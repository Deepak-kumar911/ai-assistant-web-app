# Web App Dashboard (`web-app/`)

The multi-tenant operator interface built with **React 18**, **Vite**, **Redux Toolkit**, and a modern **Dark Glassmorphic Design System** for managing AI agents, team collaboration, visual workflow automations, customer conversations, operational analytics, and account settings.

---

## 1. Key Pages & Components

### 1.1. Main Operational Dashboard (`/dashboard`)
- **Operational StatCards:**
  - **Agent Capacity:** Shows current plan limit utilization, active count vs limit, and usage percentage.
  - **Conversations Volume:** Total conversations and message volume in the selected date window with trend indicators.
  - **Task Pipeline:** Total submissions, breakdown between Custom Forms and Bookings, and pending review counts.
  - **Instagram Automation Impact:** Automated DMs handled, leads captured, response rate, and operator hours saved.
- **Interactive Filter Toolbar:**
  - **Agent Filter Selector:** Isolates metrics, tasks, and timeseries charts to an individual agent or "All Agents".
  - **Date Range Selector:** Quick preset selection (`Today`, `Yesterday`, `Last 7 Days`, `This Month`, `Last Month`, `Custom`).
  - **Custom Range Inputs:** Interactive start and end date pickers with validation.
- **Dynamic Activity Timeseries Bar Chart:**
  - Interactive SVG/CSS chart displaying daily conversations and message volume with hover tooltips and metric toggles.
- **Connected Platforms Status & First-Run Empty State:**
  - Real-time health badges for Website Chat Widget and Instagram Integration.
  - Friendly first-run onboarding state (`EmptyState.jsx`) for new accounts with zero deployed agents.

### 1.2. Account & Profile Settings (`/settings`)
- **URL Query Param Sync:** Reads `?search=profile` or `?tab=profile` to navigate directly to the requested tab.
- **User Profile Section:**
  - Direct profile avatar upload to S3 (`POST /api/v1/upload/user/media`) with initials fallback.
  - Editable user display name with instant Redux synchronization (`setDetails`).
  - Read-only email address with an emerald **"Verified"** badge.
  - Current workspace role and tenant ID indicators.
- **Plan & Billing Section:**
  - Displays current plan tier (`Free`, `Pro`, `Ultra`) and pricing details.
  - Agent capacity meter (`agentCount / agentLimit`) with progress bar.
  - **Upgrade Plan Modal (`UpgradePlanModal.jsx`):** Interactive comparison modal detailing tier features and upgrade inquiries.
- **Team Workspace Section:**
  - Workspace ID summary and one-click navigation link to the Members management page (`/team`).
- **Security Section:**
  - Authentication provider status badge (Google OAuth or Password Authentication) and session protection notice.

### 1.3. Multi-Tenant Workspace Switcher (`AccountSwitcher.jsx`)
- Dropdown selector displaying the active workspace name, user's current role (`Owner`, `Admin`, `Member`, `Viewer`), and plan tier badge (`FREE`, `PRO`, `ULTRA`).
- Lists every accessible workspace from `GET /api/v1/auth/me`.
- One-click context switch calling `POST /api/v1/account/switch`, revoking old tokens and reloading fresh tenant data with zero cross-tenant state bleed.

### 1.4. Team Management (`/team`)
- Member table displaying names, emails, roles, join dates, and actions.
- Role management dropdown allowing Owners to adjust roles between `Admin`, `Member`, and `Viewer` (`PATCH /api/v1/account/members/:id/role`).
- Member removal action (`DELETE /api/v1/account/members/:userId`).
- Email invitation modal (`POST /api/v1/account/invite`) with 7-day single-use invite tokens and duplicate invite prevention.

### 1.5. Website Chat Widget & Customizer (`/integrations/web`)
- **Live Interactive Widget Preview:** Real-time preview card showcasing brand color customization, greeting messages, and agent persona.
- **Customizer Controls:** Color picker for brand accent colors, custom welcome messages, and agent selector.
- **Embed Code Generator:** Encapsulated `<script>` tag embedding the Shadow DOM widget bundle (`widget.js`) with one-click copy.

