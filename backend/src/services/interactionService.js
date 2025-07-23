
import { supabase } from '../config/supabaseClient.js';

const USER_ID = '7cffc0ea-0966-4bc5-9fba-1bbb453f8703'; // Hardcoded user ID

export const createInteraction = async (interactionData) => {
    const { data: newInteraction, error: interactionError } = await supabase
        .from('interactions')
        .insert([{ ...interactionData, user_id: USER_ID}])
        .select();

    if (interactionError) {
        console.error('Error creating interaction:', interactionError);
        throw new Error(interactionError.message);
    }

    // Update customer's interaction_ids
    const { data: customerData, error: fetchCustomerError } = await supabase
        .from('customers')
        .select('interaction_ids')
        .eq('id', newInteraction[0].customer_id)
        .single();

    if (fetchCustomerError) {
        console.error('Error fetching customer for interaction_ids update:', fetchCustomerError);
        throw new Error(fetchCustomerError.message);
    }

    const currentInteractionIds = customerData.interaction_ids || [];
    const updatedInteractionIds = [...currentInteractionIds, newInteraction[0].id];

    const { error: updateCustomerError } = await supabase
        .from('customers')
        .update({ interaction_ids: updatedInteractionIds })
        .eq('id', newInteraction[0].customer_id);

    if (updateCustomerError) {
        console.error('Error updating customer interaction_ids:', updateCustomerError);
        throw new Error(updateCustomerError.message);
    }

    return newInteraction[0];
};

export const updateInteraction = async (id, interactionData) => {
    const { data, error } = await supabase
        .from('interactions')
        .update(interactionData)
        .eq('id', id)
        .select();

    return data[0];
};





export const getInteractionsByIds = async (interactionIds) => {
    const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .in('id', interactionIds)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching interactions by IDs:', error);
        throw new Error(error.message);
    }
    return data;
};

export const updateCustomerAIResults = async (customerId, aiResults) => {
    const { data, error } = await supabase
        .from('customers')
        .update(aiResults)
        .eq('id', customerId)
        .select();

    if (error) {
        console.error('Error updating customer with AI results:', error);
        throw new Error(error.message);
    }
    return data[0];
};

export const getCustomerAIProfile = async (customerId) => {
    const { data, error } = await supabase
        .from('customers')
        .select('preferences, objections, buying_signals', 'confidence_score')
        .eq('id', customerId)
        .single();

    if (error) {
        console.error('Error fetching customer AI profile:', error);
        throw new Error(error.message);
    }
    return data;
};

export const getAllInteractions = async () => {
    const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all interactions:', error);
        throw new Error(error.message);
    }
    return data;
};
