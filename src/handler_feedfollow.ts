import { getFeedByUrl } from "./lib/db/queries/feeds"
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./lib/db/queries/feed_follows"
import { printFeed } from "./handler_feed"
import { User } from "./src/lib/db/schema";


export async function handlerAddFeedFollow(cmdName: string, user: User, ...args: string[]) {
    if (!args.length) {
        throw new Error(`Usage: ${cmdName} <url>`);
    }

    const url = args[0];

    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Error following feed ${url}. Feed not found`);
    }

    const feedFollow = await createFeedFollow(user.id, feed.id);
    if (!feedFollow) {
        throw new Error(`Error following feed ${url}`);
    }

    console.log(`${feedFollow.userName} now successfully following feed ${feedFollow.feedName}`);
}

export async function handlerListFeedFollows(_: string, user: User) {
    const feedFollows = await getFeedFollowsForUser(user.id);
    if (!feedFollows) {
        console.log(`${user.name} is not following any feeds`);
        return;
    }

    console.log(`${user.name} is following ${feedFollows.length} feeds:`);
    for (const feed of feedFollows) {
        printFeed(feed, user);
    }
}

export async function handlerUnfollowFeed(cmdName: string, user: User, ...args: string[]) {
    if (!args.length) {
        throw new Error(`Usage: ${cmdName} <url>`);
    }

    const url = args[0];

    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Error unfollowing feed ${url}. Feed not found`);
    }

    const feedUnfollow = await deleteFeedFollow(user.id, feed.id);
    if (!feedUnfollow) {
        throw new Error(`Error following feed ${url}`);
    }

    console.log(`${user.name} no longer following feed ${url}`);
}
