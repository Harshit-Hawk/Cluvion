import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { User, Mail, Shield, Save, Camera, Building2 } from 'lucide-react';

const ClubHeadProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: 'club_head',
    designation: '',
    managed_club: null
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);


        // Fetch User and Managed Club Data in parallel
        const [userResp, clubResp] = await Promise.all([
           supabase
            .from('users')
            .select('full_name, email, role, designation')
            .eq('id', user.id)
            .single(),
           supabase
            .from('memberships')
            .select('clubs(name)')
            .eq('user_id', user.id)
            .eq('role', 'head')
            .single()
        ]);

        if (userResp.error) throw userResp.error;
        
        let managedClubName = 'Unassigned';
        if (clubResp.data?.clubs) {
           managedClubName = clubResp.data.clubs.name;
        }

        if (userResp.data) {
          setProfileData({
             ...userResp.data,
             managed_club: managedClubName
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfileData();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('users')
        .update({ 
          full_name: profileData.full_name,
          designation: profileData.designation
        })
        .eq('id', user.id);

      if (error) throw error;
      
      updateProfile({
        full_name: profileData.full_name,
        designation: profileData.designation
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 p-8 md:p-10 rounded-3xl shadow-xl border border-white/10 text-white mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Club Head Profile</h1>
            <p className="text-indigo-100 max-w-lg leading-relaxed">Manage your personal details, campus role, and club affiliation.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Quick Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-1 space-y-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40"></div>
            
            <div className="relative w-32 h-32 rounded-full mt-8 mb-4 border-4 border-white dark:border-gray-900 shadow-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors group overflow-hidden">
                {profileData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profileData.full_name || 'No Name Set'}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{profileData.email || user?.email}</p>
            
            <div className="mt-6 flex flex-col items-center gap-2 w-full">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800/50 w-max mx-auto uppercase tracking-wider">
                <Shield size={14} /> {profileData.role?.replace('_', ' ') || 'Club Head'}
              </div>
              
              {profileData.managed_club && (
                 <div className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full border border-emerald-100 dark:border-emerald-800/50 w-max mx-auto">
                    <Building2 size={14} /> {profileData.managed_club}
                 </div>
              )}

              {profileData.designation && (
                <div className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-700 w-max mx-auto">
                  {profileData.designation}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Settings Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Personal Details</h3>
              </div>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900"
                    placeholder="e.g. Jane Doe"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Designation</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900"
                    placeholder="e.g. Tech Club President"
                    value={profileData.designation || ''}
                    onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Your official title within the campus or club.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    className="w-full px-4 py-3 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
                    value={profileData.email || user?.email || ''}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Email address cannot be changed directly.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClubHeadProfile;
