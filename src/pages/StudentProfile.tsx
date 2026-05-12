// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Save, Camera, Shield, Activity, Star, BookOpen, Hash, Mail, CalendarDays, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
      <Icon size={12} />
      {label}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm";

const StudentProfile = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [studentStats, setStudentStats] = useState({ score: 0, achievements: 0, events: 0 });
  const [formData, setFormData] = useState({ full_name: '', roll_no: '', course: '', dob: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        roll_no:   userProfile.roll_no   || '',
        course:    userProfile.course    || '',
        dob:       userProfile.dob       || '',
      });
    }
    const fetchStats = async () => {
      if (!user) return;
      try {
        const [scoreRes, achRes, evtRes] = await Promise.all([
          supabase.from('student_scores').select('activeness_score').eq('user_id', user.id).maybeSingle(),
          supabase.from('achievements').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'event_attended'),
        ]);
        setStudentStats({
          score:        scoreRes.data?.activeness_score ?? 0,
          achievements: achRes.count  ?? 0,
          events:       evtRes.count  ?? 0,
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, [userProfile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({
        full_name: formData.full_name,
        roll_no:   formData.roll_no,
        course:    formData.course,
        dob:       formData.dob || null,
      }).eq('id', user.id);
      if (error) throw error;
      updateProfile({ full_name: formData.full_name, roll_no: formData.roll_no, course: formData.course, dob: formData.dob || null });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
      updateProfile({ avatar_url: publicUrl });
      setAvatarPreview(publicUrl);
      toast.success('Profile picture updated!');
    } catch (err) {
      console.error(err);
      toast.error(`Avatar upload failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const displayAvatar = avatarPreview || userProfile?.avatar_url;
  const initial = formData.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  const stats = [
    { label: 'Score', value: studentStats.score, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Awards', value: studentStats.achievements, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Events', value: studentStats.events, icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account identity and view your engagement stats.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Identity & Stats */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-400"></div>

            <div className="relative mb-5 group mt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-5xl font-black flex items-center justify-center cursor-pointer overflow-hidden relative"
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : initial}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Camera size={26} className="text-white drop-shadow-md" />
                </div>
              </motion.div>
              <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {formData.full_name || 'Student Name'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
            
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700">
              <Shield size={14} className="text-blue-500" /> Verified Student
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5">Engagement Stats</h3>
            <div className="space-y-4">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="flex-1 w-full min-w-0">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update your academic details.</p>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  editing 
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                }`}
              >
                <Pencil size={14} /> {editing ? 'Cancel Edit' : 'Edit Mode'}
              </button>
            </div>

            <div className="p-6 md:p-8 flex-1">
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleUpdateProfile} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Field label="Full Name" icon={BookOpen}>
                          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter your full name" className={inputCls} />
                        </Field>
                      </div>

                      <Field label="Roll Number" icon={Hash}>
                        <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} placeholder="e.g. 2024CS015" className={inputCls} />
                      </Field>

                      <Field label="Date of Birth" icon={CalendarDays}>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputCls} />
                      </Field>

                      <div className="md:col-span-2">
                        <Field label="Course / Major" icon={BookOpen}>
                          <select name="course" value={formData.course} onChange={handleChange} className={inputCls}>
                            <option value="">Select your course</option>
                            <option>Computer Science</option>
                            <option>Information Technology</option>
                            <option>Electrical Engineering</option>
                            <option>Mechanical Engineering</option>
                            <option>Business Administration</option>
                            <option>Design</option>
                          </select>
                        </Field>
                      </div>

                      <div className="md:col-span-2 mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <Field label="Registered Email" icon={Mail}>
                          <input type="email" value={user?.email || ''} disabled className={`${inputCls} bg-transparent border-none px-0 py-1 font-medium`} />
                        </Field>
                        <p className="text-[10px] text-gray-400 mt-2"><Shield size={10} className="inline mr-1"/> Managed securely by University IT.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-200/50 dark:shadow-blue-900/20 transition-all active:scale-95"
                      >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                        Save Changes
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6 h-full"
                  >
                    {[
                      { label: 'Full Name',   icon: BookOpen,     value: formData.full_name || 'Not specified', span: true },
                      { label: 'Roll Number', icon: Hash,         value: formData.roll_no   || 'Not specified' },
                      { label: 'Date of Birth', icon: CalendarDays, value: formData.dob ? new Date(formData.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified' },
                      { label: 'Course',      icon: BookOpen,     value: formData.course    || 'Not specified', span: true },
                      { label: 'Email Address', icon: Mail,       value: user?.email        || '—', span: true },
                    ].map(({ label, icon: Icon, value, span }) => (
                      <div key={label} className={span ? 'md:col-span-2' : ''}>
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                          <Icon size={14} className="text-gray-300 dark:text-gray-600" /> {label}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentProfile;
