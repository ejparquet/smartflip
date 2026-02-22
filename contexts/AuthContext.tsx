import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { User, UserRole, Professional, ProfessionalType } from "@/types";

interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  serviceArea?: string;
  companyName?: string;
}

interface AuthState {
  user: User | Professional | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  completeRegistration: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => void;
  selectedRole: UserRole | null;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  professionalType?: ProfessionalType;
}

const STORAGE_KEY = "smartflip_user";

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User | Professional;
      }
      return null;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Check if user already exists in storage
      const existingUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (existingUser) {
        const parsed = JSON.parse(existingUser);
        // Update email if different
        if (parsed.email !== email) {
          parsed.email = email;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed as User | Professional;
      }
      
      // Create new user - allow any email/password for demo
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0] || "User",
        role: selectedRole || "homeowner",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
        phone: "(512) 555-1234",
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      return mockUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      if (user.role) {
        setSelectedRole(user.role);
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (data.role === "professional" && data.professionalType) {
        const mockProfessional: Professional = {
          id: `pro-${Date.now()}`,
          email: data.email,
          name: data.name,
          role: "professional",
          professionalType: data.professionalType,
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
          yearsExperience: 0,
          rating: 0,
          reviewCount: 0,
          bio: "",
          specialties: [],
          serviceArea: "",
          portfolioImages: [],
          isVerified: false,
          completedProjects: 0,
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProfessional));
        return mockProfessional;
      }
      
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: "homeowner",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      return mockUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      setSelectedRole(null);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const currentUser = queryClient.getQueryData<User | Professional>(["user"]);
      if (!currentUser) throw new Error("No user logged in");
      
      const updatedUser = { ...currentUser, ...data };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user"], updatedUser);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const completeRegistration = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  return {
    user: userQuery.data ?? null,
    isAuthenticated: !!userQuery.data,
    isLoading: userQuery.isLoading,
    login,
    register,
    completeRegistration,
    logout,
    selectRole,
    selectedRole,
    updateProfile,
  };
});
