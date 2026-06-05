import { createClient } from "@supabase/supabase-js";
import { formatLocalDate } from "../../utils/periodRange.js";
export const userScopeClient = (token) => {
    return createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    )
}

export const getActiveTarget = async (accessToken, userId) => {
    const client = userScopeClient(accessToken);
    
    const { data, error } = await client
        .from('target')
        .select("*")
        .eq("id_pengguna", userId)
        .eq("status", "on going")
        .single()
    if (error) {
        return { data: null, error}
    }

    return { data, error: null}
    
}