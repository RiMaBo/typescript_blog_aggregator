type CommandHandler = (cmdName: string, ...args: string[]) => void;
type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {
    const handler = registry[cmdName];

    if (handler === undefined) {
        throw new Error(`Command Not Found: ${cmdName}`);
    }

    handler(cmdName, ...args);
}
