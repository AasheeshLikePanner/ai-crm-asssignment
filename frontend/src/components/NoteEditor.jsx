import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';
import { Loader2 } from 'lucide-react';

export default function NoteEditor({
    selectedCustomer,
    noteContent,
    setNoteContent,
    handleSaveNote,
    isSaving,
    handleAutoSave,
    noteType,
    setNoteType,
    handleCancelNote,
}) {
    return (
        <div className="flex flex-col flex-1 space-y-4 h-full">
            <h2 className="text-2xl font-bold">Realtime Note Taker for {selectedCustomer?.name}</h2>
            <p className="text-muted-foreground">Capture notes for interactions with {selectedCustomer?.name}.</p>
                <RichTextEditor
                    content={noteContent}
                    onContentChange={setNoteContent}
                    onSave={handleSaveNote}
                    isSaving={isSaving}
                    onBlur={handleAutoSave}
                />
            <div className="flex items-center space-x-4">
                <label htmlFor="noteType" className="text-sm font-medium">Type:</label>
                <select
                    id="noteType"
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="p-2 border rounded-xl bg-background"
                >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelNote} className="rounded-xl">Cancel</Button>
                <Button onClick={handleSaveNote} disabled={isSaving} className="rounded-xl">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
                </Button>
            </div>
        </div>
    );
}