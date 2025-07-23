import { create } from 'zustand';

const useDashboardStore = create((set) => ({
    totalCustomers: 0,
    totalDeals: 0,
    winRate: 0,
    topObjections: [],
    setMetrics: (metrics) => set(metrics),
}));

export default useDashboardStore;