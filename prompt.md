Complete Antigravity prompt

Copy this as the main prompt:

You are a senior frontend engineer and product UI/UX architect.

You are working on an existing project called FlagForge.

IMPORTANT:
DO NOT delete the existing frontend.
DO NOT rebuild the project from scratch.
DO NOT modify the backend unless absolutely required for an existing frontend integration bug.
DO NOT replace working API contracts.
DO NOT invent fake/mock backend data when real APIs already exist.

Your job is to redesign and restructure the EXISTING FRONTEND into a polished, modern developer-tool dashboard while preserving all existing functionality.

==================================================
PROJECT
==================================================

FlagForge is a Feature Flag + Experimentation Platform.

The application allows developers/teams to:

- Create projects
- Create environments inside projects
- Create feature flags
- Enable/disable flags
- Configure percentage rollouts
- Configure targeting rules
- Edit targeting rules
- Delete targeting rules
- Evaluate flags for users
- Use environment API keys for runtime evaluation
- View activity/history
- View evaluation metrics
- Manage environment API keys
- Use a TypeScript SDK/demo

The backend is already implemented and working.

The frontend already communicates with the backend.

Your responsibility is primarily:

1. UI redesign
2. Frontend architecture
3. Component organization
4. Navigation architecture
5. UX improvements
6. Responsive layout
7. Visual consistency
8. Loading/error/empty states
9. Maintainability

==================================================
TECH STACK
==================================================

Use the EXISTING frontend stack.

Current frontend:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- shadcn/ui / existing UI components
- lucide-react

Do NOT migrate to Next.js.

Do NOT introduce a completely different UI framework.

Do NOT replace Tailwind.

Reuse existing components wherever practical.

==================================================
VERY IMPORTANT — PRESERVE FUNCTIONALITY
==================================================

Before changing anything, inspect the entire existing frontend.

Understand:

- routes
- API client
- authentication
- project API
- environment API
- feature flag API
- targeting rule API
- activity API
- evaluation API
- API key API
- existing state management
- existing forms
- existing error handling

Do not remove functionality just because the UI is being redesigned.

Every existing backend-connected feature must continue working after the redesign.

Use the existing API functions instead of writing duplicate API calls.

==================================================
CURRENT ROUTE ARCHITECTURE
==================================================

The application currently contains routes conceptually similar to:

/login

/dashboard

/projects

/projects/:projectId

/projects/:projectId/environments/:environmentId

/projects/:projectId/environments/:environmentId/evaluate

/projects/:projectId/environments/:environmentId/flags/:flagId

/activity

/settings

There may also be legacy routes.

Inspect the current App.tsx/router before modifying routes.

The preferred architecture is:

Global application shell
    ↓
Project context
    ↓
Environment context
    ↓
Feature flags
    ↓
Individual flag workspace

==================================================
TARGET APPLICATION ARCHITECTURE
==================================================

Build the frontend around this mental model:

                    FlagForge
                       │
             ┌─────────┴─────────┐
             │                   │
        Project Selector      User/Settings
             │
       Environment Context
             │
     ┌───────┼────────┬──────────┐
     │       │        │          │
 Dashboard Flags  Evaluation  Activity
                    │
                    │
              Feature Flag
                 Workspace
                    │
           ┌────────┴────────┐
           │                 │
     Configuration       Evaluation
==================================================
GLOBAL APPLICATION SHELL

Replace the old permanent sidebar-style architecture with a modern top application shell.

The top shell should contain:

LEFT:

FlagForge branding

Project selector

CENTER:

Dashboard
Feature Flags
Evaluation
Activity

RIGHT:

Settings
User/logout controls

Below the main navigation:

Environment context/navigation.

The selected project and selected environment should remain visually obvious.

Do not make environments a completely separate global section.

Environment should behave as contextual state belonging to the selected project.

Example:

FlagForge

[ Project: E-Commerce ▼ ]

Dashboard Feature Flags Evaluation Activity

Environment:
[ Development ] [ Staging ] [ Production ]

The exact visual design is up to you, but preserve this architecture.

==================================================
PROJECT SELECTOR

