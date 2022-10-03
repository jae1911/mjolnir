/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as fs from "fs";
import * as path from "path";
import { load } from "js-yaml";
import { MatrixClient } from "matrix-bot-sdk";

/**
 * The configuration, as read from production.yaml
 *
 * See file default.yaml for the documentation on individual options.
 */
// The object is magically generated by external lib `config`
// from the file specified by `NODE_ENV`, e.g. production.yaml
// or harness.yaml.
export interface IConfig {
    homeserverUrl: string;
    rawHomeserverUrl: string;
    accessToken: string;
    pantalaimon: {
        use: boolean;
        username: string;
        password: string;
    };
    dataPath: string;
    acceptInvitesFromSpace: string;
    autojoinOnlyIfManager: boolean;
    recordIgnoredInvites: boolean;
    managementRoom: string;
    verboseLogging: boolean;
    logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
    syncOnStartup: boolean;
    verifyPermissionsOnStartup: boolean;
    noop: boolean;
    protectedRooms: string[]; // matrix.to urls
    fasterMembershipChecks: boolean;
    automaticallyRedactForReasons: string[]; // case-insensitive globs
    protectAllJoinedRooms: boolean;
    /**
     * Backgrounded tasks: number of milliseconds to wait between the completion
     * of one background task and the start of the next one.
     */
    backgroundDelayMS: number;
    pollReports: boolean;
    /**
     * Whether or not new reports, received either by webapi or polling,
     * should be printed to our managementRoom.
     */
    displayReports: boolean;
    admin?: {
        enableMakeRoomAdminCommand?: boolean;
    }
    commands: {
        allowNoPrefix: boolean;
        additionalPrefixes: string[];
        confirmWildcardBan: boolean;
    };
    protections: {
        wordlist: {
            words: string[];
            minutesBeforeTrusting: number;
        };
        mentionflood: {
            minutesBeforeTrusting: number;
        };
    };
    health: {
        healthz: {
            enabled: boolean;
            port: number;
            address: string;
            endpoint: string;
            healthyStatus: number;
            unhealthyStatus: number;
        };
    };
    web: {
        enabled: boolean;
        port: number;
        address: string;
        abuseReporting: {
            enabled: boolean;
        }
        ruleServer?: {
            enabled: boolean;
        }
    }

    /**
     * Config options only set at runtime. Try to avoid using the objects
     * here as much as possible.
     */
    RUNTIME: {
        client?: MatrixClient;
    };
}

const defaultConfig: IConfig = {
    homeserverUrl: "http://localhost:8008",
    rawHomeserverUrl: "http://localhost:8008",
    accessToken: "NONE_PROVIDED",
    pantalaimon: {
        use: false,
        username: "",
        password: "",
    },
    dataPath: "/data/storage",
    acceptInvitesFromSpace: '!noop:example.org',
    autojoinOnlyIfManager: false,
    recordIgnoredInvites: false,
    managementRoom: "!noop:example.org",
    verboseLogging: false,
    logLevel: "INFO",
    syncOnStartup: true,
    verifyPermissionsOnStartup: true,
    noop: false,
    protectedRooms: [],
    fasterMembershipChecks: false,
    automaticallyRedactForReasons: ["spam", "advertising"],
    protectAllJoinedRooms: false,
    backgroundDelayMS: 500,
    pollReports: false,
    displayReports: true,
    commands: {
        allowNoPrefix: false,
        additionalPrefixes: [],
        confirmWildcardBan: true,
    },
    protections: {
        wordlist: {
            words: [],
            minutesBeforeTrusting: 20
        },
        mentionflood: {
            minutesBeforeTrusting: 20
        }
    },
    health: {
        healthz: {
            enabled: false,
            port: 8080,
            address: "0.0.0.0",
            endpoint: "/healthz",
            healthyStatus: 200,
            unhealthyStatus: 418,
        },
    },
    web: {
        enabled: false,
        port: 8080,
        address: "localhost",
        abuseReporting: {
            enabled: false,
        },
        ruleServer: {
            enabled: false,
        },
    },

    // Needed to make the interface happy.
    RUNTIME: {
    },
};

export function read(): IConfig {
    const config_dir = process.env.NODE_CONFIG_DIR || "./config";
    const config_file = `${process.env.NODE_ENV || "default"}.yaml`

    const content = fs.readFileSync(path.join(config_dir, config_file), "utf8");
    const parsed = load(content);
    const config = {...defaultConfig, ...(parsed as object)} as IConfig;
    return config;
}
