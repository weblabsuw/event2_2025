#!/usr/bin/env python3
"""
gen_sqlite_data.py

Behavior:
- Reads: scripts/agent_ssns.json (expects a JSON array of SSN strings)
- Produces: ./data.sqlite
- Schema: fly(agent_ssn TEXT, city TEXT, arrival_time TEXT, departure_time TEXT)
- Generates itineraries for each SSN in the JSON between 2025-09-01 and 2025-11-13.
- After generation, applies a small random time-jitter to each record's sort key,
  then sorts by that jittered key so the DB is somewhat sorted chronologically but
  records are interleaved (not neatly grouped by agent).
- Adds a special agent (murder victim) with ssn "002-05-1849" generated using the exact
  same itinerary generator as the others, appended after the original agents.
"""

import json
import os
import random
import sqlite3
from datetime import datetime, timedelta, timezone
import math
import sys

# --- Config ---
JSON_PATH = "agent_ssns.json"
OUT_DB = "../static/data.sqlite"
START = datetime(2025, 9, 1, tzinfo=timezone.utc)
END = datetime(2025, 11, 13, 14, 59, 59, tzinfo=timezone.utc)
RANDOM_SEED = 42
AVG_AIR_KMH = 900.0
AIRPORT_OVERHEAD_HOURS = 2.0
MAX_TRIPS_PER_AGENT = 12
# standard deviation for jitter applied to sort key (in hours)
SORT_JITTER_HOURS_SD = 48.0

# Murder victim config
VICTIM_SSN = "002-05-1849"
VICTIM_NAME = "Buckingham Web"
# time of death: 2025-10-08 15:37 CDT -> CDT is UTC-5 in Oct 2025, so UTC = +5 hours
VICTIM_DEATH_UTC = datetime(2025, 10, 8, 20, 37, 0, tzinfo=timezone.utc)
MIN_OTHER_PRESENT = 5
MAX_OTHER_PRESENT = 10

random.seed(RANDOM_SEED)

# --- Helper utilities ---
def load_unique_ssns(json_path):
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Could not find JSON file at: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("agent_ssns.json must be a JSON array of SSN strings")
    ssns = []
    for s in data:
        if isinstance(s, str) and s.strip():
            ssns.append(s.strip())
    # remove duplicates while preserving order
    seen = set()
    ordered_unique = []
    for s in ssns:
        if s not in seen:
            seen.add(s)
            ordered_unique.append(s)
    return ordered_unique

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1 = math.radians(lat1); phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1); dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def estimate_travel_hours(city_a, city_b):
    d_km = haversine_km(city_a[0], city_a[1], city_b[0], city_b[1])
    flight_h = d_km / AVG_AIR_KMH
    jitter = random.uniform(-0.5, 1.5)
    return max(0.5, flight_h + AIRPORT_OVERHEAD_HOURS + jitter)

def iso_utc(dt):
    # Return strings like "2025-09-03T13:22:00Z"
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

# --- City list with countries ---
# (lat, lon, country)
CITIES = {
    "New York": (40.7128, -74.0060, "United States"),
    "London": (51.5074, -0.1278, "United Kingdom"),
    "Paris": (48.8566, 2.3522, "France"),
    "Moscow": (55.7558, 37.6173, "Russia"),
    "Beijing": (39.9042, 116.4074, "China"),
    "Shanghai": (31.2304, 121.4737, "China"),
    "Dubai": (25.2048, 55.2708, "United Arab Emirates"),
    "Istanbul": (41.0082, 28.9784, "Turkey"),
    "Tokyo": (35.6895, 139.6917, "Japan"),
    "Hong Kong": (22.3193, 114.1694, "China"),
    "Sao Paulo": (-23.5505, -46.6333, "Brazil"),
    "Mexico City": (19.4326, -99.1332, "Mexico"),
    "Los Angeles": (34.0522, -118.2437, "United States"),
    "Mumbai": (19.0760, 72.8777, "India"),
    "Cairo": (30.0444, 31.2357, "Egypt"),
    "Berlin": (52.5200, 13.4050, "Germany"),
    "Singapore": (1.3521, 103.8198, "Singapore"),
    "Sydney": (-33.8688, 151.2093, "Australia"),
    "Rome": (41.9028, 12.4964, "Italy"),
    "Seoul": (37.5665, 126.9780, "South Korea")
}
CITY_NAMES = list(CITIES.keys())

def city_label(name):
    lat, lon, country = CITIES[name]
    return f"{name}, {country}"

