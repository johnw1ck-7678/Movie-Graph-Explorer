const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { verifyConnection } = require("./db");
const queries = require("./queries");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Wrap async route handlers so any thrown/rejected error lands in one place.
function asyncRoute(handler) {
  return (req, res) => {
    handler(req, res).catch((err) => {
      console.error("[api error]", err.message);
      res.status(503).json({
        error:
          "The graph database is currently unreachable. Please try again shortly.",
      });
    });
  };
}

app.get(
  "/api/search/movies",
  asyncRoute(async (req, res) => {
    const term = (req.query.q || "").trim();
    if (!term) return res.json([]);
    res.json(await queries.searchMovies(term));
  })
);

app.get(
  "/api/search/people",
  asyncRoute(async (req, res) => {
    const term = (req.query.q || "").trim();
    if (!term) return res.json([]);
    res.json(await queries.searchPeople(term));
  })
);

app.get(
  "/api/movies/:id",
  asyncRoute(async (req, res) => {
    const movie = await queries.getMovieDetail(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found." });
    res.json(movie);
  })
);

app.get(
  "/api/people/:id",
  asyncRoute(async (req, res) => {
    const person = await queries.getPersonDetail(req.params.id);
    if (!person) return res.status(404).json({ error: "Person not found." });
    res.json(person);
  })
);

app.get(
  "/api/people/:id/network",
  asyncRoute(async (req, res) => {
    res.json(await queries.getCostarNetwork(req.params.id));
  })
);

app.get(
  "/api/path",
  asyncRoute(async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
      return res
        .status(400)
        .json({ error: "Both 'from' and 'to' person ids are required." });
    }
    const result = await queries.shortestPath(from, to);
    if (!result) {
      return res
        .status(404)
        .json({ error: "No connecting path found between these two people." });
    }
    res.json(result);
  })
);

app.get(
  "/api/movies/:id/recommendations",
  asyncRoute(async (req, res) => {
    res.json(await queries.recommendMovies(req.params.id));
  })
);

app.get("/api/health", async (req, res) => {
  const ok = await verifyConnection();
  res.status(ok ? 200 : 503).json({ database: ok ? "connected" : "unreachable" });
});

// Fallback to index.html for any non-API route (simple single-page app).
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});