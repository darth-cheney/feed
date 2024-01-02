import { Command, number, string } from "https://deno.land/x/clay/mod.ts";
import * as path from "https://deno.land/std@0.210.0/path/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { Readability, isProbablyReaderable } from "npm:@mozilla/readability@^0.4.4";
import { parseMeta } from "./meta-parser.js";
import { getDB } from "./db.js";

const DB_PATH = path.resolve("/Users/ecgade/Sync/feed/feed-data.db");

const cmd = new Command("Ingest the linked site into our composite feed")
      .optional(string, "dbPath", { flags: ["db", "db-path"], description: "Path to the sqlite database" })
      .required(string, "url", {description: "The url of the page to ingest"});

const OPTIONS = cmd.run();
console.log(Deno.args);

if(!OPTIONS.dbPath || OPTIONS.dbPath == undefined){
  OPTIONS.dbPath = DB_PATH;
}

const getDom = async (url) => {
  const response = await fetch(url);
  if(!response.ok){
    throw new Error(response.status);
  }
  const text = await response.text();
  return new DOMParser().parseFromString(
    text,
    "text/html"
  );
};

const composeSqlInsert = (db, tableName, fieldsAndValuesArray) => {
  let questionMarks = fieldsAndValuesArray[1].map(val => "?").join(", ");
  let sql = `INSERT INTO ${tableName} ${fieldsAndValuesArray[0]} VALUES (${questionMarks})`;
  db.query(sql, fieldsAndValuesArray[1]);
};

const composeSqlFieldList = (aDict) => {
  let fieldNames = [];
  let fieldVals = [];
  Object.keys(aDict).filter(key => {
    return aDict[key];
  }).forEach(key => {
    fieldNames.push(key);
    fieldVals.push(aDict[key]);
  });
  return [
    `(${fieldNames.join(", ")})`,
    fieldVals
  ];
};

const normalizeMetaFromReadableHTML = (meta, readableHTML) => {
  if(!meta.site_name){
    meta.site_name = readableHTML.siteName;
  }
  if(!meta.summary){
    meta.summary = readableHTML.excerpt;
  }
  if(!meta.title){
    meta.title = readableHTML.title;
  }
  if(!meta.author){
    meta.author = readableHTML.byline;
  }
  meta.body = readableHTML.textContent;
  meta.body_html = readableHTML.content;
};

const normalizeDates = (meta) => {
  const now = new Date().toISOString();
  if(!meta.datePublished){
    meta.datePublished = now;
  }
  if(!meta.dateModified){
    meta.dateModified = now;
  }
  meta.dateAdded = now;
};

const report = (db, showBodies = false) => {
  let fields = [
    "id",
    "title",
    "author",
    "description",
    "summary",
    "publisher",
    "site_name",
    "image",
    "url",
    "datePublished",
    "dateModified",
    "dateAdded"
  ];
  if(showBodies){
    fields.push("body");
    fields.push("body_html");
  }
  let sql = fields.join(", ");
  sql = `SELECT ${sql} FROM feed_articles LIMIT 1;`;
  const [result] = db.query(sql);
  const response = {};
  fields.forEach((fieldName, index) => {
    response[fieldName] = result[index];
  });
  console.log(response);
};

const insertIntoDB = async (data) => {
  const db = await getDB(OPTIONS.dbPath);
  composeSqlInsert(
    db,
    "feed_articles",
    composeSqlFieldList(data)
  );
  db.close();
};

// Main
try {
  const document = await getDom(OPTIONS.url); 
  const meta = parseMeta(document, OPTIONS.url);
  const readableHTML = new Readability(document).parse();
  normalizeMetaFromReadableHTML(meta, readableHTML);
  normalizeDates(meta);
  await insertIntoDB(meta);
  console.log(`Added [${meta.url}]`);
} catch (e){
  console.error(e);
  Deno.exit(-1);
}
