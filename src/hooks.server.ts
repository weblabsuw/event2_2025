import { error, type Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
  // Check if the request is for an API route
  if (event.url.pathname.startsWith('/api')) {
    const response = await resolve(event, {
      transformPageChunk: ({ html }) => html,
    });

    // Only handle 404s that don't have JSON content (i.e., route not found)
    if (response.status === 404) {
      const contentType = response.headers.get('Content-Type');

      // If response already has JSON content, pass it through (endpoint handled it)
      if (contentType?.includes('application/json')) {
        return response;
      }

      // Otherwise, format a generic 404 for routes that don't exist
      return new Response(
        JSON.stringify({
          error: {
            message: 'API endpoint not found',
            status: 404,
            path: event.url.pathname
          }
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return response;
  }

  return resolve(event);
};  