# --- Itinerary generator ---
def generate_itinerary_for_agent(ssn, start_window_days=10):
    itinerary = []
    first_arrival = START + timedelta(days=random.uniform(0, start_window_days),
                                      hours=random.uniform(0, 23),
                                      minutes=random.choice([0, 15, 30, 45]))
    if first_arrival > END:
        return itinerary

    current_time = first_arrival
    current_city = random.choice(CITY_NAMES)
    trips_count = 0

    while True:
        trips_count += 1
        stay_days = random.choices(
            population=[1,2,3,4,5,7,10,14,21],
            weights=[20,18,15,12,10,8,6,6,5],
            k=1
        )[0]
        stay_hours = random.uniform(0, 20)
        departure = current_time + timedelta(days=stay_days, hours=stay_hours)

        if departure > END:
            if current_time + timedelta(hours=4) < END:
                departure = END - timedelta(hours=random.uniform(0, 6))
            else:
                break

        itinerary.append((city_label(current_city), current_time, departure))

        next_city = random.choice(CITY_NAMES)
        attempts = 0
        while next_city == current_city and attempts < 5:
            next_city = random.choice(CITY_NAMES)
            attempts += 1

        travel_h = estimate_travel_hours(CITIES[current_city], CITIES[next_city])
        layover_hours = random.uniform(2, 36)
        next_arrival = departure + timedelta(hours=travel_h + layover_hours)

        if next_arrival > END or trips_count >= MAX_TRIPS_PER_AGENT:
            break

        next_arrival = next_arrival.replace(minute=random.choice([0,15,30,45]), second=0, microsecond=0)
        current_city = next_city
        current_time = next_arrival

    return itinerary

