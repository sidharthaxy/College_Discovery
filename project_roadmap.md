# Project Roadmap: College Discovery Platform

This roadmap details the checklist of deliverables across all phases of development. We will follow a lockstep full-stack development process, where backend API routes are completed and immediately integrated with their respective frontend views before moving to subsequent features.

## Phase 0: System Initialization
- [ ] **Git Setup & Workflow**
  - [ ] Initialize git repository or verify existing repo status.
  - [ ] Create `phase-0-initialization` branch.
- [ ] **Backend Project Setup (`/backend`)**
  - [ ] Initialize Node.js project with TypeScript.
  - [ ] Set up Express server with CORS allowed for local frontend.
  - [ ] Configure Prisma ORM with PostgreSQL connection.
  - [ ] Define database models in `schema.prisma` (Colleges, Courses, Placements, Cutoffs, Reviews).
  - [ ] Create `prisma/seed.ts` populating standard IIT and NIT mock data.
  - [ ] Run seed script to verify database state.
- [ ] **Frontend Project Setup (`/frontend`)**
  - [ ] Initialize Vite + React + TypeScript application.
  - [ ] Install TailwindCSS and React Router DOM.
  - [ ] Configure Tailwind theme with white/off-white background and deep navy primary accent.
  - [ ] Verify basic frontend routing and layout.

## Phase 1: Search & Discovery Engine
- [ ] **Git Branching**
  - [ ] Commit Phase 0 progress and branch off to `phase-1-search-discovery`.
- [ ] **Backend API Development**
  - [ ] Implement `GET /api/colleges` supporting:
    - [ ] Pagination (page & limit parameters).
    - [ ] Combinative filters (search query, max fees, location, rating).
- [ ] **Frontend View Development**
  - [ ] Create "Discover Colleges" view (`/discover` or homepage).
  - [ ] Left Sidebar layout containing:
    - [ ] Search input.
    - [ ] Max Fees slider.
    - [ ] Location dropdown.
    - [ ] Rating checkboxes.
  - [ ] Sync active filters state with React Router URL search parameters.
  - [ ] Right Area layout: Grid of college cards.
  - [ ] Cards layout:
    - [ ] Display college logo, name, rating, location.
    - [ ] Display data pills for "Fees" (annual/overall) and "Avg Package".
    - [ ] Include "View Details" (link to detail page) and "Compare" (add to comparison state) buttons.
- [ ] **Integration**
  - [ ] Connect the search sidebar and cards list to the `GET /api/colleges` backend endpoint.

## Phase 2: Detail Pages & Trust Loop
- [ ] **Git Branching**
  - [ ] Commit Phase 1 progress and branch off to `phase-2-details-reviews`.
- [ ] **Backend API Development**
  - [ ] Implement `GET /api/colleges/:slug` fetching a single college including courses, placements, and cutoffs.
  - [ ] Implement `GET /api/reviews` fetching reviews of a college by college ID or slug.
  - [ ] Implement `POST /api/reviews` allowing review creation.
- [ ] **Frontend View Development**
  - [ ] Create dynamic routing in React Router (`/colleges/:slug`).
  - [ ] Hero Section: Full-width cover image, college logo overlay, name, rating, and quick details.
  - [ ] Tab Navigation:
    - [ ] **Overview**: Short description and quick stats.
    - [ ] **Courses & Fees**: Table/list of courses with fees.
    - [ ] **Placements**: Placement history (average & highest package, top recruiters).
    - [ ] **Reviews**: User reviews display.
  - [ ] Verified Student Badge:
    - [ ] Implement UI for a distinct green "Verified Student" badge next to user names for verified reviews.
- [ ] **Integration**
  - [ ] Connect detail pages to the single college and reviews API endpoints.

## Phase 3: Side-by-Side Comparison Matrix
- [ ] **Git Branching**
  - [ ] Commit Phase 2 progress and branch off to `phase-3-comparison`.
- [ ] **Frontend State Management**
  - [ ] Build a client-side comparison state (Context or Zustand) managing a list of selected colleges (Max 3).
- [ ] **Frontend View Development**
  - [ ] Create comparison page `/compare` matching the "Technical Comparison Matrix" mockup.
  - [ ] 4-Column Table layout:
    - [ ] Column 1: Labels (Fees, Intake, Highest Package, Average Package, Top Recruiters).
    - [ ] Columns 2-4: Details of up to 3 selected colleges.
  - [ ] Visual Metric Highlighting:
    - [ ] Highlight the winning metric (e.g. lowest fees, highest package, etc.) in each row using a subtle green background.

## Phase 4: Match Predictor Engine
- [ ] **Git Branching**
  - [ ] Commit Phase 3 progress and branch off to `phase-4-match-predictor`.
- [ ] **Backend API Development**
  - [ ] Implement `POST /api/predict` endpoint:
    - [ ] Accepts: Entrance Exam, Category (Gen, OBC, SC, ST), Rank.
    - [ ] Query historical cutoffs database and match against input parameters.
    - [ ] Return list of matching colleges and their historical cutoff ranks.
- [ ] **Frontend View Development**
  - [ ] Create Rank Predictor view (`/predict`).
  - [ ] Form layout: Dropdowns for Exam and Category, text/number input for Rank.
  - [ ] Results panel underneath:
    - [ ] Display list of predicted matching colleges.
    - [ ] Show college details on the left, historical cutoff number on the right.
- [ ] **Integration**
  - [ ] Connect predictor form to the `POST /api/predict` endpoint and render returned options.

## Phase 5: Administrative CMS Dashboard
- [ ] **Git Branching**
  - [ ] Commit Phase 4 progress and branch off to `phase-5-admin-dashboard`.
- [ ] **Backend API Development**
  - [ ] Protect admin routes under `/api/admin/*` using mock/basic admin authentication middleware.
  - [ ] Implement `POST /api/admin/colleges` handling nested Prisma transactions for ingestion.
  - [ ] Implement `PUT /api/admin/reviews/:id` for review status moderation (Approve/Reject).
- [ ] **Frontend View Development**
  - [ ] Create `/admin` view with route protection (mock check).
  - [ ] **View 1: Add College Wizard**:
    - [ ] 4-Step horizontal wizard (Basic Info, Courses, Placements, Cutoffs).
    - [ ] Image assets upload: Include a drag-and-drop zone.
  - [ ] **View 2: Review Moderation Queue**:
    - [ ] Dense data table listing pending reviews.
    - [ ] Add direct "Approve" and "Reject" actions.
- [ ] **Integration**
  - [ ] Hook frontend CMS views up to the protected admin API endpoints.
