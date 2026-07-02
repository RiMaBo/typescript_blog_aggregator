import { registerCommand, runCommand } from "./commands";
import { handlerLogin, handlerRegister } from "./handler_user";


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
