import { db } from "..";
import { posts, feedFollows, feeds } from "../schema";
import { eq, desc } from "drizzle-orm";


export async function createPost(title, url, description, publishedAt, feedID: string) {
    const [result] = await db.insert(posts).values({
        title:       title,
        url:         url,
        description: description,
        publishedAt: publishedAt,
        feedId:      feedID
    }).returning();

    return result;
};

export async function getPostsForUser(userID: string, limit: number) {
    return await db.select({
            id: posts.id,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            title: posts.title,
            url: posts.url,
            description: posts.description,
            publishedAt: posts.publishedAt,
            feedId: posts.feedId,
            name: feeds.name
        })
        .from(posts)
        .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
        .innerJoin(feeds, eq(posts.feedId, feeds.id))
        .where(eq(feedFollows.userId, userID))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
};
