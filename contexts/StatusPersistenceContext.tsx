import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

export type StatusType = 
  | "pending" | "in_progress" | "completed" | "cancelled"
  | "delivered" | "picked_up" | "scheduled" | "dispatched"
  | "en_route" | "on_hold" | "approved" | "rejected";

interface StatusRecord {
  id: string;
  entityType: string;
  status: StatusType;
  updatedAt: string;
}

interface StatusPersistenceState {
  statuses: Record<string, StatusRecord>;
  getStatus: (entityType: string, id: string) => StatusType | null;
  setStatus: (entityType: string, id: string, status: StatusType) => void;
  clearStatus: (entityType: string, id: string) => void;
  isLoading: boolean;
}

const STORAGE_KEY = "smartflip_status_persistence";

export const [StatusPersistenceProvider, useStatusPersistence] = createContextHook<StatusPersistenceState>(() => {
  const queryClient = useQueryClient();
  const [statuses, setStatuses] = useState<Record<string, StatusRecord>>({});

  const statusQuery = useQuery({
    queryKey: ["persistedStatuses"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Record<string, StatusRecord>;
      }
      return {};
    },
  });

  useEffect(() => {
    if (statusQuery.data) {
      setStatuses(statusQuery.data);
    }
  }, [statusQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (newStatuses: Record<string, StatusRecord>) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStatuses));
      return newStatuses;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["persistedStatuses"], data);
    },
  });

  const { mutate: saveStatuses } = saveMutation;

  const getStatus = useCallback((entityType: string, id: string): StatusType | null => {
    const key = `${entityType}_${id}`;
    return statuses[key]?.status ?? null;
  }, [statuses]);

  const setStatus = useCallback((entityType: string, id: string, status: StatusType) => {
    const key = `${entityType}_${id}`;
    const newRecord: StatusRecord = {
      id,
      entityType,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    const newStatuses = { ...statuses, [key]: newRecord };
    setStatuses(newStatuses);
    saveStatuses(newStatuses);
  }, [statuses, saveStatuses]);

  const clearStatus = useCallback((entityType: string, id: string) => {
    const key = `${entityType}_${id}`;
    const newStatuses = { ...statuses };
    delete newStatuses[key];
    setStatuses(newStatuses);
    saveStatuses(newStatuses);
  }, [statuses, saveStatuses]);

  return {
    statuses,
    getStatus,
    setStatus,
    clearStatus,
    isLoading: statusQuery.isLoading,
  };
});
