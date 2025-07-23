import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { SearchIcon } from 'lucide-react';

export default function Interactions() {
    const [interactions, setInteractions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                const interactionsResponse = await axios.get('http://localhost:8000/interactions');
                setInteractions(interactionsResponse.data);

                
                const customersResponse = await axios.get('http://localhost:8000/customers');
                setCustomers(customersResponse.data);

            } catch (err) {
                console.error('Failed to fetch data:', err);
                setFetchError('Failed to load interactions or customer data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown Customer';
    };

    const getCustomerEmail = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.email : 'Unknown Email';
    };

    const filteredInteractions = useMemo(() => {
        if (!searchTerm) {
            return interactions;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return interactions.filter(interaction => {
            const customerName = getCustomerName(interaction.customer_id).toLowerCase();
            const customerEmail = getCustomerEmail(interaction.customer_id).toLowerCase();
            const interactionContent = interaction.content ? interaction.content.toLowerCase() : '';
            const interactionType = interaction.type ? interaction.type.toLowerCase() : '';

            return customerName.includes(lowerCaseSearchTerm) ||
                   customerEmail.includes(lowerCaseSearchTerm) ||
                   interactionContent.includes(lowerCaseSearchTerm) ||
                   interactionType.includes(lowerCaseSearchTerm);
        });
    }, [interactions, customers, searchTerm]);

    if (isLoading) {
        return <div className="p-6 text-center">Loading interactions...</div>;
    }

    if (fetchError) {
        return <div className="p-6 text-center text-red-500">{fetchError}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Interactions</h1>

            <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search by customer name, email, interaction content, or type..."
                    className="pl-10 pr-4 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-auto rounded-xl border">
                <Table className="w-full">
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold text-foreground">Customer Name</TableHead>
                            <TableHead className="font-semibold text-foreground">Customer Email</TableHead>
                            <TableHead className="font-semibold text-foreground">Type</TableHead>
                            <TableHead className="font-semibold text-foreground">Content</TableHead>
                            <TableHead className="font-semibold text-foreground">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInteractions.length > 0 ? (
                            filteredInteractions.map((interaction) => (
                                <TableRow key={interaction.id}>
                                    <TableCell>{getCustomerName(interaction.customer_id)}</TableCell>
                                    <TableCell>{getCustomerEmail(interaction.customer_id)}</TableCell>
                                    <TableCell>{interaction.type}</TableCell>
                                    <TableCell className="max-w-xs truncate">{interaction.content}</TableCell>
                                    <TableCell>{new Date(interaction.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">No interactions found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}