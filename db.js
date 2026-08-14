const neo4j = require("neo4j-driver");
require("dotenv").config();

const { COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD } = process.env;

if (!COGNODB_URI || !COGNODB_USER || !COGNODB_PASSWORD) {
  console.error(
    "[db] Missing CognoDB connection details. "
  );
  process.exit(1);
}

const driver = neo4j.driver(
  COGNODB_URI,
  neo4j.auth.basic(COGNODB_USER, COGNODB_PASSWORD),
  { maxConnectionPoolSize: 20 }
);

async function verifyConnection() {
  try {
    await driver.verifyConnectivity();
    console.log("[db] Connected to CognoDB successfully.");
    return true;
  } catch (err) {
    console.error("[db] Could not connect to CognoDB:", err.message);
    return false;
  }
}

async function runQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

module.exports = { driver, verifyConnection, runQuery };
