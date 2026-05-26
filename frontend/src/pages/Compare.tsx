import { API_URL } from '../config';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trophy, TrendingUp, Sparkles, Plus, ArrowRightLeft, Bookmark } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { user, token, openAuthModal } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveComparison = async () => {
    if (!user || !token) {
      openAuthModal();
      return;
    }
    setIsSaving(true);
    try {
      const collegeIds = compareList.map(c => String(c.id));
      const res = await fetch(`${API_URL}/profile/save-comparison`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${compareList[0].name} vs ${compareList.length > 1 ? compareList[1].name : 'Others'}`,
          collegeIds
        })
      });
      if (!res.ok) throw new Error('Failed to save comparison');
      alert('Comparison saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Error saving comparison.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to determine the "winner" index for specific fields
  const getWinnerIndex = (
    field: 'fees' | 'avgPackage' | 'highestPackage' | 'intake',
    mode: 'min' | 'max'
  ): number => {
    if (compareList.length <= 1) return -1;

    let targetIdx = 0;
    let targetVal = compareList[0][field];

    for (let i = 1; i < compareList.length; i++) {
      const val = compareList[i][field];
      if (mode === 'min') {
        if (val < targetVal) {
          targetVal = val;
          targetIdx = i;
        }
      } else {
        if (val > targetVal) {
          targetVal = val;
          targetIdx = i;
        }
      }
    }

    // Check if there's a tie (if all values are equal, don't highlight any single winner)
    const allEqual = compareList.every((item) => item[field] === targetVal);
    return allEqual ? -1 : targetIdx;
  };

  const winningFeesIdx = getWinnerIndex('fees', 'min');
  const winningAvgPkgIdx = getWinnerIndex('avgPackage', 'max');
  const winningHiPkgIdx = getWinnerIndex('highestPackage', 'max');
  const winningIntakeIdx = getWinnerIndex('intake', 'max');

  // Fill up comparison columns to exactly 3 for layout consistency
  const filledColumns = [...compareList];
  while (filledColumns.length < 3) {
    filledColumns.push(null as any);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-l-4 border-navy-900 pl-6 py-1">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Technical Comparison Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
            Side-by-side performance analysis of Tier-1 Engineering Institutions. Metrics based on the 2024 academic cycle data.
          </p>
        </div>
        {compareList.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleSaveComparison}
              disabled={isSaving}
              className="text-xs font-bold bg-navy-900 text-white px-4 py-2 rounded hover:bg-navy-800 transition-colors flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Comparison'}
            </button>
            <button
              onClick={clearCompare}
              className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors uppercase"
            >
              Clear Matrix
            </button>
          </div>
        )}
      </div>

      {compareList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center max-w-xl mx-auto shadow-sm">
          <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-navy-900">Compare Matrix is Empty</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            You haven't selected any colleges to compare. Head over to the Discover page and click the compare icon on your preferred colleges.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Go to Discover
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden rounded-xl shadow-sm">
          {/* Table Container Grid */}
          <div className="min-w-[800px] overflow-x-auto">
            {/* Header row containing College Profiles */}
            <div className="grid grid-cols-[240px_1fr_1fr_1fr] bg-slate-50/50 border-b border-slate-200">
              <div className="p-6 flex items-center font-bold text-xs uppercase tracking-wider text-slate-400">
                Attributes
              </div>

              {filledColumns.map((college, idx) => {
                if (!college) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="p-6 border-l border-slate-200 flex flex-col items-center justify-center text-center bg-slate-50/30 min-h-[220px]"
                    >
                      <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-3 bg-white">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-slate-400 font-semibold mb-2">Slot Empty</span>
                      <Link
                        to="/"
                        className="text-[10px] bg-white border border-slate-200 hover:border-navy-500 hover:text-navy-900 px-3 py-1.5 rounded text-slate-500 font-bold transition-all"
                      >
                        Add College
                      </Link>
                    </div>
                  );
                }

                return (
                  <div
                    key={college.id}
                    className="p-6 border-l border-slate-200 bg-white flex flex-col justify-between group hover:bg-slate-50/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Rank #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeFromCompare(college.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center p-1.5 border border-slate-100 mb-3">
                        <img
                          src={college.logoUrl}
                          alt={college.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-sm font-bold text-navy-900 leading-snug line-clamp-1">
                        {college.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {college.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrix Data Rows */}
            <div className="divide-y divide-slate-150">
              {/* Row 1: Location */}
              <div className="grid grid-cols-[240px_1fr_1fr_1fr] hover:bg-slate-50/30 transition-colors text-xs font-medium">
                <div className="p-4 px-6 font-bold text-slate-500 uppercase tracking-wider flex items-center bg-slate-50/25">
                  Location
                </div>
                {filledColumns.map((college, idx) => (
                  <div key={idx} className="p-4 border-l border-slate-200 text-slate-700 flex items-center">
                    {college ? college.location : '-'}
                  </div>
                ))}
              </div>

              {/* Row 2: Fees (Lowest Wins) */}
              <div className="grid grid-cols-[240px_1fr_1fr_1fr] hover:bg-slate-50/30 transition-colors text-xs font-semibold">
                <div className="p-4 px-6 font-bold text-slate-500 uppercase tracking-wider flex items-center bg-slate-50/25">
                  Annual Fees
                </div>
                {filledColumns.map((college, idx) => {
                  if (!college) return <div key={idx} className="p-4 border-l border-slate-200 text-slate-400 flex items-center">-</div>;
                  const isWinner = idx === winningFeesIdx;
                  return (
                    <div
                      key={idx}
                      className={`p-4 border-l border-slate-200 flex items-center justify-between ${
                        isWinner ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-navy-900'
                      }`}
                    >
                      <span>₹{(college.fees / 100000).toFixed(2)} Lakhs</span>
                      {isWinner && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold flex items-center gap-0.5 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 fill-current" />
                          Best Value
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row 3: Intake */}
              <div className="grid grid-cols-[240px_1fr_1fr_1fr] hover:bg-slate-50/30 transition-colors text-xs font-medium">
                <div className="p-4 px-6 font-bold text-slate-500 uppercase tracking-wider flex items-center bg-slate-50/25">
                  B.Tech Intake
                </div>
                {filledColumns.map((college, idx) => {
                  if (!college) return <div key={idx} className="p-4 border-l border-slate-200 text-slate-400 flex items-center">-</div>;
                  const isWinner = idx === winningIntakeIdx;
                  return (
                    <div
                      key={idx}
                      className={`p-4 border-l border-slate-200 flex items-center ${
                        isWinner ? 'text-navy-900 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {college.intake} Seats
                    </div>
                  );
                })}
              </div>

              {/* Row 4: Average Package (Highest Wins) */}
              <div className="grid grid-cols-[240px_1fr_1fr_1fr] hover:bg-slate-50/30 transition-colors text-xs font-semibold">
                <div className="p-4 px-6 font-bold text-slate-500 uppercase tracking-wider flex items-center bg-slate-50/25">
                  Average Package
                </div>
                {filledColumns.map((college, idx) => {
                  if (!college) return <div key={idx} className="p-4 border-l border-slate-200 text-slate-400 flex items-center">-</div>;
                  const isWinner = idx === winningAvgPkgIdx;
                  return (
                    <div
                      key={idx}
                      className={`p-4 border-l border-slate-200 flex items-center justify-between ${
                        isWinner ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-navy-900'
                      }`}
                    >
                      <span>₹{college.avgPackage.toFixed(2)} LPA</span>
                      {isWinner && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold flex items-center gap-0.5 shadow-sm">
                          <Trophy className="w-2.5 h-2.5 fill-current" />
                          Top Average
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row 5: Highest Package (Highest Wins) */}
              <div className="grid grid-cols-[240px_1fr_1fr_1fr] hover:bg-slate-50/30 transition-colors text-xs font-semibold">
                <div className="p-4 px-6 font-bold text-slate-500 uppercase tracking-wider flex items-center bg-slate-50/25">
                  Highest Package
                </div>
                {filledColumns.map((college, idx) => {
                  if (!college) return <div key={idx} className="p-4 border-l border-slate-200 text-slate-400 flex items-center">-</div>;
                  const isWinner = idx === winningHiPkgIdx;
                  return (
                    <div
                      key={idx}
                      className={`p-4 border-l border-slate-200 flex items-center justify-between ${
                        isWinner ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-navy-900'
                      }`}
                    >
                      <span>₹{college.highestPackage.toFixed(2)} LPA</span>
                      {isWinner && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold flex items-center gap-0.5 shadow-sm">
                          <TrendingUp className="w-2.5 h-2.5" />
                          Max Package
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row 6: Top Recruiters */}
              <div className="grid grid-cols-[240px_1fr_1fr_1fr] hover:bg-slate-50/30 transition-colors text-xs font-medium">
                <div className="p-4 px-6 font-bold text-slate-500 uppercase tracking-wider flex items-center bg-slate-50/25">
                  Top Recruiters
                </div>
                {filledColumns.map((college, idx) => {
                  if (!college) return <div key={idx} className="p-4 border-l border-slate-200 text-slate-400 flex items-center">-</div>;
                  return (
                    <div key={idx} className="p-4 border-l border-slate-200 flex flex-wrap gap-1.5 items-center">
                      {college.topRecruiters.slice(0, 3).map((recruiter, rIdx) => (
                        <span
                          key={rIdx}
                          className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight"
                        >
                          {recruiter}
                        </span>
                      ))}
                      {college.topRecruiters.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          +{college.topRecruiters.length - 3} more
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
