import { registerCommand, runCommand } from "./commands";
import { handlerLogin, handlerRegister, handlerListUsers } from "./handler_user";
import { handlerReset } from "./handler_reset"
import { handlerAgg } from "./handler_feed"


async function main() {
    const args = process.argv.slice(2);
    if (!args.length) {
        console.log("Usage: cli <command> [args...]");
        process.exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);
    const cmdsRegistry: CommandsRegistry = {};

    registerCommand(cmdsRegistry, "login", handlerLogin);
    registerCommand(cmdsRegistry, "register", handlerRegister);
    registerCommand(cmdsRegistry, "reset", handlerReset);
    registerCommand(cmdsRegistry, "users", handlerListUsers);
    registerCommand(cmdsRegistry, "agg", handlerAgg);

    try {
        await runCommand(cmdsRegistry, cmdName, ...cmdArgs);
    } catch (err) {
        if (err instanceof Error) {
            console.error(`Error running command ${cmdName}: ${err.message}`);
        } else {
            console.error(`Error running command ${cmdName}: ${err}`);
        }

        process.exit(1);
    }

    process.exit(0);
}

main();
