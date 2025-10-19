import { useState, useCallback } from 'react';
import { Mail, Copy, Check, Search, Moon, Sun, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppContext } from '@/hooks/useAppContext';

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AppHeader({ searchQuery, onSearchChange }: AppHeaderProps) {
  const { selectedProjectId, theme, toggleTheme } = useAppContext();
  const [copiedId, setCopiedId] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyProjectId = useCallback(() => {
    if (selectedProjectId) {
      navigator.clipboard.writeText(selectedProjectId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  }, [selectedProjectId]);

  const codeExample = `import { client } from 'mailstub-client';

await client.send('${selectedProjectId}', {
  sender: 'noreply@myapp.local',
  receiver: 'user@example.com',
  subject: 'Welcome!',
  body: '<h1>Hello World</h1>'
});`;

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(codeExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [codeExample]);

  return (
    <>
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
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/50 px-2 sm:px-3 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800 min-w-0 overflow-hidden">
                      <code className="text-xs sm:text-sm font-mono text-cyan-700 dark:text-cyan-400 font-medium truncate">
                        {selectedProjectId}
                      </code>
                    </div>
                    <button
                      onClick={handleCopyProjectId}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors flex-shrink-0"
                      title="Copy project ID"
                    >
                      {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setHelpDialogOpen(true)}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors flex-shrink-0"
                      title="How to use project ID"
                    >
                      <HelpCircle className="w-4 h-4" />
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
                  className="pl-9 w-40 md:w-52 lg:w-64 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-cyan-500"
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
                className="pl-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-cyan-500"
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

      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Using Your Project ID
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Use this project ID to send test emails to MailStub from your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Example Usage
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-7 text-xs gap-1.5"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="relative bg-slate-950 dark:bg-slate-900 rounded-lg border border-slate-800 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <pre className="p-4 text-sm leading-relaxed">
                    <code className="text-slate-100 dark:text-slate-300 font-mono">
                      <span className="text-purple-400">import</span>{' '}
                      <span className="text-slate-100">{'{ client }'}</span>{' '}
                      <span className="text-purple-400">from</span>{' '}
                      <span className="text-green-400">'mailstub-client'</span>
                      <span className="text-slate-100">;</span>
                      {'\n\n'}
                      <span className="text-purple-400">await</span>{' '}
                      <span className="text-slate-100">client</span>
                      <span className="text-yellow-400">.</span>
                      <span className="text-blue-400">send</span>
                      <span className="text-slate-100">(</span>
                      <span className="text-green-400">'{selectedProjectId}'</span>
                      <span className="text-slate-100">, {'{'}</span>
                      {'\n  '}
                      <span className="text-cyan-400">sender</span>
                      <span className="text-slate-100">:</span>{' '}
                      <span className="text-green-400">'noreply@myapp.local'</span>
                      <span className="text-slate-100">,</span>
                      {'\n  '}
                      <span className="text-cyan-400">receiver</span>
                      <span className="text-slate-100">:</span>{' '}
                      <span className="text-green-400">'user@example.com'</span>
                      <span className="text-slate-100">,</span>
                      {'\n  '}
                      <span className="text-cyan-400">subject</span>
                      <span className="text-slate-100">:</span>{' '}
                      <span className="text-green-400">'Welcome!'</span>
                      <span className="text-slate-100">,</span>
                      {'\n  '}
                      <span className="text-cyan-400">body</span>
                      <span className="text-slate-100">:</span>{' '}
                      <span className="text-green-400">'&lt;h1&gt;Hello World&lt;/h1&gt;'</span>
                      {'\n'}
                      <span className="text-slate-100">{'});'}</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                The project ID is required as the first argument when sending test emails. 
                All emails sent with this ID will appear in this project.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}