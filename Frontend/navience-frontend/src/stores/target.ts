import { defineStore, storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/services/supabase";
import type { Tables, TablesInsert, TablesUpdate,Enums } from "@/types/supabase";

type Target = Tables<"target">;
type TargetInsert = TablesInsert<"target">;
type TargetUpdate = TablesUpdate<"target">;
type TargetStatus = Enums<"target_status_enum">;

export const useTargetStore = defineStore('target', () => {
    const isLoading = ref(false)
    const storeError = ref<string | null>(null);
    const items = ref<Target[]>([])
    const selected = ref<Target | null>(null)
    

    const payload = ref<Partial<Target>>({
        id_pengguna:'',
        nama_target:'',
        nominal_target: 0,
        status: 'on going' as TargetStatus,
        deadline: ''
    })
    const searchQuery = ref('');
    const setPayload = (value: Partial<Target>) => {
        payload.value = { ...payload.value, ...value };
    }

    const resetPayload = () => {
        payload.value = {
            id_pengguna:'',
            nama_target:'',
            nominal_target: 0,
            status: 'on going' as TargetStatus,
            deadline: ''
        };
    }

    const validatePayload = (value: Partial<Target>) => {
        if (!value.nama_target) {
            return 'nama target wajib diisi.';
        }
        if (value.nominal_target === undefined || value.nominal_target === null) {
            return 'Nominal wajib diisi.';
        }
        if (typeof value.nominal_target !== 'number' || value.nominal_target <= 0) {
            return 'Nominal harus lebih dari 0.';
        }
        if (!value.deadline) {
            return 'batas waktu wajib diisi';
        }
        if (!value.status) {
            return 'status target wajib diisi';
        }
        return null;
    }

    // Check if there is any active target overall
    const hasActiveTarget = () => {
        return items.value.some(item => item.status === 'on going');
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
                .from('target')
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

    async function fetchTargetAktif(userId:string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('target')
                .select('*')
                .eq('id_pengguna', userId)
                .eq('status', 'on going')
                .single()
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

    async function createTarget(userId:string, payload: Partial<TargetInsert>) {
        setLoading(true);
        setError(null);

        if (hasActiveTarget()) {
            setError('Tidak dapat menambahkan lebih dari satu target aktif ');
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
                .from('target')
                .insert({
                    id_pengguna: userId,
                    nama_target: payload.nama_target,
                    nominal_target: payload.nominal_target,
                    deadline: payload.deadline,
                    status: "on going" as TargetStatus
                })
                .select("*")
                .single()
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

    async function updateTarget(userId:string, targetId: string, payload: Partial<TargetUpdate>) {
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
                .from('target')
                .update({
                    nama_target: payload.nama_target,
                    nominal_target: payload.nominal_target,
                    deadline: payload.deadline,
                    status: (payload.status ?? 'on going') as TargetStatus
                })
                .eq('id_pengguna', userId)
                .eq('id_target', targetId)
                .select('*')
                .single()
            if (error) {
                setError(error.message);
                throw error;
            }
            resetPayload();
            if (data) {
                const nextItems = items.value.map(item =>
                    item.id_target === data.id_target ? data : item
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

    async function deleteTarget(userId:string, targetId:string) {
        setLoading(true);
        setError(null);
        try {
            const { data, error }= await supabase
                .from('target')
                .delete()
                .eq('id_pengguna', userId)
                .eq('id_target', targetId)
            if (error) {
                setError(error.message);
                throw error;
            }
            items.value = items.value.filter(item => item.id_target !== targetId);
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
        hasActiveTarget,
        setPayload,
        resetPayload,
        setError,
        setLoading,
        fetchAll,
        fetchTargetAktif,
        createTarget,
        updateTarget,
        deleteTarget
    }

})