'use client';

import React, { useState } from 'react';
import DepartmentManager from '../../../../components/admin/DepartmentManager';
import CourseManager from '../../../../components/admin/CourseManager';
import { motion } from 'framer-motion';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'courses'>('departments');

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Academic Settings</h1>
        <p className="text-gray-500 mt-2">Manage college departments, head of departments, and courses.</p>
      </div>

      <div className="flex gap-2 mb-8 bg-white dark:bg-gray-900 p-1.5 rounded-2xl w-fit border border-gray-100 dark:border-gray-800 shadow-sm">
        <button
          onClick={() => setActiveTab('departments')}
          className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${activeTab === 'departments' ? 'text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          {activeTab === 'departments' && (
            <motion.div layoutId="academicsTab" className="absolute inset-0 bg-indigo-600 rounded-xl" />
          )}
          <span className="relative z-10">Departments</span>
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${activeTab === 'courses' ? 'text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          {activeTab === 'courses' && (
            <motion.div layoutId="academicsTab" className="absolute inset-0 bg-indigo-600 rounded-xl" />
          )}
          <span className="relative z-10">Courses</span>
        </button>
      </div>

      {activeTab === 'departments' ? <DepartmentManager /> : <CourseManager />}
    </div>
  );
}
