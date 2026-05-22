import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/services/supabase";
import type { Session, User } from "@supabase/supabase-js";

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const session = ref<Session | null>(null);

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
       const { data, error } = await supabase.auth.signInWithPassword({email, password});

       if(error) {
        throw error
       }

       session.value = data.session;
       user.value = data.user;
       
    }

    async function register(email:string, password: string) {
        const { data, error } = await supabase.auth.signUp({email, password});

        if (error) {
            throw error;
        }

        session.value = data.session;
        user.value = data.user;
    }

    async function logout() {
        const {error} = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
        session.value = null;
        user.value = null;
    }

    return {
        user,
        session,
        token,
        isAuthenticated,
        initializeAuth,
        login,
        register,
        logout
    }
})