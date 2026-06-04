'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  X, Calendar as CalendarIcon, MapPin, 
  AlignLeft, Type, UploadCloud, Image as ImageIcon, 
  CheckCircle, ArrowRight
} from 'lucide-react';

interface EventSchedulingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  onEventCreated: (event: any) => void;
}

export default function EventSchedulingWizard({ isOpen, onClose, clubId, onEventCreated }: EventSchedulingWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    location: '',
    event_date: '',
    description: '',
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const uploadPoster = async (): Promise<string | null> => {
    if (!posterFile) return null;
    const fileExt = posterFile.name.split('.').pop();
    const fileName = `${user?.id}/events-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, posterFile, { upsert: false });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw new Error('Failed to upload poster.');
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.title || !formData.event_date || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (posterFile) {
        imageUrl = await uploadPoster();
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          club_id: clubId,
          title: formData.title,
          description: formData.description,
          event_date: new Date(formData.event_date).toISOString(),
          location: formData.location,
          category: formData.category,
          image_url: imageUrl,
          status: 'pending' // New events go to moderation
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Event submitted for moderation!');
      onEventCreated(data);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Error creating event.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: 'General', location: '', event_date: '', description: '' });
    setPosterFile(null);
    setPosterPreview(null);
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetForm}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-800"
          >
            {/* Left Side: Poster Upload & Preview (Only visible in step 2 or on large screens) */}
            <div className={`md:w-5/12 bg-gray-50 dark:bg-gray-800/50 p-8 flex flex-col justify-center border-r border-gray-100 dark:border-gray-800 ${step === 1 ? 'hidden md:flex' : 'flex'}`}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Event Poster</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">A stunning poster attracts more students.</p>
              </div>

              <div 
                className={`relative group aspect-[3/4] w-full max-w-sm mx-auto rounded-2xl overflow-hidden transition-all duration-300 ${posterPreview ? '' : 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-gray-800 cursor-pointer flex flex-col items-center justify-center'}`}
                onClick={() => !posterPreview && fileInputRef.current?.click()}
              >
                {posterPreview ? (
                  <>
                    <img src={posterPreview} alt="Event Poster Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPosterFile(null); setPosterPreview(null); }}
                        className="bg-white/20 hover:bg-red-500/80 text-white p-3 rounded-full transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 pointer-events-none">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Click to upload poster</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>
            </div>

            {/* Right Side: Form Details */}
            <div className={`md:w-7/12 p-8 flex flex-col h-full overflow-y-auto ${step === 2 ? 'hidden md:flex' : 'flex'}`}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {step === 1 ? 'Event Details' : 'Final Polish'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step === 1 ? 'Let\'s get the basics down.' : 'Add a description and poster.'}
                  </p>
                </div>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6 flex-1"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Title *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Type className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="e.g., Annual Hackathon 2026"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              required
                              type="datetime-local"
                              name="event_date"
                              value={formData.event_date}
                              onChange={handleInputChange}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                          <select
                            required
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          >
                            <option value="General">General</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Competition">Competition</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Cultural">Cultural</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            required
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="e.g., Main Auditorium, Block C"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6 flex-1 flex flex-col"
                    >
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Description</label>
                        <div className="relative flex-1 flex flex-col">
                          <div className="absolute top-3 left-3 pointer-events-none">
                            <AlignLeft className="h-5 w-5 text-gray-400" />
                          </div>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={8}
                            className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none flex-1"
                            placeholder="Tell everyone what this event is about..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className={`h-2 rounded-full transition-all ${step === 1 ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} />
                    <div className={`h-2 rounded-full transition-all ${step === 2 ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} />
                  </div>
                  
                  <div className="flex space-x-4">
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      >
                        Back
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : step === 1 ? (
                        <>
                          <span>Next Step</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Schedule Event</span>
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
