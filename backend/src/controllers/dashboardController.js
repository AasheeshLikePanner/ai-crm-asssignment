import * as dashboardService from '../services/dashboardService.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const metrics = await dashboardService.getDashboardMetrics();
        res.status(200).json(metrics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};