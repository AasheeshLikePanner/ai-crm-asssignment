import useCustomerStore from '@/store/customerStore';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import RichTextEditor from '@/components/RichTextEditor';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Loader2 } from 'lucide-react';
import NoteEditor from '@/components/NoteEditor';
import ConflictResolutionDialog from './ConflictResolutionDialog'; 

export default function CustomerDetailsPanel({
    selectedCustomer,
    setSelectedCustomer,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    customerToDelete,
    setCustomerToDelete,
    isDeletingCustomer,
    confirmDelete,
}) {
    const { updateCustomer, customers, setCustomers } = useCustomerStore();
    const [viewMode, setViewMode] = useState('details'); 
    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState('call');
    const [isSaving, setIsSaving] = useState(false);
    const [currentInteractionId, setCurrentInteractionId] = useState(null); 
    const [displayedInteractions, setDisplayedInteractions] = useState([]); 
    const saveTimeoutRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedCustomer, setEditedCustomer] = useState(null);
    const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
    const [conflictingData, setConflictingData] = useState(null);

    useEffect(() => {
        if (selectedCustomer) {
            setEditedCustomer({ ...selectedCustomer });
        } else {
            setEditedCustomer(null);
            setIsEditing(false);
        }
    }, [selectedCustomer]);


    useEffect(() => {
        if (selectedCustomer?.interaction_ids && selectedCustomer.interaction_ids.length > 0) {
            const fetchInteractions = async () => {
                try {
                    const response = await axios.post('http://localhost:8000/interactions/batch', {
                        interactionIds: selectedCustomer.interaction_ids
                    });
                    setDisplayedInteractions(response.data.map(interaction => ({
                        ...interaction,
                        timestamp: new Date(interaction.created_at),
                    })));
                } catch (error) {
                    console.error('Error fetching interactions by IDs:', error);
                }
            };
            fetchInteractions();
        } else {
            setDisplayedInteractions([]); 
        }
    }, [selectedCustomer?.interaction_ids]);

    const handleSaveNote = async () => {
        if (!selectedCustomer || !noteContent) return;

        setIsSaving(true);

        const interactionData = {
            customer_id: selectedCustomer.id,
            type: noteType,
            note: noteContent,
        };

        try {
            let response;
            let savedInteraction;

            if (currentInteractionId) {
                
                response = await axios.put(`http://localhost:8000/interactions/${currentInteractionId}`, interactionData);
                savedInteraction = response.data;
                
                const updatedInteractions = displayedInteractions.map(int =>
                    int.id === savedInteraction.id ? { ...int, note: savedInteraction.note, type: savedInteraction.type } : int
                );
                setDisplayedInteractions(updatedInteractions);
                console.log('Note updated:', savedInteraction);
            } else {
                
                response = await axios.post('http://localhost:8000/interactions', interactionData);
                savedInteraction = response.data;
                setCurrentInteractionId(savedInteraction.id); 

                const newInteraction = {
                    ...savedInteraction,
                    timestamp: new Date(savedInteraction.created_at), 
                };

                setDisplayedInteractions(prev => [...prev, newInteraction]);
                console.log('Note saved:', newInteraction);
            }
        } catch (error) {
            console.error('Error saving/updating note:', error);
            
        } finally {
            setIsSaving(false);
        }
    };

    const handleAutoSave = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            handleSaveNote();
        }, 2000); 
    };

    const handleCancelNote = () => {
        setNoteContent(''); 
        setCurrentInteractionId(null); 
        setViewMode('details'); 
    };

    const handleUpdateCustomer = async (force = false) => {
        if (!editedCustomer) return;

        setIsSaving(true);
        try {
            const payload = {
                customerData: {
                    name: editedCustomer.name,
                    email: editedCustomer.email,
                    phone: editedCustomer.phone,
                    company: editedCustomer.company,
                },
                updated_at: force ? null : selectedCustomer.updated_at, 
            };

            const response = await axios.put(`http://localhost:8000/customers/${selectedCustomer.id}`, payload);
            const updatedData = response.data;

            
            updateCustomer(updatedData.id, updatedData);
            setSelectedCustomer(updatedData);
            setIsEditing(false);
            setIsConflictDialogOpen(false); 
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setConflictingData(error.response.data.data);
                setIsConflictDialogOpen(true);
            } else {
                console.error('Error updating customer:', error);
                
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleForceUpdate = () => {
        handleUpdateCustomer(true); 
    };

    const handleDiscardChanges = () => {
        
        const latestCustomer = customers.find(c => c.id === selectedCustomer.id);
        setSelectedCustomer(latestCustomer);
        setEditedCustomer({ ...latestCustomer });
        setIsConflictDialogOpen(false);
        setIsEditing(false);
    };

    

    useEffect(() => {
        if (viewMode === 'noteEditor' && noteContent) {
            handleAutoSave();
        }
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [noteContent, viewMode]);

    
    useEffect(() => {
        setNoteContent('');
        setCurrentInteractionId(null); 
        console.log('CustomerDetailsPanel.jsx: selectedCustomer object:', selectedCustomer);
    }, [selectedCustomer?.id]);

    return (
        <div className="flex flex-col w-1/2 space-y-6 p-6 overflow-y-auto">
            {selectedCustomer ? (
                <div className="flex-1 flex flex-col space-y-4">
                    {viewMode === 'details' ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-xl">Edit</Button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <Button onClick={() => handleUpdateCustomer()} className="rounded-xl" disabled={isSaving}>
                                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                                        </Button>
                                        <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-xl">Cancel</Button>
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground">Customer Details</p>
                            <div className="space-y-4 mt-4">
                                <p><strong>Email:</strong> {isEditing ? <Input value={editedCustomer.email} onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })} /> : selectedCustomer.email}</p>
                                <p><strong>Phone:</strong> {isEditing ? <Input value={editedCustomer.phone} onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })} /> : selectedCustomer.phone}</p>
                                <p><strong>Company:</strong> {isEditing ? <Input value={editedCustomer.company} onChange={(e) => setEditedCustomer({ ...editedCustomer, company: e.target.value })} /> : selectedCustomer.company}</p>
                                <p><strong>Created At:</strong> {format(new Date(selectedCustomer.created_at), 'PPP')}</p>
                                <p><strong>Last Updated:</strong> {format(new Date(selectedCustomer.updated_at), 'PPP p')}</p>

                                <h3 className="text-xl font-semibold mt-6">AI Insights</h3>
                                <p><strong>Preferences:</strong> {selectedCustomer.preferences?.join(', ') || 'N/A'}</p>
                                <p><strong>Objections:</strong> {selectedCustomer.objections?.join(', ') || 'N/A'}</p>
                                <p><strong>Buying Signals:</strong> {selectedCustomer.buying_signals?.join(', ') || 'N/A'}</p>
                                <p><strong>Confidence Score:</strong> {selectedCustomer.confidence_score || 'N/A'}</p>

                                <h3 className="text-xl font-semibold mt-6">Past Interactions</h3>
                                {displayedInteractions.length > 0 ? (
                                    <ul className="space-y-2">
                                        {displayedInteractions.map((interaction, index) => (
                                            <li key={index} className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-sm text-muted-foreground">{format(interaction.timestamp, 'PPP p')} - {interaction.type}</p>
                                                <p>{interaction.note}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground">No interactions yet.</p>
                                )}

                                <Button onClick={() => setViewMode('noteEditor')} className="rounded-xl mt-4">
                                    Realtime Note Taker
                                </Button>
                            </div>
                        </>
                    ) : (
                        <NoteEditor
                            selectedCustomer={selectedCustomer}
                            noteContent={noteContent}
                            setNoteContent={setNoteContent}
                            handleSaveNote={handleSaveNote}
                            isSaving={isSaving}
                            handleAutoSave={handleAutoSave}
                            noteType={noteType}
                            setNoteType={setNoteType}
                            handleCancelNote={handleCancelNote}
                        />
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a customer to view details.
                </div>
            )}

            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {customerToDelete?.name}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="rounded-xl" disabled={isDeletingCustomer}>
                            {isDeletingCustomer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isDeletingCustomer ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            
            <ConflictResolutionDialog
                isOpen={isConflictDialogOpen}
                onClose={() => setIsConflictDialogOpen(false)}
                onForceUpdate={handleForceUpdate}
                onDiscardChanges={handleDiscardChanges}
                yourChanges={editedCustomer}
                serverChanges={conflictingData}
                isSaving={isSaving}
            />
        </div>
    );
}