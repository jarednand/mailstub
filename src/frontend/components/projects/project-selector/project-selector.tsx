import { ChevronDown } from 'lucide-react';
import { useAppContext } from '@/hooks/useAppContext';

export function ProjectSelector() {
  const { projects, selectedProjectId, setSelectedProjectId, isLoadingProjects } = useAppContext();

  return (
    <div className="relative">
      <select
        data-testid="project-selector"
        value={selectedProjectId || ''}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        disabled={isLoadingProjects}
        className="w-full px-3 py-2.5 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingProjects ? (
          <option>Loading projects...</option>
        ) : projects.length === 0 ? (
          <option>No projects</option>
        ) : (
          projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))
        )}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}