import { setUser } from "./config"
import { getUser, createUser } from "./lib/db/queries/users"


export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (!args.length) {
        throw new Error(`Usage: ${cmdName} <name>`);
    }

    const userName = args[0];

    const foundUser = await getUser(userName);
    if (!foundUser) {
        throw new Error(`User ${userName} not found`);
    }

    setUser(foundUser.name);
    console.log("User Switched Successfully.");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (!args.length) {
        throw new Error(`Usage: ${cmdName} <name>`);
    }

    const userName = args[0];

    const foundUser = await getUser(userName);
    if (foundUser) {
        throw new Error(`User ${userName} already exists`);
    }

    const createdUser = await createUser(userName);
    if (!createdUser) {
        throw new Error(`Error creating user ${userName}`);
    }

    console.log(`User ${userName} created successfully.`);

    setUser(createdUser.name);
    console.log("User Switched Successfully.");
}
