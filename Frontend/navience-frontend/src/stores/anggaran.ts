import { defineStore, storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/services/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";
import { useTransaksiStore } from "@/stores/transaksi";

type Anggaran = Tables<"anggaran">;
type AnggaranInsert = TablesInsert<"anggaran">;
type AnggaranUpdate = TablesUpdate<"anggaran">;

export const useAnggaranStore = defineStore('anggaran', () => {
    const isLoading = ref(false)
    const storeError = ref<string | null>(null);

    const now = new Date();
    const bulan = now.getMonth();
    const tahun = now.getFullYear();
    const periodeIns = new Date(tahun, bulan, 1);
    const payload = ref<Partial<Anggaran>>({
        id_kategori: '',
        id_pengguna: '',
        periode: periodeIns.toDateString(),
        total_anggaran: 0
    })

    const setPayload = (value: Partial<Anggaran>) => {
        payload.value = { ...payload.value, ...value };
    }

    const resetPayload = () => {
        payload.value = {
            id_kategori: '',
            id_pengguna: '',
            periode:'',
            total_anggaran: 0
        };
    }

    const validatePayload = (value: Partial<Anggaran>) => {
        if (!value.id_kategori) {
            return 'Kategori anggaran wajib diisi.';
        }
        if (value.total_anggaran === undefined || value.total_anggaran === null) {
            return 'Nominal wajib diisi.';
        }
        if (typeof value.total_anggaran !== 'number' || value.total_anggaran <= 0) {
            return 'Nominal harus lebih dari 0.';
        }

        return null;
    }

    const items = ref<Anggaran[]>([])
    const selected = ref<Anggaran | null>(null)
    const transaksiStore = useTransaksiStore();
    const { pengeluaranByKategoriBulanAktif } = storeToRefs(transaksiStore);
    const anggaranTerpakai = computed(() =>{
        const map = new Map<string, number>();
        for (const item of items.value) {
            const terpakai = pengeluaranByKategoriBulanAktif.value.get(item.id_kategori) ?? 0;
            map.set(item.id_kategori, terpakai);
        }
        return map;
    })
    const sisaAnggaran = computed(() => {
        const kategoriId = selected.value?.id_kategori ?? payload.value.id_kategori;
        if (!kategoriId) return 0;

        const total = selected.value?.total_anggaran ?? 0;
        const terpakai = anggaranTerpakai.value.get(kategoriId) ?? 0;
        return total - terpakai;
    })
    const isActiveExist = (kategoriId: string) => {
        if (!kategoriId) return false;
        const periodeAktif = periodeIns.toDateString();
        return items.value.some(item => item.periode === periodeAktif && item.id_kategori === kategoriId);
    }

    const setLoading = (value: boolean) => {
        isLoading.value = value;
    };
    const setError = (value: string | null) => {
        storeError.value = value;
    }

    async function fetchAll(userId:string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('anggaran')
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
        }finally {
            setLoading(false);
        }
    }

    async function fetchAnggaranAktif(userID:string) {
        setLoading(true);
        setError(null);
        try {
            const { data , error } = await supabase
            .from('anggaran')
            .select('*')
            .eq('id_pengguna', userID)
            .eq('periode', periodeIns.toDateString())
            .single()
            if (error) {
                storeError.value = error.message;
                throw error;
            }
            selected.value = data;
        }
        catch(error){
            if (!storeError.value && error instanceof Error) {
                setError(error.message)
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }

    async function createAnggaran(userId:string, payload: Partial<AnggaranInsert>) {
        setLoading(true);
        setError(null);

        if (isActiveExist(payload.id_kategori ?? '')) {
            setError('Sudah terdapat anggaran aktif untuk kategori tersebut');
            setLoading(false);
            return;
        }


        const validationError = validatePayload(payload);
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('anggaran')
                .insert({
                    id_pengguna: userId,
                    id_kategori: payload.id_kategori,
                    periode: payload.periode,
                    total_anggaran: payload.total_anggaran
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

    async function updateAnggaran(userId:string, anggaranId: string, payload: Partial<AnggaranUpdate>) {
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
                .from('anggaran')
                .update({
                    id_pengguna: userId,
                    id_kategori: payload.id_kategori,
                    periode: payload.periode,
                    total_anggaran: payload.total_anggaran
                })
                .eq('id_anggaran', anggaranId)
                .eq('id_pengguna', userId)
                .select("*")
                .single()
            if (error) {
                setError(error.message);
                throw error;
            }
            resetPayload();
            if (data) {
                const nextItems = items.value.map(item =>
                    item.id_anggaran === data.id_anggaran ? data : item
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

    async function deleteAnggaran(userId:string, anggaranId: string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('anggaran')
                .delete()
                .eq('id_pengguna', userId)
                .eq('id_anggaran', anggaranId)
            if (error) {
                setError(error.message);
                throw error;
            }
            items.value = items.value.filter(item => item.id_anggaran !== anggaranId);
        } catch (error) {
            if (!storeError.value && error instanceof Error) {
                setError(error.message)
            }
            throw error;
        }finally{
            setLoading(false);
        }
    }

    return {
        items,
        selected,
        payload,
        isLoading,
        storeError,
        anggaranTerpakai,
        sisaAnggaran,
        isActiveExist,
        setPayload,
        resetPayload,
        periodeIns,
        setLoading,
        setError,
        fetchAll,
        fetchAnggaranAktif,
        createAnggaran,
        updateAnggaran,
        deleteAnggaran,
    }

})