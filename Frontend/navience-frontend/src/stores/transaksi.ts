import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/services/supabase";
import type { Transaksi, JenisTransaksi } from "@/types/transaksi";

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
    const isLoading = ref(false)
    const storeError = ref<string | null>(null);
    const searchQuery = ref('');
    const filterCategory = ref('');
    const filterTimeRange = ref('');
    const sortNominal = ref<'asc' | 'desc' | ''>('');

    const hasItems = computed(() => items.value.length > 0)
    const totalNominal = computed(() => {
        const nominal = items.value.map(item => item.nominal);
        return nominal.reduce((sum, value) => sum + value, 0);
    })
    
    const transaksiByJenis = computed(() => {
        return items.value.reduce<Record<string, Transaksi[]>>((result, item) => {
            const key = item.jenis_transaksi;
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
            return result;
        }, {});
    })

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

        if (!keyword) {
            return list;
        }

        return list.filter(item => {
            const nama = item.nama_transaksi?.toLowerCase() ?? '';
            const deskripsi = item.deskripsi?.toLowerCase() ?? '';
            return nama.includes(keyword) || deskripsi.includes(keyword);
        });
    })

    const sortedItems = computed(() => {
        const list = [...filteredItems.value];
        if (!sortNominal.value) {
            return list;
        }

        return list.sort((a, b) => {
            return sortNominal.value === 'asc'
                ? a.nominal - b.nominal
                : b.nominal - a.nominal;
        });
    })

    const pengeluaranByKategoriBulanAktif = computed(() => {
        const now = new Date();
        const ym = now.toISOString().slice(0, 7);
        const map = new Map<string, number>();

        for (const item of items.value) {
            if (item.jenis_transaksi !== 'pengeluaran') continue;
            if (item.tanggal_transaksi.slice(0, 7) !== ym) continue;

            map.set(item.id_kategori, (map.get(item.id_kategori) ?? 0) + item.nominal);
        }

        return map;
    })

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
        months.forEach(month => {
            map.set(month.key, { pemasukan: 0, pengeluaran: 0 });
        });

        for (const item of items.value) {
            const key = item.tanggal_transaksi.slice(0, 7);
            const row = map.get(key);
            if (!row) continue;

            if (item.jenis_transaksi === 'pemasukan') {
                row.pemasukan += item.nominal;
            } else if (item.jenis_transaksi === 'pengeluaran') {
                row.pengeluaran += item.nominal;
            }
        }

        const categories = months.map(month => month.label);
        const yearMarkers = months.reduce<{ index: number; year: number }[]>((acc, month, index) => {
            const prevYear = index === 0 ? null : months[index - 1]?.year ?? null;
            if (prevYear !== month.year) {
                acc.push({ index, year: month.year });
            }
            return acc;
        }, []);

        const pemasukanData = months.map(month => map.get(month.key)?.pemasukan ?? 0);
        const pengeluaranData = months.map(month => map.get(month.key)?.pengeluaran ?? 0);

        return {
            categories,
            yearMarkers,
            series: [
                { name: 'Pemasukan', data: pemasukanData },
                { name: 'Pengeluaran', data: pengeluaranData }
            ]
        };
    });

    const setLoading = (value: boolean) => {
        isLoading.value = value;
    };
    const setError = (value: string | null) => {
        storeError.value = value;
    }

    const setSearchQuery = (value: string) => {
        searchQuery.value = value;
    }

    const setSortNominal = (value: 'asc' | 'desc' | '') => {
        sortNominal.value = value;
    }

    const setPayload = (value: Partial<Transaksi>) => {
        payload.value = { ...payload.value, ...value };
    }

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
    }

    const validatePayload = (value: Partial<Transaksi>) => {
        if (!value.tanggal_transaksi) {
            return 'Tanggal transaksi wajib diisi.';
        }
        if (Number.isNaN(Date.parse(value.tanggal_transaksi))) {
            return 'Format tanggal transaksi tidak valid.';
        }
        if (!value.id_kategori) {
            return 'Kategori wajib dipilih.';
        }
        if (value.nominal === undefined || value.nominal === null) {
            return 'Nominal wajib diisi.';
        }
        if (typeof value.nominal !== 'number' || value.nominal <= 0) {
            return 'Nominal harus lebih dari 0.';
        }
        if (!value.jenis_transaksi) {
            return 'Jenis transaksi wajib dipilih.';
        }
        if (!value.nama_transaksi || value.nama_transaksi.trim().length < 3) {
            return 'Nama transaksi wajib diisi (minimal 3 karakter).';
        }
        if (!value.deskripsi || value.deskripsi.trim().length === 0) {
            return 'Deskripsi wajib diisi.';
        }
        return null;
    }

    // TODO: actions CRUD
    // - fetchAll (optionally by id_pengguna)
    async function fetchAll(userId: string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('id_pengguna', userId)

            if (error) {
                setError(error.message);
                throw error;
            }
            items.value=data;
        } catch (error) {
            if (!storeError.value && error instanceof Error) {
                setError(error.message)
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }
    // - fetchById(id_transaksi)
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

            if (error) {
                storeError.value = error.message;
                throw error;
            }
            selected.value = data;
        } catch (error) {
            if (!storeError.value && error instanceof Error) {
                setError(error.message)
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }
    // - create(payload)
    async function createTransaksi(userId: string, payload: Partial<Transaksi>) {
        setLoading(true);
        setError(null);

        const validationError = validatePayload(payload);
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
            .from('transaksi')
            .insert({
                id_pengguna: userId,
                id_target: payload.id_target ?? null,
                nama_transaksi: payload.nama_transaksi ?? null,
                tanggal_transaksi: payload.tanggal_transaksi,
                nominal: payload.nominal,
                jenis_transaksi: payload.jenis_transaksi,
                nama_toko: payload.nama_toko ?? null,
                deskripsi: payload.deskripsi ?? null,
                id_kategori: payload.id_kategori
            })
            .select('*')
            .single();

            if (error) {
                setError(error.message);
                throw error;
            }
            resetPayload();
            if (data) {
                items.value = [data, ...items.value];
            }
        } catch (error) {
            if (!storeError.value && error instanceof Error) {
                setError(error.message)
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }



    // - update(id_transaksi, payload)
    async function updateTransaksi(userId: string, transaksiId: string, payload: Partial<Transaksi>) {
        setLoading(true);
        setError(null);

        const validationError = validatePayload(payload);
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
            .from('transaksi')
            .update({
                id_pengguna: userId,
                id_target: payload.id_target ?? null,
                nama_transaksi: payload.nama_transaksi ?? null,
                tanggal_transaksi: payload.tanggal_transaksi,
                nominal: payload.nominal,
                jenis_transaksi: payload.jenis_transaksi,
                nama_toko: payload.nama_toko ?? null,
                deskripsi: payload.deskripsi ?? null,
                id_kategori: payload.id_kategori
            })
            .eq('id_transaksi', transaksiId)
            .eq('id_pengguna', userId)
            .select('*')
            .single();

            if (error) {
                setError(error.message);
                throw error;
            }
            resetPayload();
            if (data) {
                const nextItems = items.value.map(item =>
                    item.id_transaksi === data.id_transaksi ? data : item
                );
                items.value = nextItems;
            }
        } catch (error) {
            if (!storeError.value && error instanceof Error) {
                setError(error.message)
            }
            throw error;
        } finally {
            setLoading(false);
        }

    }
    // - remove(id_transaksi)
    async function deleteTransaksi(userId: string, transaksiId:string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
            .from('transaksi')
            .delete()
            .eq('id_pengguna', userId)
            .eq('id_transaksi', transaksiId)
            .select('id_transaksi')
            .single();
            if (error) {
                setError(error.message);
                throw error;
            }
            items.value = items.value.filter(item => item.id_transaksi !== transaksiId);
        } catch (error) {
            if (!storeError.value && error instanceof Error) {
                setError(error.message)
            }
            throw error;
        }finally{
            setLoading(false);
        }
    }

    

    // TODO: return state/getters/actions
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
        deleteTransaksi
    }
})