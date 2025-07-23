import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PlusCircle, SearchIcon, Trash2, Edit, DollarSign, UserRound, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import DealConflictResolutionDialog from '@/components/DealConflictResolutionDialog'; 

export default function Deals() {
    const [deals, setDeals] = useState([]);
    const [customers, setCustomers] = useState([]); 
    const [isLoadingDeals, setIsLoadingDeals] = useState(true);
    const [isSavingDeal, setIsSavingDeal] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
    const [conflictingData, setConflictingData] = useState(null);
    const [dealToUpdate, setDealToUpdate] = useState(null);

    useEffect(() => {
        const fetchDealsAndCustomers = async () => {
            try {
                setIsLoadingDeals(true);
                const [dealsResponse, customersResponse] = await Promise.all([
                    axios.get('http://localhost:8000/deals'),
                    axios.get('http://localhost:8000/customers') 
                ]);

                const fetchedDeals = dealsResponse.data.map(deal => ({
                    ...deal,
                    created_at: new Date(deal.created_at),
                    updated_at: new Date(deal.updated_at),
                }));
                setDeals(fetchedDeals);
                setCustomers(customersResponse.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setFetchError('Failed to load deals or customers.');
            } finally {
                setIsLoadingDeals(false);
            }
        };

        fetchDealsAndCustomers();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
    const [currentDeal, setCurrentDeal] = useState(null); 
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [dealToDelete, setDealToDelete] = useState(null);
    const [isDeletingDeal, setIsDeletingDeal] = useState(false);

    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const statuses = ['open', 'won', 'lost'];

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const customerName = deal.customers?.name || '';
            const customerEmail = deal.customers?.email || '';
            const ownerName = deal.users?.name || '';

            const matchesSearch = searchTerm === '' ||
                deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deal.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deal.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ownerName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [deals, searchTerm]);

    const handleAddDealClick = () => {
        setCurrentDeal(null); 
        setIsDealDialogOpen(true);
    };

    const handleEditDealClick = (deal) => {
        setCurrentDeal({ ...deal }); 
        setDealToUpdate(deal);
        setIsDealDialogOpen(true);
    };

    const handleDeleteClick = (deal) => {
        setDealToDelete(deal);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!dealToDelete) return;

        setIsDeletingDeal(true);
        try {
            await axios.delete(`http://localhost:8000/deals/${dealToDelete.id}`);
            setDeals(prev => prev.filter(d => d.id !== dealToDelete.id));
            setIsDeleteDialogOpen(false);
            setDealToDelete(null);
            console.log('Deal deleted:', dealToDelete.id);
        } catch (error) {
            console.error('Error deleting deal:', error);
            
        } finally {
            setIsDeletingDeal(false);
        }
    };

    const handleSaveDeal = async (e, force = false) => {
        e.preventDefault();
        setIsSavingDeal(true);
        const formData = new FormData(e.target);
        const dealData = {
            title: formData.get('title'),
            customer_id: formData.get('customer_id'),
            stage: formData.get('stage'),
            value: parseFloat(formData.get('value')),
            status: formData.get('status') || 'open', 
        };

        try {
            if (currentDeal) {
                
                const payload = {
                    dealData,
                    updated_at: force ? null : currentDeal.updated_at,
                };
                const response = await axios.put(`http://localhost:8000/deals/${currentDeal.id}`, payload);
                setDeals(prev => prev.map(d =>
                    d.id === currentDeal.id
                        ? { ...d, ...response.data, updated_at: new Date(response.data.updated_at) }
                        : d
                ));
                console.log('Deal updated:', response.data);
            } else {
                
                const response = await axios.post('http://localhost:8000/deals', dealData);
                setDeals(prev => [...prev, { ...response.data, created_at: new Date(response.data.created_at), updated_at: new Date(response.data.updated_at) }]);
                console.log('New deal added:', response.data);
            }
            setIsDealDialogOpen(false);
            setIsConflictDialogOpen(false);
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setConflictingData(error.response.data.data);
                setIsConflictDialogOpen(true);
            } else {
                console.error('Error saving deal:', error);
                
            }
        } finally {
            setIsSavingDeal(false);
        }
    };

    const handleForceUpdate = (e) => {
        handleSaveDeal(e, true); 
    };

    const handleDiscardChanges = () => {
        
        const latestDeal = deals.find(d => d.id === currentDeal.id);
        setCurrentDeal({ ...latestDeal });
        setIsConflictDialogOpen(false);
    };

    const getStageColorClass = (stage) => {
        switch (stage) {
            case 'lead': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'qualified': return 'bg-green-50 text-green-700 ring-green-600/20';
            case 'proposal': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
            case 'negotiation': return 'bg-purple-50 text-purple-700 ring-purple-600/20';
            case 'closed': return 'bg-gray-50 text-gray-700 ring-gray-600/20';
            default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    };

    const getStatusColorClass = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-500 text-white';
            case 'won': return 'bg-green-500 text-white';
            case 'lost': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="flex flex-col flex-1 p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-900">Deals Overview</h1>
                <Button onClick={handleAddDealClick} className="flex items-center space-x-2 px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 bg-black text-white hover:bg-gray-800">
                    <PlusCircle className="h-5 w-5" />
                    <span>Add New Deal</span>
                </Button>
            </div>

            <div className="relative shadow-sm rounded-xl overflow-hidden">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search deals by title, stage, status, or customer..."
                    className="pl-12 pr-4 py-3 border-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg rounded-xl shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <Table className="w-full">
                    <TableHeader className="bg-gray-100">
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated At</TableHead>
                            <TableHead className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDeals.length > 0 ? (
                            filteredDeals.map((deal) => {
                                return (
                                    <TableRow key={deal.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                                        <TableCell className="px-6 py-4 font-medium text-gray-900">{deal.title}</TableCell>
                                        <TableCell className="px-6 py-4">
                                            {deal.customers ? (
                                                <div>
                                                    <p className="font-medium text-gray-800">{deal.customers.name}</p>
                                                    <p className="text-sm text-gray-500">{deal.customers.email}</p>
                                                </div>
                                            ) : <span className="text-gray-500">N/A</span>}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset", getStageColorClass(deal.stage))}>
                                                {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="flex items-center text-gray-800">
                                                <DollarSign className="h-4 w-4 mr-1 text-green-600" />{deal.value.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", getStatusColorClass(deal.status))}>
                                                {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="flex items-center text-gray-800">
                                                <UserRound className="h-4 w-4 mr-1 text-gray-500" />{deal.users?.name || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600">{format(deal.created_at, 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600">{format(deal.updated_at, 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditDealClick(deal)}
                                                className="rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 mr-2"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(deal)}
                                                className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="px-6 py-12 text-center text-lg text-gray-500">
                                    No deals found. Try adjusting your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            
            <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
                <DialogContent className="sm:max-w-[480px] p-6 rounded-xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900">{currentDeal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            {currentDeal ? 'Update the details for this deal.' : 'Enter the details for the new deal.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveDeal} className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right text-gray-700 font-medium">
                                Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={currentDeal?.title || ''}
                                className="col-span-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer_id" className="text-right text-gray-700 font-medium">
                                Customer
                            </Label>
                            <Select name="customer_id" defaultValue={currentDeal?.customer_id || ''} required>
                                <SelectTrigger className="col-span-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg shadow-lg">
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id} className="hover:bg-gray-100">
                                            {customer.name} ({customer.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stage" className="text-right text-gray-700 font-medium">
                                Stage
                            </Label>
                            <Select name="stage" defaultValue={currentDeal?.stage || ''} required>
                                <SelectTrigger className="col-span-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                    <SelectValue placeholder="Select a stage" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg shadow-lg">
                                    {stages.map(stage => (
                                        <SelectItem key={stage} value={stage} className="hover:bg-gray-100">
                                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="value" className="text-right text-gray-700 font-medium">
                                Value
                            </Label>
                            <Input
                                id="value"
                                name="value"
                                type="number"
                                step="0.01"
                                defaultValue={currentDeal?.value || ''}
                                className="col-span-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right text-gray-700 font-medium">
                                Status
                            </Label>
                            <Select name="status" defaultValue={currentDeal?.status || ''} required>
                                <SelectTrigger className="col-span-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg shadow-lg">
                                    {statuses.map(status => (
                                        <SelectItem key={status} value={status} className="hover:bg-gray-100">
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDealDialogOpen(false)} className="rounded-full px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-100">Cancel</Button>
                            <Button type="submit" className="rounded-full px-6 py-2 bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300" disabled={isSavingDeal}>
                                {isSavingDeal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentDeal ? (isSavingDeal ? 'Saving...' : 'Save Changes') : (isSavingDeal ? 'Adding...' : 'Add Deal')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] p-6 rounded-xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900">Delete Deal</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Are you sure you want to delete the deal "<span className="font-semibold">{dealToDelete?.title}</span>"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-full px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-100">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="rounded-full px-6 py-2 bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-300" disabled={isDeletingDeal}>
                            {isDeletingDeal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isDeletingDeal ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <DealConflictResolutionDialog
                isOpen={isConflictDialogOpen}
                onClose={() => setIsConflictDialogOpen(false)}
                onForceUpdate={handleForceUpdate}
                onDiscardChanges={handleDiscardChanges}
                yourChanges={currentDeal}
                serverChanges={conflictingData}
                isSaving={isSavingDeal}
            />
        </div>
    );
}