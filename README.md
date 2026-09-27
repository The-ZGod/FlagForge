# FlagForge

FlagForge is a feature flag platform that lets applications **release features gradually without redeploying**.

You create a feature flag in FlagForge, connect your application using the SDK, and ask FlagForge whether a feature should be enabled for a user.

```text
Your Application
      |
      | "Should this feature be enabled?"
      v
   FlagForge
      |
      v
    ON / OFF
```

## What you can do

- Turn a feature ON or OFF
- Release a feature to a percentage of users
- Target users using attributes such as `country` or `plan`
- Evaluate flags through a runtime API
- Use the published `flagforge-sdk`
- Keep separate flags and API keys for each environment
- View activity and evaluation metrics in the dashboard

---

## How FlagForge works

```text
1. Create a Project
       ↓
2. Create an Environment
       ↓
3. Create a Feature Flag
       ↓
4. Get the Environment API Key
       ↓
5. Add flagforge-sdk to your backend
       ↓
6. Evaluate the flag for a user
       ↓
7. FlagForge returns ON / OFF
```

### Example

Suppose you create:

```text
Flag name: New Checkout
Flag key:  new_checkout
Enabled:    ON
Rollout:    25%
```

Your application can ask:

```ts
const enabled = await flagforge.isEnabled("new_checkout", {
  userId: "user-123"
});
```

FlagForge decides whether `user-123` receives the feature.

---

# Using FlagForge in your project

The easiest way to integrate FlagForge is with the published SDK.

## 1. Install the SDK

### npm

```bash
npm install flagforge-sdk
```

### pnpm

```bash
pnpm add flagforge-sdk
```

### yarn

```bash
yarn add flagforge-sdk
```

## 2. Get your Environment API Key

In the FlagForge dashboard:

```text
API Keys
   ↓
Select your environment
   ↓
Copy the environment API key
```

Store it in your backend environment variables:

```env
FLAGFORGE_API_KEY=your-environment-api-key
```

**Do not put the API key in frontend/browser code.**

## 3. Create a feature flag

In FlagForge:

```text
Feature Flags
   ↓
Create Flag
```

For example:

```text
Name: New Checkout
Key:  new_checkout
```

The **Flag Key** is the value you pass to the SDK.

## 4. Initialize the SDK

### JavaScript

```js
import { FlagForge } from "flagforge-sdk";

const flagforge = new FlagForge({
  apiUrl: "https://flagforge-paju.onrender.com",
  apiKey: process.env.FLAGFORGE_API_KEY
});
```

### TypeScript

```ts
import { FlagForge } from "flagforge-sdk";

const flagforge = new FlagForge({
  apiUrl: "https://flagforge-paju.onrender.com",
  apiKey: process.env.FLAGFORGE_API_KEY!
});
```

## 5. Evaluate your feature flag

Use your **own feature flag key** and your application's user ID:

```js
const enabled = await flagforge.isEnabled("YOUR_FEATURE_FLAG_KEY", {
  userId: "YOUR_USER_ID"
});

if (enabled) {
  // Show the new feature
} else {
  // Show the existing feature
}
```

### Where do these values come from?

- `YOUR_FEATURE_FLAG_KEY` → the **Flag Key** of the feature flag you created in FlagForge.
- `YOUR_USER_ID` → a stable user ID from your own application.
- `FLAGFORGE_API_KEY` → the API key for the environment your application uses.

---

# Targeting users

You can target users using attributes.

For example, create a rule:

```text
country EQUALS IN
```

Then send the user's attributes:

```ts
const enabled = await flagforge.isEnabled("new_checkout", {
  userId: "user-123",
  attributes: {
    country: "IN"
  }
});
```

Supported rule operators currently include:

```text
EQUALS
NOT_EQUALS
```

---

# Percentage rollouts

You can release a feature to only a percentage of users.

For example:

```text
Rollout: 25%
```

FlagForge uses the user's ID and flag key to create a deterministic bucket.

```text
User ID + Flag Key
        ↓
      SHA-256
        ↓
    Bucket 0–99
        ↓
 Compare with rollout %
        ↓
      ON / OFF
```

The same user receives a consistent result for the same flag.

---

# SDK methods

### `isEnabled()`

Use this when you only need `true` or `false`.

```ts
const enabled = await flagforge.isEnabled("new_checkout", {
  userId: "user-123"
});
```

### `evaluate()`

Use this when you also want to know why FlagForge returned the result.

```ts
const result = await flagforge.evaluate("new_checkout", {
  userId: "user-123",
  attributes: {
    country: "IN"
  }
});

console.log(result.enabled);
console.log(result.reason);
```

Possible reasons include:

```text
FLAG_NOT_FOUND
FLAG_DISABLED
FULL_ROLLOUT
PERCENTAGE_ROLLOUT
PERCENTAGE_ROLLOUT_EXCLUDED
TARGETING_RULE_NOT_MATCHED
```

---

# Without the SDK

You can also call the runtime API directly from any backend language.

```bash
curl -X POST https://flagforge-paju.onrender.com/api/evaluation   -H "Content-Type: application/json"   -H "X-FlagForge-Key: YOUR_ENVIRONMENT_API_KEY"   -d '{
    "flagKey": "YOUR_FEATURE_FLAG_KEY",
    "userId": "YOUR_USER_ID",
    "attributes": {
      "country": "IN"
    }
  }'
```

Example response:

```json
{
  "enabled": true,
  "reason": "PERCENTAGE_ROLLOUT"
}
```

---

# Project structure

```text
FlagForge/
├── backend/     # Express API, evaluation engine, database logic
├── frontend/    # React dashboard
├── sdk/         # TypeScript SDK
├── demo/        # SDK demo application
├── docker.compose.yml
└── package.json
```

---

# Tech Stack

| Part | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Runtime API Keys | SHA-256 |
| SDK | TypeScript |
| Testing | Jest + Supertest |
| Database Development | Docker |

---

# Run FlagForge locally

## Prerequisites

- Node.js
- npm
- Docker
- Git

## 1. Clone

```bash
git clone <repository-url>
cd FlagForge
```

## 2. Start PostgreSQL

```bash
docker compose -f docker.compose.yml up -d
```

PostgreSQL runs on:

```text
localhost:5433
```

## 3. Configure the backend

Create:

```text
backend/.env
```

```env
DATABASE_URL="postgresql://FlagForgeUser:FlagForgePassword@localhost:5433/FlagForgeDb"
JWT_SECRET="your-secret"
```

## 4. Install and start the backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend:

```text
http://localhost:3000
```

## 5. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend URL will be shown by Vite.

---

# Testing

Run the backend tests:

```bash
cd backend
npm test
```

The tests cover important areas such as:

- Authentication
- Authorization
- Feature flag evaluation
- Targeting rules
- Percentage rollouts
- Deterministic bucketing
- API key authentication

---

# License

This project is intended as a portfolio and learning project.
