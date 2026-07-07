import { db } from "..";
import { feeds } from "../schema";
import { eq } from "drizzle-orm";
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
