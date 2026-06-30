import { setUser } from "./config"


export function handlerLogin(cmdName: string, ...args: string[]): void {
    if (!args.length) {
        throw new Error(`Usage: ${cmdName} <name>`);
    }

    const userName = args[0];
    setUser(userName);
    console.log("User Switched Successfully.");
}
