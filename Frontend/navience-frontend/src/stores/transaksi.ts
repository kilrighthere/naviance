import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/services/supabase";
import type { Transaksi, JenisTransaksi } from "@/types/transaksi";
import axios from "axios";

const API_BASE = "https://naviance-production-5ff4.up.railway.app/api/v1";

// Helper untuk ambil access token terbaru dari Supabase session
const getAccessToken = async (): Promise<string> => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) {
        throw new Error("Sesi tidak valid, silakan login ulang.");
    }
    return data.session.access_token;
};

// Axios instance dengan base config
const apiClient = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// Build request body tanpa id_pengguna — backend ambil dari JWT
const buildRequestBody = (p: Partial<Transaksi>) => ({
    id_target: p.id_target ?? null,
    nama_transaksi: p.nama_transaksi ?? null,
    tanggal_transaksi: p.tanggal_transaksi,
    nominal: p.nominal,
    jenis_transaksi: p.jenis_transaksi,
    nama_toko: p.nama_toko ?? null,
    deskripsi: p.deskripsi ?? null,
    id_kategori: p.id_kategori,
});

export const useTransaksiStore = defineStore('transaksi', () => {
    const items = ref<Transaksi[]>([]);
    const selected = ref<Transaksi | null>(null);
    const payload = ref<Partial<Transaksi>>({
        id_pengguna: '',
        id_target: null,
        nama_transaksi: null,
        tanggal_transaksi: '',
        nominal: 0,
        jenis_transaksi: 'pengeluaran' as JenisTransaksi,
        nama_toko: null,
        deskripsi: null,
        id_kategori: ''
    });
    const isLoading = ref(false);
    const storeError = ref<string | null>(null);
    const searchQuery = ref('');
    const filterCategory = ref('');
    const filterTimeRange = ref('');
    const sortNominal = ref<'asc' | 'desc' | ''>('');

    // ─── Getters ────────────────────────────────────────────────────────────────

    const hasItems = computed(() => items.value.length > 0);

    const totalNominal = computed(() =>
        items.value.reduce((sum, item) => sum + item.nominal, 0)
    );

    const transaksiByJenis = computed(() =>
        items.value.reduce<Record<string, Transaksi[]>>((result, item) => {
            const key = item.jenis_transaksi;
            if (!result[key]) result[key] = [];
            result[key].push(item);
            return result;
        }, {})
    );

    const filteredItems = computed(() => {
        const keyword = searchQuery.value.trim().toLowerCase();
        let list = items.value;

        if (filterCategory.value) {
            list = list.filter(item => item.id_kategori === filterCategory.value);
        }

        if (filterTimeRange.value) {
            const now = new Date();
            if (filterTimeRange.value === '7d') {
                const limit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                list = list.filter(item => new Date(item.tanggal_transaksi) >= limit);
            } else if (filterTimeRange.value === '30d') {
                const limit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                list = list.filter(item => new Date(item.tanggal_transaksi) >= limit);
            } else if (filterTimeRange.value === 'this_month') {
                const ym = now.toISOString().slice(0, 7);
                list = list.filter(item => item.tanggal_transaksi.startsWith(ym));
            }
        }

        if (!keyword) return list;

        return list.filter(item => {
            const nama = item.nama_transaksi?.toLowerCase() ?? '';
            const deskripsi = item.deskripsi?.toLowerCase() ?? '';
            return nama.includes(keyword) || deskripsi.includes(keyword);
        });
    });

    const sortedItems = computed(() => {
        const list = [...filteredItems.value];
        if (!sortNominal.value) {
            return list.sort((a, b) => {
                const dateDiff = new Date(b.tanggal_transaksi).getTime() - new Date(a.tanggal_transaksi).getTime();
                if (dateDiff !== 0) return dateDiff;
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                return 0;
            });
        }
        return list.sort((a, b) =>
            sortNominal.value === 'asc' ? a.nominal - b.nominal : b.nominal - a.nominal
        );
    });

    const pengeluaranByKategoriBulanAktif = computed(() => {
        const ym = new Date().toISOString().slice(0, 7);
        const map = new Map<string, number>();
        for (const item of items.value) {
            if (item.jenis_transaksi !== 'pengeluaran') continue;
            if (item.tanggal_transaksi.slice(0, 7) !== ym) continue;
            map.set(item.id_kategori, (map.get(item.id_kategori) ?? 0) + item.nominal);
        }
        return map;
    });

    type ApexRingkasanBulanan = {
        categories: string[];
        yearMarkers: { index: number; year: number }[];
        series: { name: string; data: number[] }[];
    };

    const ringkasan6BulanApex = computed<ApexRingkasanBulanan>(() => {
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, index) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
            const year = d.getFullYear();
            const monthNumber = String(d.getMonth() + 1).padStart(2, '0');
            return {
                key: `${year}-${monthNumber}`,
                label: d.toLocaleString('id-ID', { month: 'short' }),
                year
            };
        });

        const map = new Map<string, { pemasukan: number; pengeluaran: number }>();
        months.forEach(m => map.set(m.key, { pemasukan: 0, pengeluaran: 0 }));

        for (const item of items.value) {
            const row = map.get(item.tanggal_transaksi.slice(0, 7));
            if (!row) continue;
            if (item.jenis_transaksi === 'pemasukan') row.pemasukan += item.nominal;
            else if (item.jenis_transaksi === 'pengeluaran') row.pengeluaran += item.nominal;
        }

        const yearMarkers = months.reduce<{ index: number; year: number }[]>((acc, m, i) => {
            const prevYear = i === 0 ? null : months[i - 1]?.year ?? null;
            if (prevYear !== m.year) acc.push({ index: i, year: m.year });
            return acc;
        }, []);

        return {
            categories: months.map(m => m.label),
            yearMarkers,
            series: [
                { name: 'Pemasukan', data: months.map(m => map.get(m.key)?.pemasukan ?? 0) },
                { name: 'Pengeluaran', data: months.map(m => map.get(m.key)?.pengeluaran ?? 0) },
            ],
        };
    });

    // ─── Setters ────────────────────────────────────────────────────────────────

    const setLoading = (value: boolean) => { isLoading.value = value; };
    const setError = (value: string | null) => { storeError.value = value; };
    const setSearchQuery = (value: string) => { searchQuery.value = value; };
    const setSortNominal = (value: 'asc' | 'desc' | '') => { sortNominal.value = value; };
    const setPayload = (value: Partial<Transaksi>) => { payload.value = { ...payload.value, ...value }; };

    const resetPayload = () => {
        payload.value = {
            id_pengguna: '',
            id_target: null,
            nama_transaksi: null,
            tanggal_transaksi: '',
            nominal: 0,
            jenis_transaksi: 'pengeluaran' as JenisTransaksi,
            nama_toko: null,
            deskripsi: null,
            id_kategori: ''
        };
    };

    const validatePayload = (value: Partial<Transaksi>): string | null => {
        if (!value.tanggal_transaksi) return 'Tanggal transaksi wajib diisi.';
        if (Number.isNaN(Date.parse(value.tanggal_transaksi))) return 'Format tanggal transaksi tidak valid.';
        if (!value.id_kategori) return 'Kategori wajib dipilih.';
        if (value.nominal === undefined || value.nominal === null) return 'Nominal wajib diisi.';
        if (typeof value.nominal !== 'number' || value.nominal <= 0) return 'Nominal harus lebih dari 0.';
        if (!value.jenis_transaksi) return 'Jenis transaksi wajib dipilih.';
        if (!value.nama_transaksi || value.nama_transaksi.trim().length < 3) return 'Nama transaksi wajib diisi (minimal 3 karakter).';
        if (!value.deskripsi || value.deskripsi.trim().length === 0) return 'Deskripsi wajib diisi.';
        return null;
    };

    // ─── Actions: Fetch (tetap Supabase) ────────────────────────────────────────

    async function fetchAll(userId: string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('transaksi')
                .select('*')
                .eq('id_pengguna', userId);

            if (error) { setError(error.message); throw error; }
            items.value = data;
        } catch (error) {
            if (!storeError.value && error instanceof Error) setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function fetchById(userId: string, transaksiId: string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('transaksi')
                .select('*')
                .eq('id_pengguna', userId)
                .eq('id_transaksi', transaksiId)
                .single();

            if (error) { setError(error.message); throw error; }
            selected.value = data;
        } catch (error) {
            if (!storeError.value && error instanceof Error) setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // ─── Actions: Mutasi (via REST API backend) ──────────────────────────────────

    async function createTransaksi(userId: string, transaksiPayload: Partial<Transaksi>) {
        setLoading(true);
        setError(null);

        const validationError = validatePayload(transaksiPayload);
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const token = await getAccessToken();
            const { data } = await apiClient.post<Transaksi>(
                "/transactions",
                buildRequestBody(transaksiPayload),
                { headers: { Authorization: `Bearer ${token}` } }
            );

            resetPayload();
            if (data) items.value = [data, ...items.value];
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message ?? error.response?.data?.error?.message ?? error.message)
                : error instanceof Error ? error.message : 'Terjadi kesalahan.';
            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function updateTransaksi(userId: string, transaksiId: string, transaksiPayload: Partial<Transaksi>) {
        setLoading(true);
        setError(null);

        const validationError = validatePayload(transaksiPayload);
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const token = await getAccessToken();
            const { data } = await apiClient.patch<Transaksi>(
                `/transactions/${transaksiId}`,
                buildRequestBody(transaksiPayload),
                { headers: { Authorization: `Bearer ${token}` } }
            );

            resetPayload();
            if (data) {
                items.value = items.value.map(item =>
                    item.id_transaksi === data.id_transaksi ? data : item
                );
            }
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message ?? error.response?.data?.error?.message ?? error.message)
                : error instanceof Error ? error.message : 'Terjadi kesalahan.';
            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function deleteTransaksi(userId: string, transaksiId: string) {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            await apiClient.delete(
                `/transactions/${transaksiId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            items.value = items.value.filter(item => item.id_transaksi !== transaksiId);
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message ?? error.response?.data?.error?.message ?? error.message)
                : error instanceof Error ? error.message : 'Terjadi kesalahan.';
            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // ─── Return ──────────────────────────────────────────────────────────────────

    return {
        items,
        selected,
        payload,
        isLoading,
        storeError,
        searchQuery,
        filterCategory,
        filterTimeRange,
        sortNominal,
        hasItems,
        totalNominal,
        transaksiByJenis,
        filteredItems,
        sortedItems,
        pengeluaranByKategoriBulanAktif,
        ringkasan6BulanApex,
        setLoading,
        setError,
        setSearchQuery,
        setSortNominal,
        setPayload,
        resetPayload,
        fetchAll,
        fetchById,
        createTransaksi,
        updateTransaksi,
        deleteTransaksi,
    };
});