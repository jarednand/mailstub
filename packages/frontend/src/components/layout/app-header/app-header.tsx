import { useState, useCallback } from 'react';
import { Mail, Copy, Check, Search, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/hooks/useAppContext';

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AppHeader({ searchQuery, onSearchChange }: AppHeaderProps) {
  const { selectedProjectId, theme, toggleTheme } = useAppContext();
  const [copiedId, setCopiedId] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleCopyProjectId = useCallback(() => {
    if (selectedProjectId) {
      navigator.clipboard.writeText(selectedProjectId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  }, [selectedProjectId]);

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {!mobileSearchOpen ? (
        <>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 mr-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 hidden sm:block">
                MailStub
              </h1>
            </div>
            {selectedProjectId && (
              <>
                <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/50 px-2 sm:px-3 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800 min-w-0">
                  <code className="text-xs sm:text-sm font-mono text-cyan-700 dark:text-cyan-400 font-medium truncate">
                    {selectedProjectId}
                  </code>
                  <button
                    onClick={handleCopyProjectId}
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors flex-shrink-0"
                  >
                    {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="text-sm pl-9 w-40 md:w-52 lg:w-64 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-cyan-500"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(true)}
              className="sm:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 w-full sm:hidden">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="text-sm pl-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-cyan-500"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(false)}
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}