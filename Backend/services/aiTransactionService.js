import { createClient } from "@supabase/supabase-js";
import { createTransaksi } from "./transactionService.js";

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

export const createTransaksiPredict = async (accessToken, userId, payload) => {
    const client = userScopeClient(accessToken);
    const { data, error } = await client
        .from("transaksi_ai")
        .insert({
            raw_text: payload.raw_text,
            clean_text: payload.clean_text,
            jenis_transaksi: payload.jenis_transaksi,
            id_kategori: payload.id_kategori,
            nominal: payload.nominal,
            tanggal_transaksi: payload.tanggal_transaksi,
            input_source: payload.input_source,
            prediction_source: payload.prediction_source,
            jenis_confidence: payload.jenis_confidence,
            kategori_confidence: payload.kategori_confidence,
            ai_metadata: payload.ai_metadata || {},
            status: "pending",
            id_transaksi: null,
            id_pengguna: userId
        })
        .select()
        .single();
        if(error){
            return { data: null, error}
        }
        return { data, error: null}
}

export const confirmTransaksiPredict = async (accessToken, userId, payload) => {
    const client = userScopeClient(accessToken);
    const transaksiPayload = {
        nama_transaksi: payload.nama_transaksi,
        nominal: payload.nominal,
        tanggal_transaksi: payload.tanggal_transaksi,
        jenis_transaksi: payload.jenis_transaksi,
        id_kategori: payload.id_kategori,
        nama_toko: payload.nama_toko || null,
        deskripsi: payload.deskripsi || null,
        id_target: payload.id_target || null
    };    
    const transaksiResult = await createTransaksi(accessToken, userId, transaksiPayload);
    if(transaksiResult.error){
        return { data: null, error: transaksiResult.error };
    }

    const { data, error } = await client
        .from("transaksi_ai")
        .update({
            id_transaksi: transaksiResult.data.id_transaksi,
            status: "confirmed"
        })
        .eq("id_transaksi_ai", payload.id_transaksi_ai)
        .select()
        .single()
    if(error){
        return { data: null, error}
    }
    return { data, error: null}
    
}
export const rejectTransactionPredict = async (accessToken, userId, idTransaksiAi ) => {
    const client = userScopeClient(accessToken);

    const { data, error } = await client
        .from("transaksi_ai")
        .update({
            status: "rejected"
        })
        .eq("id_transaksi_ai", idTransaksiAi)
        .eq("id_pengguna", userId)
        .select()
        .maybeSingle();

    if (error) {
        return { data: null, error };
    }

    if (!data) {
        return {
            data: null,
            error: new Error("Transaksi tidak ditemukan")
        };
    }

    return { data, error: null };
};