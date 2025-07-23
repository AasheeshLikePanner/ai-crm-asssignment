import useCustomerStore from '@/store/customerStore';
import axios from 'axios';
import { CalendarIcon, SearchIcon, PlusCircle, Trash2, Mail, Phone, UserRound, Building, Settings } from 'lucide-react';
import AddCustomerDialog from '@/components/AddCustomerDialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import CustomerDetailsPanel from '@/components/CustomerDetailsPanel';

export default function Customers() {
    const { customers, setCustomers, addCustomer, deleteCustomer } = useCustomerStore();
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);

     useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoadingCustomers(true);
                const response = await axios.get('http://localhost:8000/customers');
                
                const fetchedCustomers = response.data.map(customer => ({
                    ...customer,
                    createdAt: new Date(customer.created_at),
                    
                interactions: customer.interaction_ids || [], 
                }));
                setCustomers(fetchedCustomers);
                
            } catch (err) {
                
                setFetchError('Failed to load customers.');
            } finally {
                setIsLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = searchTerm === '' ||
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm) ||
                customer.company.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDate = filterDate === null ||
                format(customer.createdAt, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd');

            return matchesSearch && matchesDate;
        });
    }, [customers, searchTerm, filterDate]);

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedCustomerIds(filteredCustomers.map(customer => customer.id));
        } else {
            setSelectedCustomerIds([]);
        }
    };

    const handleSelectCustomer = (customerId, checked) => {
        if (checked) {
            setSelectedCustomerIds(prev => [...prev, customerId]);
        } else {
            setSelectedCustomerIds(prev => prev.filter(id => id !== customerId));
        }
    };

    const handleDeleteClick = (customer) => {
        setCustomerToDelete(customer);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;

        setIsDeletingCustomer(true);
        try {
            await axios.delete(`http://localhost:8000/customers/${customerToDelete.id}`);
            deleteCustomer(customerToDelete.id);
            setIsDeleteDialogOpen(false);
            setCustomerToDelete(null);
            setSelectedCustomer(null); 
            setSelectedCustomerIds([]); 
            
        } catch (error) {
            
            
        } finally {
            setIsDeletingCustomer(false);
        }
    };

    const handleAddCustomer = async (newCustomerData) => {
        setIsAddingCustomer(true);
        try {
            const response = await axios.post('http://localhost:8000/customers', newCustomerData);

            const addedCustomer = response.data;
            addCustomer({ ...addedCustomer, createdAt: new Date(addedCustomer.created_at), interactions: [] });
            setIsAddCustomerDialogOpen(false);
            
        } catch (error) {
            
            
        } finally {
            setIsAddingCustomer(false);
        }
    };

    const isAllSelected = filteredCustomers.length > 0 && selectedCustomerIds.length === filteredCustomers.length;
    const isIndeterminate = selectedCustomerIds.length > 0 && selectedCustomerIds.length < filteredCustomers.length;

    return (
        <div className="flex h-full">
            
            <div className="flex flex-col w-1/2 space-y-6 border-r">
                <div className="p-6 space-y-6">
                    <h1 className="text-3xl font-bold">Customers</h1>

                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by name, email, phone, or company..."
                                className="pl-10 pr-4 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal rounded-xl",
                                        !filterDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filterDate ? format(filterDate, "PPP") : <span>Filter by date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filterDate}
                                    onSelect={setFilterDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={() => setIsAddCustomerDialogOpen(true)} className="flex items-center space-x-2 rounded-xl">
                            <PlusCircle className="h-5 w-5" />
                            <span>Add Customer</span>
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden flex-1 rounded-xl">
                    <Table className="w-full">
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-b">
                                <TableHead className="w-12 text-center">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead className="w-[200px] font-semibold text-foreground">Name</TableHead>
                                <TableHead className="font-semibold text-foreground"><Mail className="inline-block h-4 w-4 mr-2" />Email</TableHead>
                                <TableHead className="font-semibold text-foreground"><Phone className="inline-block h-4 w-4 mr-2" />Phone</TableHead>
                                <TableHead className="font-semibold text-foreground"><Building className="inline-block h-4 w-4 mr-2" />Company</TableHead>
                                <TableHead className="text-right font-semibold text-foreground"><Settings className="inline-block h-4 w-4 mr-2" />Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((customer) => (
                                <TableRow
                                    key={customer.id}
                                    onClick={() => setSelectedCustomer(customer)}
                                    className={cn(
                                        "cursor-pointer hover:bg-muted/30 transition-colors border-b",
                                        selectedCustomer?.id === customer.id && "bg-muted/50"
                                    )}
                                >
                                    <TableCell className="w-12 text-center">
                                        <Checkbox
                                            checked={selectedCustomerIds.includes(customer.id)}
                                            onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked)}
                                            aria-label={`Select ${customer.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium py-1">{customer.name}</TableCell>
                                    <TableCell className="py-1">{customer.email}</TableCell>
                                    <TableCell className="py-1">{customer.phone}</TableCell>
                                    <TableCell className="py-1">{customer.company}</TableCell>
                                    <TableCell className="text-right py-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleDeleteClick(customer);
                                            }}
                                            className="rounded-full text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            
            <CustomerDetailsPanel
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                customers={customers}
                setCustomers={setCustomers}
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                customerToDelete={customerToDelete}
                setCustomerToDelete={setCustomerToDelete}
                isDeletingCustomer={isDeletingCustomer}
                confirmDelete={confirmDelete}
            />

            <AddCustomerDialog
                isOpen={isAddCustomerDialogOpen}
                onClose={() => setIsAddCustomerDialogOpen(false)}
                onAddCustomer={handleAddCustomer}
            />
        </div>
    )
}