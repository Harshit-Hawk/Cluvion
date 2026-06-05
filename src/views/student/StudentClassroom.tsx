'use client';

import React, { useState } from 'react';
import { BookOpen, CheckSquare, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import StudentAttendance from './StudentAttendance';

export default function StudentClassroom() {
  const [activeTab, setActiveTab] = useState('Attendance');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-8 pt-safe">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={32} />
            Classroom
          </h1>
          <p className="text-gray-500 font-medium mt-2">Manage your academic courses and resources.</p>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-0">
        <button 
          onClick={() => setActiveTab('Attendance')}
          className={`flex items-center gap-2 font-bold pb-3 border-b-2 transition-colors ${activeTab === 'Attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <CheckSquare size={18} /> Attendance
        </button>
        <button 
          onClick={() => setActiveTab('Resources')}
          className={`flex items-center gap-2 font-bold pb-3 border-b-2 transition-colors ${activeTab === 'Resources' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FileText size={18} /> Resources
        </button>
      </div>

      {activeTab === 'Attendance' ? (
        <div className="mt-0">
           <StudentAttendance />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0e0e12] rounded-3xl border border-gray-100 dark:border-white/5 p-8 text-center shadow-sm mt-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Resources Coming Soon</h2>
          <p className="text-gray-500">Course resources will be available here.</p>
        </div>
      )}
    </div>
  );
}
