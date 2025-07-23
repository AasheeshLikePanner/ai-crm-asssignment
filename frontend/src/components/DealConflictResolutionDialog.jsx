import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DealConflictResolutionDialog({
    isOpen,
    onClose,
    onForceUpdate,
    onDiscardChanges,
    yourChanges,
    serverChanges,
    isSaving,
}) {
    if (!yourChanges || !serverChanges) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-red-600">Update Conflict</DialogTitle>
                    <DialogDescription>
                        Another user has updated this deal's information since you started editing.
                        Please review the changes and decide how to proceed.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Your Changes</h3>
                        <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                            <p><strong>Title:</strong> {yourChanges.title}</p>
                            <p><strong>Stage:</strong> {yourChanges.stage}</p>
                            <p><strong>Value:</strong> {yourChanges.value}</p>
                            <p><strong>Status:</strong> {yourChanges.status}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Server Changes</h3>
                        <div className="space-y-2 p-4 border rounded-lg bg-blue-50">
                            <p><strong>Title:</strong> {serverChanges.title}</p>
                            <p><strong>Stage:</strong> {serverChanges.stage}</p>
                            <p><strong>Value:</strong> {serverChanges.value}</p>
                            <p><strong>Status:</strong> {serverChanges.status}</p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onDiscardChanges} className="rounded-full px-6 py-2">Discard My Changes & Reload</Button>
                    <Button onClick={onForceUpdate} className="rounded-full px-6 py-2 bg-red-600 text-white hover:bg-red-700" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Overwrite with My Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}