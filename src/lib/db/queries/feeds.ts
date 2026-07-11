import { db } from "..";
import { feeds } from "../schema";
import { eq, sql } from "drizzle-orm";
import { firstOrUndefined } from "./utils";


export async function createFeed(name, url, userID: string) {
    const result = await db.insert(feeds).values({
        name:   name,
        url:    url,
        userId: userID
    }).returning();

    return firstOrUndefined(result);
}

export async function getFeeds() {
    return await db.select().from(feeds);
}

export async function getFeedByUrl(url: string) {
    const result = await db.select().from(feeds).where(eq(feeds.url, url));
    return firstOrUndefined(result);
}

export async function markFeedFetched(feedID: string) {
    const result = await db.update(feeds).set({ lastFetchedAt: new Date() }).where(eq(feeds.id, feedID)).returning();
    return firstOrUndefined(result);
}

export async function getNextFeedToFetch() {
    const result = await db.select().from(feeds).orderBy(sql`${feeds.lastFetchedAt} NULLS FIRST`).limit(1);
    return firstOrUndefined(result);
}
