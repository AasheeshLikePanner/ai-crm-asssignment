import { Router } from 'express';
import { addDeal, getDeals, updateDeal, deleteDeal } from '../controllers/dealController.js';

const router = Router();

router.post('/', addDeal);
router.get('/', getDeals);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;