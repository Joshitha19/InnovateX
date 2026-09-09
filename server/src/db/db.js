const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

let dbClient = null;
let isPostgres = false;

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL && (DATABASE_URL.startsWith("postgres://") || DATABASE_URL.startsWith("postgresql://"))) {
  isPostgres = true;
  const { Pool } = require("pg");
  dbClient = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
  console.log("[DB] Using PostgreSQL connection pool");
} else {
  isPostgres = false;
  const Database = require("better-sqlite3");
  const dataDir = path.join(__dirname, "../../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "delulu_hunt.db");
  dbClient = new Database(dbPath);
  dbClient.pragma("journal_mode = WAL");
  dbClient.pragma("foreign_keys = ON");
  console.log("[DB] Using local SQLite database:", dbPath);
}

// Helper to convert ? placeholders to $1, $2 for Postgres
function formatSql(sql) {
  if (!isPostgres) return sql;
  let paramIdx = 1;
  return sql.replace(/\?/g, () => `$${paramIdx++}`);
}

async function query(sql, params = []) {
  if (isPostgres) {
    const formatted = formatSql(sql);
    const res = await dbClient.query(formatted, params);
    return res.rows;
  } else {
    const stmt = dbClient.prepare(sql);
    return stmt.all(...params);
  }
}

async function get(sql, params = []) {
  if (isPostgres) {
    const formatted = formatSql(sql);
    const res = await dbClient.query(formatted, params);
    return res.rows[0] || null;
  } else {
    const stmt = dbClient.prepare(sql);
    return stmt.get(...params) || null;
  }
}

async function run(sql, params = []) {
  if (isPostgres) {
    const formatted = formatSql(sql);
    const res = await dbClient.query(formatted, params);
    return { rowCount: res.rowCount };
  } else {
    const stmt = dbClient.prepare(sql);
    const info = stmt.run(...params);
    return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
  }
}

async function executeRaw(sql) {
  if (isPostgres) {
    await dbClient.query(sql);
  } else {
    dbClient.exec(sql);
  }
}

module.exports = {
  db: dbClient,
  isPostgres,
  query,
  get,
  run,
  executeRaw,
};
