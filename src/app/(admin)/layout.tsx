'use client';

import { Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="container p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      <div className="container p-4">
        {children}
      </div>
    </div>
  );
}
