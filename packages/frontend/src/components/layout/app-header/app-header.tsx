import { useState, useCallback } from 'react';
import { Mail, Copy, Check, Settings, Search, Moon, Sun } from 'lucide-react';
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

  const handleCopyProjectId = useCallback(() => {
    if (selectedProjectId) {
      navigator.clipboard.writeText(selectedProjectId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  }, [selectedProjectId]);

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            MailStub
          </h1>
        </div>
        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
        {selectedProjectId && (
          <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/50 px-3 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <code className="text-sm font-mono text-cyan-700 dark:text-cyan-400 font-medium">
              {selectedProjectId}
            </code>
            <button
              onClick={handleCopyProjectId}
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-cyan-500"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}