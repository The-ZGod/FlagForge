# FlagForge

FlagForge is a feature flag and controlled rollout platform built with TypeScript, React, Express, PostgreSQL, and Prisma.

It allows applications to control feature availability without requiring a new deployment.

A feature can be:

- Enabled or disabled globally
- Released to a percentage of users
- Targeted using user attributes
- Evaluated through a runtime API
- Consumed through a lightweight TypeScript SDK

---

## Why FlagForge?

Feature flags allow teams to safely release and control application functionality.

Instead of deploying a feature directly to every user:

```text
Application
     |
     v
Ask FlagForge
     |
     v
Should this feature be enabled?
     |
     v
Flag Evaluation
     |
     +------> ON
     |
     +------> OFF
```

This allows features to be gradually released and targeted to specific users or user groups.

---

# Features

## Authentication

FlagForge provides JWT-based authentication for dashboard users.

Users can:

- Register
- Login
- Access protected dashboard APIs
- Manage resources they own

Passwords are hashed before being stored.

---

## Projects

A project represents an application or product using FlagForge.

Example:

```text
Project: E-Commerce Application
```

Projects belong to users and provide the top-level organization for environments and feature flags.

---

## Environments

Each project can contain multiple environments.

Example:

```text
Project
├── Development
├── Staging
└── Production
```

Each environment contains its own feature flags and has its own environment-scoped SDK API key.

---

## Feature Flags

A feature flag contains:

- Name
- Key
- Enabled state
- Rollout percentage
- Targeting rules

Example:

```text
Name: New Checkout
Key: new_checkout
Enabled: true
Rollout: 25%
```

A flag can be enabled or disabled without changing the application code.

---

## Targeting Rules

Feature flags can target users using user attributes.

Example:

```text
country EQUALS IN
```

A request containing:

```json
{
  "country": "IN"
}
```

matches the rule.

Multiple targeting rules can be configured for a feature flag.

---

## Percentage Rollouts

FlagForge supports deterministic percentage rollouts.

The evaluation process is:

```text
User ID + Flag Key
       |
       v
    SHA-256
       |
       v
 Bucket 0-99
       |
       v
Compare with rollout %
       |
       v
    ON / OFF
```

For example:

```text
Rollout = 10%

Buckets 0-9    -> ON
Buckets 10-99  -> OFF
```

The same user and feature flag combination always produces the same bucket.

This provides consistent rollout behavior across requests.

---

## Evaluation API

Applications can evaluate feature flags through the runtime evaluation API.

The runtime evaluation endpoint is protected using an environment-scoped API key.

Example request:

```http
POST /api/evaluation
X-FlagForge-Key: <environment-api-key>
Content-Type: application/json
```

Request body:

```json
{
  "flagKey": "new_checkout",
  "userId": "user-123",
  "attributes": {
    "country": "IN",
    "plan": "premium"
  }
}
```

Example response:

```json
{
  "enabled": true,
  "reason": "PERCENTAGE_ROLLOUT"
}
```

Possible evaluation reasons include:

```text
FLAG_NOT_FOUND
FLAG_DISABLED
FULL_ROLLOUT
PERCENTAGE_ROLLOUT
PERCENTAGE_ROLLOUT_EXCLUDED
TARGETING_RULE_NOT_MATCHED
```

---

# Evaluation Flow

FlagForge evaluates a feature flag using the following flow:

```text
              Evaluation Request
                      |
                      v
             Validate API Key
                      |
                      v
             Resolve Environment
                      |
                      v
              Find Feature Flag
                      |
                      v
             Is Flag Enabled?
                /           \
              No             Yes
              |               |
              v               v
        FLAG_DISABLED    Evaluate Rules
                              |
                       ┌──────┴──────┐
                     Fail           Match
                      |               |
                      v               v
             TARGETING_RULE_     Check Rollout
              NOT_MATCHED            |
                                      v
                              Deterministic Hash
                                      |
                                      v
                                  ON / OFF
```

