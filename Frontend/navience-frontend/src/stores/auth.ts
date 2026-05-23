import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/services/supabase";
import type { Session, User } from "@supabase/supabase-js";

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const session = ref<Session | null>(null);
    const authError = ref<string | null>(null);
    const isLoading = ref(false)

    const token = computed(() => session.value?.access_token || null);
    const isAuthenticated = computed(() => !!user.value)

    async function initializeAuth() {
        const { data } = await supabase.auth.getSession();
        session.value = data.session;
        user.value = data.session?.user || null;

        supabase.auth.onAuthStateChange((_event, currentEvent) => {
            session.value = currentEvent;
            user.value = currentEvent?.user || null;
        });
    }


    // async function getUser() {
    //     const { 
    //         data: { user: currentUser }
    //     } = await supabase.auth.getUser()

    //     user.value=currentUser;
    // }

    async function login(email: string, password:string) {
        isLoading.value = true
        authError.value = null;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                authError.value = error.message;
                throw error;
            }

            session.value = data.session;
            user.value = data.user;
        } catch (error) {
            if (!authError.value && error instanceof Error) {
                authError.value = error.message;
            }
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function register(email:string, password: string, metedata: { nama_lengkap: string}) {
        isLoading.value = true;
        authError.value = null;

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metedata
                }
            });

            if (error) {
                authError.value = error.message;
                throw error;
            }

            if (data.session) {
                await supabase.auth.signOut();
            }

            session.value = null;
            user.value = null;
        } catch (error) {
            if (!authError.value && error instanceof Error) {
                authError.value = error.message;
            }
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function logout() {
        isLoading.value = true;
        authError.value = null;

        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                authError.value = error.message;
                throw error;
            }

            session.value = null;
            user.value = null;
        } catch (error) {
            if (!authError.value && error instanceof Error) {
                authError.value = error.message;
            }
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        user,
        session,
        token,
        isAuthenticated,
        initializeAuth,
        login,
        register,
        logout,
        authError
    }
})