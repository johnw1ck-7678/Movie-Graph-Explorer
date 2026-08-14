const { driver, verifyConnection } = require("./db");

const people = [
  { id: "p1", name: "Leonardo DiCaprio" },
  { id: "p2", name: "Kate Winslet" },
  { id: "p3", name: "Tom Hanks" },
  { id: "p4", name: "Christopher Nolan" },
  { id: "p5", name: "Cillian Murphy" },
  { id: "p6", name: "Marion Cotillard" },
  { id: "p7", name: "James Cameron" },
  { id: "p8", name: "Joseph Gordon-Levitt" },
  { id: "p9", name: "Elliot Page" },
  { id: "p10", name: "Robert De Niro" },
  { id: "p11", name: "Martin Scorsese" },
  { id: "p12", name: "Emily Blunt" },
  { id: "p13", name: "Matt Damon" },
  { id: "p14", name: "Steven Spielberg" },
  { id: "p15", name: "Rami Malek" },
  { id: "p16", name: "Tom Hardy" },
  { id: "p17", name: "Anne Hathaway" },
  { id: "p18", name: "Michael Caine" },
  { id: "p19", name: "Jack Nicholson" },
  { id: "p20", name: "Mark Wahlberg" },
  { id: "p21", name: "Jonah Hill" },
  { id: "p22", name: "Margot Robbie" },
  { id: "p23", name: "Brad Pitt" },
  { id: "p24", name: "Morgan Freeman" },
  { id: "p25", name: "Christian Bale" },
  { id: "p26", name: "Heath Ledger" },
  { id: "p27", name: "Scarlett Johansson" },
  { id: "p28", name: "Florence Pugh" },
  { id: "p29", name: "Matthew McConaughey" },
  { id: "p30", name: "Jessica Chastain" },
  { id: "p31", name: "Ken Watanabe" },
  { id: "p32", name: "John Krasinski" },
  { id: "p33", name: "Lucy Boynton" },
  { id: "p34", name: "Gwilym Lee" },
  { id: "p35", name: "Robert Downey Jr." },
  { id: "p36", name: "Jeremy Renner" },
  { id: "p37", name: "Denis Villeneuve" },
  { id: "p38", name: "Quentin Tarantino" },
  { id: "p39", name: "David Fincher" },
  { id: "p40", name: "Alejandro G. Iñárritu" },
  { id: "p41", name: "Jamie Foxx" },
  { id: "p42", name: "Saoirse Ronan" },
  { id: "p43", name: "Adam Driver" },
  { id: "p44", name: "Josh Brolin" },
  { id: "p45", name: "Joe Pesci" },
  { id: "p46", name: "Amy Adams" },
  { id: "p47", name: "Jennifer Lawrence" },
  { id: "p48", name: "Cate Blanchett" },
  { id: "p49", name: "Meryl Streep" },
  { id: "p50", name: "Mark Rylance" },
  { id: "p51", name: "Timothée Chalamet" },
  { id: "p52", name: "Kenneth Branagh" },
  { id: "p53", name: "Bryan Singer" },
  { id: "p54", name: "David Frankel" },
  { id: "p55", name: "Greta Gerwig" },
  { id: "p56", name: "Adam McKay" },
  { id: "p57", name: "Noah Baumbach" },
  { id: "p58", name: "Joss Whedon" },
];

const genres = [
  { id: "g1", name: "Drama" },
  { id: "g2", name: "Sci-Fi" },
  { id: "g3", name: "Thriller" },
  { id: "g4", name: "Romance" },
  { id: "g5", name: "Biography" },
  { id: "g6", name: "Crime" },
  { id: "g7", name: "Action" },
  { id: "g8", name: "War" },
];

