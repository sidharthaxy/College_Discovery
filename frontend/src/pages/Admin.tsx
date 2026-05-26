import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus, Check, ShieldAlert, CloudUpload, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

// Cutoff Form is now dynamic
interface CutoffForm {
  examId: string;
  criteria: Record<string, string | number>;
  cutoffValue: number;
}

interface AdminReview {
  id: number;
  user?: {
    name: string;
  };
  rating: number;
  comment: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  college: {
    name: string;
  };
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

export default function Admin() {
  const { user, token } = useAuth();

  // Tab State: 'wizard', 'examBuilder', or 'moderation'
  const [activeTab, setActiveTab] = useState<'wizard' | 'examBuilder' | 'moderation'>('wizard');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  // --- EXAMS LIST ---
  const [exams, setExams] = useState<Exam[]>([]);
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch(`${API_URL}/exams`)
        .then(res => res.json())
        .then(data => setExams(data))
        .catch(err => console.error(err));
    }
  }, [user, activeTab]);

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
  
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [coverUploaded, setCoverUploaded] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const [courses, setCourses] = useState<CourseForm[]>([
    { name: 'Computer Science and Engineering', duration: 4, fees: 150000 },
  ]);

  const [placements, setPlacements] = useState<PlacementForm[]>([
    { year: 2024, avgPackage: 15.0, highestPackage: 30.0 },
  ]);

  const [cutoffs, setCutoffs] = useState<CutoffForm[]>([]);

  const [wizardSuccess, setWizardSuccess] = useState(false);
  const [wizardSubmitting, setWizardSubmitting] = useState(false);

  const handleAddCourse = () => setCourses([...courses, { name: '', duration: 4, fees: 150000 }]);
  const handleRemoveCourse = (idx: number) => setCourses(courses.filter((_, i) => i !== idx));
  const handleCourseChange = (idx: number, field: keyof CourseForm, value: string | number) => {
    const updated = [...courses];
    updated[idx] = { ...updated[idx], [field]: field === 'name' ? String(value) : Number(value) };
    setCourses(updated);
  };

  const handleAddPlacement = () => setPlacements([...placements, { year: 2024, avgPackage: 12.0, highestPackage: 25.0 }]);
  const handleRemovePlacement = (idx: number) => setPlacements(placements.filter((_, i) => i !== idx));
  const handlePlacementChange = (idx: number, field: keyof PlacementForm, value: string | number) => {
    const updated = [...placements];
    updated[idx] = { ...updated[idx], [field]: Number(value) };
    setPlacements(updated);
  };

  const handleAddCutoff = () => {
    if (exams.length === 0) {
      alert("No exams found in database. Create an Exam Schema first.");
      return;
    }
    const defaultExam = exams[0];
    const initialCriteria: Record<string, string> = {};
    defaultExam.formSchema.forEach(f => {
      initialCriteria[f.name] = (f.type === 'select' && f.options) ? f.options[0] : '';
    });
    setCutoffs([...cutoffs, { examId: defaultExam.id, criteria: initialCriteria, cutoffValue: 1000 }]);
  };

  const handleRemoveCutoff = (idx: number) => setCutoffs(cutoffs.filter((_, i) => i !== idx));

  const handleCutoffExamChange = (idx: number, newExamId: string) => {
    const exam = exams.find(e => e.id === newExamId);
    if (!exam) return;
    const initialCriteria: Record<string, string> = {};
    exam.formSchema.forEach(f => {
      initialCriteria[f.name] = (f.type === 'select' && f.options) ? f.options[0] : '';
    });
    const updated = [...cutoffs];
    updated[idx] = { examId: newExamId, criteria: initialCriteria, cutoffValue: updated[idx].cutoffValue };
    setCutoffs(updated);
  };

  const handleCutoffCriteriaChange = (idx: number, key: string, value: string) => {
    const updated = [...cutoffs];
    updated[idx].criteria = { ...updated[idx].criteria, [key]: value };
    setCutoffs(updated);
  };

  const handleCutoffValueChange = (idx: number, val: string) => {
    const updated = [...cutoffs];
    updated[idx].cutoffValue = Number(val);
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

    const topRecruiters = topRecruitersInput.split(',').map(r => r.trim()).filter(r => r.length > 0);

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
      const response = await fetch(`${API_URL}/admin/colleges`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Transaction failed. Make sure the slug is unique.');
      setWizardSuccess(true);
      setCollegeName('');
      setSlug('');
      setLocation('');
      setDescription('');
      setTopRecruitersInput('');
      setCutoffs([]);
      setCurrentStep(1);
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving college.');
    } finally {
      setWizardSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary credentials are not configured in .env");
      return;
    }

    if (type === 'logo') setLogoUploading(true);
    else setCoverUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || 'Upload failed');

      if (type === 'logo') {
        setLogoUrl(data.secure_url);
        setLogoUploaded(true);
      } else {
        setCoverUrl(data.secure_url);
        setCoverUploaded(true);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      if (type === 'logo') setLogoUploading(false);
      else setCoverUploading(false);
    }
  };

  // --- VIEW 2: EXAM BUILDER STATE ---
  const [examName, setExamName] = useState('');
  const [scoringType, setScoringType] = useState<'RANK' | 'SCORE'>('RANK');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [examSuccess, setExamSuccess] = useState(false);
  const [examSubmitting, setExamSubmitting] = useState(false);

  const addFormField = () => {
    setFormFields([...formFields, { name: '', label: '', type: 'text', options: [] }]);
  };
  const removeFormField = (idx: number) => {
    setFormFields(formFields.filter((_, i) => i !== idx));
  };
  const updateFormField = (idx: number, key: keyof FormField, value: any) => {
    const updated = [...formFields];
    updated[idx] = { ...updated[idx], [key]: value };
    setFormFields(updated);
  };
  
  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExamSubmitting(true);
    setExamSuccess(false);

    try {
      const response = await fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: examName, scoringType, formSchema: formFields }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create Exam Schema');
      }
      setExamSuccess(true);
      setExamName('');
      setFormFields([]);
      // fetch exams again
      const listRes = await fetch(`${API_URL}/exams`);
      setExams(await listRes.json());
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExamSubmitting(false);
    }
  };

  // --- VIEW 3: MODERATION QUEUE STATE ---
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchPendingReviews = async () => {
    if (user?.role !== 'ADMIN') return;
    setReviewsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/reviews?status=PENDING`, {
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
    if (activeTab === 'moderation' && user?.role === 'ADMIN') {
      fetchPendingReviews();
    }
  }, [activeTab, user]);

  const handleModerateReview = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
      } else {
        alert('Failed to update review status.');
      }
    } catch (err) {
      alert('Error updating review status.');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md max-w-sm w-full space-y-6 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-900 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <ShieldAlert className="w-6 h-6 text-red-800" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-navy-900 tracking-tight">Access Denied</h2>
            <p className="text-sm text-slate-500 font-medium">
              You do not have the required permissions to access the Admin Portal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Admin Console Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage institutional ingestion pipelines and verify student reviews.
          </p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'wizard' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Add College Wizard
        </button>
        <button
          onClick={() => setActiveTab('examBuilder')}
          className={`py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'examBuilder' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Add Exam Schema
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'moderation' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Verify Reviews
        </button>
      </div>

      {/* --- EXAM BUILDER --- */}
      {activeTab === 'examBuilder' && (
        <div className="space-y-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          {examSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-sm font-semibold text-center">
              Exam schema created successfully! You can now use it in the Predictor and College Wizard.
            </div>
          )}
          <form onSubmit={handleExamSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-navy-900">Dynamic Exam Schema Builder</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Exam Name</label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. MHT CET"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Scoring Mode</label>
                <select
                  value={scoringType}
                  onChange={(e) => setScoringType(e.target.value as 'RANK' | 'SCORE')}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                >
                  <option value="RANK">Rank Based (Lower is Better)</option>
                  <option value="SCORE">Marks Based (Higher is Better)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-navy-900">Schema Fields</h3>
              <p className="text-xs text-slate-500 font-medium">Add parameters that apply to this exam (e.g. Category, State, Branch, Round).</p>
              
              {formFields.map((field, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-wrap gap-4 items-start relative">
                  <button type="button" onClick={() => removeFormField(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 space-y-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Field Key (No spaces)</label>
                    <input
                      type="text"
                      required
                      value={field.name}
                      onChange={(e) => updateFormField(idx, 'name', e.target.value.replace(/\s+/g, ''))}
                      placeholder="e.g. category"
                      className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="flex-1 space-y-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Display Label</label>
                    <input
                      type="text"
                      required
                      value={field.label}
                      onChange={(e) => updateFormField(idx, 'label', e.target.value)}
                      placeholder="e.g. Seat Category"
                      className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="flex-1 space-y-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Input Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateFormField(idx, 'type', e.target.value)}
                      className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                    >
                      <option value="text">Text (e.g. Branch)</option>
                      <option value="number">Number (e.g. Round)</option>
                      <option value="select">Dropdown</option>
                    </select>
                  </div>
                  {field.type === 'select' && (
                    <div className="w-full space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Dropdown Options (Comma separated)</label>
                      <input
                        type="text"
                        required
                        value={field.options?.join(', ')}
                        onChange={(e) => updateFormField(idx, 'options', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="OPEN, OBC-NCL, SC, ST"
                        className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addFormField}
                className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-navy-900 hover:border-navy-950/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> ADD FIELD
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button type="submit" disabled={examSubmitting} className="bg-navy-900 hover:bg-navy-800 text-white px-8 py-2 rounded-lg text-xs font-bold transition-all">
                {examSubmitting ? 'Saving...' : 'SAVE SCHEMA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- INGESTION WIZARD --- */}
      {activeTab === 'wizard' && (
        <div className="space-y-8">
          {wizardSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-sm font-semibold text-center">
              College and all nested dependencies saved and published successfully!
            </div>
          )}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((step) => {
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              return (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isActive ? 'bg-navy-900 text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className={`text-xs font-bold ${isActive ? 'text-navy-900' : 'text-slate-400'}`}>
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Courses'}
                      {step === 3 && 'Placements'}
                      {step === 4 && 'Cutoffs'}
                    </span>
                  </div>
                  {step < 4 && <div className={`h-0.5 flex-grow mx-4 rounded ${currentStep > step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            {/* Steps 1-3 remain mostly unchanged, just reusing existing structure */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-scale-up">
                {/* Basic Info form rendered previously */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">College Name</label>
                    <input type="text" required value={collegeName} onChange={(e) => { setCollegeName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }} className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">URL Slug</label>
                    <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Location</label>
                    <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Student Intake</label>
                    <input type="number" required value={intake} onChange={(e) => setIntake(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Max Fees (Annual)</label>
                    <input type="number" required value={fees} onChange={(e) => setFees(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Overall Rating</label>
                    <input type="number" step="0.1" min="1" max="5" required value={rating} onChange={(e) => setRating(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Top Recruiters (CSV)</label>
                    <input type="text" value={topRecruitersInput} onChange={(e) => setTopRecruitersInput(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Overview / Description</label>
                  <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Logo Upload</label>
                    <label className={`block border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${logoUploaded ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} disabled={logoUploading} />
                      <CloudUpload className={`w-8 h-8 mx-auto ${logoUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-bold text-navy-900 mt-2">
                        {logoUploading ? 'Uploading...' : logoUploaded ? 'Logo Uploaded!' : 'Click to Upload Logo'}
                      </p>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Cover Banner Upload</label>
                    <label className={`block border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${coverUploaded ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={coverUploading} />
                      <CloudUpload className={`w-8 h-8 mx-auto ${coverUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-bold text-navy-900 mt-2">
                        {coverUploading ? 'Uploading...' : coverUploaded ? 'Cover Uploaded!' : 'Click to Upload Cover'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-scale-up">
                {courses.map((course, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Course #{idx + 1}</span>
                      <button type="button" onClick={() => handleRemoveCourse(idx)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                        <input type="text" value={course.name} onChange={(e) => handleCourseChange(idx, 'name', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Duration</label>
                        <input type="number" value={course.duration} onChange={(e) => handleCourseChange(idx, 'duration', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Fees</label>
                        <input type="number" value={course.fees} onChange={(e) => handleCourseChange(idx, 'fees', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddCourse} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-navy-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> ADD COURSE</button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-scale-up">
                {placements.map((placement, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Placement #{idx + 1}</span>
                      <button type="button" onClick={() => handleRemovePlacement(idx)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Year</label>
                        <input type="number" value={placement.year} onChange={(e) => handlePlacementChange(idx, 'year', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Avg Package</label>
                        <input type="number" step="0.1" value={placement.avgPackage} onChange={(e) => handlePlacementChange(idx, 'avgPackage', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Highest</label>
                        <input type="number" step="0.1" value={placement.highestPackage} onChange={(e) => handlePlacementChange(idx, 'highestPackage', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddPlacement} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-navy-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> ADD PLACEMENT</button>
              </div>
            )}

            {/* DYNAMIC CUTOFF FORM */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-scale-up">
                <h3 className="text-sm font-bold text-navy-900">Add Historical Cutoffs</h3>
                
                {cutoffs.map((cutoff, idx) => {
                  const exam = exams.find(e => e.id === cutoff.examId);
                  return (
                    <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-150 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Cutoff Record #{idx + 1}</span>
                        <button type="button" onClick={() => handleRemoveCutoff(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Exam Setup</label>
                          <select
                            value={cutoff.examId}
                            onChange={(e) => handleCutoffExamChange(idx, e.target.value)}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                          >
                            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            Closing {exam?.scoringType === 'SCORE' ? 'Score/Marks' : 'Rank'}
                          </label>
                          <input
                            type="number"
                            required
                            value={cutoff.cutoffValue}
                            onChange={(e) => handleCutoffValueChange(idx, e.target.value)}
                            className="block w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      {exam?.formSchema && exam.formSchema.length > 0 && (
                        <div className="bg-white p-4 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {exam.formSchema.map(field => (
                            <div key={field.name} className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">{field.label}</label>
                              {field.type === 'select' && field.options ? (
                                <select
                                  value={cutoff.criteria[field.name] || ''}
                                  onChange={(e) => handleCutoffCriteriaChange(idx, field.name, e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                                >
                                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  value={cutoff.criteria[field.name] || ''}
                                  onChange={(e) => handleCutoffCriteriaChange(idx, field.name, e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button type="button" onClick={handleAddCutoff} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-navy-900 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> ADD CUTOFF RECORD</button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className={`flex items-center gap-1 border border-slate-200 text-slate-500 px-5 py-2 rounded-lg text-xs font-bold ${currentStep === 1 ? 'invisible' : 'visible'}`}>
                <ArrowLeft className="w-3.5 h-3.5" /> BACK
              </button>

              {currentStep < 4 ? (
                <button type="button" onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-1 bg-navy-900 hover:bg-navy-800 text-white px-6 py-2 rounded-lg text-xs font-bold">
                  NEXT <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button type="button" onClick={handleWizardSubmit} disabled={wizardSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg text-xs font-bold disabled:opacity-40">
                  {wizardSubmitting ? 'Publishing...' : 'SAVE & PUBLISH'}
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
              className="text-xs text-navy-900 font-bold border border-slate-200 bg-white px-3 py-1.5 rounded-lg"
            >
              Refresh Queue
            </button>
          </div>

          {reviewsLoading ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-900 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <span className="text-3xl">🎉</span>
              <h3 className="mt-4 text-sm font-bold text-navy-900 font-serif">Queue is Clear</h3>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-navy-900 uppercase text-[10px] tracking-wider">Date</th>
                      <th className="px-6 py-4 font-bold text-navy-900 uppercase text-[10px] tracking-wider">Target College</th>
                      <th className="px-6 py-4 font-bold text-navy-900 uppercase text-[10px] tracking-wider">Reviewer</th>
                      <th className="px-6 py-4 font-bold text-navy-900 uppercase text-[10px] tracking-wider">Rating</th>
                      <th className="px-6 py-4 font-bold text-navy-900 uppercase text-[10px] tracking-wider">Comment Snippet</th>
                      <th className="px-6 py-4 font-bold text-navy-900 uppercase text-[10px] tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-xs font-bold text-navy-900">{r.college.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                            {r.user?.name || 'Anonymous'}
                            {r.isVerified && <Check className="w-3.5 h-3.5 text-emerald-500 bg-emerald-100 rounded-full p-0.5" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-amber-500 flex items-center gap-1 mt-3.5">
                          {r.rating} <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-[200px]">{r.comment}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleModerateReview(r.id, 'APPROVED')} className="px-3 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded uppercase hover:bg-emerald-100">Approve</button>
                          <button onClick={() => handleModerateReview(r.id, 'REJECTED')} className="px-3 py-1.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded uppercase hover:bg-red-100">Reject</button>
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
