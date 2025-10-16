import { useMemo, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { useAppContext } from '@/hooks/useAppContext';
import { useMessages } from '@/hooks/useMessages';
import { toast } from 'sonner';

export function MessageDetailView() {
  const { messages, selectedMessageId, setSelectedMessageId } = useAppContext();
  const { deleteMessage } = useMessages();
  
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedMessage = useMemo(
    () => messages.find(m => m.id === selectedMessageId),
    [messages, selectedMessageId]
  );

  const handleDeleteMessage = async () => {
    if (!selectedMessageId) return;

    setIsDeleting(true);
    
    try {
      await deleteMessage(selectedMessageId);
      toast.success('Message deleted successfully');
      setDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting message:', error);
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
            variant="ghost"
            onClick={() => setSelectedMessageId(null)}
            className="gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Inbox
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialog(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              {selectedMessage.subject}
            </h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                    From
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedMessage.sender}
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                  To
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedMessage.receiver}
                </div>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.body}
              </p>
            </div>
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