const movies = [
  { id: "m1", title: "Titanic", year: 1997, genres: ["g1", "g4"] },
  { id: "m2", title: "Inception", year: 2010, genres: ["g2", "g3"] },
  { id: "m3", title: "Oppenheimer", year: 2023, genres: ["g1", "g5"] },
  { id: "m4", title: "The Revenant", year: 2015, genres: ["g1"] },
  { id: "m5", title: "Catch Me If You Can", year: 2002, genres: ["g1", "g6"] },
  { id: "m6", title: "The Wolf of Wall Street", year: 2013, genres: ["g1", "g6"] },
  { id: "m7", title: "Saving Private Ryan", year: 1998, genres: ["g1", "g8"] },
  { id: "m8", title: "The Departed", year: 2006, genres: ["g6", "g3"] },
  { id: "m9", title: "Dunkirk", year: 2017, genres: ["g1", "g3", "g8"] },
  { id: "m10", title: "A Quiet Place", year: 2018, genres: ["g3"] },
  { id: "m11", title: "Bohemian Rhapsody", year: 2018, genres: ["g5", "g1"] },
  { id: "m12", title: "The Dark Knight", year: 2008, genres: ["g7", "g3", "g6"] },
  { id: "m13", title: "Interstellar", year: 2014, genres: ["g2", "g1"] },
  { id: "m14", title: "The Prestige", year: 2006, genres: ["g2", "g3"] },
  { id: "m15", title: "Once Upon a Time in Hollywood", year: 2019, genres: ["g1", "g4"] },
  { id: "m16", title: "Django Unchained", year: 2012, genres: ["g7", "g1"] },
  { id: "m17", title: "Se7en", year: 1995, genres: ["g6", "g3"] },
  { id: "m18", title: "Little Women", year: 2019, genres: ["g1", "g4"] },
  { id: "m19", title: "Don't Look Up", year: 2021, genres: ["g1"] },
  { id: "m20", title: "Killers of the Flower Moon", year: 2023, genres: ["g1", "g6"] },
  { id: "m21", title: "Casino", year: 1995, genres: ["g6", "g1"] },
  { id: "m22", title: "Taxi Driver", year: 1976, genres: ["g6", "g1"] },
  { id: "m23", title: "The Devil Wears Prada", year: 2006, genres: ["g1", "g4"] },
  { id: "m24", title: "Sicario", year: 2015, genres: ["g6", "g3"] },
  { id: "m25", title: "Arrival", year: 2016, genres: ["g2", "g1"] },
  { id: "m26", title: "Dune", year: 2021, genres: ["g2", "g7"] },
  { id: "m27", title: "The Avengers", year: 2012, genres: ["g7", "g2"] },
  { id: "m28", title: "Marriage Story", year: 2019, genres: ["g1", "g4"] },
];

// [personId, movieId] pairs for the ACTED_IN relationship.
// Every pairing below is a verified real cast credit.
const actedIn = [
  // Titanic
  ["p1", "m1"],  // Leonardo DiCaprio
  ["p2", "m1"],  // Kate Winslet

  // Inception
  ["p1", "m2"],  // Leonardo DiCaprio
  ["p8", "m2"],  // Joseph Gordon-Levitt
  ["p31", "m2"], // Ken Watanabe
  ["p16", "m2"], // Tom Hardy
  ["p9", "m2"],  // Elliot Page
  ["p5", "m2"],  // Cillian Murphy
  ["p6", "m2"],  // Marion Cotillard
  ["p18", "m2"], // Michael Caine

  // Oppenheimer
  ["p5", "m3"],  // Cillian Murphy
  ["p12", "m3"], // Emily Blunt
  ["p13", "m3"], // Matt Damon
  ["p35", "m3"], // Robert Downey Jr.
  ["p28", "m3"], // Florence Pugh
  ["p15", "m3"], // Rami Malek
  ["p52", "m3"], // Kenneth Branagh

  // The Revenant
  ["p1", "m4"],  // Leonardo DiCaprio
  ["p16", "m4"], // Tom Hardy

  // Catch Me If You Can
  ["p1", "m5"],  // Leonardo DiCaprio
  ["p3", "m5"],  // Tom Hanks

  // The Wolf of Wall Street
  ["p1", "m6"],  // Leonardo DiCaprio
  ["p21", "m6"], // Jonah Hill
  ["p22", "m6"], // Margot Robbie
  ["p29", "m6"], // Matthew McConaughey

  // Saving Private Ryan
  ["p3", "m7"],  // Tom Hanks
  ["p13", "m7"], // Matt Damon

  // The Departed
  ["p1", "m8"],  // Leonardo DiCaprio
  ["p13", "m8"], // Matt Damon
  ["p19", "m8"], // Jack Nicholson
  ["p20", "m8"], // Mark Wahlberg

  // Dunkirk
  ["p5", "m9"],  // Cillian Murphy
  ["p16", "m9"], // Tom Hardy

  // A Quiet Place
  ["p12", "m10"], // Emily Blunt
  ["p32", "m10"], // John Krasinski

  // Bohemian Rhapsody
  ["p15", "m11"], // Rami Malek
  ["p33", "m11"], // Lucy Boynton
  ["p34", "m11"], // Gwilym Lee

  // The Dark Knight
  ["p25", "m12"], // Christian Bale
  ["p26", "m12"], // Heath Ledger
  ["p18", "m12"], // Michael Caine
  ["p24", "m12"], // Morgan Freeman

  // Interstellar
  ["p29", "m13"], // Matthew McConaughey
  ["p17", "m13"], // Anne Hathaway
  ["p30", "m13"], // Jessica Chastain
  ["p18", "m13"], // Michael Caine

  // The Prestige
  ["p25", "m14"], // Christian Bale
  ["p18", "m14"], // Michael Caine
  ["p27", "m14"], // Scarlett Johansson

  // Once Upon a Time in Hollywood
  ["p1", "m15"],  // Leonardo DiCaprio
  ["p23", "m15"], // Brad Pitt
  ["p22", "m15"], // Margot Robbie

  // Django Unchained
  ["p1", "m16"],  // Leonardo DiCaprio
  ["p41", "m16"], // Jamie Foxx

  // Se7en
  ["p23", "m17"], // Brad Pitt
  ["p24", "m17"], // Morgan Freeman

  // Little Women
  ["p28", "m18"], // Florence Pugh
  ["p42", "m18"], // Saoirse Ronan

  // Don't Look Up
  ["p1", "m19"],  // Leonardo DiCaprio
  ["p47", "m19"], // Jennifer Lawrence
  ["p21", "m19"], // Jonah Hill
  ["p48", "m19"], // Cate Blanchett
  ["p49", "m19"], // Meryl Streep
  ["p50", "m19"], // Mark Rylance
  ["p51", "m19"], // Timothée Chalamet

  // Killers of the Flower Moon
  ["p1", "m20"],  // Leonardo DiCaprio
  ["p10", "m20"], // Robert De Niro

  // Casino
  ["p10", "m21"], // Robert De Niro
  ["p45", "m21"], // Joe Pesci

  // Taxi Driver
  ["p10", "m22"], // Robert De Niro

  // The Devil Wears Prada
  ["p49", "m23"], // Meryl Streep
  ["p17", "m23"], // Anne Hathaway
  ["p12", "m23"], // Emily Blunt

  // Sicario
  ["p12", "m24"], // Emily Blunt
  ["p44", "m24"], // Josh Brolin

  // Arrival
  ["p46", "m25"], // Amy Adams
  ["p36", "m25"], // Jeremy Renner

  // Dune
  ["p51", "m26"], // Timothée Chalamet
  ["p44", "m26"], // Josh Brolin

  // The Avengers
  ["p35", "m27"], // Robert Downey Jr.
  ["p27", "m27"], // Scarlett Johansson
  ["p36", "m27"], // Jeremy Renner

  // Marriage Story
  ["p27", "m28"], // Scarlett Johansson
  ["p43", "m28"], // Adam Driver
];

