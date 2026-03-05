import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { User, Mail, Shield, Save, Key, Camera } from 'lucide-react';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: 'admin',
    designation: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('users')
          .select('full_name, email, role, designation')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Admin Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Quick Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-1 space-y-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 border-4 border-white dark:border-gray-900 shadow-md">
                {profileData.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profileData.full_name || 'No Name Set'}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{profileData.email || user?.email}</p>
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full border border-purple-200 dark:border-purple-800/50 uppercase tracking-wide flex items-center gap-1.5">
                <Shield size={12} /> {profileData.role || 'Admin'}
              </div>
              {profileData.designation && (
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                  {profileData.designation}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Settings Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <User size={18} className="text-blue-500 dark:text-blue-400" /> Personal Information
              </h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                      placeholder="e.g. John Doe"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                      placeholder="e.g. Dean of Students"
                      value={profileData.designation || ''}
                      onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Your official title or position.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="email"
                      disabled
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm"
                      value={profileData.email || user?.email || ''}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Email address cannot be changed directly.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
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

export default AdminProfile;
