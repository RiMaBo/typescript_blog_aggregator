import { readConfig } from "./config"
import { getUser } from "./lib/db/queries/users"
import { createFeed } from "./lib/db/queries/feeds"
import { Feed, User } from "./src/lib/db/schema";

import { XMLParser } from "fast-xml-parser"


type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

function printFeed(feed: Feed, user: User) {
    console.log(` - ID:      ${feed.id}`);
    console.log(` - Created: ${feed.createdAt}`);
    console.log(` - Updated: ${feed.updatedAt}`);
    console.log(` - Name:    ${feed.name}`);
    console.log(` - URL:     ${feed.url}`);
    console.log(` - User:    ${user.name}`);
}

async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    let headers = new Headers({
        "Content-Type": "application/rss+xml",
        "User-Agent":   "gator",
    });

    const response = await fetch(feedURL, { headers: headers });
    if (!response.ok) {
        throw new Error(`Error fetching feed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();

    const parserOptions = {
        processEntities: false,
    };

    const parser = new XMLParser(parserOptions);
    const result = parser.parse(xml);

    const channel = result.rss?.channel;
    if (!channel) {
        throw new Error("Error parsing XML. Channel not found");
    }

    if (!channel.title || !channel.link || !channel.description || !channel.item) {
        throw new Error("Error parsing Channel");
    }

    const items: any[] = Array.isArray(channel.item) ? channel.item : [channel.item];

    const rssItems: RSSItem = [];
    items.forEach((item) => {
        if (item.title && item.link && item.description && item.pubDate) {
            rssItems.push({
                title:       item.title,
                link:        item.link,
                description: item.description,
                pubDate:     item.pubDate,
            });
        }
    });

    const rssFeed: RSSFeed = {
        channel: {
            title:       channel.title,
            link:        channel.link,
            description: channel.description,
            item:        rssItems,
        }
    };

    return rssFeed;
}

export async function handlerAgg(_: string) {
    const feedURL = "https://www.wagslane.dev/index.xml";

    const feedData = await fetchFeed(feedURL);
    const feedDataStr = JSON.stringify(feedData, null, 2);
    console.log(feedDataStr);
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length < 2) {
        throw new Error(`Usage: ${cmdName} <name> <url>`)
    }

    const cfg = readConfig();
    const user = await getUser(cfg.currentUserName);
    if (!user) {
        throw new Error(`Error adding feed. User ${cfg.currentUserName} does not exist`);
    }

    const feedName = args[0];
    const feedUrl = args[1];

    const feed = await createFeed(feedName, feedUrl, user.id);
    if (!feed) {
        throw new Error(`Error adding feed ${feedName} with URL ${feedUrl}`);
    }

    console.log("Feed added successfully:");
    printFeed(feed, user);
}
