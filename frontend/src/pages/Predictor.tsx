import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, GraduationCap, ChevronRight, Calculator } from 'lucide-react';

interface CollegeSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  location: string;
  rating: number;
  fees: number;
  avgPackage: number;
}

interface CutoffMatch {
  id: string;
  examId: string;
  criteria: Record<string, string | number>;
  cutoffValue: number;
  college: CollegeSummary;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

interface Exam {
  id: string;
  name: string;
  scoringType: 'RANK' | 'SCORE';
  formSchema: FormField[];
}

export default function Predictor() {
  const navigate = useNavigate();
  
  // App State
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  
  // Form State
  const [criteria, setCriteria] = useState<Record<string, string>>({});
  const [rankValue, setRankValue] = useState<string>('');
  
  // API Response States
  const [matches, setMatches] = useState<CutoffMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/exams');
        if (response.ok) {
          const data = await response.json();
          setExams(data);
          if (data.length > 0) {
            setSelectedExamId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
      }
    };
    fetchExams();
  }, []);

  // When selected exam changes, reset criteria to default values based on schema
  useEffect(() => {
    const currentExam = exams.find(e => e.id === selectedExamId);
    if (currentExam) {
      const initialCriteria: Record<string, string> = {};
      currentExam.formSchema.forEach(field => {
        if (field.type === 'select' && field.options && field.options.length > 0) {
          initialCriteria[field.name] = field.options[0];
        } else if (field.type === 'text') {
          initialCriteria[field.name] = '';
        } else if (field.type === 'number') {
          initialCriteria[field.name] = '1';
        }
      });
      setCriteria(initialCriteria);
      setSearched(false);
      setMatches([]);
    }
  }, [selectedExamId, exams]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rankValue || Number(rankValue) <= 0) {
      alert('Please enter a valid rank or score');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // In the real system, you might not want to send empty text fields as exact matches, 
      // but for this MVP, we pass the criteria as configured by the user.
      // We will filter out empty strings so we don't accidentally do exact matching on "" if the user left it blank.
      const filteredCriteria = Object.fromEntries(
        Object.entries(criteria).filter(([_, value]) => value !== '')
      );

      const response = await fetch('http://localhost:5001/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: selectedExamId,
          criteria: filteredCriteria,
          rank: Number(rankValue),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve predictions');
      }

      const data = await response.json();
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while predicting.');
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaChange = (name: string, value: string) => {
    setCriteria(prev => ({ ...prev, [name]: value }));
  };

  const currentExam = exams.find(e => e.id === selectedExamId);
  const isScore = currentExam?.scoringType === 'SCORE';

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 font-serif">
          Admission Predictor
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
          Enter your entrance exam details to discover recommended Tier-1 colleges based on historical cutoffs.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Exam Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Entrance Exam
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 cursor-pointer font-medium"
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* Rank / Score Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Your {isScore ? 'Score / Marks' : 'Rank'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calculator className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  value={rankValue}
                  onChange={(e) => setRankValue(e.target.value)}
                  placeholder={`e.g. ${isScore ? '330' : '500'}`}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 font-medium"
                />
              </div>
            </div>

            {/* Dynamic Fields based on formSchema */}
            {currentExam?.formSchema.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {field.label}
                </label>
                {field.type === 'select' && field.options ? (
                  <select
                    value={criteria[field.name] || ''}
                    onChange={(e) => handleCriteriaChange(field.name, e.target.value)}
                    className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 cursor-pointer font-medium"
                  >
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={criteria[field.name] || ''}
                    onChange={(e) => handleCriteriaChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                    className="block w-full px-3 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 font-medium"
                  />
                )}
              </div>
            ))}
            
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-navy-900 hover:bg-navy-800 text-white px-12 py-3.5 rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm transition-all"
            >
              {loading ? 'Analyzing Trends...' : 'Find Matching Colleges'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Area */}
      {searched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-navy-900">Recommended Matches</h2>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
              {loading ? 'Loading...' : `${matches.length} Options Found`}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-900 mx-auto"></div>
              <p className="mt-3 text-xs text-slate-400 font-medium">Processing historical cutoff databases...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center text-red-700 text-sm font-semibold">
              {error}
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <span className="text-3xl">🗳️</span>
              <h3 className="mt-4 text-sm font-bold text-navy-900">No Admission Matches Found</h3>
              <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your {isScore ? 'score' : 'rank'} exceeds the closing cutoffs for the seeded {currentExam?.name} data. Try adjusting the parameters to test another option.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => navigate(`/colleges/${match.college.slug}`)}
                  className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between hover:border-navy-500/50 hover:shadow-sm cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                      <img
                        src={match.college.logoUrl}
                        alt={match.college.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 group-hover:text-navy-700 transition-colors leading-tight">
                        {match.college.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-xs mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {match.college.location}
                        </span>
                        
                        {/* Dynamically render criteria keys */}
                        {Object.entries(match.criteria).map(([k, v]) => (
                          <React.Fragment key={k}>
                            <span className="text-slate-200">•</span>
                            <span className="flex items-center gap-1 text-navy-900 font-bold bg-navy-50 px-2 py-0.5 rounded text-[10px] uppercase">
                              {k === 'branch' && <GraduationCap className="w-3 h-3 text-navy-700" />}
                              {String(v)}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex flex-col items-end justify-center gap-1 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Historical Cutoff
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-navy-900 bg-slate-100 px-3 py-1 rounded">
                        {match.criteria.openingRank ? `${match.criteria.openingRank} - ${match.cutoffValue}` : match.cutoffValue} {isScore ? 'Marks' : 'Rank'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-navy-900 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
