import { Handlebars } from 'https://deno.land/x/handlebars/mod.ts';
import { getDB } from "./db.js";
import { Command, number, string } from "https://deno.land/x/clay/mod.ts";
import * as path from "https://deno.land/std@0.210.0/path/mod.ts";

const FIELDS = [
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
  "dateAdded",
];

const cmd = new Command("Render the feed database items to a plain page")
      .required(string, "dbPath", {description: "The path to the sqlite databse"});

const OPTIONS = cmd.run();
const dbPath = path.resolve(OPTIONS.dbPath);
const db = await getDB(dbPath);
const itemQuery = `${FIELDS.join(", ")}`;
const query = db.query(`SELECT ${itemQuery} FROM feed_articles LIMIT 5;`);
db.close();

const data = query.map(row => {
  let result = {};
  row.forEach((entry, index) => {
    const key = FIELDS[index];
    result[key] = entry;
  });
  return result;
});



const handle = new Handlebars();

const result = await handle.renderView("main", {items: data});

await Deno.writeTextFile("output.html", result);

