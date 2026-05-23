import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Discover from './pages/Discover';
import CollegeDetail from './pages/CollegeDetail';
import Compare from './pages/Compare';
import Predictor from './pages/Predictor';
import Admin from './pages/Admin';
import { CompareProvider, useCompare } from './context/CompareContext';

function Header() {
  const { compareList } = useCompare();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-2xl text-navy-900 font-extrabold tracking-tight font-serif flex items-center gap-1">
              🎓 College<span className="text-navy-500 font-sans font-semibold">Discovery</span>
            </Link>
          </div>
          <nav className="flex space-x-8">
            <Link
              to="/"
              className="text-slate-600 hover:text-navy-900 px-1 py-2 text-sm font-medium transition-colors"
            >
              Discover
            </Link>
            <Link
              to="/compare"
              className="text-slate-600 hover:text-navy-900 px-1 py-2 text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              Compare Matrix
              {compareList.length > 0 && (
                <span className="bg-navy-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {compareList.length}
                </span>
              )}
            </Link>
            <Link
              to="/predict"
              className="text-slate-600 hover:text-navy-900 px-1 py-2 text-sm font-medium transition-colors"
            >
              Rank Predictor
            </Link>
            <Link
              to="/admin"
              className="text-slate-600 hover:text-navy-900 px-1 py-2 text-sm font-medium transition-colors"
            >
              Admin Portal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <CompareProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />

          {/* Main Content Area */}
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/colleges/:slug" element={<CollegeDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/predict" element={<Predictor />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              &copy; 2026 College Discovery Platform. All rights reserved. Locally Hosted.
            </div>
          </footer>
        </div>
      </Router>
    </CompareProvider>
  );
}
