import * as customerService from '../services/customerService.js';

export const addCustomer = async (req, res) => {
    try {
        const newCustomer = await customerService.createCustomer(req.body);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await customerService.deleteCustomer(id);
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await customerService.getCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerData, updated_at } = req.body;

        if (!updated_at) {
            return res.status(400).json({ message: 'Conflict check failed: The client did not provide the required `updated_at` timestamp.' });
        }

        const updatedCustomer = await customerService.updateCustomer(id, customerData, updated_at);
        res.status(200).json(updatedCustomer);
    } catch (error) {
        if (error.status === 409) {
            return res.status(409).json({ 
                message: error.message,
                data: error.data
            });
        }
        res.status(500).json({ message: error.message });
    }
};