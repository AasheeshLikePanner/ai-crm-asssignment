import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Loader2, FileText, Image, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FileManagementDialog({
    isOpen,
    onClose,
    customer,
    setCustomers,
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('customerId', customer.id);

        try {
            const response = await axios.post('http://localhost:8000/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { fileUrl, customer: updatedCustomer } = response.data;
            toast.success('File uploaded successfully!');

            
            setCustomers(prevCustomers =>
                prevCustomers.map(c =>
                    c.id === updatedCustomer.id ? { ...c, files: updatedCustomer.files } : c
                )
            );

            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file.');
        } finally {
            setIsUploading(false);
        }
    };

    const getFileIcon = (url) => {
        if (url.includes('.pdf')) {
            return <FileText className="h-5 w-5 text-red-500" />;
        } else if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif')) {
            return <Image className="h-5 w-5 text-blue-500" />;
        } else {
            return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-xl">
                <DialogHeader>
                    <DialogTitle>Manage Files for {customer.name}</DialogTitle>
                    <DialogDescription>
                        View existing files or upload new documents for this customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Existing Files</h3>
                        {customer.files && customer.files.length > 0 ? (
                            <ul className="space-y-2">
                                {customer.files.map((fileUrl, index) => (
                                    <li key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                                        {getFileIcon(fileUrl)}
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                            {fileUrl.split('/').pop()} 
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No files uploaded yet.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Upload New File</h3>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="file" type="file" onChange={handleFileChange} className="rounded-xl"
                            />
                            <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="rounded-xl">
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                        {selectedFile && (
                            <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="rounded-xl">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}