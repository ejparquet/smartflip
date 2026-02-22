import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { ProfessionalType } from "@/types";

export interface JobOpportunity {
  id: string;
  title: string;
  address: string;
  budget: string;
  timeline: string;
  isUrgent?: boolean;
  status: "pending" | "accepted" | "declined";
  professionalType: ProfessionalType;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  location?: string;
  projectId?: string;
  projectName?: string;
  color: string;
  professionalType: ProfessionalType;
  participants?: { id: string; name: string; avatar: string }[];
}

export interface ProjectInvite {
  id: string;
  projectName: string;
  projectType: string;
  address: string;
  image: string;
  invitedBy: {
    name: string;
    avatar: string;
    role: string;
  };
  estimatedBudget: string;
  timeline: string;
  startDate: string;
  teamSize: number;
  description: string;
  yourRole: string;
  invitedDate: string;
  status: "pending" | "accepted" | "declined";
  professionalType: ProfessionalType;
}

const STORAGE_KEY = "smartflip_invitations";

const mockRealtorEvents: CalendarEvent[] = [
  {
    id: "re1",
    title: "Property Showing - Oak Valley",
    date: "2026-01-28",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    type: "showing",
    location: "1234 Oak Valley Dr, Austin, TX",
    projectName: "Oak Valley Flip",
    color: "#8B5CF6",
    professionalType: "realtor",
    participants: [
      { id: "p1", name: "John & Mary Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
    ],
  },
  {
    id: "re2",
    title: "Listing Appointment",
    date: "2026-01-28",
    startTime: "2:00 PM",
    endTime: "3:30 PM",
    type: "listing_appointment",
    location: "567 Lakefront Blvd, Austin, TX",
    projectName: "Lakefront Listing",
    color: "#10B981",
    professionalType: "realtor",
  },
  {
    id: "re3",
    title: "Investor Strategy Call",
    date: "2026-01-29",
    startTime: "9:00 AM",
    endTime: "10:00 AM",
    type: "strategy_call",
    projectName: "Investment Property",
    color: "#272D53",
    professionalType: "realtor",
    participants: [
      { id: "p2", name: "Marcus Thompson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" },
    ],
  },
  {
    id: "re4",
    title: "Open House",
    date: "2026-01-30",
    startTime: "1:00 PM",
    endTime: "4:00 PM",
    type: "open_house",
    location: "890 Commerce St, Round Rock, TX",
    projectName: "Commerce Property",
    color: "#EC4899",
    professionalType: "realtor",
  },
  {
    id: "re5",
    title: "Closing Meeting",
    date: "2026-02-01",
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    type: "closing",
    location: "Title Company - 456 Main St",
    projectName: "Cedar Park Flip",
    color: "#22C55E",
    professionalType: "realtor",
    participants: [
      { id: "p3", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" },
    ],
  },
  {
    id: "re6",
    title: "Market Analysis Meeting",
    date: "2026-02-02",
    startTime: "3:00 PM",
    endTime: "4:00 PM",
    type: "meeting",
    location: "Office",
    color: "#3B82F6",
    professionalType: "realtor",
  },
  {
    id: "re7",
    title: "Contract Deadline",
    date: "2026-02-05",
    startTime: "5:00 PM",
    endTime: "5:00 PM",
    type: "deadline",
    projectName: "Lakefront Listing",
    color: "#EF4444",
    professionalType: "realtor",
  },
];

const mockLandscaperEvents: CalendarEvent[] = [
  {
    id: "le1",
    title: "Site Survey - Mueller Property",
    date: "2026-01-28",
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    type: "survey",
    location: "4521 Mueller Blvd, Austin, TX",
    projectName: "Mueller Flip Full Landscape",
    color: "#22C55E",
    professionalType: "landscaper",
    participants: [
      { id: "p1", name: "David Park", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
    ],
  },
  {
    id: "le2",
    title: "Plant Delivery",
    date: "2026-01-28",
    startTime: "1:00 PM",
    endTime: "3:00 PM",
    type: "delivery",
    location: "4521 Mueller Blvd, Austin, TX",
    projectName: "Mueller Flip Full Landscape",
    color: "#10B981",
    professionalType: "landscaper",
  },
  {
    id: "le3",
    title: "Irrigation Install Start",
    date: "2026-01-29",
    startTime: "7:00 AM",
    endTime: "5:00 PM",
    type: "installation",
    location: "4521 Mueller Blvd, Austin, TX",
    projectName: "Mueller Flip Full Landscape",
    color: "#3B82F6",
    professionalType: "landscaper",
    participants: [
      { id: "p2", name: "Carlos Martinez", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
    ],
  },
  {
    id: "le4",
    title: "Client Walkthrough - South Austin",
    date: "2026-01-30",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    type: "meeting",
    location: "3456 S 1st St, Austin, TX",
    projectName: "South Austin Backyard Oasis",
    color: "#272D53",
    professionalType: "landscaper",
    participants: [
      { id: "p3", name: "Emily Johnson", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200" },
    ],
  },
  {
    id: "le5",
    title: "Hardscape Patio Pour",
    date: "2026-02-01",
    startTime: "6:00 AM",
    endTime: "2:00 PM",
    type: "installation",
    location: "3456 S 1st St, Austin, TX",
    projectName: "South Austin Backyard Oasis",
    color: "#78716C",
    professionalType: "landscaper",
  },
  {
    id: "le6",
    title: "Tree Planting Day",
    date: "2026-02-05",
    startTime: "8:00 AM",
    endTime: "4:00 PM",
    type: "installation",
    location: "4521 Mueller Blvd, Austin, TX",
    projectName: "Mueller Flip Full Landscape",
    color: "#22C55E",
    professionalType: "landscaper",
  },
  {
    id: "le7",
    title: "Project Deadline",
    date: "2026-02-20",
    startTime: "5:00 PM",
    endTime: "5:00 PM",
    type: "deadline",
    projectName: "South Austin Backyard Oasis",
    color: "#EF4444",
    professionalType: "landscaper",
  },
];

const mockLandscaperInvites: ProjectInvite[] = [
  {
    id: "li1",
    projectName: "Riverside Flip Landscaping",
    projectType: "Full Landscape Design",
    address: "2847 Riverside Dr, Austin, TX 78704",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    invitedBy: {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      role: "Investor",
    },
    estimatedBudget: "$18,000 - $25,000",
    timeline: "3-4 weeks",
    startDate: "2026-02-15",
    teamSize: 6,
    description: "Complete landscape transformation for flip property. Native, low-maintenance plants preferred. Irrigation system required.",
    yourRole: "Lead Landscaper",
    invitedDate: "2026-01-25",
    status: "pending",
    professionalType: "landscaper",
  },
  {
    id: "li2",
    projectName: "Tarrytown Estate Grounds",
    projectType: "Estate Landscaping",
    address: "2100 Windsor Rd, Austin, TX 78703",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    invitedBy: {
      name: "Robert Mitchell",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      role: "Realtor",
    },
    estimatedBudget: "$75,000 - $95,000",
    timeline: "8-10 weeks",
    startDate: "2026-03-15",
    teamSize: 10,
    description: "Luxury property listing preparation. Pool surround, outdoor kitchen area, mature tree installation. Premium materials approved.",
    yourRole: "Landscape Contractor",
    invitedDate: "2026-01-24",
    status: "pending",
    professionalType: "landscaper",
  },
];

const initialLandscaperJobs: JobOpportunity[] = [
  { id: "lj1", title: "Backyard Renovation", address: "1234 Sunset Dr, Austin, TX", budget: "$15,000 - $20,000", timeline: "Start in 2 weeks", status: "pending", professionalType: "landscaper", isUrgent: false },
  { id: "lj2", title: "Commercial Lawn Maintenance", address: "567 Business Park Ave, Round Rock, TX", budget: "$2,500/month", timeline: "Ongoing contract", status: "pending", professionalType: "landscaper", isUrgent: false },
  { id: "lj3", title: "Irrigation System Repair", address: "Oak Hills Community, Cedar Park, TX", budget: "$3,500", timeline: "ASAP", status: "pending", professionalType: "landscaper", isUrgent: true },
];

const mockRealtorInvites: ProjectInvite[] = [
  {
    id: "ri1",
    projectName: "Westlake Hills Flip",
    projectType: "Investment Property",
    address: "4521 Westlake Dr, Austin, TX",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    invitedBy: {
      name: "Marcus Thompson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      role: "Investor",
    },
    estimatedBudget: "$450,000",
    timeline: "6 months",
    startDate: "2026-02-01",
    teamSize: 4,
    description: "Luxury flip opportunity in Westlake Hills. Looking for listing agent to help with acquisition analysis and eventual sale. Commission negotiable.",
    yourRole: "Listing Agent",
    invitedDate: "2026-01-25",
    status: "pending",
    professionalType: "realtor",
  },
  {
    id: "ri2",
    projectName: "Mueller Development Condos",
    projectType: "New Construction Sales",
    address: "2100 Aldrich St, Austin, TX",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    invitedBy: {
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      role: "Developer",
    },
    estimatedBudget: "$2,500,000",
    timeline: "12 months",
    startDate: "2026-02-15",
    teamSize: 8,
    description: "Seeking experienced realtor to handle sales for new 12-unit condo development in Mueller. Exclusive listing opportunity with builder incentives.",
    yourRole: "Sales Agent",
    invitedDate: "2026-01-24",
    status: "pending",
    professionalType: "realtor",
  },
  {
    id: "ri3",
    projectName: "South Congress Investment",
    projectType: "Commercial Property",
    address: "3456 S Congress Ave, Austin, TX",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    invitedBy: {
      name: "Jennifer Mills",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      role: "Investment Group",
    },
    estimatedBudget: "$1,200,000",
    timeline: "3 months",
    startDate: "2026-02-20",
    teamSize: 3,
    description: "Mixed-use property acquisition on South Congress. Need agent with commercial experience for buyer representation and due diligence.",
    yourRole: "Buyer's Agent",
    invitedDate: "2026-01-23",
    status: "accepted",
    professionalType: "realtor",
  },
];

interface InvitationsState {
  jobs: JobOpportunity[];
  calendarEvents: CalendarEvent[];
  projectInvites: ProjectInvite[];
  isLoading: boolean;
  updateJobStatus: (jobId: string, status: "accepted" | "declined") => void;
  updateInviteStatus: (inviteId: string, status: "accepted" | "declined") => void;
  getJobsForType: (type: ProfessionalType) => JobOpportunity[];
  getEventsForType: (type: ProfessionalType) => CalendarEvent[];
  getInvitesForType: (type: ProfessionalType) => ProjectInvite[];
  getPendingJobsForType: (type: ProfessionalType) => JobOpportunity[];
  getPendingInvitesForType: (type: ProfessionalType) => ProjectInvite[];
}

const initialRealtorJobs: JobOpportunity[] = [
  { id: "rj1", title: "Oak Valley Flip", address: "1234 Oak Valley Dr, Austin, TX", budget: "$3,500", timeline: "2 weeks", status: "pending", professionalType: "realtor" },
  { id: "rj2", title: "Lakefront Listing", address: "567 Lakefront Blvd, Austin, TX", budget: "$4,200", timeline: "3 weeks", status: "pending", professionalType: "realtor" },
  { id: "rj3", title: "Investment Property", address: "890 Commerce St, Round Rock, TX", budget: "$2,800", timeline: "1 week", status: "pending", professionalType: "realtor" },
];

export const [InvitationsProvider, useInvitations] = createContextHook<InvitationsState>(() => {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<JobOpportunity[]>([...initialRealtorJobs, ...initialLandscaperJobs]);
  const [projectInvites, setProjectInvites] = useState<ProjectInvite[]>([...mockRealtorInvites, ...mockLandscaperInvites]);
  const [calendarEvents] = useState<CalendarEvent[]>([...mockRealtorEvents, ...mockLandscaperEvents]);

  const dataQuery = useQuery({
    queryKey: ["invitations-data"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as { jobs: JobOpportunity[]; invites: ProjectInvite[] };
      }
      return { jobs: [...initialRealtorJobs, ...initialLandscaperJobs], invites: [...mockRealtorInvites, ...mockLandscaperInvites] };
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setJobs(dataQuery.data.jobs);
      setProjectInvites(dataQuery.data.invites);
    }
  }, [dataQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (data: { jobs: JobOpportunity[]; invites: ProjectInvite[] }) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["invitations-data"], data);
    },
  });

  const updateJobStatus = useCallback((jobId: string, status: "accepted" | "declined") => {
    console.log("[InvitationsContext] Updating job status:", jobId, status);
    setJobs(prev => {
      const updated = prev.map(job => 
        job.id === jobId ? { ...job, status } : job
      );
      saveMutation.mutate({ jobs: updated, invites: projectInvites });
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectInvites]);

  const updateInviteStatus = useCallback((inviteId: string, status: "accepted" | "declined") => {
    console.log("[InvitationsContext] Updating invite status:", inviteId, status);
    setProjectInvites(prev => {
      const updated = prev.map(invite => 
        invite.id === inviteId ? { ...invite, status } : invite
      );
      saveMutation.mutate({ jobs, invites: updated });
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const getJobsForType = useCallback((type: ProfessionalType) => {
    return jobs.filter(job => job.professionalType === type);
  }, [jobs]);

  const getEventsForType = useCallback((type: ProfessionalType) => {
    return calendarEvents.filter(event => event.professionalType === type);
  }, [calendarEvents]);

  const getInvitesForType = useCallback((type: ProfessionalType) => {
    return projectInvites.filter(invite => invite.professionalType === type);
  }, [projectInvites]);

  const getPendingJobsForType = useCallback((type: ProfessionalType) => {
    return jobs.filter(job => job.professionalType === type && job.status === "pending");
  }, [jobs]);

  const getPendingInvitesForType = useCallback((type: ProfessionalType) => {
    return projectInvites.filter(invite => invite.professionalType === type && invite.status === "pending");
  }, [projectInvites]);

  return {
    jobs,
    calendarEvents,
    projectInvites,
    isLoading: dataQuery.isLoading,
    updateJobStatus,
    updateInviteStatus,
    getJobsForType,
    getEventsForType,
    getInvitesForType,
    getPendingJobsForType,
    getPendingInvitesForType,
  };
});
