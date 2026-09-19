import { FlagForge } from "../../sdk/dist/index.js";

const apiKey = process.env.FLAGFORGE_API_KEY;

if (!apiKey) {
    throw new Error("FLAGFORGE_API_KEY is not configured");
}

const flagforge = new FlagForge({
    apiUrl: "http://localhost:3000",
    apiKey,
});

const result = await flagforge.evaluate(
    "new_checkout",
    {
        userId: "customer-001",
        attributes: {
            country: "IN",
        },
    }
);

console.log("Flag evaluation result:");
console.log(result);