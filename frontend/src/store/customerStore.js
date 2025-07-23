import { create } from 'zustand';

const useCustomerStore = create((set) => ({
    customers: [],
    setCustomers: (payload) => set((state) => {
        if (typeof payload === 'function') {
            return { customers: payload(state.customers) };
        } else {
            return { customers: payload };
        }
    }),
    addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
    updateCustomer: (updatedCustomer) =>
        set((state) => ({
            customers: state.customers.map((customer) =>
                customer.id === updatedCustomer.id ? updatedCustomer : customer
            ),
        })),
    deleteCustomer: (customerId) =>
        set((state) => ({
            customers: state.customers.filter((customer) => customer.id !== customerId),
        })),
}));

export default useCustomerStore;