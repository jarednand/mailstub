import { useState } from 'react';
import { Mail, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { useAppContext } from '@/hooks/useAppContext';

export function EmptyState() {
  const [projectDialog, setProjectDialog] = useState(false);
  const { theme, toggleTheme } = useAppContext();

  return (
    <>
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Header with theme toggle */}
        <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              MailStub
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            data-testid="theme-toggle-button"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Welcome to MailStub
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Get started by creating your first project
              </p>
            </div>

            {/* Get Started Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
              <div className="space-y-6">
                {/* Step 1 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Create a Project
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 ml-11">
                    Projects help you organize test emails by application or environment.
                  </p>
                  <div className="ml-11">
                    <Button
                      onClick={() => setProjectDialog(true)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      data-testid="create-project-button"
                    >
                      Create Project
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800" />

                {/* Step 2 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Add a User
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 ml-11">
                    Create test users to receive emails in your project.
                  </p>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800" />

                {/* Step 3 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Send Test Emails
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 ml-11 mb-3">
                    Install the MailStub client and start sending test emails from your app.
                  </p>
                  <div className="ml-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                    <code className="text-xs text-slate-600 dark:text-slate-400 block mb-3">
                      npm install mailstub-client
                    </code>
                    <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
{`import { client } from 'mailstub-client';

await client.send(projectId, {
  sender: 'noreply@myapp.local',
  receiver: 'user@example.com',
  subject: 'Welcome!',
  body: '<h1>Hello World</h1>'
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Help text */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Need help? Check out the{' '}
              <a
                href="https://github.com/jarednand/mailstub#readme"
                className="text-cyan-600 dark:text-cyan-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                documentation
              </a>
            </p>
          </div>
        </div>
      </div>

      <ProjectFormDialog
        open={projectDialog}
        onOpenChange={setProjectDialog}
        mode="create"
      />
    </>
  );
}