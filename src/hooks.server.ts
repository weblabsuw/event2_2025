import { error, type Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
  // Check if the request is for an API route
  if (event.url.pathname.startsWith('/api')) {
    const response = await resolve(event, {
      transformPageChunk: ({ html }) => html,
    });
    
    // If it's an error response (4xx or 5xx), convert to JSON
    if (response.status >= 400) {
      return new Response(
        JSON.stringify({
          error: {
            message: response.statusText || 'An error occurred',
            status: response.status,
            path: event.url.pathname
          }
        }),
        {
          status: response.status,
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
