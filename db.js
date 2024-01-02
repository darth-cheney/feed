import { DB } from "https://deno.land/x/sqlite/mod.ts";

const BOOTSTRAP_SQL_PATH = "./bootstrap.sql";

export const getDB = async (path) => {
  let dbPath = path;
  if(!path){
    dbPath = "./database.db";
  }
  const text = await Deno.readTextFile(BOOTSTRAP_SQL_PATH);
  const db = new DB(dbPath);
  db.execute(text);
  return db;
};
