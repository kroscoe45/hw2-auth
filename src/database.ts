import sqlite3 from "sqlite3";

//initialize the database on disk in the data directory
const db = new sqlite3.Database("./data/database.db");
