import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@/types";
import { mockProperties } from "@/mocks/properties";

const STORAGE_KEY = "smartflip_properties";

export const [PropertyProvider, useProperties] = createContextHook(() => {
  const queryClient = useQueryClient();

  const propertiesQuery = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Property[];
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProperties));
      return mockProperties;
    },
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (property: Omit<Property, "id" | "createdAt">) => {
      const newProperty: Property = {
        ...property,
        id: `prop-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const current = propertiesQuery.data || [];
      const updated = [...current, newProperty];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newProperty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      const current = propertiesQuery.data || [];
      const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated.find((p) => p.id === id)!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = propertiesQuery.data || [];
      const updated = current.filter((p) => p.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const addProjectToPropertyMutation = useMutation({
    mutationFn: async ({ propertyId, projectId }: { propertyId: string; projectId: string }) => {
      const current = propertiesQuery.data || [];
      const updated = current.map((p) => {
        if (p.id === propertyId) {
          return { ...p, projectIds: [...p.projectIds, projectId] };
        }
        return p;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const getPropertyById = (id: string): Property | undefined => {
    return propertiesQuery.data?.find((p) => p.id === id);
  };

  const getPropertiesByStatus = (status: Property["status"]): Property[] => {
    return propertiesQuery.data?.filter((p) => p.status === status) || [];
  };

  return {
    properties: propertiesQuery.data || [],
    isLoading: propertiesQuery.isLoading,
    addProperty: addPropertyMutation.mutateAsync,
    updateProperty: updatePropertyMutation.mutateAsync,
    deleteProperty: deletePropertyMutation.mutateAsync,
    addProjectToProperty: addProjectToPropertyMutation.mutateAsync,
    getPropertyById,
    getPropertiesByStatus,
  };
});
