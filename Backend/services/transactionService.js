import { createClient } from "@supabase/supabase-js";

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

const buildError = (message) => ({ data: null, error: { message } });

const isDateBeforeNow = (dateString, now) => {
    const time = Date.parse(dateString);
    if (Number.isNaN(time)) {
        return false;
    }
    return time < now.getTime();
};

const isTargetActive = (target, now) => {
    if (!target) return false;
    return target.status === "on going" && !isDateBeforeNow(target.deadline, now);
};

const isTargetLocked = (target, remaining, now) => {
    if (!target) return false;
    if (target.status === "finished" || target.status === "overdue") {
        return true;
    }
    return isDateBeforeNow(target.deadline, now) && remaining > 0;
};

const getTargetById = async (client, userId, targetId) => {
    return await client
        .from("target")
        .select("id_target, id_pengguna, status, deadline, nominal_target")
        .eq("id_pengguna", userId)
        .eq("id_target", targetId)
        .single();
};

const getActiveTarget = async (client, userId, now) => {
    return await client
        .from("target")
        .select("id_target, id_pengguna, status, deadline, nominal_target")
        .eq("id_pengguna", userId)
        .eq("status", "on going")
        .gte("deadline", now.toISOString())
        .order("deadline", { ascending: true })
        .limit(1)
        .single();
};

const getTabunganTotalForTarget = async (client, userId, targetId) => {
    const { data, error } = await client
        .from("transaksi")
        .select("nominal")
        .eq("id_pengguna", userId)
        .eq("id_target", targetId)
        .eq("jenis_transaksi", "tabungan");

    if (error) {
        return { total: 0, error };
    }

    const total = (data || []).reduce((sum, row) => sum + (row.nominal || 0), 0);
    return { total, error: null };
};

const resolveTabunganTarget = async (client, userId, payload, now) => {
    let targetId = payload.id_target || null;
    let targetResponse;

    if (targetId) {
        targetResponse = await getTargetById(client, userId, targetId);
    } else {
        targetResponse = await getActiveTarget(client, userId, now);
        targetId = targetResponse.data?.id_target || null;
    }

    if (targetResponse.error || !targetResponse.data) {
        return buildError("Target aktif tidak ditemukan");
    }

    const target = targetResponse.data;
    if (!isTargetActive(target, now)) {
        return buildError("Target tidak aktif atau sudah lewat deadline");
    }

    const { total, error } = await getTabunganTotalForTarget(client, userId, target.id_target);
    if (error) {
        return { data: null, error };
    }

    const remaining = target.nominal_target - total;
    if (payload.nominal > remaining) {
        return buildError("Nominal melebihi sisa target");
    }

    return { data: { target, remaining }, error: null };
};

const getTransaksiById = async (client, userId, transaksiId) => {
    return await client
        .from("transaksi")
        .select("*")
        .eq("id_pengguna", userId)
        .eq("id_transaksi", transaksiId)
        .single();
};

// TODO: Implement insert transaction with user_id.
export const createTransaksi = async (accessToken, userId, payload) => {
    const client = userScopeClient(accessToken);
    const now = new Date();

    if (payload.jenis_transaksi === "tabungan") {
        const targetCheck = await resolveTabunganTarget(client, userId, payload, now);
        if (targetCheck.error) {
            return targetCheck;
        }
        const targetId = targetCheck.data.target.id_target;
        payload = { ...payload, id_target: targetId };
    }

    return client
        .from("transaksi")
        .insert({
            ...payload,
            id_pengguna: userId,
        })
        .select("*")
        .maybeSingle();
};

// TODO: Implement update transaction by id_transaksi + user_id.
export const updateTransaksi = async (accessToken, userId, transaksiId, payload) => {
    const client = userScopeClient(accessToken);
    const now = new Date();

    const existing = await getTransaksiById(client, userId, transaksiId);
    if (existing.error || !existing.data) {
        return { data: null, error: existing.error || { message: "Transaksi tidak ditemukan" } };
    }

    const effective = {
        ...existing.data,
        ...payload,
    };

    if (effective.jenis_transaksi === "tabungan") {
        const targetCheck = await resolveTabunganTarget(client, userId, effective, now);
        if (targetCheck.error) {
            return targetCheck;
        }
        const targetId = targetCheck.data.target.id_target;
        payload = { ...payload, id_target: targetId };
    }

    return client
        .from("transaksi")
        .update(payload)
        .eq("id_pengguna", userId)
        .eq("id_transaksi", transaksiId)
        .select("*")
        .maybeSingle();
};

// TODO: Implement delete transaction by id_transaksi + user_id.
export const deleteTransaksi = async (accessToken, userId, transaksiId) => {
    const client = userScopeClient(accessToken);
    const now = new Date();

    const existing = await getTransaksiById(client, userId, transaksiId);
    if (existing.error || !existing.data) {
        return { data: null, error: existing.error || { message: "Transaksi tidak ditemukan" } };
    }

    if (existing.data.jenis_transaksi === "tabungan" && existing.data.id_target) {
        const targetResponse = await getTargetById(client, userId, existing.data.id_target);
        if (targetResponse.error || !targetResponse.data) {
            return { data: null, error: targetResponse.error || { message: "Target tidak ditemukan" } };
        }

        const { total, error } = await getTabunganTotalForTarget(client, userId, existing.data.id_target);
        if (error) {
            return { data: null, error };
        }

        const remaining = targetResponse.data.nominal_target - total;
        if (isTargetLocked(targetResponse.data, remaining, now)) {
            return buildError("Tidak dapat menghapus transaksi tabungan dari target yang sudah selesai");
        }
    }

    return client
        .from("transaksi")
        .delete()
        .eq("id_pengguna", userId)
        .eq("id_transaksi", transaksiId)
        .select("id_transaksi")
        .maybeSingle();
};

// TODO: Implement summary by period (aggregate total per period).
export const getSummaryByPeriod = async (accessToken, userId, start, end) => {
    const client = userScopeClient(accessToken);
    const { data, error } = await client
        .from("transaksi")
        .select("nominal, jenis_transaksi")
        .eq("id_pengguna", userId)
        .gte("tanggal_transaksi", start)
        .lte("tanggal_transaksi", end);

    if (error) {
        return { data: null, error };
    }

    const summary = {
        pemasukan: 0,
        pengeluaran: 0,
        tabungan: 0,
        total: 0,
    };

    for (const row of data || []) {
        const nominal = row.nominal || 0;
        summary.total += nominal;
        if (row.jenis_transaksi === "pemasukan") summary.pemasukan += nominal;
        if (row.jenis_transaksi === "pengeluaran") summary.pengeluaran += nominal;
        if (row.jenis_transaksi === "tabungan") summary.tabungan += nominal;
    }

    return { data: summary, error: null };
};

// TODO: Implement category total by period.
export const getCategoryTotalByPeriod = async (accessToken, userId, idKategori, start, end) => {
    const client = userScopeClient(accessToken);
    const { data, error } = await client
        .from("transaksi")
        .select("nominal")
        .eq("id_pengguna", userId)
        .eq("id_kategori", idKategori)
        .eq("jenis_transaksi", "pengeluaran")
        .gte("tanggal_transaksi", start)
        .lte("tanggal_transaksi", end);

    if (error) {
        return { data: null, error };
    }

    const total = (data || []).reduce((sum, row) => sum + (row.nominal || 0), 0);
    return { data: { total, count: (data || []).length }, error: null };
};

