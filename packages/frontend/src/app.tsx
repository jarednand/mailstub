import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/layout/sidebar';
import { MainContent } from '@/components/layout/main-content';
import { EmptyState } from '@/components/layout/empty-state';
import { useAppContext } from '@/hooks/useAppContext';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, projects, isLoadingProjects } = useAppContext();

  // Apply theme to document root for Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Don't render anything while projects are loading
  if (isLoadingProjects) {
    return null;
  }

  // Show empty state if no projects exist
  if (projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainContent searchQuery={searchQuery} />
      </div>
    </div>
  );
}