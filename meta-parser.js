

const OG_TAGS = ["title", "description", "image", "url", "site_name"];
const OG_KEY = "property";
const ITEM_PROP_TAGS = [
  "author",
  "description",
  "publisher",
  "datePublished",
  "dateModified",
];
const ITEM_PROP_KEY = "itemprop";

const extractOGTagInfo = (dom) => {
  let result = {};
  OG_TAGS.forEach((tagName) => {
    const el = dom.querySelector(`meta[${OG_KEY}="og:${tagName}"]`);
    if (el) {
      result[tagName] = el.getAttribute("content");
    }
  });
  return result;
};

const extractItemPropInfo = (dom) => {
  let result = {};
  ITEM_PROP_TAGS.forEach((tagName) => {
    const el = dom.querySelector(`meta[${ITEM_PROP_KEY}="${tagName}"]`);
    if (el) {
      result[tagName] = el.getAttribute("content");
    }
  });
  return result;
};

export const parseMeta = (dom, sourceUrl) => {
  
  const ogResult = extractOGTagInfo(dom);
  const propResult = extractItemPropInfo(dom);
  const result = { ...ogResult, ...propResult };
  result.url = sourceUrl;
  return result;
};
