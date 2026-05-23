import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  User,
  ShieldCheck,
} from 'lucide-react';

interface Course {
  id: number;
  name: string;
  fees: number;
  duration: number;
}

interface Placement {
  id: number;
  year: number;
  avgPackage: number;
  highestPackage: number;
}

interface Review {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
}

interface CollegeDetails {
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
  courses: Course[];
  placements: Placement[];
  reviews: Review[];
}

// Representative metadata per college to display on Overview tab
const collegeMetadataMap: Record<string, { established: number; size: string; type: string; highlights: string[] }> = {
  'iit-bombay': {
    established: 1958,
    size: '550 Acres',
    type: 'Public / Institute of National Importance',
    highlights: ['100% Placement in Core & Tech', 'Renowned Entrepreneurship Cell (E-Cell)', 'Top Rankers Choice in JEE Advanced', 'State-of-the-art Nanoelectronics Labs', 'Vibrant Powai Lakefront Campus'],
  },
  'iit-delhi': {
    established: 1961,
    size: '320 Acres',
    type: 'Public / Institute of Eminence',
    highlights: ['Strategic location in Hauz Khas startup hub', 'Excellent industry-sponsored research projects', 'High global alumni employability ranking', 'Cutting-edge AI research centers', 'Distinguished placement track record'],
  },
  'iit-madras': {
    established: 1959,
    size: '617 Acres',
    type: 'Public / NIRF #1 Engineering College',
    highlights: ['India\'s first and largest university Research Park', 'Lush green forest campus with diverse flora & fauna', 'Pioneering technical clubs and labs', 'Outstanding research citations globally', 'Robust international collaboration programs'],
  },
  'nit-trichy': {
    established: 1964,
    size: '800 Acres',
    type: 'Public / NIRF #1 NIT',
    highlights: ['Sprawling campus in central Tamil Nadu', 'Pragyan - India\'s largest student-run ISO tech fest', 'Stellar placement rates mirroring top IITs', 'Active research culture in solar energy', 'Strong core engineering laboratories'],
  },
  'nit-surathkal': {
    established: 1960,
    size: '295 Acres',
    type: 'Public / Beach Campus',
    highlights: ['Unique private beach access for students', 'Excellent IT & Coding culture', 'Outstanding placements in multinational tech firms', 'State-of-the-art central library resources', 'Rich sports and recreational activities'],
  },
  'nit-rourkela': {
    established: 1961,
    size: '647 Acres',
    type: 'Public / Second Largest NIT',
    highlights: ['Largest campus footprint in eastern India', 'Superior research infrastructure and labs', 'Highly active student clubs and societies', 'Consistent placements in steel, analytics & software', 'Multicultural student demographic'],
  },
};

