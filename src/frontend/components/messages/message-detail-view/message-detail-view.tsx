import { useMemo, useState } from 'react';
import { ChevronLeft, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { useAppContext } from '@/hooks/useAppContext';
import { useMessages } from '@/hooks/useMessages';
import { toast } from 'sonner';

export function MessageDetailView() {
  const { selectedUserId, users, messages, selectedMessageId, setSelectedMessageId } = useAppContext();
  const { deleteMessage } = useMessages();
  
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedMessage = useMemo(
    () => messages.find(m => m.id === selectedMessageId),
    [messages, selectedMessageId]
  );

  const currentUser = useMemo(
    () => users.find(u => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const emailHasChanged = useMemo(() => {
    if (!selectedMessage || !currentUser) return false;
    return selectedMessage.receiver !== currentUser.email;
  }, [selectedMessage, currentUser]);

  const handleDeleteMessage = async () => {
    if (!selectedMessageId) return;

    setIsDeleting(true);
    
    try {
      await deleteMessage(selectedMessageId);
      toast.success('Message deleted successfully');
      setDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!selectedMessage) {
    return null;
  }

  return (
    <>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
          <Button
            data-testid="back-to-inbox-button"
            variant="ghost"
            onClick={() => setSelectedMessageId(null)}
            className="gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Inbox
          </Button>
          <Button
            data-testid="delete-message-button"
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialog(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-scroll p-8 bg-slate-50 dark:bg-slate-950 h-[calc(100vh-128px)]">
          <div className="max-w-3xl min-w-[500px] mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <h2
              data-testid="message-subject"
              className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6"
            >
              {selectedMessage.subject}
            </h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                    From
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    <span data-testid="message-sender">{selectedMessage.sender}</span>
                  </div>
                </div>
                <div
                  data-testid="message-timestamp"
                  className="text-sm text-slate-500 dark:text-slate-400"
                >
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                  To
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    <span data-testid="message-receiver">{selectedMessage.receiver}</span>
                  </div>
                  {emailHasChanged && currentUser && (
                    <div className="relative group">
                      <Info 
                        className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-help" 
                        data-testid="email-changed-icon"
                      />
                      <div className="absolute left-0 top-6 hidden group-hover:block z-10 w-64">
                        <div className="bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs rounded-lg px-3 py-2 shadow-lg border border-slate-700 dark:border-slate-600">
                          This user's email has been updated to <span className="font-semibold">{currentUser.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              data-testid="message-body"
              className="prose max-w-none text-slate-700 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
            />
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDeleteMessage}
        title="Confirm Deletion"
        description="This will permanently delete this message. This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
}