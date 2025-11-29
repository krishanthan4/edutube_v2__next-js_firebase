import { useAuth as useAuthContext } from '@/app/contexts/AuthContext';

export function useAuth() {
  const auth = useAuthContext();
  const userProfile = (auth as any).userProfile;
  const isAdmin = (auth as any).isAdmin;
  
  return {
    ...auth,
    userProfile,
    isAdmin
  };
}