This combines:

```text
Flag State
    +
Targeting Rules
    +
Percentage Rollout
    =
Final Evaluation Result
```

---

# Environment API Keys

Each environment can have its own SDK API key.

When a key is generated:

```text
Generate API Key
       |
       +--------------------+
       |                    |
       v                    v
 Raw API Key           SHA-256 Hash
 returned once        stored in DB
```

The raw API key is not stored in the database.

Only its hash and a safe key prefix are stored.

Generating a new key replaces the existing key for that environment.

Therefore, the previous key immediately becomes invalid.

The SDK uses the API key through:

```http
X-FlagForge-Key: <api-key>
```

---

# TypeScript SDK

FlagForge includes a lightweight TypeScript SDK for runtime feature flag evaluation.

Example:

```ts
import { FlagForge } from "./sdk";

const flagforge = new FlagForge({
  apiUrl: "http://localhost:3000",
  apiKey: process.env.FLAGFORGE_API_KEY!,
});

const enabled = await flagforge.isEnabled("new_checkout", {
  userId: "user-123",
  attributes: {
    country: "IN",
    plan: "premium",
  },
});

if (enabled) {
  // Show new checkout
}
```

The SDK sends the environment API key with each evaluation request.

It does not need to send the environment ID because the backend resolves the environment from the API key.

---

# Demo Application

The repository includes a small TypeScript demo application that consumes the FlagForge SDK.

The demo demonstrates a real evaluation request:

```text
Demo Application
       |
       v
FlagForge SDK
       |
       v
Evaluation API
       |
       v
Feature Flag Evaluation
       |
       v
Result
```

The demo uses an environment API key loaded from an environment variable.

Example:

```env
FLAGFORGE_API_KEY=<your-environment-api-key>
```

This keeps the API key outside the source code.

---

# Activity History

FlagForge records important changes in an activity history.

Currently tracked operations include feature flag and targeting rule changes.

Example:

```text
CREATED   FEATURE_FLAG
UPDATED   FEATURE_FLAG
DELETED   FEATURE_FLAG

CREATED   FLAG_RULE
DELETED   FLAG_RULE
```

Activity records contain information such as:

- Action
- Entity
- Entity ID
- Metadata
- User
- Timestamp

The dashboard displays the activity history for the authenticated user.

---

# Evaluation Metrics

FlagForge includes evaluation metrics for observing runtime evaluation behavior.

The metrics include:

- Total evaluations
- Enabled evaluations
- Disabled evaluations
- Average evaluation latency
- Evaluation reason breakdown

Example:

```text
Total Evaluations      1000
Enabled                 101
Disabled                899
Average Latency       4.25 ms
```

These measurements help verify rollout behavior and evaluate the performance of the evaluation path.

---

# Security

FlagForge separates dashboard authentication from runtime evaluation.

## Dashboard APIs

Dashboard management APIs use JWT authentication.

```text
Frontend
   |
   | Authorization: Bearer <JWT>
   v
FlagForge API
```

JWT authentication is used for operations such as:

- Project management
- Environment management
- Feature flag management
- Targeting rule management
- Activity history

---

## Runtime Evaluation

Runtime evaluation uses an environment-scoped API key.

```text
Application / SDK
       |
       | X-FlagForge-Key
       v
Evaluation API
```

This separates application runtime access from dashboard user authentication.

---

## Authorization

FlagForge performs ownership checks on protected resources.

For example:

```text
User
 |
 +-- Project
      |
      +-- Environment
             |
             +-- Feature Flag
                    |
                    +-- Targeting Rules
```

A user must own the parent resource before accessing or modifying the associated resources.

---

## Password Security

Passwords are never stored as plaintext.

Passwords are hashed before being stored in PostgreSQL.

---

## API Key Security

Environment API keys are not stored in plaintext.

The database stores a SHA-256 hash of the API key.

