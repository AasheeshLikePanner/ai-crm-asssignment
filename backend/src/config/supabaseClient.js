import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

class SupabaseClient {
    constructor() {
        if (SupabaseClient.instance) {
            return SupabaseClient.instance;
        }
        this.client = createClient(supabaseUrl, supabaseKey);
        SupabaseClient.instance = this;
    }

    getInstance() {
        return this.client;
    }
}

export const supabase = new SupabaseClient().getInstance();