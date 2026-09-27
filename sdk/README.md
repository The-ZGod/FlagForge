# FlagForge

TypeScript SDK for the FlagForge feature flag platform.

FlagForge allows applications to evaluate feature flags at runtime using a simple SDK.

With the SDK, applications can:

- Evaluate feature flags
- Enable or disable functionality without redeploying
- Use percentage rollouts
- Use user targeting rules
- Evaluate flags using user attributes
- Get evaluation reasons
- Keep runtime access scoped to a FlagForge environment

---

## Installation

Install the SDK using npm:

```bash
npm install flagforge-sdk
```

---

## Quick Start

```ts
import { FlagForge } from "flagforge-sdk";

const flagforge = new FlagForge({
  apiUrl: "https://flagforge-paju.onrender.com",
  apiKey: process.env.FLAGFORGE_API_KEY!,
});

const result = await flagforge.evaluate("new_checkout", {
  userId: "user-123",
  attributes: {
    country: "IN",
    plan: "premium",
  },
});

console.log(result);
```

Example response:

```ts
{
  enabled: true,
  reason: "FULL_ROLLOUT"
}
```

---

# API

## `FlagForge`

Creates a FlagForge SDK client.

```ts
const flagforge = new FlagForge({
  apiUrl: "https://flagforge-paju.onrender.com",
  apiKey: process.env.FLAGFORGE_API_KEY!,
});
```

### Configuration

| Option | Type | Description |
|---|---|---|
| `apiUrl` | `string` | URL of the FlagForge backend |
| `apiKey` | `string` | Environment-scoped FlagForge API key |

---

# `evaluate()`

The `evaluate()` method evaluates a feature flag and returns both the enabled state and the reason for the decision.

```ts
const result = await flagforge.evaluate("new_checkout", {
  userId: "user-123",
  attributes: {
    country: "IN",
    plan: "premium",
  },
});
```

Parameters:

```ts
{
  userId: string;
  attributes?: Record<string, string>;
}
```

Response:

```ts
{
  enabled: boolean;
  reason: string;
}
```

---

# `isEnabled()`

Use `isEnabled()` when you only need a boolean result.

```ts
const enabled = await flagforge.isEnabled("new_checkout", {
  userId: "user-123",
  attributes: {
    country: "IN",
    plan: "premium",
  },
});

if (enabled) {
  console.log("New checkout enabled");
}
```

---

# Environment API Key

The SDK uses an environment-scoped API key for runtime evaluation.

```env
FLAGFORGE_API_KEY=your-environment-api-key
```

The SDK sends the key using:

```http
X-FlagForge-Key: <your-api-key>
```

The backend resolves the environment from the API key.

Never commit a real API key to source control.

---

# Percentage Rollouts

FlagForge supports deterministic percentage rollouts.

For example:

```text
Rollout: 25%
```

A user may receive:

```text
User A → ON
User B → OFF
User C → OFF
User D → ON
```

The same user and feature flag combination produces a consistent result.

Possible response:

```ts
{
  enabled: true,
  reason: "PERCENTAGE_ROLLOUT"
}
```

A user excluded from the rollout can receive:

```ts
{
  enabled: false,
  reason: "PERCENTAGE_ROLLOUT_EXCLUDED"
}
```

---

# Targeting Rules

Feature flags can target users based on attributes.

For example:

```text
country EQUALS IN
```

The application can provide:

```ts
const result = await flagforge.evaluate("new_checkout", {
  userId: "user-123",
  attributes: {
    country: "IN",
  },
});
```

Multiple targeting rules can also be configured for a feature flag.

---

# Evaluation Reasons

The evaluation API can return:

```text
FLAG_NOT_FOUND
FLAG_DISABLED
FULL_ROLLOUT
PERCENTAGE_ROLLOUT
PERCENTAGE_ROLLOUT_EXCLUDED
TARGETING_RULE_NOT_MATCHED
```

Example:

```ts
const result = await flagforge.evaluate("new_checkout", {
  userId: "user-123",
});

console.log(result.enabled);
console.log(result.reason);
```

---

# Express Example

```ts
import express from "express";
import { FlagForge } from "flagforge-sdk";

const app = express();

const flagforge = new FlagForge({
  apiUrl: process.env.FLAGFORGE_API_URL!,
  apiKey: process.env.FLAGFORGE_API_KEY!,
});

app.get("/api/search", async (req, res) => {
  const userId =
    (req.headers["x-user-id"] as string) || "anonymous";

  const plan =
    (req.query.plan as string) || "free";

  const useAiSearch = await flagforge.isEnabled("ai_powered_search", {
    userId,
    attributes: {
      plan,
    },
  });

  res.json({
    aiSearchEnabled: useAiSearch,
  });
});

app.listen(4000, () => {
  console.log("Application running on port 4000");
});
```

---

# Environment Variables

Create a `.env` file:

```env
FLAGFORGE_API_URL=https://flagforge-paju.onrender.com
FLAGFORGE_API_KEY=your-environment-api-key
```

Then:

```ts
const flagforge = new FlagForge({
  apiUrl: process.env.FLAGFORGE_API_URL!,
  apiKey: process.env.FLAGFORGE_API_KEY!,
});
```

---

# Runtime Architecture

```text
┌─────────────────────────┐
│      Your Application   │
│                         │
│  import { FlagForge }   │
└────────────┬────────────┘
             │
             │ evaluate()
             ▼
┌─────────────────────────┐
│      FlagForge SDK      │
└────────────┬────────────┘
             │
             │ HTTPS
             │ X-FlagForge-Key
             ▼
┌─────────────────────────┐
│    FlagForge Backend    │
│                         │
│  Authentication         │
│  Flag Evaluation        │
│  Targeting              │
│  Rollouts               │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    PostgreSQL Database  │
└─────────────────────────┘
```

---

# Security

The SDK uses an environment-scoped API key for runtime evaluation.

For server-side applications, store the API key in an environment variable or secret manager.

Do not expose environment API keys in publicly accessible client-side applications unless your FlagForge environment and key usage are specifically designed for that scenario.

---

# Development

This repository contains the source code for the FlagForge SDK.

Install dependencies:

```bash
npm install
```

Build the SDK:

```bash
npm run build
```

The compiled package is generated in:

```text
dist/
```

---

# TypeScript

The SDK is written in TypeScript and provides TypeScript declaration files.

After installation:

```bash
npm install flagforge-sdk
```

Import the SDK:

```ts
import { FlagForge } from "flagforge-sdk";
```

---

# Example Project

A minimal application:

```text
my-app/
├── src/
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

Install:

```bash
npm install flagforge-sdk
```

`.env`:

```env
FLAGFORGE_API_URL=https://flagforge-paju.onrender.com
FLAGFORGE_API_KEY=your-environment-api-key
```

`src/index.ts`:

```ts
import "dotenv/config";
import { FlagForge } from "flagforge-sdk";

const flagforge = new FlagForge({
  apiUrl: process.env.FLAGFORGE_API_URL!,
  apiKey: process.env.FLAGFORGE_API_KEY!,
});

async function main() {
  const result = await flagforge.evaluate("new_checkout", {
    userId: "user-123",
    attributes: {
      country: "IN",
      plan: "premium",
    },
  });

  console.log(result);
}

main().catch(console.error);
```

---

# License

MIT License.

See the `LICENSE` file for the complete license text.

---

# FlagForge

FlagForge is a feature flag and experimentation platform designed to support:

- Runtime feature releases
- Percentage rollouts
- Targeting rules
- Environment-specific configuration
- Runtime feature evaluation
- Developer SDK integration

Repository:

https://github.com/The-ZGod/FlagForge
