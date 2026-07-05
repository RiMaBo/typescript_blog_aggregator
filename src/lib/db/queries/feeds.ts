import { db } from "..";
import { feeds } from "../schema";
import { firstOrUndefined } from "./utils";

import { uuid } from "drizzle-orm/pg-core";


export async function createFeed(name, url: string, user_id: uuid) {
    const result = await db.insert(feeds).values({
            name:    name,
            url:     url,
            user_id: user_id
        }).returning();

    return firstOrUndefined(result);
}