Create a reusable project selector.

Requirements:

Show current project
Dropdown list of projects
Selecting a project changes project context
Allow navigation to project management
Handle no projects
Handle loading
Handle API errors
Do not use fake projects

Use the existing project API.

==================================================
ENVIRONMENT CONTEXT

When a project is selected, load its environments.

Display environments horizontally beneath the main navigation.

Example:

Environment
[ Development ] [ Staging ] [ Production ]

The active environment should be visually distinct.

Selecting an environment should navigate to that environment's feature flags.

Do not create fake environments.

Use the existing environment API.

==================================================
DASHBOARD

The dashboard must use REAL backend data.

Do not hardcode:

project counts
environment counts
flag counts
rollout percentages
targeting rule counts
evaluation metrics

Display useful high-level information such as:

Projects
Environments
Feature Flags
Enabled Flags
Targeting Rules
Evaluation activity/metrics if available

The dashboard should feel like a developer/product operations dashboard.

Keep it clean.

Avoid excessive charts if the backend doesn't provide meaningful data.

==================================================
FEATURE FLAGS PAGE

This is the main workspace.

The page should feel like a feature flag inventory.

Suggested structure:

Header:

Feature Flags
Short description

[ Search ]
[ Filter ]
[ Create Flag ]

Then:

Feature flag list/table/cards.

Each flag should show:

Flag name
Flag key
Enabled/Disabled status
Rollout percentage
Targeting rule count
Actions

Avoid making every flag card extremely large.

The inventory should be scannable.

Example:

┌────────────────────────────────────────────────────┐
│ checkout-redesign Enabled │
│ checkout_redesign │
│ │
│ Targeting 2 rules Rollout 50% │
│ │
│ Open → │
└────────────────────────────────────────────────────┘

Users should be able to click a flag and open its dedicated workspace.

==================================================
FEATURE FLAG DETAIL WORKSPACE

This is one of the most important parts of the redesign.

Route:

/projects/:projectId/environments/:environmentId/flags/:flagId

The page should be a dedicated workspace for one feature flag.

Header:

Back to Feature Flags

Flag name
Flag key

Status badge

Actions:

Enable/Disable
Edit
Delete

Then provide tabs:

Configuration
Evaluation

Potential structure:

← Feature Flags

checkout-redesign
checkout_redesign

[ Enabled ]

Configuration | Evaluation

Configuration

Rollout
[ 50% ]

Targeting Rules

country EQUALS US
plan EQUALS premium

[ Add Rule ]

Evaluation

Evaluation playground
User ID
Attributes
Evaluate
Result
Reason
Latency

The configuration tab should contain the functionality currently present in the old FeatureFlags page.

==================================================
CONFIGURATION TAB

Move the existing feature flag configuration functionality into the detail workspace.

It must support:

Enable/disable flag
Rollout percentage
Save rollout
Targeting rules
Create targeting rule
Edit targeting rule
Delete targeting rule

IMPORTANT:

Do not make rollout update on every keystroke.

Keep the existing behavior where the user edits the value locally and explicitly saves it.

This prevents unnecessary PATCH requests and excessive activity entries.

==================================================
TARGETING RULES

Rules currently support:

EQUALS
NOT_EQUALS

Preserve these operators.

A rule should clearly display:

attribute
operator
value

Example:

country EQUALS US
plan NOT_EQUALS free

Each rule should have:

Edit
Delete

Add Rule should open a clean form/modal/sheet rather than making the entire page expand unnecessarily.

The exact UI implementation is up to you.

==================================================
CREATE FEATURE FLAG

Create Flag should preferably use a modal/dialog/sheet rather than permanently occupying the page.

Fields:

Name
Key

Validate the form.

Use the existing createFeatureFlag API.

After creation:

update UI
close modal
show appropriate feedback

Do not create fake local-only flags.

==================================================
EVALUATION WORKSPACE

Preserve the existing evaluation functionality.

Evaluation is runtime-oriented and uses the environment API key.

The UI should make this distinction clear.

The evaluation page/workspace should allow:

User ID

Attributes

Evaluate

Then show:

Enabled / Disabled

Reason

