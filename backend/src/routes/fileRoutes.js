import { Router } from 'express';
import { uploadFile } from '../controllers/fileController.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);

export default router;
