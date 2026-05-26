# College Discovery - Frontend

This is the frontend client for the College Discovery platform. It handles all UI/UX components, routing, and user interaction.

## Tech Stack
- **React 18**: Chosen for its robust component-based architecture and widespread ecosystem.
- **Vite**: Used over Webpack/CRA for significantly faster HMR (Hot Module Replacement) and optimized build times.
- **Tailwind CSS**: The primary styling engine. Selected for rapid UI iteration, design token consistency, and zero-runtime overhead.
- **React Router DOM v6**: For SPA routing, enabling seamless transitions between Discover, Compare, Predictor, and Admin views.
- **Lucide React**: For scalable, consistent vector iconography.
- **TypeScript**: Strictly typed to catch structural bugs early (e.g., mismatched types between the Prisma backend API and React components).

## Architectural Decisions

### State Management
Instead of reaching for heavy external stores like Redux or Zustand, the state is managed via:
1. **React Context (`AuthContext.tsx`)**: Used exclusively for global state that needs to be accessed by deeply nested components (User session, Authentication JWT, User Role).
2. **Local State (`useState`, `useReducer`)**: Form data, UI toggles, and page-specific fetched data are scoped locally to prevent unnecessary global re-renders.

### Component Structure
- **Pages**: Top-level route components (`Discover.tsx`, `Profile.tsx`) handle API data fetching and pass it down.
- **Components**: UI blocks like `Navbar`, `AuthModal`, `Footer` that are reusable and stateless where possible.

### Dynamic Environment Variables
The application uses `VITE_API_URL` to route requests. This ensures the compiled artifact can be seamlessly promoted from a local environment to a production domain without touching the source code.

## Deployment on Vercel
This app is natively optimized for Vercel. 
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Ensure the Build Command is `npm run build` and Output Directory is `dist`.
4. Set the Environment Variable `VITE_API_URL` to your live Backend URL.
