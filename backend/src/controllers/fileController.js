import cloudinary from '../config/cloudinaryConfig.js';
import * as customerService from '../services/customerService.js';

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { customerId } = req.body;
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required.' });
        }

        const result = await cloudinary.uploader.upload(req.file.path || `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
            folder: 'ai-crm-files',
            resource_type: 'auto',
        });

        const fileUrl = result.secure_url;

        
        const updatedCustomer = await customerService.addFileToCustomer(customerId, fileUrl);

        res.status(200).json({ message: 'File uploaded successfully', fileUrl, customer: updatedCustomer });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file.', error: error.message });
    }
};