const htmlparser2 = require("htmlparser2");
const fetch = require("node-fetch");
const { toXML } = require("jstoxml");

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

  console.log(toXML(feedOne));

  return feedOne;
};

fetchAndMergeFeeds()
