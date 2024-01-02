CREATE TABLE IF NOT EXISTS feed_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  author TEXT,
  description TEXT,
  summary TEXT,
  publisher TEXT,
  site_name TEXT,
  image TEXT,
  url TEXT UNIQUE,
  datePublished TEXT,
  dateModified TEXT,
  dateAdded TEXT,
  body TEXT,
  body_html TEXT
);
