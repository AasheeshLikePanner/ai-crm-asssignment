import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useDashboardStore from '@/store/dashboardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Lightbulb } from 'lucide-react';

export default function Dashboard() {
    const { totalCustomers, totalDeals, winRate, topObjections, setMetrics } = useDashboardStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardMetrics = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('http://localhost:8000/dashboard');
                setMetrics(response.data);
            } catch (err) {
                console.error('Failed to fetch dashboard metrics:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardMetrics();
    }, [setMetrics]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full text-xl">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full text-xl text-red-500">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col p-8 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800">CRM Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCustomers}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDeals}</div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{winRate}%</div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Objections</CardTitle>
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <ul className="text-lg font-medium text-gray-800 list-disc pl-5">
                            {topObjections.map((objection, index) => (
                                <li key={index}>{objection}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}