The raw key is returned only when the key is generated.

---

# Architecture

FlagForge currently follows a modular monolith architecture.

```text
                         ┌─────────────────────┐
                         │    React Frontend   │
                         │   TypeScript + Vite │
                         └──────────┬──────────┘
                                    |
                                    | JWT
                                    v
                         ┌─────────────────────┐
                         │    Express API      │
                         │    TypeScript       │
                         └──────────┬──────────┘
                                    |
                   ┌────────────────┼────────────────┐
                   |                |                |
                   v                v                v
            ┌────────────┐  ┌──────────────┐  ┌─────────────┐
            │ PostgreSQL │  │   Evaluation │  │   Activity  │
            │  + Prisma  │  │    Engine    │  │    Logs     │
            └────────────┘  └──────┬───────┘  └─────────────┘
                                   |
                                   | API Key
                                   v
                         ┌─────────────────────┐
                         │   TypeScript SDK    │
                         │    / Demo App       │
                         └─────────────────────┘
```

The backend is organized into independent modules while remaining inside a single backend application.

---

# Backend Modules

The backend currently contains modules for:

```text
backend/src/modules/

├── api-keys/
├── auth/
├── activity/
├── environments/
├── evaluation/
├── feature-flags/
└── projects/
```

This structure keeps business logic separated by domain.

---

# Database Model

The core database relationships are:

```text
User
 |
 +---- Project
         |
         +---- Environment
                 |
                 +---- FeatureFlag
                 |       |
                 |       +---- FlagRule
                 |
                 +---- EnvironmentApiKey

User
 |
 +---- Activity
```

PostgreSQL is used as the persistent data store and Prisma is used as the ORM.

---

# Technology Stack

| Area | Technology |
|------|------------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Runtime API Keys | SHA-256 |
| SDK | TypeScript |
| Testing | Jest |
| HTTP Testing | Supertest |
| Containerization | Docker |
| Version Control | Git + GitHub |

---

# Repository Structure

```text
FlagForge/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── generated/
│       ├── lib/
│       ├── middleware/
│       │
│       └── modules/
│           ├── api-keys/
│           ├── auth/
│           ├── activity/
│           ├── environments/
│           ├── evaluation/
│           ├── feature-flags/
│           └── projects/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── lib/
│       └── pages/
│
├── sdk/
│   └── src/
│
├── demo/
│   └── src/
│
├── docker.compose.yml
├── package.json
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Docker
- Git

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd FlagForge
```

---

## 2. Start PostgreSQL

Start the PostgreSQL container:

```bash
docker compose -f docker.compose.yml up -d
```

PostgreSQL is exposed on:

```text
localhost:5433
```

---

# Backend Setup

## 3. Configure environment variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL="postgresql://FlagForgeUser:FlagForgePassword@localhost:5433/FlagForgeDb"
JWT_SECRET="your-secret"
```

Do not commit `.env` files.

---

## 4. Install dependencies

```bash
cd backend
npm install
```

---

## 5. Generate Prisma Client

```bash
npx prisma generate
```

---

## 6. Run database migrations

```bash
npx prisma migrate dev
```

---

## 7. Start the backend

```bash
npm run dev
```

The backend API runs on:

```text
http://localhost:3000
```

Health check:

```text
GET http://localhost:3000/health
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will provide the frontend URL in the terminal.

---

# SDK Setup

Build the SDK:

```bash
cd sdk
npm install
npm run build
```

The generated SDK build can then be consumed by the demo application.

---

# Demo Setup

The demo requires an environment API key.

Create:

```text
demo/.env
```

Add:

```env
FLAGFORGE_API_KEY=<your-environment-api-key>
```

Build the demo:

```bash
cd demo
npm install
npm run build
```

Run it:

```bash
npm start
```

The demo performs a real feature flag evaluation against the running FlagForge backend.

---

# Testing

