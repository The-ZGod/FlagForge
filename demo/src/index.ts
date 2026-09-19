import { FlagForge } from "../../sdk/dist/index.js";

const flagforge = new FlagForge({
    apiUrl: "http://localhost:3000",
    apiKey: "PASTE_YOUR_GENERATED_API_KEY_HERE",
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