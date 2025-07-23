
import * as interactionService from '../services/interactionService.js';
import { addInteractionToAIQueue } from '../aiProcessor.js';

export const addInteraction = async (req, res) => {
    try {
        const newInteraction = await interactionService.createInteraction(req.body);
        addInteractionToAIQueue(newInteraction);
        res.status(201).json(newInteraction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateInteraction = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInteraction = await interactionService.updateInteraction(id, req.body);
        res.status(200).json(updatedInteraction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInteractionsByIds = async (req, res) => {
    try {
        const { interactionIds } = req.body;
        if (!Array.isArray(interactionIds) || interactionIds.length === 0) {
            return res.status(400).json({ message: 'interactionIds must be a non-empty array.' });
        }
        const interactions = await interactionService.getInteractionsByIds(interactionIds);
        res.status(200).json(interactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllInteractions = async (req, res) => {
    try {
        const interactions = await interactionService.getAllInteractions();
        res.status(200).json(interactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


