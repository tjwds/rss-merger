const htmlparser2 = require("htmlparser2");
const fetch = require("node-fetch");
const { toXML } = require("jstoxml");

const rssTemplate = (formattedBuildDate, itemsString) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
    <channel>
        <title>Joe Woods</title>
        <link>https://joewoods.dev</link>
        <description></description>
        <generator>rss-merger</generator>
        <language>en</language>
        <atom:link href="https://rss.joewoods.dev/rss.xml" rel="self" type="application/rss+xml"/>
        <lastBuildDate>${formattedBuildDate}</lastBuildDate>
        ${itemsString}
    </channel>
</rss>`;
};

const fetchAndMergeFeeds = async () => {
  const fileOne = await fetch("https://blog.joewoods.dev/rss.xml").then((res) =>
    res.text()
  );
  const fileTwo = await fetch("https://notes.joewoods.dev/rss.xml").then(
    (res) => res.text()
  );

  const feedOne = htmlparser2.parseFeed(fileOne.toString());
  const feedTwo = htmlparser2.parseFeed(fileTwo.toString());

  feedOne.items.push(...feedTwo.items);
  feedOne.link = "https://joewoods.dev";
  if (feedTwo.updated > feedOne.updated) feedOne.updated = feedTwo.updated;

  feedOne.items.sort((a, b) => a.pubDate - b.pubDate).reverse();

  feedOne.items.forEach(
    (item) => (item.pubDate = new Date(item.pubDate).toUTCString())
  );

  console.log(
    rssTemplate(
      new Date().toUTCString(),
      feedOne.items.map((item) => "<item>" + toXML(item) + "</item>").join("")
    )
  );

  return feedOne;
};

fetchAndMergeFeeds();