Evaluation latency

Useful evaluation information

Do not require a database User record for arbitrary evaluation user IDs.

The user ID is used for deterministic rollout bucketing.

==================================================
EVALUATION REASONS

Preserve existing evaluation reason values such as:

FLAG_NOT_FOUND
FLAG_DISABLED
FULL_ROLLOUT
PERCENTAGE_ROLLOUT
PERCENTAGE_ROLLOUT_EXCLUDED
TARGETING_RULE_NOT_MATCHED

Display these in a human-readable way in the UI while preserving the underlying API values.

==================================================
ACTIVITY

Keep Activity as a dedicated page.

Display activity in a clean chronological timeline/table.

Activities may include:

Feature flag created
Feature flag updated
Feature flag deleted
Targeting rule created
Targeting rule updated
Targeting rule deleted

Use the real Activity API.

Display:

Action
Entity
Details
Timestamp

Do not invent activity records.

==================================================
SETTINGS

Settings should contain application/environment configuration relevant to the current user.

Preserve existing functionality.

The environment API key management UI should be clear.

Explain that runtime API keys are environment-scoped.

When a key is generated/rotated:

show the raw key only when returned by the API
provide a copy action
clearly explain that the raw key should be stored securely

Never expose stored hashed keys.

==================================================
API KEY UX

Environment API keys are runtime credentials.

Make the distinction between:

Dashboard authentication

and

Runtime environment API key

clear.

The UI should not confuse JWT authentication with runtime evaluation credentials.

==================================================
RESPONSIVE DESIGN

The application must work on:

Desktop
Laptop
Tablet
Mobile

For smaller screens:

navigation should collapse appropriately
project/environment selectors should remain usable
tables should become scrollable or card-based
dialogs should fit the viewport
no horizontal page overflow
==================================================
LOADING STATES

Every backend-driven page should have a proper loading state.

Do not show empty states while data is still loading.

Examples:

Loading projects...

Loading environments...

Loading feature flags...

Loading activity...

Use subtle skeletons/spinners where appropriate.

==================================================
EMPTY STATES

Create useful empty states.

Examples:

No projects yet

No environments in this project

No feature flags in this environment

No targeting rules configured

No activity yet

Each empty state should explain what the user can do next.

Example:

No feature flags yet.

Create your first feature flag to start controlling application behavior.

[Create Flag]

==================================================
ERROR STATES

Handle API failures gracefully.

Do not silently fail.

Use:

inline error messages
toast notifications where appropriate
retry actions when useful

Avoid exposing raw backend stack traces to the user.

==================================================
DESIGN DIRECTION

IMPORTANT:

Do NOT copy another product's branding.

Do NOT copy another application's colors exactly.

Do NOT copy logos.

Do NOT clone a reference website.

Use the existing FlagForge visual identity.

Desired aesthetic:

modern developer tool
premium but restrained
clean
minimal
professional
strong information hierarchy
subtle borders
subtle shadows
excellent spacing
readable typography
compact controls
lots of whitespace
light neutral application background
white/neutral content surfaces

Think:

modern developer platform

rather than:

marketing website

Avoid excessive glassmorphism.

Avoid huge gradients.

Avoid unnecessary animations.

Avoid oversized cards.

Avoid excessive rounded containers.

==================================================
TYPOGRAPHY

Keep the existing Geist-based typography if already configured.

Use typography hierarchy carefully.

Page title
Section title
Body
Metadata
Labels

Do not introduce another font system unnecessarily.

==================================================
COMPONENT ARCHITECTURE

Break large pages into reusable components.

Suggested structure:

frontend/src/components/

layout/
AppLayout
Sidebar / TopNavigation
ProjectSelector
EnvironmentSwitcher

feature-flags/
FeatureFlagCard
FeatureFlagList
FeatureFlagHeader
FeatureFlagConfiguration
FeatureFlagRules
FeatureFlagRuleRow
CreateFeatureFlagDialog

evaluation/
EvaluationForm
EvaluationResult
EvaluationMetrics

activity/
ActivityList
ActivityItem

common/
EmptyState
LoadingState
ErrorState

