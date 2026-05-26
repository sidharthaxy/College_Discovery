import { API_URL } from '../config';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, ArrowRightLeft, ChevronLeft, ChevronRight, Check, Bookmark } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

interface College {
  id: number;
  slug: string;
  name: string;
  logoUrl: string;
  coverUrl: string;
  rating: number;
  location: string;
  description: string;
  fees: number;
  avgPackage: number;
  highestPackage: number;
  intake: number;
  topRecruiters: string[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  // Local state for filters, initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [maxFees, setMaxFees] = useState(Number(searchParams.get('maxFees')) || 50); // Lakhs
  const [location, setLocation] = useState(searchParams.get('location') || 'All Locations');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [institutionType, setInstitutionType] = useState(searchParams.get('institutionType') || 'All');

  // API State
  const { user, token, openAuthModal } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = Number(searchParams.get('page')) || 1;

  // Handle building queries from state and updating URL search params
  const updateUrlParams = useCallback((newParams: Record<string, string | number | null>) => {
    const updated = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'All Locations' || val === 'All' || (key === 'maxFees' && val === 50)) {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });

    // Reset to page 1 if filters change
    if (!newParams.page && updated.get('page')) {
      updated.set('page', '1');
    }

    setSearchParams(updated);
  }, [searchParams, setSearchParams]);

  // Fetch colleges from API
  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        
        const urlSearch = searchParams.get('search');
        if (urlSearch) queryParams.append('search', urlSearch);
        
        const urlMaxFees = searchParams.get('maxFees');
        if (urlMaxFees) {
          // Convert Lakhs to absolute INR
          const feesInInr = Number(urlMaxFees) * 100000;
          queryParams.append('maxFees', String(feesInInr));
        }

        const urlLocation = searchParams.get('location');
        if (urlLocation && urlLocation !== 'All Locations') {
          queryParams.append('location', urlLocation);
        }

        const urlRating = searchParams.get('rating');
        if (urlRating) queryParams.append('rating', urlRating);

        const urlInstType = searchParams.get('institutionType');
        if (urlInstType && urlInstType !== 'All') {
          queryParams.append('institutionType', urlInstType);
        }

        const urlPage = searchParams.get('page') || '1';
        queryParams.append('page', urlPage);
        queryParams.append('limit', '4'); // Limit 4 cards per page as in mockup structure

        const response = await fetch(`${API_URL}/colleges?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch colleges');
        }

        const data = await response.json();
        setColleges(data.colleges);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, [searchParams]);

  // Fetch saved colleges if authenticated
  useEffect(() => {
    const fetchSavedColleges = async () => {
      if (!user || !token) {
        setSavedCollegeIds([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSavedCollegeIds(data.savedColleges.map((sc: any) => sc.collegeId));
        }
      } catch (err) {
        console.error('Error fetching saved colleges', err);
      }
    };
    fetchSavedColleges();
  }, [user, token]);

  const toggleSaveCollege = async (collegeId: string) => {
    if (!user || !token) {
      openAuthModal();
      return;
    }
    
    // Optimistic update
    const isSaved = savedCollegeIds.includes(collegeId);
    if (isSaved) {
      setSavedCollegeIds(prev => prev.filter(id => id !== collegeId));
    } else {
      setSavedCollegeIds(prev => [...prev, collegeId]);
    }

    try {
      const res = await fetch(`${API_URL}/profile/save-college`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ collegeId })
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (err) {
      // Revert on error
      if (isSaved) {
        setSavedCollegeIds(prev => [...prev, collegeId]);
      } else {
        setSavedCollegeIds(prev => prev.filter(id => id !== collegeId));
      }
      alert('Error saving college. Please try again.');
    }
  };

  // Sync inputs with URL changes (e.g. when back/forward button is clicked or clear all is triggered)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setMaxFees(Number(searchParams.get('maxFees')) || 50);
    setLocation(searchParams.get('location') || 'All Locations');
    setMinRating(searchParams.get('rating') || '');
    setInstitutionType(searchParams.get('institutionType') || 'All');
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams({ search: val });
  };

  const handleFeesChange = (val: number) => {
    setMaxFees(val);
    updateUrlParams({ maxFees: val });
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    updateUrlParams({ location: val });
  };

  const handleRatingToggle = (val: string) => {
    const nextRating = minRating === val ? '' : val;
    setMinRating(nextRating);
    updateUrlParams({ rating: nextRating });
  };

  const handleInstitutionTypeChange = (val: string) => {
    setInstitutionType(val);
    updateUrlParams({ institutionType: val });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  const handleClearAll = () => {
    setSearch('');
    setMaxFees(50);
    setLocation('All Locations');
    setMinRating('');
    setInstitutionType('All');
    setSearchParams(new URLSearchParams());
  };

  const toggleCompare = (college: College) => {
    if (isInCompare(college.id)) {
      removeFromCompare(college.id);
    } else {
      const added = addToCompare(college);
      if (!added) {
        alert('You can compare a maximum of 3 colleges side-by-side.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Filters Sidebar - 3 Columns */}
      <aside className="md:col-span-3 space-y-6 md:sticky md:top-24 max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-navy-900 tracking-tight">Filters</h2>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-navy-600 hover:text-navy-900 uppercase hover:underline transition-all"
            >
              Clear all
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Search College
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="IIT, NIT, location..."
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
              />
            </div>
          </div>

          {/* Max Fees Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Max Fees (Annual)
              </label>
              <span className="text-xs font-semibold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                ₹{maxFees === 50 ? 'Any' : `${maxFees}L`}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={maxFees}
              onChange={(e) => handleFeesChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-900 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-0.5">
              <span>₹1L</span>
              <span>₹25L</span>
              <span>₹50L</span>
            </div>
          </div>

          {/* Location Dropdown */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all cursor-pointer"
            >
              <option value="All Locations">All Locations</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Odisha">Odisha</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Kerala">Kerala</option>
            </select>
          </div>

          {/* Institution Type Dropdown */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Institution Type
            </label>
            <select
              value={institutionType}
              onChange={(e) => handleInstitutionTypeChange(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Public">Public (IITs/NITs)</option>
              <option value="Private">Private (BITS, etc)</option>
            </select>
          </div>

          {/* Rating Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Rating
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={minRating === '4.5'}
                  onChange={() => handleRatingToggle('4.5')}
                  className="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium group-hover:text-navy-900 transition-colors">4.5+ Stars</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={minRating === '4.0'}
                  onChange={() => handleRatingToggle('4.0')}
                  className="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 text-slate-200" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium group-hover:text-navy-900 transition-colors">4.0+ Stars</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Grid Area - 9 Columns */}
      <section className="md:col-span-9 space-y-6">
        {/* Top summary bar */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Discover Colleges</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {loading
                ? 'Loading results...'
                : pagination
                ? `Showing ${colleges.length} of ${pagination.total} results`
                : 'No results found'}
            </p>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-navy-900 mx-auto"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium">Searching for matches...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center text-red-700">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg font-bold transition-all"
            >
              Retry
            </button>
          </div>
        ) : colleges.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-4 text-base font-bold text-navy-900">No colleges match your filters</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Try adjusting your max fees, removing search queries, or expanding locations to find more options.
            </p>
            <button
              onClick={handleClearAll}
              className="mt-6 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid of College Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {colleges.map((college) => {
                const compared = isInCompare(college.id);
                return (
                  <div
                    key={college.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-navy-500/50 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header Section */}
                      <div className="flex gap-4 items-start mb-5">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                          <img
                            src={college.logoUrl}
                            alt={college.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base font-bold text-navy-900 leading-snug hover:text-navy-700 transition-colors">
                              {college.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-navy-900 flex-shrink-0">
                                <span className="text-xs font-bold">{college.rating.toFixed(1)}</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveCollege(String(college.id));
                                }}
                                className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                                  savedCollegeIds.includes(String(college.id))
                                    ? 'text-navy-900 bg-navy-50 hover:bg-navy-100'
                                    : 'text-slate-300 hover:text-navy-900 hover:bg-slate-50'
                                }`}
                                title={savedCollegeIds.includes(String(college.id)) ? "Remove from saved" : "Save College"}
                              >
                                <Bookmark className="w-4 h-4" fill={savedCollegeIds.includes(String(college.id)) ? "currentColor" : "none"} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{college.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description Snippet */}
                      <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-2">
                        {college.description}
                      </p>

                      {/* Info Pills */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                            Annual Fees
                          </span>
                          <span className="text-sm font-bold text-navy-900">
                            ₹{(college.fees / 100000).toFixed(2)} Lakhs
                          </span>
                        </div>
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                          <span className="text-[10px] font-bold text-emerald-600/80 block uppercase tracking-wider mb-1">
                            Avg Package
                          </span>
                          <span className="text-sm font-bold text-emerald-800">
                            ₹{college.avgPackage.toFixed(1)} Lakhs
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/colleges/${college.slug}`)}
                        className="flex-grow bg-navy-900 hover:bg-navy-800 text-white py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide uppercase transition-all shadow-sm"
                      >
                        VIEW DETAILS
                      </button>
                      <button
                        onClick={() => toggleCompare(college)}
                        title={compared ? 'Remove from Compare' : 'Add to Compare'}
                        className={`px-3 border rounded-lg flex items-center justify-center transition-all ${
                          compared
                            ? 'bg-navy-900 border-navy-900 text-white'
                            : 'border-slate-200 text-navy-900 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {compared ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ArrowRightLeft className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        pageNum === currentPage
                          ? 'bg-navy-900 text-white'
                          : 'border border-transparent text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
