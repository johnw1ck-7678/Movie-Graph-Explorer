const state = { pathFrom: null, pathTo: null };

function el(html) {
  const div = document.createElement("div");
  div.innerHTML = html.trim();
  return div.firstChild;
}

function loadingState(msg = "Loading from the graph...") {
  return `<div class="state"><div class="spinner"></div>${msg}</div>`;
}

function emptyState(msg) {
  return `<div class="state">${msg}</div>`;
}

function errorState(msg) {
  return `<div class="state error">⚠ ${msg}</div>`;
}

async function api(path) {
  const res = await fetch(path);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong.");
  return body;
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

//movie explorer

const movieSearch = document.getElementById("movie-search");
const movieResults = document.getElementById("movie-results");
const movieDetail = document.getElementById("movie-detail");
const movieRecs = document.getElementById("movie-recs");

movieSearch.addEventListener(
  "input",
  debounce(async (e) => {
    const term = e.target.value.trim();
    movieResults.innerHTML = "";
    if (!term) return;
    try {
      const results = await api(`/api/search/movies?q=${encodeURIComponent(term)}`);
      if (results.length === 0) {
        movieResults.innerHTML = `<li class="state">No movies found for "${term}".</li>`;
        return;
      }
      movieResults.innerHTML = "";
      results.forEach((m) => {
        const li = el(
          `<li>${m.title} <span class="meta">${m.year || ""}</span></li>`
        );
        li.addEventListener("click", () => loadMovie(m.id));
        movieResults.appendChild(li);
      });
    } catch (err) {
      movieResults.innerHTML = `<li class="state error">⚠ ${err.message}</li>`;
    }
  })
);

async function loadMovie(id) {
  movieResults.innerHTML = "";
  movieSearch.value = "";
  movieDetail.innerHTML = loadingState("Loading movie details...");
  movieRecs.innerHTML = "";
  try {
    const m = await api(`/api/movies/${id}`);
    const cast = (m.cast || []).filter((c) => c.id);
    const directors = (m.directors || []).filter((d) => d.id);
    const genres = m.genres || [];

    movieDetail.innerHTML = "";
    const card = el(`
      <div class="card">
        <h2>${m.title}</h2>
        <div class="year">${m.year || "Year unknown"}</div>
        ${genres.length ? `<div class="section-label">Genres</div>
        <div class="pill-row">${genres.map((g) => `<span class="pill genre">${g}</span>`).join("")}</div>` : ""}
        ${directors.length ? `<div class="section-label">Director${directors.length > 1 ? "s" : ""}</div>
        <div class="pill-row" id="director-pills"></div>` : ""}
        <div class="section-label">Cast</div>
        <div class="pill-row" id="cast-pills">${cast.length === 0 ? '<span class="meta">No cast on record.</span>' : ""}</div>
      </div>
    `);
    movieDetail.appendChild(card);

    const directorPills = card.querySelector("#director-pills");
    directors.forEach((d) => {
      const pill = el(`<span class="pill clickable">${d.name}</span>`);
      pill.addEventListener("click", () => loadPersonInNetworkTab(d.id));
      directorPills.appendChild(pill);
    });

    const castPills = card.querySelector("#cast-pills");
    cast.forEach((c) => {
      const pill = el(`<span class="pill clickable">${c.name}</span>`);
      pill.addEventListener("click", () => loadPersonInNetworkTab(c.id));
      castPills.appendChild(pill);
    });

    
    movieRecs.innerHTML = loadingState("Finding related movies...");
    const recs = await api(`/api/movies/${id}/recommendations`);
    if (recs.length === 0) {
      movieRecs.innerHTML = `
        <div class="card">
          <div class="section-label">You might also like</div>
          ${emptyState("No two-hop recommendations found for this movie yet.")}
        </div>`;
    } else {
      movieRecs.innerHTML = `
        <div class="card">
          <div class="section-label">You might also like — connected through shared cast, 2 hops away</div>
          <ul class="result-list">
            ${recs.map((r) => `<li data-id="${r.id}">${r.title} <span class="meta">${r.year} · ${r.matchingGenres.join(", ")}</span></li>`).join("")}
          </ul>
        </div>`;
      movieRecs.querySelectorAll("li[data-id]").forEach((li) => {
        li.addEventListener("click", () => loadMovie(li.dataset.id));
      });
    }
  } catch (err) {
    movieDetail.innerHTML = errorState(err.message);
    movieRecs.innerHTML = "";
  }
}

//co-start network

const personSearch = document.getElementById("person-search");
const personResults = document.getElementById("person-results");
const networkResult = document.getElementById("network-result");

personSearch.addEventListener(
  "input",
  debounce(async (e) => {
    const term = e.target.value.trim();
    personResults.innerHTML = "";
    if (!term) return;
    try {
      const results = await api(`/api/search/people?q=${encodeURIComponent(term)}`);
      if (results.length === 0) {
        personResults.innerHTML = `<li class="state">No one found for "${term}".</li>`;
        return;
      }
      personResults.innerHTML = "";
      results.forEach((p) => {
        const li = el(`<li>${p.name}</li>`);
        li.addEventListener("click", () => loadNetwork(p.id, p.name));
        personResults.appendChild(li);
      });
    } catch (err) {
      personResults.innerHTML = `<li class="state error">⚠ ${err.message}</li>`;
    }
  })
);

async function loadNetwork(id, name) {
  personResults.innerHTML = "";
  personSearch.value = "";
  networkResult.innerHTML = loadingState(`Mapping ${name}'s co-star network...`);
  try {
    const network = await api(`/api/people/${id}/network`);
    if (network.length === 0) {
      networkResult.innerHTML = `<div class="card"><h2>${name}</h2>${emptyState("No co-star connections found within 2 hops.")}</div>`;
      return;
    }
    const byHop = { 1: [], 2: [] };
    network.forEach((n) => { (byHop[n.hopsAway] || (byHop[n.hopsAway] = [])).push(n); });

    networkResult.innerHTML = `
      <div class="card">
        <h2>${name}</h2>
        <div class="section-label">Direct co-stars (1 hop)</div>
        <div class="pill-row">${(byHop[1] || []).map((n) => `<span class="pill">${n.name}</span>`).join("") || '<span class="meta">None on record.</span>'}</div>
        <div class="section-label">Extended network (2 hops — co-stars of co-stars)</div>
        <div class="pill-row">${(byHop[2] || []).map((n) => `<span class="pill">${n.name}</span>`).join("") || '<span class="meta">None on record.</span>'}</div>
      </div>`;
  } catch (err) {
    networkResult.innerHTML = errorState(err.message);
  }
}

function loadPersonInNetworkTab(id) {
  document.querySelector('.tab-btn[data-tab="network"]').click();
  api(`/api/people/${id}`).then((p) => loadNetwork(id, p.name)).catch(() => {});
}

//connection path 

function setupPathField(inputId, resultsId, chipId, key) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  const chip = document.getElementById(chipId);

  input.addEventListener(
    "input",
    debounce(async (e) => {
      const term = e.target.value.trim();
      results.innerHTML = "";
      if (!term) return;
      try {
        const people = await api(`/api/search/people?q=${encodeURIComponent(term)}`);
        if (people.length === 0) {
          results.innerHTML = `<li class="state">No one found for "${term}".</li>`;
          return;
        }
        results.innerHTML = "";
        people.forEach((p) => {
          const li = el(`<li>${p.name}</li>`);
          li.addEventListener("click", () => {
            state[key] = p;
            chip.innerHTML = `<span class="pill">${p.name}</span>`;
            results.innerHTML = "";
            input.value = "";
            updatePathButton();
          });
          results.appendChild(li);
        });
      } catch (err) {
        results.innerHTML = `<li class="state error">⚠ ${err.message}</li>`;
      }
    })
  );
}

setupPathField("path-from-search", "path-from-results", "path-from-selected", "pathFrom");
setupPathField("path-to-search", "path-to-results", "path-to-selected", "pathTo");

function updatePathButton() {
  document.getElementById("find-path-btn").disabled = !(state.pathFrom && state.pathTo);
}

document.getElementById("find-path-btn").addEventListener("click", async () => {
  const resultEl = document.getElementById("path-result");
  resultEl.innerHTML = loadingState("Tracing the shortest connection...");
  try {
    const result = await api(`/api/path?from=${state.pathFrom.id}&to=${state.pathTo.id}`);
    const chain = result.nodes
      .map((n) => `<span class="path-node ${n.type.toLowerCase()}">${n.label}</span>`)
      .join('<span class="path-arrow">→</span>');
    resultEl.innerHTML = `
      <div class="card">
        <div class="section-label">${result.hops} hop${result.hops !== 1 ? "s" : ""} apart</div>
        <div class="path-chain">${chain}</div>
      </div>`;
  } catch (err) {
    resultEl.innerHTML = errorState(err.message);
  }
});