### 1.6. Connected Platforms & Instagram Status (`/integrations/instagram`)
- **Health Status Badge:** Live indicator showing `Connected` (emerald), `Expired` (amber), or `Error` (rose).
- **3-Dot Kebab Menu:** Actions to view status details or trigger immediate OAuth reconnection (`POST /api/v1/integration/instagram/reconnect`).
- **Route Guard:** `InstagramRouteGuard.jsx` redirecting unintegrated users to the setup view.

### 1.7. Visual Workflow Canvas (`/workflows`)
- Interactive ReactFlow-based node graph editor for trigger→action automations:
  - `trigger.schedule`: Cron / timestamp scheduling.
  - `action.instagram_publish_post`: Two-step media container publishing.
  - `trigger.instagram_comment`: Stateful wait node with comment webhook resume.
  - `condition.keyword_match`: Case-insensitive text condition evaluator.
  - `action.instagram_reply_comment`: Public comment auto-reply.
  - `action.instagram_send_dm`: Private direct message auto-sender.
- Quick-schedule post generator auto-generating 2-node workflow definitions.

### 1.8. Task Response Center (`/tasks`) & Unified Chat Inbox (`/inbox`)
- **Task Response Center:** Multi-channel log for Lead Capture forms and Appointment Bookings with status management (`confirmed`, `cancelled`, `rejected`) and filtered CSV export.
- **Unified Chat Inbox:** Split-pane inbox viewing website chats (persisted in MongoDB) and Instagram direct messages (fetched live on demand via Meta Graph API with 5-minute Redis caching).

---

## 2. Directory Structure

```
web-app/
├── src/
│   ├── api/             # Axios API interfaces
│   │   ├── authApi.js   # Authentication, session refresh & /auth/me
│   │   ├── accountApi.js# Account switching, team members, invites, usage quotas
│   │   ├── agentApi.js  # Agent configuration, avatar upload, knowledge
│   │   ├── dashboardApi.js # Dashboard metrics & timeseries aggregation
│   │   ├── inboxApi.js  # Chat Inbox threads & status patching
│   │   ├── integrationApi.js # Instagram OAuth, health status, reconnect
│   │   ├── tasksApi.js  # Task Response Center submissions & CSV export
│   │   ├── userApi.js   # User profile updates (PATCH /user/profile)
│   │   └── workflowApi.js # Workflow CRUD & execution instances
│   │
│   ├── components/      # Reusable UI component library
│   │   ├── layout/      # Sidebar, Header, UserLayout, AccountSwitcher, MobileNav
│   │   ├── plan/        # UpgradePlanModal, PlanBadge
│   │   ├── ui/          # StatCard, EmptyState, LoadingState, ErrorState, Modal, Select, Badge, Button
│   │   └── workflows/   # Workflow Canvas custom nodes & edge renderers
│   │
│   ├── pages/           # Application views
│   │   ├── auth/        # Login, Signup, InviteAccept, VerifyOtp
│   │   ├── Dashboard.jsx# Operational main dashboard with filters & timeseries
│   │   ├── Settings.jsx # Account & profile settings with tab navigation
│   │   ├── Team.jsx     # Team member management & invites
│   │   ├── agent/       # AgentSettings, KnowledgeBase, TasksConfig
│   │   ├── integrations/# WebIntegration (Customizer), InstagramSettings, InstagramInsights
│   │   ├── inbox/       # ChatInbox
│   │   ├── tasks/       # TaskResponseCenter
│   │   └── workflows/   # WorkflowCanvas, WorkflowList
│   │
│   ├── redux/           # Redux Toolkit store & slices
│   │   ├── store.js     # Configured Redux store
│   │   └── slices/      # authSlice (session bootstrap, active account, user details)
│   │
│   ├── routes/          # mainRouter.jsx & protected route guards (AuthGuard, InstagramRouteGuard)
│   ├── index.css        # Tailwind CSS & HSL design tokens
│   └── App.jsx          # Application root with session bootstrap
│
├── index.html
├── vite.config.js
└── package.json
```

---

## 3. Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Running on http://localhost:5173

# Production build validation
npm run build
```
