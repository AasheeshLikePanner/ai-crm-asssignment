
import { supabase } from '../config/supabaseClient.js';

export const createCustomer = async (customerData) => {
    const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select();

    if (error) {
        console.error('Error creating customer:', error);
        throw new Error(error.message);
    }
    return data[0];
};

export const deleteCustomer = async (id) => {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting customer:', error);
        throw new Error(error.message);
    }
    return { success: true };
};

export const getCustomers = async () => {
    const { data, error } = await supabase
        .from('customers')
        .select('*');

    if (error) {
        console.error('Error fetching customers:', error);
        throw new Error(error.message);
    }
    return data;
};

export const updateCustomer = async (id, customerData, clientUpdatedAt) => {
    // First, fetch the current record from the database
    const { data: currentCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('updated_at')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching customer for update:', fetchError);
        throw new Error(fetchError.message);
    }

    // Optimistic locking check
    if (new Date(currentCustomer.updated_at).getTime() !== new Date(clientUpdatedAt).getTime()) {
        // Conflict detected
        const { data: conflictingCustomer, error: conflictFetchError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (conflictFetchError) {
            console.error('Error refetching conflicting customer data:', conflictFetchError);
            throw new Error(conflictFetchError.message);
        }

        const conflictError = new Error('Conflict: Customer data has been updated by someone else.');
        conflictError.status = 409; // Conflict
        conflictError.data = conflictingCustomer;
        throw conflictError;
    }


    // No conflict, proceed with the update
    const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating customer:', error);
        throw new Error(error.message);
    }
    return data[0];
};

export const addFileToCustomer = async (customerId, fileUrl) => {
    // Fetch the current customer to get existing files
    const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('files')
        .eq('id', customerId)
        .single();

    if (fetchError) {
        console.error('Error fetching customer files:', fetchError);
        throw new Error(fetchError.message);
    }

    const currentFiles = customer.files || [];
    const updatedFiles = [...currentFiles, fileUrl];

    // Update the customer with the new files array
    const { data, error: updateError } = await supabase
        .from('customers')
        .update({ files: updatedFiles })
        .eq('id', customerId)
        .select();

    if (updateError) {
        console.error('Error updating customer files:', updateError);
        throw new Error(updateError.message);
    }
    return data[0];
};
