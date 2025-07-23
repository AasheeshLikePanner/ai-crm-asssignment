
import { supabase } from '../config/supabaseClient.js';

export const getDashboardMetrics = async () => {
    try {
        // Total Customers
        const { count: totalCustomers, error: customerError } = await supabase
            .from('customers')
            .select('id', { count: 'exact' });

        if (customerError) throw customerError;

        // Total Deals
        const { count: totalDeals, error: dealError } = await supabase
            .from('deals')
            .select('id', { count: 'exact' });

        if (dealError) throw dealError;

        // Win Rate
        const { count: wonDeals, error: wonDealsError } = await supabase
            .from('deals')
            .select('id', { count: 'exact' })
            .eq('status', 'won');

        if (wonDealsError) throw wonDealsError;

        const winRate = totalDeals > 0 ? (wonDeals / totalDeals * 100).toFixed(2) : 0;

        // Top Objections (Placeholder for now, as no specific field exists)
        const topObjections = ["Pricing", "Lack of integration"]; // Example placeholders

        return {
            totalCustomers,
            totalDeals,
            winRate: parseFloat(winRate),
            topObjections,
        };
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw new Error('Failed to fetch dashboard metrics: ' + error.message);
    }
};
