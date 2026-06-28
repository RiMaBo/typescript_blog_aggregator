import { readConfig, setUser } from "./config";


function main() {
    setUser("RiMaBo");
    const cfg = readConfig();
    console.log(cfg);
}

main();