export default function CollegeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [college, setCollege] = useState<CollegeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'reviews'>('overview');

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isVerifiedStudent, setIsVerifiedStudent] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch college details
  useEffect(() => {
    const fetchCollegeDetails = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5001/api/colleges/${slug}`);
        if (!response.ok) {
          throw new Error('College not found');
        }
        const data = await response.json();
        setCollege(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [slug]);

  // Handle Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const response = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerName,
          rating,
          comment,
          collegeId: college.id,
          isVerified: isVerifiedStudent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setSubmitSuccess(true);
      setReviewerName('');
      setRating(5);
      setComment('');
      setIsVerifiedStudent(false);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowReviewForm(false);
        setSubmitSuccess(false);
      }, 3500);
    } catch (err) {
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-navy-900 mx-auto"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading college profiles...</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-16 text-center max-w-lg mx-auto mt-12">
        <span className="text-4xl">🎓</span>
        <h3 className="mt-4 text-lg font-bold text-navy-900">College Profile Not Found</h3>
        <p className="mt-2 text-sm text-slate-500">
          The college profile you requested does not exist or may have been removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all"
        >
          Return to Discovery
        </Link>
      </div>
    );
  }

  const meta = collegeMetadataMap[college.slug] || {
    established: 1960,
    size: '300 Acres',
    type: 'Public / Institute of Importance',
    highlights: ['Strong placement history', 'High-quality faculty', 'Rich library facilities', 'Modern research labs'],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner Section */}
      <section className="relative rounded-2xl overflow-hidden h-[360px] shadow-md border border-slate-200">
        <img
          src={college.coverUrl}
          alt={college.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{college.location}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {college.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-lg shadow-sm">
                <span className="font-bold text-sm md:text-base">{college.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-slate-200 text-xs md:text-sm font-medium">
                Based on {college.reviews.length} Verified Student Reviews
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm sticky top-16 z-30">
        <div className="flex space-x-8 px-8 overflow-x-auto no-scrollbar">
          {(['overview', 'courses', 'placements', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-navy-900 text-navy-900'
                  : 'border-transparent text-slate-400 hover:text-navy-900'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'courses' && 'Courses & Fees'}
              {tab === 'placements' && 'Placements'}
              {tab === 'reviews' && `Reviews (${college.reviews.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="mt-8">
        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-navy-900">About {college.name}</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {college.description}
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Established
                  </span>
                  <span className="text-lg font-extrabold text-navy-900">{meta.established}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Campus Size
                  </span>
                  <span className="text-lg font-extrabold text-navy-900">{meta.size}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Student Intake
                  </span>
                  <span className="text-lg font-extrabold text-navy-900">{college.intake} Students</span>
                </div>
              </div>
            </div>

            {/* Highlights Sidebar */}
            <aside className="lg:col-span-4">
              <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-950 shadow-sm space-y-4">
                <h3 className="text-base font-bold tracking-wide uppercase text-slate-300">
                  Key Highlights
                </h3>
                <ul className="space-y-4">
                  {meta.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200 leading-relaxed font-medium">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}

        {/* 2. Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-base font-bold text-navy-900">Academic Programs</h2>
              <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                {college.courses.length} Courses Available
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 pl-8">Course Name</th>
                    <th className="p-4">Degree</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4 text-right pr-8">Annual Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {college.courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-8 font-bold text-navy-900">{course.name}</td>
                      <td className="p-4 text-slate-500 font-semibold">B.Tech</td>
                      <td className="p-4 text-slate-500 flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{course.duration} Years</span>
                      </td>
                      <td className="p-4 text-right pr-8 font-extrabold text-navy-900">
                        ₹{(course.fees / 100000).toFixed(2)} Lakhs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Placements Tab */}
        {activeTab === 'placements' && (
          <div className="space-y-8 animate-fade-in">
            {/* Package Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Average Placement Package
                </span>
                <h3 className="text-3xl font-extrabold text-navy-900">
                  ₹{college.avgPackage.toFixed(2)} LPA
                </h3>
                {college.placements.length > 1 && (
                  <span className="text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Placement growth positive this year
                  </span>
                )}
              </div>
              <div className="bg-navy-900 text-white p-8 rounded-xl shadow-md flex flex-col justify-center text-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 block">
                  Highest Domestic Package
                </span>
                <h3 className="text-3xl font-extrabold text-white">
                  ₹{college.highestPackage.toFixed(2)} LPA
                </h3>
                <span className="text-xs font-semibold text-emerald-400 mt-2">
                  Top engineering placement offer
                </span>
              </div>
            </div>

            {/* Recruiters */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-navy-900">Top Hiring Partners</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {college.topRecruiters.map((recruiter, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-navy-500/20 hover:shadow-sm h-14 rounded-lg flex items-center justify-center font-extrabold text-slate-400 text-xs tracking-wider transition-all duration-200 uppercase"
                  >
                    {recruiter}
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Placements Table */}
            {college.placements.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-navy-900">Placement Trend Over Years</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4 pl-8">Year</th>
                      <th className="p-4 text-right">Average Package</th>
                      <th className="p-4 text-right pr-8">Highest Package</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {college.placements.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 pl-8 font-bold text-navy-900">{p.year}</td>
                        <td className="p-4 text-right text-slate-600 font-medium">₹{p.avgPackage.toFixed(2)} LPA</td>
                        <td className="p-4 text-right pr-8 font-extrabold text-navy-900">₹{p.highestPackage.toFixed(2)} LPA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Sidebar Review Stats */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-navy-900 mb-4">Quality Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Academic Rigour', score: 4.8, percentage: '96%' },
                    { label: 'Infrastructure', score: 4.6, percentage: '92%' },
                    { label: 'Placements Support', score: 4.9, percentage: '98%' },
                    { label: 'Campus Environment', score: 4.5, percentage: '90%' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{item.label}</span>
                        <span className="text-navy-900 font-bold">{item.score}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy-900 rounded-full"
                          style={{ width: item.percentage }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start review box */}
              <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-950 shadow-sm text-center">
                <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Write a Review
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Help the future batches select the right choice. Share your experience.
                </p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mt-5 w-full bg-white hover:bg-slate-50 text-navy-900 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Start Review
                </button>
              </div>
            </aside>

            {/* Main Reviews Listing */}
            <div className="lg:col-span-8 space-y-6">
              {/* Submission Form Modal/Panel */}
              {showReviewForm && (
                <div className="bg-white border border-navy-500/30 rounded-xl p-6 shadow-md space-y-4 relative animate-scale-up">
                  <h3 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-3">
                    Submit Student Review
                  </h3>
                  
                  {submitSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-sm font-medium text-center">
                      Thank you! Your review has been submitted for moderation. It will be visible on this page after admin approval.
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder="e.g. Priyesh Shah"
                            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Overall Rating
                          </label>
                          <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 cursor-pointer"
                          >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Review Comments
                        </label>
                        <textarea
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tell us about the academics, campus life, infrastructure, and placement support..."
                          rows={4}
                          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isVerified"
                          checked={isVerifiedStudent}
                          onChange={(e) => setIsVerifiedStudent(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="isVerified" className="text-xs text-slate-500 font-semibold cursor-pointer">
                          I am an active student / alumnus (Apply Verified Badge)
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                        >
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-navy-900">Student Experiences</h3>

                {college.reviews.length === 0 ? (
                  <div className="bg-slate-50 p-12 text-center rounded-xl border border-slate-100">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No approved reviews yet.</p>
                  </div>
                ) : (
                  college.reviews.map((review) => (
                    <article
                      key={review.id}
                      className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm font-bold text-navy-900">
                                {review.reviewerName}
                              </span>
                              {review.isVerified && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                                  Verified Student
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                              Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-navy-900 font-bold">
                          <span className="text-xs">{review.rating.toFixed(1)}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {review.comment}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
