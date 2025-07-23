import * as dealService from '../services/dealService.js';

export const addDeal = async (req, res) => {
    try {
        const newDeal = await dealService.createDeal(req.body);
        res.status(201).json(newDeal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDeals = async (req, res) => {
    try {
        const deals = await dealService.getDeals();
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { dealData, updated_at } = req.body;

        
        if (!updated_at) {
            return res.status(400).json({ message: 'Conflict check failed: The client did not provide the required `updated_at` timestamp.' });
        }

        const updatedDeal = await dealService.updateDeal(id, dealData, updated_at);
        res.status(200).json(updatedDeal);
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

export const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        await dealService.deleteDeal(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};