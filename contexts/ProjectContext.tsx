import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project, TeamMember, Contract, Permit, Inspection } from "@/types";
import { mockProjects } from "@/mocks/projects";

const STORAGE_KEY = "smartflip_projects";

export const [ProjectProvider, useProjects] = createContextHook(() => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Project[];
        const merged = parsed.map((p) => {
          const mock = mockProjects.find((m) => m.id === p.id);
          if (mock && !p.description && mock.description) {
            return { ...p, description: mock.description };
          }
          return p;
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProjects));
      return mockProjects;
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (project: Omit<Project, "id" | "createdAt">) => {
      const newProject: Project = {
        ...project,
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const current = projectsQuery.data || [];
      const updated = [...current, newProject];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const current = projectsQuery.data || [];
      const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated.find((p) => p.id === id)!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = projectsQuery.data || [];
      const updated = current.filter((p) => p.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: async ({ projectId, member }: { projectId: string; member: Omit<TeamMember, "id" | "addedAt"> }) => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const current: Project[] = stored ? JSON.parse(stored) : [];
      const updated = current.map((p) => {
        if (p.id === projectId) {
          const newMember: TeamMember = {
            ...member,
            id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            addedAt: new Date().toISOString(),
          };
          return { ...p, team: [...p.team, newMember] };
        }
        return p;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const addContractMutation = useMutation({
    mutationFn: async ({ projectId, contract }: { projectId: string; contract: Omit<Contract, "id" | "createdAt"> }) => {
      const current = projectsQuery.data || [];
      const updated = current.map((p) => {
        if (p.id === projectId) {
          const newContract: Contract = {
            ...contract,
            id: `con-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          return { ...p, contracts: [...p.contracts, newContract] };
        }
        return p;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const getProjectById = (id: string): Project | undefined => {
    return projectsQuery.data?.find((p) => p.id === id);
  };

  const getProjectsByStatus = (status: Project["status"]): Project[] => {
    return projectsQuery.data?.filter((p) => p.status === status) || [];
  };

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    addProject: addProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    addTeamMember: addTeamMemberMutation.mutateAsync,
    addContract: addContractMutation.mutateAsync,
    getProjectById,
    getProjectsByStatus,
  };
});
