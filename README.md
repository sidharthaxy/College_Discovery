# College Discovery Platform

A full-stack, comprehensive web platform designed to streamline the college search, comparison, and prediction process for aspiring students. 

## Structure
This is a monorepo containing two main projects:
- **`/frontend`**: The React/Vite web application.
- **`/backend`**: The Node.js/Express API with Prisma ORM.

## Features
1. **College Discovery**: Browse through an extensive database of colleges, complete with advanced filters (fees, location, rating).
2. **Detailed College Profiles**: Deep dive into individual college statistics, including courses, fees, placements, recruiters, and user-generated reviews.
3. **Compare Matrix**: Compare up to 3 colleges side-by-side on metrics like average package, duration, and tuition.
4. **Admission Predictor**: Input your entrance exam (e.g., JEE Main) rank, category, and state to dynamically predict eligibility based on historical cutoffs.
5. **User Profiles**: Sign up, save favorites, store comparison matrices, and write verified reviews.
6. **Admin Portal**: Fully integrated admin capabilities. Add colleges, manage reviews, configure entrance exams, and edit college profiles (rows and statistics) dynamically on-the-fly.
7. **Intelligent Fuzzy Search**: Uses PostgreSQL `pg_trgm` to seamlessly handle typos and partial matches when searching for colleges or tags.

## Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or higher recommended)
- A PostgreSQL instance (e.g. Neon DB, Supabase, or local)
- (Optional) Redis (if caching was configured)

### 1. Database Setup
1. Create a PostgreSQL database.
2. Navigate to the backend directory: `cd backend`
3. Copy the env example: `cp .env.example .env`
4. Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.

### 2. Backend Setup
1. Install dependencies: `npm install`
2. Run database migrations: `npx prisma migrate dev`
3. Seed the database with initial college data: `npm run prisma:seed`
4. Start the backend dev server: `npm run dev`
*(Runs on `http://localhost:5001` by default)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Copy the env example: `cp .env.example .env`
4. Make sure `VITE_API_URL` points to your backend (default is `http://localhost:5001/api`).
5. Start the frontend dev server: `npm run dev`
*(Runs on `http://localhost:5173` by default)*