# --- Main process ---
def main():
    try:
        ssns = load_unique_ssns(JSON_PATH)
    except Exception as e:
        print(f"Error loading SSNs: {e}", file=sys.stderr)
        sys.exit(1)

    if not ssns:
        print("No SSNs found in JSON. Exiting.", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(ssns)} unique SSN(s). Generating itineraries...")

    # Build rows with datetime objects (not yet ISO strings), so we can compute jittered sort keys
    rows_dt = []  # entries: (agent_ssn, city_str, arrival_dt, departure_dt)
    for ssn in ssns:
        itin = generate_itinerary_for_agent(ssn)
        if not itin:
            fallback_arr = START + timedelta(days=random.uniform(0, 3), hours=random.uniform(6, 20))
            fallback_dep = min(END, fallback_arr + timedelta(days=1, hours=random.uniform(0, 12)))
            city = city_label(random.choice(CITY_NAMES))
            rows_dt.append((ssn, city, fallback_arr, fallback_dep))
        else:
            for city, arr, dep in itin:
                rows_dt.append((ssn, city, arr, dep))

    # --- Build agent -> sorted itinerary mapping so we can modify safely ---
    agent_itins = {}
    for agent_ssn, city, arr_dt, dep_dt in rows_dt:
        agent_itins.setdefault(agent_ssn, []).append((city, arr_dt, dep_dt))
    # sort each agent's itinerary by arrival time
    for ssn in agent_itins:
        agent_itins[ssn].sort(key=lambda t: t[1])

    # Choose a death city for the victim
    death_city_name = random.choice(CITY_NAMES)
    death_city_label = city_label(death_city_name)
    print(f"Chosen death city: {death_city_label}")

    # Count how many other agents already present in that city at the death time
    def present_in_city_at(agent_entries, city_label_str, dt):
        for c, a, d in agent_entries:
            if c == city_label_str and a <= dt < d:
                return True
        return False

    present_agents = [ssn for ssn, entries in agent_itins.items() if present_in_city_at(entries, death_city_label, VICTIM_DEATH_UTC)]
    present_count = len([a for a in present_agents if a != VICTIM_SSN])  # exclude victim if present (shouldn't be)
    print(f"Initially {present_count} agents present at {death_city_label} at {VICTIM_DEATH_UTC.isoformat()} UTC")

    # If fewer than MIN_OTHER_PRESENT, insert stays for randomly chosen agents so they ARE present
    if present_count < MIN_OTHER_PRESENT:
        need = MIN_OTHER_PRESENT - present_count
        # choose candidate agents that are not already present and not the victim
        candidates = [ssn for ssn in agent_itins.keys() if ssn != VICTIM_SSN and ssn not in present_agents]
        random.shuffle(candidates)
        added = 0
        for ssn in candidates:
            if added >= need:
                break
            entries = agent_itins[ssn]
            # Remove any entries that strictly contain the death time (shouldn't be, candidate list filtered),
            # but also remove overlapping entries to avoid inconsistencies.
            new_entries = [e for e in entries if not (e[1] < VICTIM_DEATH_UTC and VICTIM_DEATH_UTC < e[2])]
            # Create a new stay that definitely spans the death time
            pre_hours = random.uniform(6, 48)
            post_hours = random.uniform(6, 48)
            arr = max(START, VICTIM_DEATH_UTC - timedelta(hours=pre_hours))
            dep = min(END, VICTIM_DEATH_UTC + timedelta(hours=post_hours))
            new_entries.append((death_city_label, arr, dep))
            # sort and then avoid consecutive identical cities by patching neighbors
            new_entries.sort(key=lambda t: t[1])
            # ensure no consecutive identical-city stays
            patched = []
            for city, a, d in new_entries:
                if patched and patched[-1][0] == city:
                    # change city to some other city to avoid duplicate consecutive city
                    alt_c = city
                    attempts = 0
                    while alt_c == city and attempts < 10:
                        alt_choice = random.choice(CITY_NAMES)
                        alt_c = city_label(alt_choice)
                        attempts += 1
                    city = alt_c
                patched.append((city, a, d))
            agent_itins[ssn] = patched
            added += 1
        present_count += added
        print(f"Added {added} agents to reach {present_count} present.")

    # If more than MAX_OTHER_PRESENT, remove some presence by altering some agents' entries at that time
    if present_count > MAX_OTHER_PRESENT:
        # find which agents are present (exclude victim)
        present_list = [ssn for ssn in agent_itins if present_in_city_at(agent_itins[ssn], death_city_label, VICTIM_DEATH_UTC)]
        present_list = [s for s in present_list if s != VICTIM_SSN]
        remove_needed = present_count - MAX_OTHER_PRESENT
        random.shuffle(present_list)
        removed = 0
        for ssn in present_list:
            if removed >= remove_needed:
                break
            entries = agent_itins[ssn]
            new_entries = []
            for city, a, d in entries:
                if city == death_city_label and a <= VICTIM_DEATH_UTC < d:
                    # change this stay to another city that isn't equal to neighbor city
                    alt_city = death_city_label
                    attempts = 0
                    while alt_city == death_city_label and attempts < 20:
                        alt_choice = random.choice(CITY_NAMES)
                        alt_city = city_label(alt_choice)
                        attempts += 1
                    new_entries.append((alt_city, a, d))
                    removed += 1
                else:
                    new_entries.append((city, a, d))
            # fix consecutive duplicates
            patched = []
            for city, a, d in new_entries:
                if patched and patched[-1][0] == city:
                    alt_city = city
                    attempts = 0
                    while alt_city == city and attempts < 20:
                        alt_choice = random.choice(CITY_NAMES)
                        alt_city = city_label(alt_choice)
                        attempts += 1
                    city = alt_city
                patched.append((city, a, d))
            agent_itins[ssn] = patched
        present_count -= removed
        print(f"Removed presence from {removed} agents to reach {present_count} present.")

    # At this point, ensure present_count is within [MIN_OTHER_PRESENT, MAX_OTHER_PRESENT]
    # If still not enough (edge cases), we'll try one more pass inserting for random agents
    if present_count < MIN_OTHER_PRESENT:
        candidates = [ssn for ssn in agent_itins.keys() if ssn != VICTIM_SSN and not present_in_city_at(agent_itins[ssn], death_city_label, VICTIM_DEATH_UTC)]
        random.shuffle(candidates)
        added = 0
        for ssn in candidates:
            if present_count >= MIN_OTHER_PRESENT:
                break
            entries = agent_itins[ssn]
            # Insert a short stay spanning the death time
            arr = max(START, VICTIM_DEATH_UTC - timedelta(hours=8))
            dep = min(END, VICTIM_DEATH_UTC + timedelta(hours=8))
            entries.append((death_city_label, arr, dep))
            entries.sort(key=lambda t: t[1])
            # fix duplicates
            patched = []
            for city, a, d in entries:
                if patched and patched[-1][0] == city:
                    alt_city = city
                    attempts = 0
                    while alt_city == city and attempts < 10:
                        alt_city = city_label(random.choice(CITY_NAMES))
                        attempts += 1
                    city = alt_city
                patched.append((city, a, d))
            agent_itins[ssn] = patched
            present_count += 1
            added += 1
        print(f"Final pass added {added} agents; now {present_count} present.")

    print(f"Final count present at death: {present_count} (target between {MIN_OTHER_PRESENT} and {MAX_OTHER_PRESENT})")

    # --- Generate the victim's itinerary using the SAME generator as other agents ---
    # Attempt multiple times (advancing RNG each try) until the generated itinerary naturally
    # contains at least one stay that spans VICTIM_DEATH_UTC. This keeps generation identical
    # in method to other agents; we only repeat generation until we get an itinerary that fits.
    victim_itin = []
    max_attempts = 500
    attempts = 0
    while attempts < max_attempts:
        attempts += 1
        gen = generate_itinerary_for_agent(VICTIM_SSN)
        # check if any stay in gen is in the chosen death city and spans the death time
        spans_in_death_city = [1 for (c, a, d) in gen if c == death_city_label and a <= VICTIM_DEATH_UTC < d]
        if spans_in_death_city:
            victim_itin = gen
            print(f"Victim itinerary found after {attempts} generate attempts (natural span in {death_city_label}).")
            break
        # else continue to next attempt (this advances RNG)
    # fallback: if not found, take last generated gen (if exists) and minimally adjust one stay to be in death city and span death
    if not victim_itin:
        if 'gen' in locals() and gen:
            # try to modify an existing stay so it is in the death city and spans the death time
            idx = random.randrange(len(gen))
            city_old, a_old, d_old = gen[idx]
            # pick a stay window that will include death time
            new_arr = min(a_old, VICTIM_DEATH_UTC - timedelta(hours=random.uniform(2, 12)))
            new_dep = max(d_old, VICTIM_DEATH_UTC + timedelta(hours=random.uniform(2, 12)))
            # set the city to the chosen death city to guarantee presence there at death time
            gen[idx] = (death_city_label, max(START, new_arr), min(END, new_dep))
            victim_itin = gen
            print(f"Victim itinerary adjusted after {attempts} attempts (fallback -> forced into {death_city_label}).")
        else:
            # extreme fallback: create a small itinerary in the death city spanning death time
            pre = VICTIM_DEATH_UTC - timedelta(hours=random.uniform(6, 48))
            post = VICTIM_DEATH_UTC + timedelta(hours=random.uniform(6, 48))
            victim_itin = [(death_city_label, max(START, pre), min(END, post))]
            print(f"No generated itineraries available; created a fallback victim itinerary in {death_city_label}.")


    # Ensure victim_itin has no consecutive same-city entries (generator already avoids that but we guard anyway)
    victim_itin_sorted = sorted(victim_itin, key=lambda t: t[1])
    patched = []
    for city, a, d in victim_itin_sorted:
        if patched and patched[-1][0] == city:
            alt_city = city
            attempts = 0
            while alt_city == city and attempts < 10:
                alt_city = city_label(random.choice(CITY_NAMES))
                attempts += 1
            city = alt_city
        patched.append((city, a, d))
    victim_itin = patched

    # Append the victim's itinerary AFTER other agents' entries (to keep earlier randomness identical)
    agent_itins[VICTIM_SSN] = victim_itin

    # Rebuild rows_dt from agent_itins (keeping original order of agents roughly the same,
    # but victim will be present as one of the keys — ensure victim's entries are placed after others)
    rows_dt = []
    # preserve original ssns order, but append victim last
    ssns_ordered = [s for s in ssns if s != VICTIM_SSN]
    for ssn in ssns_ordered:
        entries = agent_itins.get(ssn, [])
        for city, a, d in entries:
            rows_dt.append((ssn, city, a, d))
    # append victim last
    for city, a, d in agent_itins[VICTIM_SSN]:
        rows_dt.append((VICTIM_SSN, city, a, d))

    # Now compute a jittered sort key for each row and sort by it to get "somewhat-sorted, somewhat-random" ordering.
    rows_with_sortkey = []
    for agent_ssn, city, arr_dt, dep_dt in rows_dt:
        # jitter in hours; gaussian around 0, sd = SORT_JITTER_HOURS_SD
        jitter_hours = random.gauss(0, SORT_JITTER_HOURS_SD)
        sort_key = arr_dt + timedelta(hours=jitter_hours)
        # clamp sort_key to the overall window to avoid pathological extremes
        if sort_key < START:
            sort_key = START + (sort_key - START) * 0  # set to START
        if sort_key > END:
            sort_key = END
        rows_with_sortkey.append((sort_key, agent_ssn, city, arr_dt, dep_dt))

    # sort by the jittered key
    rows_with_sortkey.sort(key=lambda t: t[0])

    # Convert to insertion-ready ISO strings
    insert_rows = []
    for _, agent_ssn, city, arr_dt, dep_dt in rows_with_sortkey:
        insert_rows.append((agent_ssn, city, iso_utc(arr_dt), iso_utc(dep_dt)))

    # Create SQLite DB and insert
    if os.path.exists(OUT_DB):
        print(f"Overwriting existing {OUT_DB}")
        os.remove(OUT_DB)

    conn = sqlite3.connect(OUT_DB)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE fly (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_ssn TEXT NOT NULL,
            city TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            departure_time TEXT NOT NULL
        );
    """)
    cur.executemany("INSERT INTO fly (agent_ssn, city, arrival_time, departure_time) VALUES (?, ?, ?, ?);", insert_rows)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM fly;")
    count = cur.fetchone()[0]
    print(f"Inserted {count} flight records into {OUT_DB}.")

    # --- Generate WHO table ---
    FIRST_NAMES = ["Alex", "Jamie", "Taylor", "Jordan", "Casey", "Morgan", "Avery", "Riley", "Parker", "Quinn",
                   "Sam", "Charlie", "Cameron", "Drew", "Rowan", "Reese", "Hayden", "Kai", "Sasha", "Elliot",
                   "Noah", "Liam", "Mason", "Ethan", "Logan", "Lucas", "Oliver", "Aiden", "Carter", "Grayson",
                   "Hannah", "Olivia", "Emma", "Ava", "Isabella", "Sophia", "Mia", "Charlotte", "Amelia", "Harper",
                   "Benjamin", "William", "James", "Henry", "Jacob", "Michael", "Daniel", "Matthew", "Joseph", "David",
                   "Zoe", "Chloe", "Lily", "Madison", "Emily", "Aria", "Scarlett", "Victoria", "Grace", "Nora",
                   "Ian", "Victor", "Gabe", "Marcus", "Leo", "Felix", "Simon", "Owen", "Evan", "Adam",
                   "Brandon", "Natalie", "Ruby", "Josie", "Maya", "Ivy", "Alice", "Elsa", "Irene", "June"]
    LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson",
                  "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White",
                  "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Perez", "Hall",
                  "Young", "Allen", "Sanchez", "Wright", "King", "Scott", "Green", "Baker", "Adams", "Nelson",
                  "Hill", "Ramirez", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Torres",
                  "Parker", "Collins", "Edwards", "Stewart", "Flores", "Morris", "Nguyen", "Murphy", "Rivera", "Cook",
                  "Rogers", "Morgan", "Peterson", "Cooper", "Reed", "Bailey", "Bell", "Gomez", "Kelly", "Howard",
                  "Ward", "Cox", "Diaz", "Richardson", "Wood", "Watson", "Brooks", "Bennett", "Gray", "James",
                  "Reyes", "Cruz", "Hughes", "Price", "Myers", "Long", "Foster", "Sanders", "Ross", "Morales"]
    EYE_COLORS = ["brown", "blue", "green", "hazel", "gray", "amber"]

    def generate_unique_names(n):
        all_pairs = [(f, l) for f in FIRST_NAMES for l in LAST_NAMES]
        return [f"{f} {l}" for f, l in random.sample(all_pairs, n)]

    def generate_who_records(ssns):
        n = len(ssns)
        names = generate_unique_names(n)
        records = []
        for ssn, name in zip(ssns, names):
            height = int(max(150, min(200, round(random.gauss(175, 10)))))
            weight = int(max(50, min(130, round(random.gauss(75, 12)))))
            eye = random.choice(EYE_COLORS)
            records.append((VICTIM_NAME if ssn == VICTIM_SSN else name, ssn, height, eye, weight))
        return records

    # Generate and insert WHO table
    who_records = generate_who_records([s for s in agent_itins.keys()])
    cur.execute("""
                CREATE TABLE who
                (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    name      TEXT NOT NULL,
                    ssn       TEXT NOT NULL UNIQUE,
                    height_cm INTEGER,
                    eye_color TEXT,
                    weight_kg INTEGER
                );
                """)
    cur.executemany("INSERT INTO who (name, ssn, height_cm, eye_color, weight_kg) VALUES (?, ?, ?, ?, ?);", who_records)
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM who;")
    count_who = cur.fetchone()[0]
    print(f"Inserted {count_who} agent records into 'who' table.")

    conn.close()
    print("Done.")

if __name__ == "__main__":
    main()
