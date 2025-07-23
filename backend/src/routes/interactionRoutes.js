
import { Router } from 'express';
import { addInteraction, updateInteraction, getInteractionsByIds, getAllInteractions } from '../controllers/interactionController.js';

const router = Router();

router.post('/', addInteraction);
router.put('/:id', updateInteraction);
router.post('/batch', getInteractionsByIds);
router.get('/', getAllInteractions);


export default router;
