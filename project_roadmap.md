# Project Roadmap: College Discovery Platform

This roadmap details the checklist of deliverables across all phases of development. We will follow a lockstep full-stack development process, where backend API routes are completed and immediately integrated with their respective frontend views before moving to subsequent features.

## Phase 0: System Initialization
- [x] **Git Setup & Workflow**
  - [x] Initialize git repository or verify existing repo status.
  - [x] Create `phase-0-initialization` branch.
- [x] **Backend Project Setup (`/backend`)**
  - [x] Initialize Node.js project with TypeScript.
  - [x] Set up Express server with CORS allowed for local frontend.
  - [x] Configure Prisma ORM with PostgreSQL connection.
  - [x] Define database models in `schema.prisma` (Colleges, Courses, Placements, Cutoffs, Reviews).
  - [x] Create `prisma/seed.ts` populating standard IIT and NIT mock data.
  - [x] Run seed script to verify database state.
- [x] **Frontend Project Setup (`/frontend`)**
  - [x] Initialize Vite + React + TypeScript application.
  - [x] Install TailwindCSS and React Router DOM.
  - [x] Configure Tailwind theme with white/off-white background and deep navy primary accent.
  - [x] Verify basic frontend routing and layout.

## Phase 1: Search & Discovery Engine
- [x] **Git Branching**
  - [x] Commit Phase 0 progress and branch off to `phase-1-search-discovery`.
- [x] **Backend API Development**
  - [x] Implement `GET /api/colleges` supporting:
    - [x] Pagination (page & limit parameters).
    - [x] Combinative filters (search query, max fees, location, rating).
- [x] **Frontend View Development**
  - [x] Create "Discover Colleges" view (`/discover` or homepage).
  - [x] Left Sidebar layout containing:
    - [x] Search input.
    - [x] Max Fees slider.
    - [x] Location dropdown.
    - [x] Rating checkboxes.
  - [x] Sync active filters state with React Router URL search parameters.
  - [x] Right Area layout: Grid of college cards.
  - [x] Cards layout:
    - [x] Display college logo, name, rating, location.
    - [x] Display data pills for "Fees" (annual/overall) and "Avg Package".
    - [x] Include "View Details" (link to detail page) and "Compare" (add to comparison state) buttons.
- [x] **Integration**
  - [x] Connect the search sidebar and cards list to the `GET /api/colleges` backend endpoint.

## Phase 2: Detail Pages & Trust Loop
- [x] **Git Branching**
  - [x] Commit Phase 1 progress and branch off to `phase-2-details-reviews`.
- [x] **Backend API Development**
  - [x] Implement `GET /api/colleges/:slug` fetching a single college including courses, placements, and cutoffs.
  - [x] Implement `GET /api/reviews` fetching reviews of a college by college ID or slug.
  - [x] Implement `POST /api/reviews` allowing review creation.
- [x] **Frontend View Development**
  - [x] Create dynamic routing in React Router (`/colleges/:slug`).
  - [x] Hero Section: Full-width cover image, college logo overlay, name, rating, and quick details.
  - [x] Tab Navigation:
    - [x] **Overview**: Short description and quick stats.
    - [x] **Courses & Fees**: Table/list of courses with fees.
    - [x] **Placements**: Placement history (average & highest package, top recruiters).
    - [x] **Reviews**: User reviews display.
  - [x] Verified Student Badge:
    - [x] Implement UI for a distinct green "Verified Student" badge next to user names for verified reviews.
- [x] **Integration**
  - [x] Connect detail pages to the single college and reviews API endpoints.

## Phase 3: Side-by-Side Comparison Matrix
- [x] **Git Branching**
  - [x] Commit Phase 2 progress and branch off to `phase-3-comparison`.
- [x] **Frontend State Management**
  - [x] Build a client-side comparison state (Context or Zustand) managing a list of selected colleges (Max 3).
- [x] **Frontend View Development**
  - [x] Create comparison page `/compare` matching the "Technical Comparison Matrix" mockup.
  - [x] 4-Column Table layout:
    - [x] Column 1: Labels (Fees, Intake, Highest Package, Average Package, Top Recruiters).
    - [x] Columns 2-4: Details of up to 3 selected colleges.
  - [x] Visual Metric Highlight:
    - [x] Highlight the winning metric (e.g. lowest fees, highest package, etc.) in each row using a subtle green background.

## Phase 4: Match Predictor Engine (Dynamic Schema Architecture)
- [x] **Git Branching**
  - [x] Commit Phase 3 progress and branch off to `phase-4-match-predictor`.
- [x] **Database & Schema Updates**
  - [x] Refactor Prisma schema to support `Exam` model with JSON `formSchema`.
  - [x] Refactor `Cutoff` model to link to `Exam` and store variable parameters in a JSON `criteria` column.
- [ ] **Backend API Development**
  - [ ] Implement `POST /api/predict` endpoint:
    - [ ] Accepts dynamically generated `criteria` JSON payloads.
    - [ ] Use PostgreSQL exact JSON matching to query the `Cutoff` table.
    - [ ] Return list of matching colleges and their historical cutoff ranks.
- [ ] **Frontend View Development**
  - [ ] Create Rank Predictor view (`/predict`).
  - [ ] Form layout: Fetch available exams on mount.
  - [ ] Dynamic Rendering: Parse the selected exam's `formSchema` JSON to dynamically generate necessary inputs (e.g., Quota, Category, Round).
  - [ ] Results panel underneath:
    - [ ] Display list of predicted matching colleges.
    - [ ] Show college details on the left, historical cutoff number on the right.
- [ ] **Integration**
  - [ ] Connect predictor form to the `POST /api/predict` endpoint and render returned options.

## Phase 5: Administrative CMS Dashboard (Dynamic Ingestion)
- [x] **Git Branching**
  - [x] Commit Phase 4 progress and branch off to `phase-5-admin-dashboard`.
- [x] **Backend API Development**
  - [x] Protect admin routes under `/api/admin/*` using mock/basic admin authentication middleware.
  - [x] Implement `POST /api/admin/colleges` handling nested Prisma transactions for ingestion.
  - [x] Implement `PUT /api/admin/reviews/:id` for review status moderation (Approve/Reject).
- [ ] **Frontend View Development**
  - [x] Create `/admin` view with route protection (mock check).
  - [ ] **View 1: Exam Form Builder (New)**:
    - [ ] Build a dynamic form builder at `/admin/exams/new`.
    - [ ] Define Exam Name and add parameters (Label, Type, Options) to construct the `formSchema` JSON.
  - [ ] **View 2: Add College Wizard**:
    - [x] 4-Step horizontal wizard (Basic Info, Courses, Placements, Cutoffs).
    - [x] Image assets upload: Include a drag-and-drop zone.
    - [ ] Enhance wizard to allow selecting supported `Exams`.
    - [ ] Dynamically render Cutoff data-entry rows based on the selected `formSchema`.
  - [x] **View 3: Review Moderation Queue**:
    - [x] Dense data table listing pending reviews.
    - [x] Add direct "Approve" and "Reject" actions.
- [ ] **Integration**
  - [x] Hook frontend CMS views up to the protected admin API endpoints.