Do not create components unnecessarily.

Use sensible boundaries.

Avoid one giant 1000+ line page component.

==================================================
DATA / API ARCHITECTURE

Do not duplicate API logic inside components.

Use existing files in:

frontend/src/lib/

for API communication.

For example, inspect and reuse existing functions for:

projects
environments
feature flags
flag rules
activity
evaluation
API keys
authentication

Components should primarily handle UI/state.

==================================================
STATE MANAGEMENT

Do not introduce Redux or another global state library unless absolutely necessary.

Use React state/hooks and existing project architecture.

Project/environment context can be derived from the current route.

Avoid unnecessary global state.

==================================================
ROUTING

Preserve React Router.

Make navigation predictable.

Important flows:

Dashboard
↓
Projects
↓
Project
↓
Environment
↓
Feature Flags
↓
Feature Flag Detail
↓
Configuration / Evaluation

The user should rarely need to manually type URLs.

==================================================
ACCESSIBILITY

Use semantic HTML.

Buttons must be buttons.

Links must be links.

Inputs must have labels.

Dialogs must be keyboard accessible.

Interactive elements need accessible labels.

Do not rely only on color to communicate status.

==================================================
PERFORMANCE

Avoid unnecessary API requests.

Do not fetch the same data repeatedly.

Do not update backend state on every keystroke.

Do not introduce heavy dependencies without a reason.

Keep the frontend lightweight.

==================================================
DO NOT CHANGE

Unless absolutely necessary, do NOT change:

backend
Prisma schema
database
API contracts
authentication implementation
evaluation algorithm
API key generation
API key hashing
targeting rule semantics
rollout algorithm
deterministic bucketing
activity model
existing working backend endpoints
==================================================
IMPORTANT EXISTING BEHAVIOR

The evaluation engine uses deterministic percentage rollout.

The backend already calculates rollout decisions.

The frontend should NOT implement a second rollout algorithm.

The frontend only configures rollout percentage.

Similarly, targeting rules are evaluated by the backend.

The frontend only manages their configuration.

==================================================
REFACTORING RULE

Do not perform a destructive rewrite.

First inspect the existing project.

Then:

Identify reusable existing components.
Identify existing API integrations.
Identify existing routes.
Identify existing functionality.
Refactor incrementally.
Preserve working behavior.
Build after major changes.
Fix TypeScript errors.
Test important user flows.

If a component already exists and works, improve it rather than replacing it unnecessarily.

==================================================
VALIDATION

After implementation, run:

npm run build

from:

frontend/

Fix all TypeScript errors.

Also verify:

login
dashboard
project selection
environment selection
feature flag listing
create flag
enable/disable flag
rollout editing
targeting rule creation
targeting rule editing
targeting rule deletion
flag detail navigation
evaluation
activity
settings
API key management
logout

Do not stop after making the UI look good.

The application must remain functional.

==================================================
GIT SAFETY

Do not delete the existing .git directory.

Do not reset the repository.

Do not run destructive git commands.

Do not overwrite the backend.

Keep changes focused on the frontend.

==================================================
FINAL GOAL

The final frontend should feel like a real developer platform for feature flag management.

The primary experience should be:

Login
↓
Dashboard
↓
Select Project
↓
Select Environment
↓
Feature Flags
↓
Open Feature Flag
↓
Configure rollout / targeting
↓
Evaluate
↓
View activity

The UI should be polished enough for:

portfolio demonstration
GitHub screenshots
recruiter review
technical interviews
live project demonstration

But do not sacrifice functionality for visual polish.

Start by inspecting the EXISTING frontend thoroughly.

Do not immediately rewrite everything.

After inspection, create a short implementation plan and then implement the redesign incrementally.


## And this is important: **don't delete your current frontend**

Give Antigravity:

```text
C:\learning-web-dev\FlagForge

with the current project intact.

Your current state is actually useful because we already have working pieces such as:

frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── feature-flags/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── environments.ts
│   │   ├── feature-flags.ts
│   │   ├── flag-rules.ts
│   │   ├── activity.ts
│   │   └── ...
│   ├── pages/
│   └── App.tsx