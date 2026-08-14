const { runQuery } = require("./db");

async function searchMovies(term) {
  const records = await runQuery(
    `MATCH (m:Movie)
     WHERE toLower(m.title) CONTAINS toLower($term)
     RETURN m.id AS id, m.title AS title, m.year AS year
     ORDER BY m.year DESC
     LIMIT 15`,
    { term }
  );

  return records.map((r) => r.toObject());
}

// Search people (actors/directors) by partial name.
async function searchPeople(term) {
  const records = await runQuery(
    `MATCH (p:Person)
     WHERE toLower(p.name) CONTAINS toLower($term)
     RETURN p.id AS id, p.name AS name
     ORDER BY p.name
     LIMIT 15`,
    { term }
  );

  return records.map((r) => r.toObject());
}

// Full detail for one movie: cast, director(s), genres.
async function getMovieDetail(movieId) {
  const records = await runQuery(
    `MATCH (m:Movie {id: $movieId})
     OPTIONAL MATCH (actor:Person)-[:ACTED_IN]->(m)
     OPTIONAL MATCH (director:Person)-[:DIRECTED]->(m)
     OPTIONAL MATCH (m)-[:HAS_GENRE]->(g:Genre)
     RETURN m.id AS id,
            m.title AS title,
            m.year AS year,
            collect(DISTINCT {id: actor.id, name: actor.name}) AS cast,
            collect(DISTINCT {id: director.id, name: director.name}) AS directors,
            collect(DISTINCT g.name) AS genres`,
    { movieId }
  );

  if (records.length === 0) return null;

  return records[0].toObject();
}

// Full detail for one person: filmography.
async function getPersonDetail(personId) {
  const records = await runQuery(
    `MATCH (p:Person {id: $personId})
     OPTIONAL MATCH (p)-[:ACTED_IN]->(actedIn:Movie)
     OPTIONAL MATCH (p)-[:DIRECTED]->(directed:Movie)
     RETURN p.id AS id,
            p.name AS name,
            collect(DISTINCT {
              id: actedIn.id,
              title: actedIn.title,
              year: actedIn.year
            }) AS actedIn,
            collect(DISTINCT {
              id: directed.id,
              title: directed.title,
              year: directed.year
            }) AS directed`,
    { personId }
  );

  if (records.length === 0) return null;

  return records[0].toObject();
}

// --- Multi-hop traversal --------------------------------------------------

// Starting from an actor, find every other actor reachable within
// 2 co-star hops through shared movies.
//
// 1 co-star hop:
// Person → Movie → Person
//
// 2 co-star hops:
// Person → Movie → Person → Movie → Person
//
// LIMIT 40 keeps the response small for the frontend.
async function getCostarNetwork(personId) {
  const records = await runQuery(
    `MATCH path =
       (start:Person {id: $personId})-[:ACTED_IN*1..4]-(other:Person)
     WHERE start <> other
       AND all(n IN nodes(path) WHERE n:Person OR n:Movie)
     WITH other, min(length(path)) / 2 AS hopsAway
     RETURN other.id AS id,
            other.name AS name,
            hopsAway
     ORDER BY hopsAway ASC, other.name ASC
     LIMIT 40`,
    { personId }
  );

  return records.map((r) => {
    const data = r.toObject();

    return {
      id: data.id,
      name: data.name,
      hopsAway:
        typeof data.hopsAway?.toNumber === "function"
          ? data.hopsAway.toNumber()
          : Number(data.hopsAway),
    };
  });
}

// Shortest connection path between two people.
async function shortestPath(fromId, toId) {
  const records = await runQuery(
    `MATCH (a:Person {id: $fromId}),
           (b:Person {id: $toId})
     MATCH path =
       shortestPath((a)-[:ACTED_IN|DIRECTED*..12]-(b))
     RETURN [n IN nodes(path) | {
              id: n.id,
              label: CASE
                       WHEN n:Person THEN n.name
                       ELSE n.title
                     END,
              type: CASE
                      WHEN n:Person THEN 'Person'
                      ELSE 'Movie'
                    END
            }] AS nodes,
            length(path) AS hops`,
    { fromId, toId }
  );

  if (records.length === 0) return null;

  return records[0].toObject();
}

// --- Movie recommendations -----------------------------------------------

// Recommend movies that are two hops away through shared cast and
// share at least one genre with the source movie.
async function recommendMovies(movieId) {
  const records = await runQuery(
    `
    MATCH (source:Movie {id: $movieId})
          <-[:ACTED_IN]-(actor:Person)
          -[:ACTED_IN]->(rec:Movie)

    MATCH (source)-[:HAS_GENRE]->(genre:Genre)
          <-[:HAS_GENRE]-(rec)

    WHERE rec <> source

    WITH rec,
         collect(DISTINCT actor.name) AS sharedActors,
         collect(DISTINCT genre.name) AS matchingGenres

    RETURN rec.id AS id,
           rec.title AS title,
           rec.year AS year,
           matchingGenres,
           size(sharedActors) AS sharedConnections,
           sharedActors

    ORDER BY sharedConnections DESC,
             rec.year DESC

    LIMIT 10
    `,
    { movieId }
  );

  return records.map((r) => {
    const data = r.toObject();

    return {
      id: data.id,
      title: data.title,
      year: data.year,
      matchingGenres: data.matchingGenres,
      sharedConnections:
        typeof data.sharedConnections?.toNumber === "function"
          ? data.sharedConnections.toNumber()
          : Number(data.sharedConnections),
      sharedActors: data.sharedActors,
    };
  });
}

module.exports = {
  searchMovies,
  searchPeople,
  getMovieDetail,
  getPersonDetail,
  getCostarNetwork,
  shortestPath,
  recommendMovies,
};
