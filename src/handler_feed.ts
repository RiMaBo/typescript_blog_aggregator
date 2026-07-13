import { getUserByID } from "./lib/db/queries/users";
import { createFeed, getFeeds, getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { createFeedFollow } from "./lib/db/queries/feed_follows";
import { createPost } from "./lib/db/queries/posts";
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

export function printFeed(feed: Feed, user: User) {
    console.log(` - ID:      ${feed.id}`);
    console.log(` - Created: ${feed.createdAt}`);
    console.log(` - Updated: ${feed.updatedAt}`);
    console.log(` - Name:    ${feed.name}`);
    console.log(` - URL:     ${feed.url}`);
    console.log(` - User:    ${user.name}`);
    console.log("");
}

function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) {
        return 0;
    }

    let durationInMs = Number(match[1]);

    if (match[2] === "s") {
        durationInMs *= 1000;
    } else if (match[2] === "m") {
        durationInMs *= 60 * 1000;
    } else if (match[2] === "h") {
        durationInMs *= 60 * 60 * 1000;
    }

    return durationInMs;
}

function handleError(err: unknown) {
    console.error(`Error scraping feeds: ${err instanceof Error ? err.message : err}`);
}

async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const headers = new Headers({
        //"Content-Type": "application/rss+xml",
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

async function scrapeFeeds() {
    const feedToFetch = await getNextFeedToFetch();
    if (!feedToFetch) {
        throw new Error("Error finding feed to fetch");
    }

    const feedData = await fetchFeed(feedToFetch.url);
    if (!feedData) {
        throw new Error(`Error fetching feed ${feedToFetch.name}`);
    }

    await markFeedFetched(feedToFetch.id);

    for (const item of feedData.channel.item) {
        console.log(`Found post: %s`, item.title);

        let publishedAt = Date.parse(item.pubDate);
        if (!publishedAt) {
            publishedAt = new Date(Date.now()).toString();
        }
        publishedAt = new Date(new Date(publishedAt).toString());

        const newPost = await createPost(item.title, item.link, item.description, publishedAt, feedToFetch.id);
        if (!newPost) {
            console.error(`Unable to create post from feed ${feedToFetch.name}`);
            continue;
        }
    }

    console.log(`Feed ${feedToFetch.name} collected, ${feedData.channel.item.length} posts found`);
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    if (!args.length) {
        throw new Error(`Usage: ${cmdName} <time between requests>`);
    }

    const timeBetweenReqs = parseDuration(args[0]);
    if (timeBetweenReqs === 0) {
        throw new Error("Error parsing time between requests");
    }
    console.log(`Collecting feeds every ${args[0]}...`);

    scrapeFeeds().catch(handleError);

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenReqs);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length < 2) {
        throw new Error(`Usage: ${cmdName} <name> <url>`)
    }

    const feedName = args[0];
    const feedUrl = args[1];

    const feed = await createFeed(feedName, feedUrl, user.id);
    if (!feed) {
        throw new Error(`Error adding feed ${feedName} with URL ${feedUrl}`);
    }

    const feedFollow = await createFeedFollow(user.id, feed.id);
    if (!feedFollow) {
        throw new Error(`Error following feed ${feedUrl}`);
    }

    console.log("Feed added successfully:");
    printFeed(feed, user);
}

export async function handlerListFeeds(_: string) {
    const feeds = await getFeeds();
    if (!feeds) {
        console.log("No feeds found");
        return;
    }

    console.log(`Found ${feeds.length} feeds:`)
    for (const feed of feeds) {
        const user = await getUserByID(feed.userId);
        if (!user) {
            throw new Error(`Failed to find user for feed ${feed.id}`);
        }

        printFeed(feed, user);
    };
}
