import { getPostsForUser } from "./lib/db/queries/posts";
import type { User } from "../lib/db/schema";


export async function handlerBrowsePosts(cmdName: string, user: User, ...args: string[]) {
    let limit = 2;

    if (args.length) {
        if (!Number(args[0])) {
            throw new Error("Please provide a numeric value for limit");
        }

        limit = args[0];
    }

    const posts = await getPostsForUser(user.id, limit);
    if (!posts) {
        throw new Error("Error getting posts");
    }

    for (const post of posts) {
        console.log(`Feed:         ${post.name}`);
        console.log(`Title:        ${post.title}`);
        console.log(`Link:         ${post.url}`);
        console.log(`Published At: ${post.publishedAt}`);
        console.log(`Description:  ${post.description}`);
        console.log("");
    }
};
