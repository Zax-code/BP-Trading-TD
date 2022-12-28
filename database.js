const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

async function initializeDatabase() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(
    "CREATE TABLE candles (Id INTEGER PRIMARY KEY, date INTEGER, high REAL, low REAL, open REAL, close REAL, volume REAL)"
  );
  db.run(
    "CREATE TABLE trade_data (Id INTEGER PRIMARY KEY, uuid TEXT, traded_crypto REAL, price REAL, created_at_int INT, side TEXT)"
  );
  db.run(
    "CREATE TABLE last_checks(Id INTEGER PRIMARY KEY, exchange TEXT, trading_pair TEXT, duration TEXT, table_name TEXT, last_check INT, startdate INT, last_id INT)"
  );
  return db;
}

async function loadDatabase() {
  const SQL = await initSqlJs();
  const filebuffer = fs.readFileSync(path.join(__dirname, "database.db"));
  const db = new SQL.Database(filebuffer);
  return db;
}

async function saveDatabase(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(__dirname, "database.db"), buffer);
}

async function insertData(db, table, data) {
  const columns = Object.keys(data[0]).join(",");
  const placeholders = Object.keys(data[0])
    .map((key) => "?")
    .join(",");
  const values = data.map((row) => {
    return Object.values(row);
  });
  const stmt = db.prepare(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
  );
  console.log(stmt.getSQL());
  db.exec("BEGIN TRANSACTION");
  try {
    for (const value of values) {
      stmt.run(value);
    }
    stmt.free();
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    console.log(e);
  }
}

async function deleteData(db, table, ids) {
  db.exec(`DELETE FROM ${table} WHERE Id IN (${ids.join(",")})`);
}

modules.exports = {
  initializeDatabase,
  loadDatabase,
  saveDatabase,
  insertData,
  deleteData,
};
