import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus, Check, X, ShieldAlert, CloudUpload, ArrowRight, ArrowLeft } from 'lucide-react';

interface CourseForm {
  name: string;
  duration: number;
  fees: number;
}

interface PlacementForm {
  year: number;
  avgPackage: number;
  highestPackage: number;
}

interface CutoffForm {
  exam: string;
  category: string;
  branch: string;
  round: number;
  cutoffRank: number;
}

interface AdminReview {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  college: {
    name: string;
  };
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('admin_auth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tab State: 'wizard' or 'moderation'
  const [activeTab, setActiveTab] = useState<'wizard' | 'moderation'>('wizard');

  // Authorization Header
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer admin-token',
  });

  // --- LOGIN HANDLER ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  // --- VIEW 1: INGESTION WIZARD STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  
  // Basic Info Form State
  const [collegeName, setCollegeName] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('4.5');
  const [intake, setIntake] = useState('1000');
  const [fees, setFees] = useState('150000');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [topRecruitersInput, setTopRecruitersInput] = useState('');
  
  // Drag and Drop mockup state
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [coverUploaded, setCoverUploaded] = useState(false);

  // Step 2: Courses State
  const [courses, setCourses] = useState<CourseForm[]>([
    { name: 'Computer Science and Engineering', duration: 4, fees: 150000 },
  ]);

  // Step 3: Placements State
  const [placements, setPlacements] = useState<PlacementForm[]>([
    { year: 2024, avgPackage: 15.0, highestPackage: 30.0 },
  ]);

  // Step 4: Cutoffs State
  const [cutoffs, setCutoffs] = useState<CutoffForm[]>([
    { exam: 'JEE Main', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 1500 },
  ]);

  const [wizardSuccess, setWizardSuccess] = useState(false);
  const [wizardSubmitting, setWizardSubmitting] = useState(false);

  // Wizard Helpers
  const handleAddCourse = () => {
    setCourses([...courses, { name: '', duration: 4, fees: 150000 }]);
  };

  const handleRemoveCourse = (idx: number) => {
    setCourses(courses.filter((_, i) => i !== idx));
  };

  const handleCourseChange = (idx: number, field: keyof CourseForm, value: string | number) => {
    const updated = [...courses];
    updated[idx] = {
      ...updated[idx],
      [field]: field === 'name' ? String(value) : Number(value),
    };
    setCourses(updated);
  };

  const handleAddPlacement = () => {
    setPlacements([...placements, { year: 2024, avgPackage: 12.0, highestPackage: 25.0 }]);
  };

  const handleRemovePlacement = (idx: number) => {
    setPlacements(placements.filter((_, i) => i !== idx));
  };

  const handlePlacementChange = (idx: number, field: keyof PlacementForm, value: string | number) => {
    const updated = [...placements];
    updated[idx] = {
      ...updated[idx],
      [field]: Number(value),
    };
    setPlacements(updated);
  };

  const handleAddCutoff = () => {
    setCutoffs([...cutoffs, { exam: 'JEE Main', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 2000 }]);
  };

  const handleRemoveCutoff = (idx: number) => {
    setCutoffs(cutoffs.filter((_, i) => i !== idx));
  };

  const handleCutoffChange = (idx: number, field: keyof CutoffForm, value: string | number) => {
    const updated = [...cutoffs];
    updated[idx] = {
      ...updated[idx],
      [field]: field === 'exam' || field === 'category' || field === 'branch' ? String(value) : Number(value),
    };
    setCutoffs(updated);
  };

  const handleWizardSubmit = async () => {
    if (!collegeName || !slug || !location || !description || !fees || !intake) {
      alert('Please fill out all basic info fields in Step 1.');
      setCurrentStep(1);
      return;
    }

    setWizardSubmitting(true);
    setWizardSuccess(false);

    // Process recruiters from tags comma-separated input
    const topRecruiters = topRecruitersInput
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const payload = {
      name: collegeName,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
      rating: Number(rating),
      location,
      description,
      fees: Number(fees),
      intake: Number(intake),
      avgPackage: placements.length > 0 ? placements[0].avgPackage : 0,
      highestPackage: placements.length > 0 ? placements[0].highestPackage : 0,
      topRecruiters: topRecruiters.length > 0 ? topRecruiters : ['Google', 'Microsoft', 'Qualcomm'],
      courses,
      placements,
      cutoffs,
    };

    try {
      const response = await fetch('http://localhost:5001/api/admin/colleges', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Transaction failed. Make sure the slug is unique.');
      }

      setWizardSuccess(true);
      // Reset form
      setCollegeName('');
      setSlug('');
      setLocation('');
      setDescription('');
      setLogoUrl('');
      setCoverUrl('');
      setTopRecruitersInput('');
      setLogoUploaded(false);
      setCoverUploaded(false);
      setCourses([{ name: 'Computer Science and Engineering', duration: 4, fees: 150000 }]);
      setPlacements([{ year: 2024, avgPackage: 15.0, highestPackage: 30.0 }]);
      setCutoffs([{ exam: 'JEE Main', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 1500 }]);
      setCurrentStep(1);
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving college.');
    } finally {
      setWizardSubmitting(false);
    }
  };

  // Mock file drop handler
  const triggerLogoUploadMock = () => {
    setLogoUploaded(true);
    setLogoUrl('https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80');
  };

  const triggerCoverUploadMock = () => {
    setCoverUploaded(true);
    setCoverUrl('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80');
  };

  // --- VIEW 2: MODERATION QUEUE STATE ---
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchPendingReviews = async () => {
    if (!isAuthenticated) return;
    setReviewsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/reviews?status=PENDING', {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews queue', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'moderation' && isAuthenticated) {
      fetchPendingReviews();
    }
  }, [activeTab, isAuthenticated]);

  const handleModerateReview = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Remove from local display list
        setReviews(reviews.filter((r) => r.id !== id));
      } else {
        alert('Failed to update review status.');
      }
    } catch (err) {
      alert('Error updating review status.');
    }
  };

  // --- RENDER UNAUTHENTICATED SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md max-w-sm w-full space-y-6 text-center">
          <div className="w-12 h-12 bg-navy-50 text-navy-900 rounded-full flex items-center justify-center mx-auto border border-navy-100">
            <ShieldAlert className="w-6 h-6 text-navy-800" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-navy-900 tracking-tight">Admin Authentication</h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter password to access administrative and review moderation systems.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password (use 'admin')"
              className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 text-center font-medium"
            />
            {authError && (
              <p className="text-xs font-bold text-red-600">Incorrect password. Please try again.</p>
            )}
            <button
              type="submit"
              className="w-full bg-navy-900 hover:bg-navy-800 text-white py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm transition-all"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER AUTHENTICATED PANEL ---
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Admin Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Admin Console Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage institutional ingestion pipelines and verify student reviews.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-auto text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'wizard' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Add College Ingestion Wizard
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'moderation' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Verify Pending Reviews
        </button>
      </div>

      {/* --- INGESTION WIZARD --- */}
      {activeTab === 'wizard' && (
        <div className="space-y-8">
          {wizardSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-sm font-semibold text-center">
              College and all nested dependencies saved and published successfully!
            </div>
          )}

          {/* Horizontal Step Indicators */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((step) => {
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              return (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isActive
                          ? 'bg-navy-900 text-white'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-navy-900' : 'text-slate-400'
                      }`}
                    >
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Courses'}
                      {step === 3 && 'Placements'}
                      {step === 4 && 'Cutoffs'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div
                      className={`h-0.5 flex-grow mx-4 rounded ${
                        currentStep > step ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Wizard Steps Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-scale-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">College Name</label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => {
                        setCollegeName(e.target.value);
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      placeholder="e.g. Indian Institute of Technology Indore"
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. iit-indore"
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Location</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Indore, Madhya Pradesh"
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Student Intake</label>
                    <input
                      type="number"
                      required
                      value={intake}
                      onChange={(e) => setIntake(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Max Fees (Annual)</label>
                    <input
                      type="number"
                      required
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Overall Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      required
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Top Recruiters (Comma Separated)</label>
                    <input
                      type="text"
                      value={topRecruitersInput}
                      onChange={(e) => setTopRecruitersInput(e.target.value)}
                      placeholder="Google, Amazon, Microsoft..."
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Overview / Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide overview of the university, department research profiles, etc..."
                    rows={4}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                  />
                </div>

                {/* Drag and Drop Zone Mockup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Logo Upload</label>
                    <div
                      onClick={triggerLogoUploadMock}
                      className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                        logoUploaded
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <CloudUpload className={`w-8 h-8 mx-auto ${logoUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-bold text-navy-900 mt-2">
                        {logoUploaded ? 'Logo Uploaded Mock Successfully!' : 'Click to Upload College Logo'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Mock drag-and-drop target</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Cover Banner Upload</label>
                    <div
                      onClick={triggerCoverUploadMock}
                      className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                        coverUploaded
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <CloudUpload className={`w-8 h-8 mx-auto ${coverUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-bold text-navy-900 mt-2">
                        {coverUploaded ? 'Cover Banner Uploaded Mock!' : 'Click to Upload Cover Image'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Mock drag-and-drop target</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Courses */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-scale-up">
                <h3 className="text-sm font-bold text-navy-900">Add Courses Offered</h3>
                
                {courses.map((course, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-150 relative space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Course Slot #{idx + 1}</span>
                      {courses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Course Name</label>
                        <input
                          type="text"
                          required
                          value={course.name}
                          onChange={(e) => handleCourseChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Computer Science and Engineering"
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-900 focus:border-navy-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Duration (Years)</label>
                        <input
                          type="number"
                          required
                          value={course.duration}
                          onChange={(e) => handleCourseChange(idx, 'duration', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-900 focus:border-navy-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Annual Fees (INR)</label>
                        <input
                          type="number"
                          required
                          value={course.fees}
                          onChange={(e) => handleCourseChange(idx, 'fees', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-navy-900 focus:border-navy-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-navy-900 hover:border-navy-950/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  ADD ANOTHER COURSE
                </button>
              </div>
            )}

            {/* Step 3: Placements */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-scale-up">
                <h3 className="text-sm font-bold text-navy-900">Add Placement History</h3>
                
                {placements.map((placement, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Placement Record #{idx + 1}</span>
                      {placements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlacement(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Year</label>
                        <input
                          type="number"
                          required
                          value={placement.year}
                          onChange={(e) => handlePlacementChange(idx, 'year', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Avg Package (LPA)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={placement.avgPackage}
                          onChange={(e) => handlePlacementChange(idx, 'avgPackage', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Highest Package (LPA)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={placement.highestPackage}
                          onChange={(e) => handlePlacementChange(idx, 'highestPackage', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddPlacement}
                  className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-navy-900 hover:border-navy-950/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  ADD PLACEMENT YEAR
                </button>
              </div>
            )}

            {/* Step 4: Cutoffs */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-scale-up">
                <h3 className="text-sm font-bold text-navy-900">Add Historical Cutoffs</h3>
                
                {cutoffs.map((cutoff, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Cutoff Record #{idx + 1}</span>
                      {cutoffs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCutoff(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Exam</label>
                        <select
                          value={cutoff.exam}
                          onChange={(e) => handleCutoffChange(idx, 'exam', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none"
                        >
                          <option value="JEE Advanced">JEE Advanced</option>
                          <option value="JEE Main">JEE Main</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Category</label>
                        <select
                          value={cutoff.category}
                          onChange={(e) => handleCutoffChange(idx, 'category', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none"
                        >
                          <option value="OPEN">OPEN (Gen)</option>
                          <option value="OBC-NCL">OBC-NCL</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Branch Name</label>
                        <input
                          type="text"
                          required
                          value={cutoff.branch}
                          onChange={(e) => handleCutoffChange(idx, 'branch', e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Round</label>
                        <input
                          type="number"
                          required
                          value={cutoff.round}
                          onChange={(e) => handleCutoffChange(idx, 'round', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Closing Rank</label>
                        <input
                          type="number"
                          required
                          value={cutoff.cutoffRank}
                          onChange={(e) => handleCutoffChange(idx, 'cutoffRank', e.target.value)}
                          className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCutoff}
                  className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-navy-900 hover:border-navy-950/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  ADD CUTOFF RECORD
                </button>
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className={`flex items-center gap-1 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-navy-900 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentStep === 1 ? 'invisible' : 'visible'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                BACK
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-1 bg-navy-900 hover:bg-navy-800 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  NEXT
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWizardSubmit}
                  disabled={wizardSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                >
                  {wizardSubmitting ? 'Publishing In Transaction...' : 'SAVE & PUBLISH COLLEGE'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODERATION QUEUE --- */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-navy-900">Pending Review Moderation Queue</h2>
            <button
              onClick={fetchPendingReviews}
              className="text-xs text-navy-900 hover:text-navy-700 font-bold border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all"
            >
              Refresh Queue
            </button>
          </div>

          {reviewsLoading ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-900 mx-auto"></div>
              <p className="mt-3 text-xs text-slate-400 font-medium">Fetching pending queue...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <span className="text-3xl">🎉</span>
              <h3 className="mt-4 text-sm font-bold text-navy-900 font-serif">Moderation Queue is Clear</h3>
              <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto">
                Excellent! All submitted student reviews have been verified and processed.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">College</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Comment Snippet</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 pl-6 font-bold text-navy-900">{review.reviewerName}</td>
                        <td className="p-4 text-slate-500 font-medium">{review.college.name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-navy-900 font-bold">
                            <span>{review.rating.toFixed(1)}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-xs text-slate-500 truncate italic">
                            "{review.comment}"
                          </p>
                        </td>
                        <td className="p-4">
                          {review.isVerified ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">
                              Student Verified
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">
                              Standard Review
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleModerateReview(review.id, 'APPROVED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerateReview(review.id, 'REJECTED')}
                              className="border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold transition-all"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
