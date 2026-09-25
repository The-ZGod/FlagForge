# FlagForge — Frontend Integration & Regression Repair

## ROLE

Act as a senior React + TypeScript engineer debugging an existing production-style application.

You are working on **FlagForge**, an existing feature flag and experimentation platform.

The backend was previously working correctly.

After a recent frontend/UI redesign, several frontend integration regressions appeared:

- "Unable to fetch" errors
- authenticated requests failing
- one user seeing/accessing another user's project/environment data
- stale project/environment IDs being used
- buttons opening the wrong actions or not working
- create/update/delete operations failing
- navigation becoming inconsistent
- API requests being sent with incorrect IDs
- authentication/session state becoming inconsistent
- environment/project selection becoming disconnected from the current user
- some pages loading but displaying incorrect data
- some UI actions no longer triggering the correct backend operation

The goal is to **repair the frontend integration completely without changing the backend logic and without redesigning the UI.**

---

# CRITICAL RULES

## 1. DO NOT CHANGE THE BACKEND

This is the most important rule.

Do NOT modify:

- backend controllers
- backend services
- backend routes
- backend middleware
- Prisma schema
- Prisma migrations
- database structure
- evaluation logic
- targeting rule logic
- rollout logic
- authentication logic
- authorization logic
- API key logic
- activity logging logic
- backend validation
- backend response contracts

The backend was working before the frontend redesign.

Assume the backend implementation and API contracts are correct unless there is overwhelming evidence that a frontend issue cannot explain the problem.

If you discover something that appears to be a backend issue:

1. Do NOT modify it.
2. Document the issue.
3. First investigate whether the frontend is calling it incorrectly.

---

# 2. DO NOT CHANGE THE UI DESIGN

The current UI is intentional and must remain visually unchanged.

Do NOT redesign:

- layout
- spacing
- typography
- colors
- dark/light theme
- cards
- buttons
- dialogs
- navigation appearance
- animations
- gradients
- glass effects
- responsive design
- page structure
- component styling

Do NOT replace components just because you would design them differently.

The current UI should remain exactly as it is.

Your job is to make the existing UI work.

Think:

> SAME UI + CORRECT DATA + CORRECT API CONNECTIONS + CORRECT AUTHENTICATION + CORRECT STATE

---

# 3. DO NOT REWRITE THE FRONTEND FROM SCRATCH

Do NOT delete and recreate the frontend.

Do NOT replace the existing architecture with a new framework.

Do NOT introduce Redux/Zustand/React Query/etc. unless the project already uses it and it is necessary to repair an existing integration.

Prefer small, targeted fixes.

Preserve:

- existing React components
- existing routes
- existing API helper functions
- existing UI components
- existing state structure
- existing styling
- existing libraries
- existing project architecture

---

# PRIMARY OBJECTIVE

Restore the frontend/backend integration to the state it had before the recent UI redesign.

Every existing frontend feature should correctly communicate with the existing backend.

The application must behave correctly for multiple independent users.

---

# FIRST: AUDIT THE ENTIRE FRONTEND

Before modifying code, inspect the complete frontend.

Pay particular attention to:

