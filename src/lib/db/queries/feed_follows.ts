import { db } from "..";
import { users, feeds, feedFollows } from "../schema";
import { eq, and } from "drizzle-orm";
import { firstOrUndefined } from "./utils";


export async function createFeedFollow(userID, feedID: string) {
    const [newFeedFollow] = await db.insert(feedFollows).values({
            userId: userID,
            feedId: feedID
        }).returning();

    const [result] = await db.select({
            userName: users.name,
            feedName: feeds.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.id, newFeedFollow.id));

    return result;
}

export async function getFeedFollowsForUser(userID: string) {
    return await db.select({
            id:        feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            name:      feeds.name,
            url:       feeds.url,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, userID));
}

export async function deleteFeedFollow(userID, feedID: string) {
    const [result] = await db.delete(feedFollows)
        .where(and(
            eq(feedFollows.userId, userID),
            eq(feedFollows.feedId, feedID)
        ))
        .returning();

        return result;
}
