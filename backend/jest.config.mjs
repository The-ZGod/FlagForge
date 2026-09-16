export default {
    testEnvironment: "node",

    transform: {
        "^.+\\.tsx?$": [
            "@swc/jest",
            {
                jsc: {
                    parser: {
                        syntax: "typescript",
                    },
                    target: "es2022",
                },
                module: {
                    type: "es6",
                },
            },
        ],
    },

    extensionsToTreatAsEsm: [".ts"],

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    testMatch: [
        "**/*.test.ts",
    ],
};