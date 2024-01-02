import { Command, number, string } from "https://deno.land/x/clay/mod.ts";
import * as path from "https://deno.land/std@0.210.0/path/mod.ts";

const cmd = new Command("Ingest all urls in the specified text file.\n\nEach url should be specified on its own line")
      .required(string, "dbPath", {flags: [ "db", "db-path"], description: "Path to the sqlite database"})
      .required(string, "inputPath", {description: "Path to the input file"});

const OPTIONS = cmd.run();

const inputPath = path.resolve(OPTIONS.inputPath);
const dbPath = path.resolve(OPTIONS.dbPath);
const text = await Deno.readTextFile(inputPath);
const urls = text.split("\n").filter(line => {
  return line && line != "" && line != "\n";
});

for(let i = 0; i < urls.length; i++){
  const url = urls[i];
  console.log(url);
  const proc = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "./ingest.js",
      url,
      "--db-path",
      dbPath
    ]
  });
  const { code, stdout, stderr } = proc.outputSync();
  const output = new TextDecoder().decode(stdout);
  const err = new TextDecoder().decode(stderr);
  console.log(output);
  console.error(err);
}

