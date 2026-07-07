import { readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";
import { getFeedByUrl } from "./lib/db/queries/feeds"
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follows"
import { printFeed } from "./handler_feed"


export async function handlerAddFeedFollow(cmdName: string, ...args: string[]) {
    if (!args.length) {
        throw new Error(`Usage: ${cmdName} <url>`);
    }

    const cfg = readConfig();
    const user = await getUser(cfg.currentUserName);
    if (!user) {
        throw new Error(`Error following feed. User ${cfg.currentUserName} does not exist`);
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

export async function handlerListFeedFollows(_: string) {
    const cfg = readConfig();
    const user = await getUser(cfg.currentUserName);
    if (!user) {
        throw new Error(`Error listing feed follows. User ${cfg.currentUserName} does not exist`);
    }

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
