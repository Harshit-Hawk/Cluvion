'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Users, Activity, Trash2, CheckCircle, XCircle, Plus, X, BarChart2, Calendar, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement
} from 'chart.js';
import { Line as LineChart, Bar as BarChart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

const AdminClubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Create Club State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClub, setNewClub] = useState<any>({ name: '', description: '', head_email: '', faculty_coordinator_name: '' });

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);

      const { data: clubsData, error: clubsError }: any = await supabase
        .from('clubs')
        .select('*')
        .order('name');
        
      if (clubsError) throw clubsError;

      const { data: membersData }: any = await supabase.from('club_members').select('*');
      const { data: usersData }: any = await supabase.from('users').select('id, full_name, email');

      const enrichedClubs = (clubsData || []).map((club: any) => {
        let members_count = 0;
        let head_name = null;
        
        if (membersData) {
          const clubMembers = membersData.filter((m: any) => m.club_id === club.id);
          members_count = clubMembers.length;
          
          const head = clubMembers.find((m: any) => m.role === 'head');
          if (head && usersData) {
            // Check user_id or student_id depending on what schema uses
            const userId = head.user_id || head.student_id;
            const headUser = usersData.find((u: any) => u.id === userId);
            if (headUser) {
              head_name = headUser.full_name || headUser.email;
            }
          }
        }
        
        return {
          ...club,
          members_count,
          head_name
        };
      });

      setClubs(enrichedClubs);
    } catch (err) {
      console.error('Error fetching admin clubs:', err);
      toast.error('Failed to load clubs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clubs' },
        (payload: any) => {
          fetchClubs(); // Re-fetch fully to re-calculate members and joins
        }
      )
      .subscribe();

    const membersChannel = supabase
      .channel('schema-db-changes-members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_members' },
        (payload: any) => {
          fetchClubs(); // Re-fetch to update head and counts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(membersChannel);
    };
  }, [user]);

  const handleCreateClub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newClub.name.trim()) {
      toast.error('Club name is required');
      return;
    }

    try {
      setIsCreating(true);

      // 1. Find the user ID of the head if email is provided
      let headUserId = null;
      if (newClub.head_email) {
        const { data: headUser, error: headUserError }: any = await supabase
          .from('users')
          .select('id, role')
          .eq('email', newClub.head_email.trim())
          .single();

        if (headUserError || !headUser) {
           toast.error('Could not find a user with that email. Club will be created without a head.');
        } else {
           headUserId = headUser.id;
           // If they aren't already a club head or admin, we probably shouldn't set them directly 
           // without changing their role, but for simplicity here we just assign them.
        }
      }

      // 2. Insert the club
      const { data: createdClubData, error: createError }: any = await supabase
        .from('clubs')
        .insert([{
           name: newClub.name.trim(),
           description: newClub.description.trim() || null,
           status: 'active',
           faculty_coordinator_name: newClub.faculty_coordinator_name.trim() || null
        }])
        .select()
        .single();

      if (createError) throw createError;

      // 3. If a head user was found, add them to club_members with role 'head'
      if (headUserId && createdClubData) {
         const { error: memberError } = await supabase
           .from('club_members')
           .insert([{
              club_id: createdClubData.id,
              user_id: headUserId,
              role: 'head'
           }]);
           
         if (memberError) console.error("Failed to assign club head:", memberError);
      }

      toast.success('Club created successfully!');
      setIsCreateModalOpen(false);
      setNewClub({ name: '', description: '', head_email: '', faculty_coordinator_name: '' });
      fetchClubs(); // Refresh list to get accurate relations
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error((error as any).message || 'Failed to create club');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: any) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'pending': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    }
  };

  const filteredClubs = clubs.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">All Clubs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and moderate clubs on the platform.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow"
        >
          <Plus size={18} />
          Create Club
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search clubs..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <select
              className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              value={filterStatus}
               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
           >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 mb-6"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club: any, index: number) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => { setSelectedClub(club); setIsProfileModalOpen(true); }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{club.name}</h3>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(club.status)}`}>
                  {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-2">
                {club.description || 'No description provided for this club.'}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-blue-500 dark:text-blue-400" />
                  <span>{club.members_count || 0} Members</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="text-sm">
                  <span className="text-gray-400 dark:text-gray-500">Head:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{club.head_name || 'N/A'}</span>
                </div>
                
                <div className="flex gap-2">
                  {club.status === 'pending' && (
                    <button onClick={(e) => e.stopPropagation()} className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 p-2 rounded-lg transition-colors" title="Approve">
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {club.status === 'active' && (
                    <button onClick={(e) => e.stopPropagation()} className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 p-2 rounded-lg transition-colors" title="Deactivate">
                      <XCircle size={18} />
                    </button>
                  )}
                  <button onClick={(e) => e.stopPropagation()} className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No clubs found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Try adjusting your search criteria or filter to see more results.
          </p>
        </div>
      )}

      {/* Create Club Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800"
              >
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Club</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={isCreating}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateClub} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="e.g. Photography Club"
                      value={newClub.name}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClub({ ...newClub, name: e.target.value })}
                       disabled={isCreating}
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                     <textarea
                        rows={3}
                       className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                       placeholder="Briefly describe the club's purpose..."
                       value={newClub.description}
                       onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewClub({ ...newClub, description: e.target.value })}
                       disabled={isCreating}
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faculty Coordinator Name</label>
                     <input
                       type="text"
                       className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                       placeholder="e.g. Dr. Smith"
                       value={newClub.faculty_coordinator_name}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClub({ ...newClub, faculty_coordinator_name: e.target.value })}
                       disabled={isCreating}
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Head Email (Optional)</label>
                     <input
                       type="email"
                       className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                       placeholder="head@example.com"
                       value={newClub.head_email}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClub({ ...newClub, head_email: e.target.value })}
                       disabled={isCreating}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If provided, this user will be assigned as the club head.</p>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      disabled={isCreating}
                    >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newClub.name.trim()}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Club'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Club Profile & Trends Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedClub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsProfileModalOpen(false)}
          >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden my-4 max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-800"
              >
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                      {selectedClub.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{selectedClub.name} Profile</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{selectedClub.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                     <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3">
                       <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><Activity className="text-emerald-600 dark:text-emerald-400" size={24} /></div>
                       <div>
                         <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Status</p>
                         <p className="font-bold text-gray-900 dark:text-gray-100">
                           {selectedClub.status.charAt(0).toUpperCase() + selectedClub.status.slice(1)}
                         </p>
                       </div>
                     </div>
                     <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-800/30 flex items-center gap-3">
                       <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Users className="text-purple-600 dark:text-purple-400" size={20} /></div>
                       <div>
                         <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Club Head</p>
                         <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                           {selectedClub.head_name || 'N/A'}
                         </p>
                       </div>
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center gap-3">
                       <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ShieldCheck className="text-blue-600 dark:text-blue-400" size={20} /></div>
                       <div>
                         <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Coordinator</p>
                         <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                           {selectedClub.faculty_coordinator_name || 'N/A'}
                         </p>
                       </div>
                     </div>
                  </div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <BarChart2 size={18} className="text-blue-500 dark:text-blue-400" /> Performance Trends & Work
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
                    <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2"><Users size={14}/> Membership Growth (6M)</h4>
                      <div className="h-48">
                         <LineChart 
                            data={{
                              labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                              datasets: [{
                                label: 'Active Members',
                                data: [Math.floor(Math.random()*10), Math.floor(Math.random()*15), Math.floor(Math.random()*25), Math.floor(Math.random()*30), Math.floor(Math.random()*45), selectedClub.members_count || Math.floor(Math.random()*50)],
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                fill: true,
                                tension: 0.4
                              }]
                            }}
                            options={{ 
                               responsive: true, 
                               maintainAspectRatio: false,
                               plugins: { legend: { display: false } },
                               scales: { y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' } }, x: { grid: { display: false } } }
                            }}
                         />
                      </div>
                    </div>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2"><Calendar size={14}/> Events Organized</h4>
                    <div className="h-48">
                       <BarChart 
                          data={{
                            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                            datasets: [{
                              label: 'Events Count',
                              data: [1, 3, 0, 4, 2, 5],
                              backgroundColor: 'rgba(16, 185, 129, 0.8)',
                              borderRadius: 4
                            }]
                          }}
                            options={{ 
                               responsive: true, 
                               maintainAspectRatio: false,
                               plugins: { legend: { display: false } },
                               scales: { y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' } }, x: { grid: { display: false } } } 
                            }}
                         />
                      </div>
                    </div>
                  </div>

                  {/* Past Events & Activities Section */}
                  <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-5">
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Activity size={18} className="text-emerald-500 dark:text-emerald-400" /> Past Events & Activities
                    </h3>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  { title: 'Annual General Meeting', date: 'Feb 15, 2026', attendees: 45, status: 'Completed' },
                  { title: 'Workshop: Introduction to ' + selectedClub.name, date: 'Jan 22, 2026', attendees: 60, status: 'Completed' },
                  { title: 'End of Semester Showcase', date: 'Dec 10, 2025', attendees: 120, status: 'Completed' },
                  { title: 'New Member Orientation', date: 'Sep 05, 2025', attendees: 30, status: 'Completed' }
                ].map((event: any, idx: number) => (
                          <div key={idx} className="p-4 hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                            <div className="flex items-start gap-4">
                              <div className="bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center min-w-[3.5rem]">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{event.date.split(' ')[0]}</span>
                                <span className="block text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                  <Users size={14} /> {event.attendees} Attendees
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                {event.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClubs;
