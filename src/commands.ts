import { User } from "./src/lib/db/schema";


type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
type CommandsRegistry = Record<string, CommandHandler>;

export type UserCommandHandler = (
    cmdName: string,
    user:    User,
    ...args: string[]
) => Promise<void>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler = registry[cmdName];

    if (handler === undefined) {
        throw new Error(`Command Not Found: ${cmdName}`);
    }

    await handler(cmdName, ...args);
}