```text
frontend/src/
├── components/
├── pages/
├── lib/
├── hooks/
├── routes/
├── App.tsx
└── main.tsx

Inspect:

authentication utilities
API client/helper functions
route configuration
protected routes
project selection
environment selection
feature flag API calls
targeting rule API calls
evaluation API calls
API key API calls
activity API calls
dashboard API calls
settings/profile API calls
logout behavior
navigation
dialogs/forms
loading states
error handling

Do not immediately start changing code.

First understand how the existing frontend is connected.

SECOND: TRACE EVERY API REQUEST

For every frontend API call, verify:

HTTP method
URL
path parameters
query parameters
request body
headers
authentication header
API key header where required
response parsing
error handling
IDs being passed
current user's ownership context

Create an internal mapping like:

Frontend function
        ↓
HTTP request
        ↓
Backend route
        ↓
Expected authentication
        ↓
Expected parameters
        ↓
Expected response

Do this for every major feature.

AUTHENTICATION MUST BE FIXED FIRST

Inspect the existing authentication flow.

Verify:

Login
 ↓
JWT/token storage
 ↓
Authenticated API requests
 ↓
Protected routes
 ↓
Logout
 ↓
Token/session cleanup

Make sure authenticated requests consistently use the existing authentication mechanism.

Do NOT create a second authentication system.

Do NOT hardcode tokens.

Do NOT bypass authentication.

Do NOT use another user's credentials.

Do NOT store another user's IDs as global application state.

CRITICAL: MULTI-USER DATA ISOLATION

This is currently one of the biggest regressions.

The frontend must NEVER assume that a project/environment from a previous user is valid for the current user.

Example:

User A
 └── Project A
      └── Environment A

Logout

User B
 └── Project B
      └── Environment B

User B must NEVER request:

Project A
Environment A

even if the browser URL still contains the old IDs.

PROJECT SELECTION

Audit the project selector.

When the current user logs in:

GET /projects

must populate the project selector using ONLY the current user's projects.

The selected project must always come from the current user's project list.

If the URL contains:

/projects/:projectId

verify that the project exists in the current user's fetched projects.

If it does not:

DO NOT continue using it.

Redirect to:
 /projects

Do not attempt to load environments or feature flags for an invalid project.

ENVIRONMENT SELECTION

Audit environment selection.

For the currently selected project:

GET /environments/project/:projectId

must determine the available environments.

The selected environment must exist in that returned list.

If:

environmentId

is stale, invalid, deleted, or belongs to another user's project:

DO NOT call:

GET /feature-flags/:environmentId

Instead:

clear invalid environment state
redirect to the project/environment selection state

The environment selector and the current page must always use the SAME environment.

Avoid this invalid state:

Environment selector:
No environments

Feature Flags page:
Old Environment A
FEATURE FLAGS

Audit all Feature Flag operations.

Verify:

GET feature flags
POST create feature flag
PATCH update feature flag
DELETE feature flag

Every request must use the currently validated:

projectId
environmentId
flagId

Never use stale IDs.

Before loading feature flags:

1. Verify current project
2. Verify current environment
3. Then fetch feature flags

Do not show a usable Create Flag dialog if there is no valid environment.

However, preserve the existing UI design.

Only repair its state/connection behavior.

CREATE FEATURE FLAG

Verify the existing Create Flag form.

It must send the exact payload expected by the existing backend.

Verify:

name
key
enabled
rolloutPercentage
environmentId

Do NOT invent a new API contract.

Do NOT change backend validation.

After successful creation:

close dialog
update local UI state
show newly created flag

If the backend returns an error:

show the backend error correctly
do not leave stale loading state
FEATURE FLAG UPDATE

Verify:

enable/disable
rollout changes
name/key changes if supported

The UI must call the existing API helper.

Do not accidentally send:

projectId

where the backend expects:

flagId

or similar parameter mismatches.

FEATURE FLAG DELETE

Verify:

DELETE /...

uses the correct:

flagId

After successful deletion:

remove flag from local state
remove its targeting rules from local state

Do not delete a different flag because of stale state or array indexes.

TARGETING RULES

Audit all targeting-rule operations:

GET rules
POST rule
PATCH rule
DELETE rule

Verify the correct:

featureFlagId
ruleId
attribute
operator
value

are being sent.

Preserve existing supported operators.

Do not change backend rule logic.

After create/update/delete:

refresh or update local rule state correctly
EVALUATION

This area is especially important.

FlagForge has TWO authentication contexts:

Dashboard API

Uses the logged-in user's authentication.

Example:

Authorization: Bearer <JWT>
Runtime Evaluation API

Uses the environment API key.

Example:

X-FlagForge-Key: <environment-api-key>

Do NOT mix these.

Dashboard JWT:

DO NOT use as runtime API key

Environment API key:

DO NOT use as dashboard JWT

Verify the evaluation playground uses the correct existing API contract.

Do not modify backend evaluation logic.

API KEYS

Audit API key generation/rotation/display.

Verify:

generate
rotate
copy
load current key metadata

Do not expose an old user's key to another user.

When switching users:

User A API key state

must never remain in:

User B UI state
ACTIVITY

Audit Activity.

Verify it loads activity for the authenticated user.

A user must not see another user's activity records.

Do not change backend activity logic.

Fix only frontend authentication/request/state handling.

DASHBOARD

Audit dashboard data.

Every dashboard request must be tied to the current authenticated user.

Verify that after logout/login:

old user's dashboard data

does not remain visible.

Handle:

loading
empty
error

states correctly.

LOGOUT

Audit logout carefully.

When logout happens:

1. Remove current authentication/session state
2. Clear user-specific frontend state
3. Clear selected project/environment state
4. Navigate to /login

Do NOT leave stale:

projectId
environmentId
flag data
activity data
API key state

in memory after logout.

Do not allow the next user to inherit the previous user's frontend state.

ROUTING

Audit every route.

Verify that routes requiring:

projectId
environmentId
flagId

only operate when those IDs belong to the current user's accessible resources.

Pay particular attention to routes such as:

/projects/:projectId
/projects/:projectId/environments/:environmentId
/projects/:projectId/environments/:environmentId/evaluate

Do not rely solely on the URL to determine authorization.

The frontend should validate route parameters against data fetched for the current authenticated user.

The backend remains the final authority.

API CLIENT

Find the central API/client implementation.

Check whether recent UI changes accidentally introduced:

incorrect base URL
missing /api
wrong HTTP methods
incorrect content type
missing Authorization header
wrong header name
incorrect JSON body
incorrect response parsing
duplicated API clients
hardcoded URLs
environment variable mismatches

There should be one consistent mechanism for communicating with the backend.

Do not create duplicate request logic unnecessarily.

"UNABLE TO FETCH" ERRORS

Trace every "Unable to fetch" error to its actual source.

Do NOT simply replace:

Unable to fetch

with a generic success state.

Determine whether the actual cause is:

wrong URL
wrong backend route
wrong port
missing Authorization
expired JWT
incorrect request body
incorrect ID
CORS
wrong environment variable
network error
frontend state bug

Then fix the frontend integration.

Preserve useful backend error messages.

BUTTON AUDIT

Every interactive button must be checked.

Especially:

Create Project
Create Environment
Create Flag
Edit Flag
Delete Flag
Enable/Disable Flag
Add Rule
Edit Rule
Delete Rule
Evaluate
Generate API Key
Rotate API Key
Copy API Key
Dismiss
Logout
Project selector
Environment selector
Navigation links

For each button verify:

Click
 ↓
Correct handler
 ↓
Correct API call if required
 ↓
Correct loading state
 ↓
Correct success state
 ↓
Correct error state
 ↓
Correct UI refresh

Do not change the button's visual appearance.

DIALOG AUDIT

Inspect every dialog/modal.

Verify:

open state
close state
submit handler
loading state
error state
form reset
correct IDs
correct API call
successful close
stale state cleanup

Do not redesign dialogs.

STATE MANAGEMENT

Look for state introduced or broken during the UI redesign.

Pay special attention to:

projectId
environmentId
projects
environments
flags
rules
user
authentication
API keys
activity

Avoid duplicating the same state in multiple unrelated components unless the current architecture requires it.

If multiple components need the same information, use the existing architecture rather than introducing a completely new state-management system.

RACE CONDITIONS

Check for async race conditions.

Example:

User selects Project A
 ↓
request environments for A

User immediately selects Project B
 ↓
request environments for B

Request A finishes AFTER request B
 ↓
A's environments overwrite B's state

Prevent this where necessary.

Similarly check:

logout while API request is running
user switch while request is running
project switch while environment request is running
environment switch while flag request is running
ERROR HANDLING

Every API operation should correctly handle:

401 → authentication/session problem
403 → authorization/access problem
404 → resource not found
409 → conflict
422/400 → validation
500 → server error
network failure → backend unavailable

Do not convert every error into:

Unable to fetch

Preserve meaningful messages.

ENVIRONMENT VARIABLES

Inspect the frontend environment configuration.

Verify the frontend is using the correct backend URL.

Do not hardcode local development URLs.

Check:

VITE_*

variables and how they are consumed.

Do not modify backend environment variables.

Do not commit secrets.

IMPORTANT: DO NOT MASK BACKEND ERRORS

If the backend returns:

You do not have access to this environment

do not simply hide the error.

Find out why the frontend sent that environment ID.

The objective is to prevent the invalid request in the first place.

REGRESSION TESTING

After repairs, test the application manually using at least TWO users.

Test User A
Register
Login
Create project
Create environment
Create feature flag
Enable/disable flag
Create targeting rule
Edit targeting rule
Delete targeting rule
Evaluate flag
Generate API key
Rotate API key
View activity
Logout
Test User B
Register
Login

Verify:

User B cannot see User A's project
User B cannot see User A's environment
User B cannot see User A's flags
User B cannot see User A's activity
User B cannot use User A's API key
User B cannot access User A's routes

Then:

Login back as User A

Verify all User A data is still intact.

IMPORTANT SECURITY TEST

Try manually navigating User B to a URL containing User A's IDs:

/projects/<USER_A_PROJECT_ID>/environments/<USER_A_ENVIRONMENT_ID>

The frontend should detect that the project/environment is not in User B's accessible resources and recover appropriately.

The backend must still reject unauthorized requests.

Do not bypass the backend authorization.

BUILD VALIDATION

After changes run:

npm run build

Fix all TypeScript errors.

Also check:

npm run dev

and manually test the major flows.

Do not leave:

unused imports
broken handlers
undefined variables
incorrect route parameters
TypeScript errors
console errors
failed API calls caused by frontend bugs
GIT SAFETY

Before making changes:

git status
git branch --show-current
git log -5 --oneline

Do not destroy existing work.

Do not reset the repository.

Do not delete working components simply because they are complicated.

Create a checkpoint before the repair if necessary.

After successful repairs, provide a concise summary of:

Files changed
What was broken
What was fixed
Backend files changed: MUST BE NONE
UI/design files changed: only logic/state if unavoidable
Tests performed
Remaining issues
FINAL ACCEPTANCE CRITERIA

The repair is complete only when ALL of the following are true:

Authentication
Login works
Logout works
Protected routes work
JWT/auth state is preserved correctly
Users do not inherit another user's frontend state
Projects
Projects load for the current user
Create project works
Project switching works
Invalid/stale project IDs are rejected by frontend state
Environments
Environments load for the selected project
Environment switching works
Invalid/stale environment IDs are rejected
No environment from another user can be loaded
Feature Flags
List works
Create works
Update works
Enable/disable works
Delete works
Correct environment ID is always used
Targeting Rules
List works
Create works
Edit works
Delete works
Correct featureFlagId/ruleId is always used
Evaluation
Evaluation playground works
Correct environment API key is used
Dashboard JWT and runtime API key are not confused
API Keys
Generate works
Rotate works
Copy works
Keys remain environment/user scoped
Activity
Current user's activity loads
Another user's activity never appears
UI
Existing UI remains visually unchanged
Existing animations remain
Existing styling remains
Existing layout remains
Existing dark/light behavior remains
Backend
NO BACKEND LOGIC CHANGED

The backend should remain exactly as it is.

GOLDEN RULE

You are NOT redesigning FlagForge.

You are NOT rebuilding FlagForge.

You are repairing the wiring of the existing FlagForge frontend.

Think of the task as:

CURRENT UI
    +
CURRENT BACKEND
    ↓
RECONNECT EVERYTHING CORRECTLY
    ↓
RESTORE ORIGINAL FUNCTIONALITY

Preserve the UI.

Preserve the backend.

Fix the integration.
Fix authentication state.
Fix IDs.
Fix routing.
Fix API calls.
Fix async state.
Fix buttons.
Fix forms.
Fix multi-user isolation.
Fix error handling.

Do not move to a new architecture unless absolutely necessary.


### One thing I'd specifically tell Antigravity

At the very top of the project, add this instruction too:

> **Before editing anything, inspect the existing frontend and backend API contracts and create a dependency map. Do not assume the newly redesigned UI's data flow is correct. The previous working API integration is the source of truth.**

That should stop it from doing the classic AI-agent move of seeing a broken button and deciding to rebuild half the app. 😄

And based on the files you've shown me, **the biggest areas it needs to audit first are `TopNaviga 