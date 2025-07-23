
import { Router } from 'express';
import { addCustomer, deleteCustomer, getCustomers, updateCustomer } from '../controllers/customerController.js';

const router = Router();

router.post('/', addCustomer);
router.delete('/:id', deleteCustomer);
router.get('/', getCustomers);
router.put('/:id', updateCustomer);

export default router;