Backend tests use Jest and Supertest.

Run the test suite:

```bash
cd backend
npm test
```

Run tests sequentially:

```bash
npm test -- --runInBand
```

Important areas tested include:

- Authentication
- Authorization
- Feature flag business logic
- Targeting rules
- Deterministic rollout bucketing
- Percentage rollout behavior
- Evaluation behavior
- API key authentication
- Important validation and failure cases

---

# Example Evaluation

Suppose the following feature flag exists:

```text
Flag:
new_checkout

Enabled:
true

Rollout:
30%

Targeting:
country EQUALS IN
```

The application sends:

```json
{
  "flagKey": "new_checkout",
  "userId": "user-123",
  "attributes": {
    "country": "IN"
  }
}
```

FlagForge evaluates:

```text
1. Validate API key
        |
        v
2. Resolve environment
        |
        v
3. Find feature flag
        |
        v
4. Check enabled state
        |
        v
5. Evaluate targeting rules
        |
        v
6. Calculate deterministic bucket
        |
        v
7. Compare bucket with rollout
        |
        v
8. Return result
```

Example response:

```json
{
  "enabled": true,
  "reason": "PERCENTAGE_ROLLOUT"
}
```

---

# Git Workflow

Git is used throughout FlagForge development.

The project follows meaningful checkpoints rather than committing every small change.

Typical workflow:

```text
Implement
    |
    v
Test
    |
    v
Verify
    |
    v
Commit
    |
    v
Push
```

Example:

```bash
git status
git diff

git add .
git commit -m "feat: add feature flag evaluation"

git push
```

Feature branches are used for complete, meaningful features when appropriate.

---

# Design Principles

FlagForge follows several engineering principles.

### Modular Monolith

The backend remains a single application while domain logic is separated into modules.

This keeps the architecture understandable without introducing unnecessary distributed-system complexity.

### Deterministic Evaluation

Percentage rollouts use deterministic hashing rather than random values.

### Resource Ownership

Protected resources are checked against the authenticated user's ownership.

### Separation of Authentication

Dashboard authentication and runtime SDK authentication are separate:

```text
Dashboard
   |
   | JWT
   v
Management API


Application
   |
   | Environment API Key
   v
Evaluation API
```

### Environment Isolation

SDK API keys are scoped to environments rather than being global.

---

# Project Goals

FlagForge was built to demonstrate practical software engineering through a complete working system.

The project focuses on:

- REST API design
- Modular backend architecture
- TypeScript
- PostgreSQL database design
- Prisma ORM
- Authentication
- Authorization
- Feature flag evaluation
- Deterministic hashing
- Percentage rollouts
- Targeting rules
- Runtime API authentication
- SDK integration
- Activity logging
- Automated testing
- Frontend/backend integration
- Docker
- Git and GitHub workflow

---

# Future Improvements

The current implementation focuses on the core feature flag platform.

Potential future improvements include:

- Redis-based evaluation caching
- More advanced analytics
- Experimentation and A/B testing
- Additional targeting operators
- More detailed evaluation observability
- CI/CD automation
- Deployment infrastructure
- SDK improvements

These are intentionally kept separate from the core feature flag system so that the main architecture remains understandable.

---

# Project Status

FlagForge currently includes:

- JWT authentication
- Project management
- Environment management
- Feature flag management
- Feature flag enable/disable
- Percentage rollouts
- Deterministic rollout bucketing
- Targeting rules
- Runtime evaluation API
- Environment-scoped SDK API keys
- TypeScript SDK
- Demo application
- Activity history
- Evaluation metrics
- Resource ownership authorization
- Automated backend tests
- React dashboard
- PostgreSQL persistence
- Prisma migrations
- Docker-based PostgreSQL setup

The project is being developed as a portfolio-focused software engineering project with emphasis on understanding the architecture and implementation rather than adding complexity for its own sake.

---

## License

This project is intended as a portfolio and learning project.
