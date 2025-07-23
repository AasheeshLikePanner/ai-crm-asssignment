
import { supabase } from '../config/supabaseClient.js';

const USER_ID = '7cffc0ea-0966-4bc5-9fba-1bbb453f8703'; // Hardcoded user ID for owner_id

export const createDeal = async (dealData) => {
    const { data, error } = await supabase
        .from('deals')
        .insert([{ ...dealData, owner_id: USER_ID }])
        .select();

    if (error) {
        console.error('Error creating deal:', error);
        throw new Error(error.message);
    }
    return data[0];
};

export const getDeals = async () => {
    const { data, error } = await supabase
        .from('deals')
        .select('*, customers(name, email), users(name)');

    if (error) {
        console.error('Error fetching deals:', error);
        throw new Error(error.message);
    }
    return data;
};

export const updateDeal = async (id, dealData, clientUpdatedAt) => {
    // First, fetch the current record from the database
    const { data: currentDeal, error: fetchError } = await supabase
        .from('deals')
        .select('updated_at')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching deal for update:', fetchError);
        throw new Error(fetchError.message);
    }

    // Optimistic locking check
    // If clientUpdatedAt is not provided, we are forcing the update (last-write-wins)
    if (clientUpdatedAt && new Date(currentDeal.updated_at).getTime() !== new Date(clientUpdatedAt).getTime()) {
        // Conflict detected
        const { data: conflictingDeal, error: conflictFetchError } = await supabase
            .from('deals')
            .select('*, customers(name, email), users(name)') // Also fetch related data
            .eq('id', id)
            .single();

        if (conflictFetchError) {
            console.error('Error refetching conflicting deal data:', conflictFetchError);
            throw new Error(conflictFetchError.message);
        }

        const conflictError = new Error('Conflict: Deal data has been updated by someone else.');
        conflictError.status = 409; // Conflict
        conflictError.data = conflictingDeal;
        throw conflictError;
    }

    // No conflict or forced update, proceed
    const { data, error } = await supabase
        .from('deals')
        .update(dealData)
        .eq('id', id)
        .select('*, customers(name, email), users(name)'); // Also fetch related data

    if (error) {
        console.error('Error updating deal:', error);
        throw new Error(error.message);
    }
    return data[0];
};

export const deleteDeal = async (id) => {
    const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting deal:', error);
        throw new Error(error.message);
    }
    return { success: true };
};