// [personId, movieId] pairs for the DIRECTED relationship.
const directed = [
  ["p4", "m2"],
  ["p4", "m3"],
  ["p7", "m1"],
  ["p40", "m4"],
  ["p14", "m5"],
  ["p11", "m6"],
  ["p14", "m7"],
  ["p11", "m8"],
  ["p4", "m9"],
  ["p32", "m10"],
  ["p53", "m11"],
  ["p4", "m12"],
  ["p4", "m13"],
  ["p4", "m14"],
  ["p38", "m15"],
  ["p38", "m16"],
  ["p39", "m17"],
  ["p55", "m18"],
  ["p56", "m19"],
  ["p11", "m20"],
  ["p11", "m21"],
  ["p11", "m22"],
  ["p54", "m23"],
  ["p37", "m24"],
  ["p37", "m25"],
  ["p37", "m26"],
  ["p58", "m27"],
  ["p57", "m28"],
];

async function run() {
  const connected = await verifyConnection();
  if (!connected) {
    console.error("[seed] Aborting: could not connect to CognoDB.");
    process.exit(1);
  }

  const session = driver.session();
  try {
    console.log("[seed] Creating constraints...");
    await session.run(
      "CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT movie_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT genre_id IF NOT EXISTS FOR (g:Genre) REQUIRE g.id IS UNIQUE"
    );

    console.log(`[seed] Loading ${people.length} people...`);
    await session.run(
      `UNWIND $rows AS row
       MERGE (p:Person {id: row.id})
       SET p.name = row.name`,
      { rows: people }
    );

    console.log(`[seed] Loading ${genres.length} genres...`);
    await session.run(
      `UNWIND $rows AS row
       MERGE (g:Genre {id: row.id})
       SET g.name = row.name`,
      { rows: genres }
    );

    console.log(`[seed] Loading ${movies.length} movies...`);
    await session.run(
      `UNWIND $rows AS row
       MERGE (m:Movie {id: row.id})
       SET m.title = row.title, m.year = row.year`,
      { rows: movies }
    );

    console.log("[seed] Linking movies to genres...");
    for (const movie of movies) {
      await session.run(
        `MATCH (m:Movie {id: $movieId})
         UNWIND $genreIds AS genreId
         MATCH (g:Genre {id: genreId})
         MERGE (m)-[:HAS_GENRE]->(g)`,
        { movieId: movie.id, genreIds: movie.genres }
      );
    }

    console.log(`[seed] Creating ${actedIn.length} ACTED_IN relationships...`);
    await session.run(
      `UNWIND $rows AS row
       MATCH (p:Person {id: row[0]}), (m:Movie {id: row[1]})
       MERGE (p)-[:ACTED_IN]->(m)`,
      { rows: actedIn }
    );

    console.log(`[seed] Creating ${directed.length} DIRECTED relationships...`);
    await session.run(
      `UNWIND $rows AS row
       MATCH (p:Person {id: row[0]}), (m:Movie {id: row[1]})
       MERGE (p)-[:DIRECTED]->(m)`,
      { rows: directed }
    );

    console.log("[seed] Done. Graph seeded successfully.");
  } catch (err) {
    console.error("[seed] Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

run();