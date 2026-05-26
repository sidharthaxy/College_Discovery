import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Trash2, ShieldCheck, MapPin, Eye, EyeOff, Edit2, Check, X, Star } from 'lucide-react';

interface SavedCollege {
  id: string;
  college: {
    id: string;
    name: string;
    slug: string;
    location: string;
    rating: number;
    logoUrl: string | null;
    institutionType: string;
  };
}

interface SavedComparison {
  id: string;
  name: string;
  collegeIds: string[];
  createdAt: string;
}

interface ProfileData {
  savedColleges: SavedCollege[];
  savedComparisons: SavedComparison[];
}

interface MyReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  college: {
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

export default function Profile() {
  const { user, token, openAuthModal, updateUser } = useAuth();
  const { overrideCompareList } = useCompare();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'colleges' | 'comparisons' | 'reviews' | 'settings'>('colleges');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Name State
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setPasswordNew] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success'|'error', msg: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      openAuthModal();
      return;
    }

    const fetchProfile = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          fetch(`${API_URL}/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/profile/reviews`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileData(data);
        }
        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          setMyReviews(rData);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, token, navigate, openAuthModal]);

  const removeCollege = async (collegeId: string) => {
    try {
      const res = await fetch(`${API_URL}/profile/save-college`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ collegeId })
      });
      if (res.ok) {
        setProfileData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            savedColleges: prev.savedColleges.filter(sc => sc.college.id !== collegeId)
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeComparison = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/profile/comparison/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setProfileData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            savedComparisons: prev.savedComparisons.filter(sc => sc.id !== id)
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadComparison = async (collegeIds: string[]) => {
    // In a real app we'd fetch the full college objects.
    // For now, since Compare context needs college objects, we can redirect to /compare
    // and let Compare context fetch them by ID, or we fetch them here.
    try {
      const qs = collegeIds.map(id => `ids=${id}`).join('&');
      const res = await fetch(`${API_URL}/colleges/batch?${qs}`);
      if (res.ok) {
        const colleges = await res.json();
        overrideCompareList(colleges);
        navigate('/compare');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`${API_URL}/profile/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMyReviews(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Failed to delete review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || !user) return;
    try {
      const res = await fetch(`${API_URL}/profile/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        const data = await res.json();
        updateUser({ ...user, name: data.name });
        setEditingName(false);
      } else {
        alert('Failed to update name');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    try {
      const res = await fetch(`${API_URL}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
        setOldPassword('');
        setPasswordNew('');
      } else {
        setPasswordStatus({ type: 'error', msg: data.error || 'Failed to update password' });
      }
    } catch (err) {
      console.error(err);
      setPasswordStatus({ type: 'error', msg: 'Server error while updating password' });
    }
  };

  if (loading) {
    return <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-900 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex items-center justify-between">
        <div>
          {editingName ? (
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-lg font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
                autoFocus
              />
              <button onClick={handleUpdateName} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => { setEditingName(false); setNewName(user?.name || ''); }} className="p-1.5 bg-slate-50 text-slate-500 rounded-md hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Welcome, {user?.name}</h1>
              <button onClick={() => setEditingName(true)} className="text-slate-300 hover:text-navy-600 opacity-0 group-hover:opacity-100 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-slate-500 font-medium mt-1">{user?.email}</p>
        </div>
        {user?.isVerifiedStudent && (
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Verified Student
          </div>
        )}
      </div>

      <div className="flex border-b border-slate-200 space-x-8 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('colleges')}
          className={`py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'colleges' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Saved Colleges ({profileData?.savedColleges.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('comparisons')}
          className={`py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'comparisons' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Saved Comparisons ({profileData?.savedComparisons.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'reviews' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          My Reviews ({myReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'settings' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-400 hover:text-navy-900'
          }`}
        >
          Account Settings
        </button>
      </div>

      {activeTab === 'colleges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileData?.savedColleges.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <Bookmark className="w-8 h-8 mx-auto text-slate-300 mb-3" />
              <p>You haven't saved any colleges yet.</p>
            </div>
          ) : (
            profileData?.savedColleges.map((saved) => (
              <div key={saved.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col relative group">
                <button 
                  onClick={() => removeCollege(saved.college.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-sm text-navy-900 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/colleges/${saved.college.slug}`} className="flex-1 p-5">
                  <div className="flex items-start gap-4">
                    <img src={saved.college.logoUrl || ''} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                    <div>
                      <h3 className="font-bold text-navy-900 leading-tight">{saved.college.name}</h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1.5 font-medium gap-1">
                        <MapPin className="w-3 h-3" /> {saved.college.location}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'comparisons' && (
        <div className="space-y-4">
          {profileData?.savedComparisons.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <p>You haven't saved any comparisons yet.</p>
            </div>
          ) : (
            profileData?.savedComparisons.map((comp) => (
              <div key={comp.id} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between hover:border-navy-200 transition-colors">
                <div>
                  <h3 className="font-bold text-navy-900">{comp.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{comp.collegeIds.length} Colleges Compared • Saved on {new Date(comp.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => loadComparison(comp.collegeIds)} className="text-sm font-bold text-navy-900 bg-navy-50 hover:bg-navy-100 px-4 py-2 rounded-lg transition-colors">
                    View
                  </button>
                  <button onClick={() => removeComparison(comp.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {myReviews.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <p>You haven't posted any reviews yet.</p>
            </div>
          ) : (
            myReviews.map((review) => (
              <div key={review.id} className="bg-white p-5 rounded-xl border border-slate-200 flex items-start justify-between hover:border-navy-200 transition-colors">
                <div className="flex gap-4 items-start">
                  {review.college.logoUrl && (
                    <img src={review.college.logoUrl} alt="" className="w-10 h-10 rounded-md object-cover border border-slate-100" />
                  )}
                  <div>
                    <h3 className="font-bold text-navy-900"><Link to={`/colleges/${review.college.slug}`} className="hover:underline">{review.college.name}</Link></h3>
                    <div className="flex items-center gap-1 mt-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                      <span className="text-xs text-slate-500 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{review.comment}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteReview(review.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2" title="Delete Review">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-xl">
          <h2 className="text-xl font-bold text-navy-900 mb-6 tracking-tight">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500"
                  value={newPassword}
                  onChange={(e) => setPasswordNew(e.target.value)}
                  required
                  minLength={6}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {passwordStatus && (
              <div className={`p-3 rounded-lg text-sm font-bold ${passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {passwordStatus.msg}
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-navy-900 text-white rounded-lg font-bold hover:bg-navy-800 transition-colors">
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
