# College Discovery - Backend

This is the API server for the College Discovery platform. It manages database connections, business logic, authentication, and dynamic prediction algorithms.

## Tech Stack
- **Node.js & Express**: The foundation of the REST API. Chosen for its lightweight nature and vast middleware ecosystem.
- **TypeScript**: Provides compile-time safety and self-documenting data structures.
- **Prisma ORM**: A next-generation ORM used for type-safe database querying. Chosen over Raw SQL/TypeORM for its intuitive schema definition and robust migration system.
- **PostgreSQL**: The relational database used. (Easily swappable to MySQL or MongoDB via Prisma).
- **JSON Web Tokens (JWT) & bcrypt**: Used for stateless, secure authentication and password hashing.

## Architectural Decisions

### Why a Relational Database (SQL/PostgreSQL)?
The platform's data is highly structured and heavily interconnected:
- A `College` has many `Course`s and `Placement`s.
- An `Exam` is linked to multiple `College` cutoffs.
- A `User` can save multiple `College`s (Many-to-Many).
Using a relational database ensures **referential integrity**. If a college is deleted, its associated courses and cutoffs are cascaded seamlessly without leaving orphaned documents, which is a common hazard in NoSQL stores.

### Database Schema Overview
1. **User**: Stores credentials and `ROLE` (USER vs ADMIN). Maintains relations to Saved Colleges and Comparisons.
2. **College**: The central entity. Contains generic stats (location, fees, rating) and one-to-many relations to granular data.
3. **Course & Placement**: Child entities of College. Allows for infinite rows of branch fees and yearly historical placement trends.
4. **Review**: Linked to both a `User` (author) and a `College`.
5. **Exam & Cutoff**: 
   - `Exam` defines the `formSchema` dynamically (e.g., what dropdowns should appear in the frontend Predictor).
   - `Cutoff` stores historical threshold data as a JSON `criteria` object, mapping it to a specific `College` and `Exam`.

### Environment Variables & CORS
- **CORS** is configured to accept requests from specific origins defined in `FRONTEND_URL`. This secures the API in production.
- **Routing** is segregated logically into `/colleges`, `/auth`, `/predict`, `/profile`, `/reviews`, and `/admin`.

## Deployment on Render
1. Create a Web Service on Render and connect your GitHub repo.
2. Set the Root Directory to `backend`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Ensure `DATABASE_URL`, `FRONTEND_URL`, and `JWT_SECRET` are set in the Render Environment Variables tab.
