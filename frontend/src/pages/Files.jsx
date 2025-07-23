import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import useCustomerStore from '@/store/customerStore';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { SearchIcon } from 'lucide-react';
import FileManagementDialog from '@/components/FileManagementDialog';

export default function Files() {
    const { customers, setCustomers } = useCustomerStore();
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isFileManagementDialogOpen, setIsFileManagementDialogOpen] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoadingCustomers(true);
                const response = await axios.get('http://localhost:8000/customers');
                const fetchedCustomers = response.data.map(customer => ({
                    ...customer,
                    createdAt: new Date(customer.created_at),
                    files: customer.files || [], 
                }));
                setCustomers(fetchedCustomers);
            } catch (err) {
                setFetchError('Failed to load customers.');
            } finally {
                setIsLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, [setCustomers]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = searchTerm === '' ||
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.company.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [customers, searchTerm]);

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer);
        setIsFileManagementDialogOpen(true);
    };

    if (isLoadingCustomers) {
        return <div className="p-6 text-center">Loading customers...</div>;
    }

    if (fetchError) {
        return <div className="p-6 text-center text-red-500">{fetchError}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Customer Files</h1>

            <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search customers by name, email, or company..."
                    className="pl-10 pr-4 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-auto rounded-xl border">
                <Table className="w-full">
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold text-foreground">Name</TableHead>
                            <TableHead className="font-semibold text-foreground">Email</TableHead>
                            <TableHead className="font-semibold text-foreground">Company</TableHead>
                            <TableHead className="font-semibold text-foreground">Files</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} onClick={() => handleCustomerClick(customer)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.company}</TableCell>
                                    <TableCell>{customer.files ? customer.files.length : 0}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">No customers found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedCustomer && (
                <FileManagementDialog
                    isOpen={isFileManagementDialogOpen}
                    onClose={() => setIsFileManagementDialogOpen(false)}
                    customer={selectedCustomer}
                    setCustomers={setCustomers} 
                />
            )}
        </div>
    );
}