import { deleteUsers } from "./lib/db/queries/users"


export async function handlerReset(_: string) {
    const result = await deleteUsers();
    if (!result) {
        throw new Error("Error running Reset command");
    }

    console.log("Database reset successfully")
}

