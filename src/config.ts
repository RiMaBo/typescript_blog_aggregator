import fs from "fs";
import os from "os";
import path from "path";


type Config = {
    dbUrl: string;
    currentUserName?: string;
};

function getConfigFilePath(): string {
    const configFileName = ".gatorconfig.json"
    return path.join(os.homedir(), configFileName);
}

function validateConfig(rawConfig: any): Config {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("db_url is required in config file");
    }

    const cfg: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name ?? ""
    };

    return cfg;
}

function writeConfig(cfg: Config): void {
    const jsonPayload = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName
    };

    const data = JSON.stringify(jsonPayload, null, 2);
    fs.writeFileSync(getConfigFilePath(), data, { encoding: "utf-8" });
}

export function readConfig(): Config {
    const data = fs.readFileSync(getConfigFilePath(), "utf-8");
    const rawConfig = JSON.parse(data);

    return validateConfig(rawConfig);
}

export function setUser(userName: string): void {
    const cfg = readConfig();
    cfg.currentUserName = userName;
    writeConfig(cfg);
}
