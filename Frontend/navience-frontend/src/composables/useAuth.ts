import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";


export function useAuth() {
    const auth = useAuthStore()
    const router = useRouter()
    
    const handleLogout = async () => {
        try {
            await auth.logout();
            router.push('/login');
        } catch (error) {
            return;
        }
    }

    return { handleLogout };
} 