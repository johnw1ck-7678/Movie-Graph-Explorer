# 🎬 Movie Graph Explorer

A small web app for exploring how actors, directors, and movies connect to
each other — built on **CognoDB**, a managed graph database, using an
official Neo4j driver over Bolt.

You can:
- Search a movie and see its cast, director, and genres
- Get "you might also like" recommendations based on shared cast **two hops
  away**, not just direct co-stars
- Search an actor and see their direct co-stars and their extended
  (2-hop) co-star network
- Find the shortest chain of collaborations connecting any two people,
  even if they've never worked together directly

## Why a graph database?

The interesting questions in this app are all about **paths and
relationships**, not records:

- *"Who is two hops away from this actor?"* In a relational schema this is
  a self-join on a `cast` join table, repeated once per hop, with manual
  de-duplication of already-visited people. It gets worse — and slower —
  the more hops you add. In Cypher it's `-[:ACTED_IN*1..4]-`.
- *"What's the shortest chain connecting person A to person B?"* This is
  the classic unbounded-depth traversal — you don't know in advance how
  many joins you'll need. SQL has no native shortest-path operation; you'd
  reach for a recursive CTE with manual cycle detection, and it still
  degrades badly as the graph grows. Cypher has `shortestPath()` built in.
- *"Recommend movies connected via shared cast two hops away, that share a
  genre, and where the connecting actor hasn't worked with the original
  cast directly."* This mixes a variable-depth pattern, a property filter,
  and an anti-join (`NOT EXISTS`) in one query. Expressing this in SQL
  needs several chained self-joins and is easy to get subtly wrong; in
  Cypher it reads like the sentence above.

None of this data is tabular by nature — a person's relevance to a query
depends on *how they're connected*, not on a foreign key pointing at a
fixed number of related rows. That's exactly the case a graph database is
built for, and exactly the case where a relational schema starts fighting
you.

## Data model

```
        ACTED_IN                      HAS_GENRE
(:Person) ───────► (:Movie) ◄───────────────────── (:Genre)
    ▲                  ▲
    │    DIRECTED      │
    └──────────────────┘
```

- **`(:Person {id, name})`** — an actor and/or director
- **`(:Movie {id, title, year})`** — a film
- **`(:Genre {id, name})`** — a genre label
- **`[:ACTED_IN]`** — Person → Movie
- **`[:DIRECTED]`** — Person → Movie
- **`[:HAS_GENRE]`** — Movie → Genre

The same `Person` node can have both `ACTED_IN` and `DIRECTED` edges
(e.g. an actor-director), which is why co-star traversals only follow
`ACTED_IN`, while the shortest-path query follows both relationship types
to find any kind of professional connection.

## Project structure

```
movie-graph-explorer/
├── server.js        # Express app, route definitions, error handling
├── db.js             # Neo4j driver setup + connection verification
├── queries.js         # All Cypher queries (parameterised)
├── seed.js            # Loads sample data into CognoDB
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js          # Frontend: search, tabs, rendering, loading/error states
├── .env.example
└── package.json
```

## Setup

### 1. Create your CognoDB instance
1. Go to [console.cognodb.com/signup](https://console.cognodb.com/signup)
   and create a free account (no credit card required).
2. From the console, create a free **c0** instance and pick a region.
   It provisions in under a minute.
3. Copy the connection URI (`bolt+s://<instance-id>.databases.cognodb.cloud`)
   and the generated password for user `cognodb` — **the password is only
   shown once.**

### 2. Configure the app
```bash
cp .env.example .env
# then edit .env and fill in COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD
```

### 3. Install dependencies
```bash
npm install
```

### 4. Seed the database
```bash
npm run seed
```
This loads ~15 people, 11 movies, 6 genres, and their relationships using
parameterised `UNWIND` + `MERGE` queries (safe to re-run).

### 5. Run the app
```bash
npm start
```
Visit `http://localhost:3000`.

## Main queries, explained

All queries live in `queries.js` and are called through a single
`runQuery()` helper (`db.js`) that always opens and closes its own session
and never string-concatenates input into Cypher.

- **`getCostarNetwork`** — the required multi-hop traversal. Follows
  `ACTED_IN` relationships up to 4 edges deep (2 "co-star hops": actor →
  movie → co-star → movie → co-star-of-co-star) and groups results by
  distance.
- **`shortestPath`** — uses Cypher's built-in `shortestPath()` over a
  variable-length pattern (`*..12`) across both `ACTED_IN` and `DIRECTED`,
  so it can connect an actor to a director or vice versa.
- **`recommendMovies`** — the "SQL would find this awkward" query.
  Finds movies reachable via a shared-cast bridge two hops out, filters to
  movies sharing a genre with the source, and excludes anyone who already
  worked with the source movie's cast directly, using `NOT (bridge)-[:ACTED_IN]->(source)`.

## Error handling

If CognoDB is unreachable, `db.js` logs the failure at startup and every
API route catches DB errors and returns a `503` with a plain-language
message rather than crashing — the frontend shows this inline as an error
state instead of a blank screen.

## Screenshots

*(Add screenshots of the Movie Explorer, Co-star Network, and Connection
Path tabs here before submitting.)*

## Demo

- Hosted app: *(add your deployment URL here)*
- Screen recording: *(add link here)*
