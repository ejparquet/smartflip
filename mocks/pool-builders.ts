export type PoolType = "inground_concrete" | "inground_fiberglass" | "inground_vinyl" | "above_ground" | "infinity" | "lap" | "plunge" | "natural" | "spa_hot_tub";

export type PoolProjectStatus = "design" | "permits" | "excavation" | "steel_plumbing" | "gunite_shell" | "tile_coping" | "decking" | "equipment" | "finish" | "completed" | "on_hold";

export type PoolNoteCategory = "soil_issues" | "change_request" | "inspection" | "client_communication" | "weather_delay" | "material_issue" | "general";

export interface PoolProjectNote {
  id: string;
  category: PoolNoteCategory;
  content: string;
  createdAt: string;
  createdBy: string;
  isImportant?: boolean;
}

export interface PoolMilestone {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  targetDate: string;
  completedDate?: string;
  notes?: string;
}

export interface PoolInspection {
  id: string;
  type: string;
  status: "scheduled" | "passed" | "failed" | "pending";
  date: string;
  inspector?: string;
  notes?: string;
}

export interface PoolProject {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAvatar?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  poolType: PoolType;
  poolSize: string;
  poolDepth: string;
  status: PoolProjectStatus;
  progress: number;
  budget: string;
  spent: string;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  coverImage: string;
  images: string[];
  milestones: PoolMilestone[];
  inspections: PoolInspection[];
  notes: PoolProjectNote[];
  features: string[];
  permits: {
    id: string;
    type: string;
    status: "pending" | "approved" | "rejected";
    number?: string;
    submittedDate?: string;
    approvedDate?: string;
  }[];
  crew: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    phone: string;
  }[];
}

export interface PoolProjectInvitation {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientType: "homeowner" | "builder" | "developer" | "commercial";
  projectAddress: string;
  projectImage: string;
  poolType: PoolType;
  estimatedSize: string;
  estimatedBudget: string;
  timeline: string;
  startDate: string;
  features: string[];
  notes?: string;
  sentAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

export const poolTypeConfig: Record<PoolType, { label: string; color: string; bg: string }> = {
  inground_concrete: { label: "Concrete", color: "#1E3A5F", bg: "#DBEAFE" },
  inground_fiberglass: { label: "Fiberglass", color: "#059669", bg: "#ECFDF5" },
  inground_vinyl: { label: "Vinyl Liner", color: "#7C3AED", bg: "#EDE9FE" },
  above_ground: { label: "Above Ground", color: "#D97706", bg: "#E8E9EE" },
  infinity: { label: "Infinity Edge", color: "#0EA5E9", bg: "#E0F2FE" },
  lap: { label: "Lap Pool", color: "#6366F1", bg: "#E0E7FF" },
  plunge: { label: "Plunge Pool", color: "#14B8A6", bg: "#CCFBF1" },
  natural: { label: "Natural Pool", color: "#22C55E", bg: "#DCFCE7" },
  spa_hot_tub: { label: "Spa/Hot Tub", color: "#EC4899", bg: "#FCE7F3" },
};

export const poolStatusConfig: Record<PoolProjectStatus, { label: string; color: string; bg: string; step: number }> = {
  design: { label: "Design", color: "#8B5CF6", bg: "#EDE9FE", step: 1 },
  permits: { label: "Permits", color: "#272D53", bg: "#E8E9EE", step: 2 },
  excavation: { label: "Excavation", color: "#78716C", bg: "#F5F5F4", step: 3 },
  steel_plumbing: { label: "Steel & Plumbing", color: "#3B82F6", bg: "#DBEAFE", step: 4 },
  gunite_shell: { label: "Gunite/Shell", color: "#1E3A5F", bg: "#E0E7FF", step: 5 },
  tile_coping: { label: "Tile & Coping", color: "#14B8A6", bg: "#CCFBF1", step: 6 },
  decking: { label: "Decking", color: "#D97706", bg: "#E8E9EE", step: 7 },
  equipment: { label: "Equipment", color: "#6366F1", bg: "#E0E7FF", step: 8 },
  finish: { label: "Finish", color: "#0EA5E9", bg: "#E0F2FE", step: 9 },
  completed: { label: "Completed", color: "#22C55E", bg: "#DCFCE7", step: 10 },
  on_hold: { label: "On Hold", color: "#EF4444", bg: "#FEE2E2", step: 0 },
};

export const noteCategoryConfig: Record<PoolNoteCategory, { label: string; color: string; icon: string }> = {
  soil_issues: { label: "Soil Issues", color: "#78716C", icon: "mountain" },
  change_request: { label: "Change Request", color: "#272D53", icon: "edit" },
  inspection: { label: "Inspection", color: "#3B82F6", icon: "clipboard-check" },
  client_communication: { label: "Client Note", color: "#8B5CF6", icon: "message-circle" },
  weather_delay: { label: "Weather Delay", color: "#0EA5E9", icon: "cloud-rain" },
  material_issue: { label: "Material Issue", color: "#EF4444", icon: "package" },
  general: { label: "General", color: "#6B7280", icon: "file-text" },
};

export const mockPoolProjects: PoolProject[] = [
  {
    id: "pool-1",
    clientName: "Michael & Sarah Thompson",
    clientPhone: "(512) 555-0134",
    clientEmail: "thompson@email.com",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    address: "4521 Lakewood Drive",
    city: "Austin",
    state: "TX",
    zipCode: "78746",
    poolType: "inground_concrete",
    poolSize: "16x32 ft",
    poolDepth: "3.5-8 ft",
    status: "steel_plumbing",
    progress: 45,
    budget: "$85,000",
    spent: "$38,500",
    startDate: "Jan 15, 2026",
    estimatedEndDate: "Apr 30, 2026",
    coverImage: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800",
    images: [
      "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800",
    ],
    features: ["Waterfall Feature", "LED Lighting", "Automatic Cover", "Heating System", "Saltwater"],
    milestones: [
      { id: "m1", name: "Design Approval", status: "completed", targetDate: "Jan 20, 2026", completedDate: "Jan 18, 2026" },
      { id: "m2", name: "Permit Approval", status: "completed", targetDate: "Feb 5, 2026", completedDate: "Feb 3, 2026" },
      { id: "m3", name: "Excavation Complete", status: "completed", targetDate: "Feb 15, 2026", completedDate: "Feb 14, 2026" },
      { id: "m4", name: "Steel & Plumbing", status: "in_progress", targetDate: "Feb 28, 2026" },
      { id: "m5", name: "Gunite Shell", status: "pending", targetDate: "Mar 15, 2026" },
      { id: "m6", name: "Tile & Coping", status: "pending", targetDate: "Mar 28, 2026" },
      { id: "m7", name: "Decking Complete", status: "pending", targetDate: "Apr 10, 2026" },
      { id: "m8", name: "Equipment Install", status: "pending", targetDate: "Apr 20, 2026" },
      { id: "m9", name: "Final Finish", status: "pending", targetDate: "Apr 28, 2026" },
    ],
    inspections: [
      { id: "i1", type: "Pre-Construction", status: "passed", date: "Jan 22, 2026", inspector: "City Inspector - J. Martinez" },
      { id: "i2", type: "Excavation", status: "passed", date: "Feb 14, 2026", inspector: "City Inspector - R. Davis" },
      { id: "i3", type: "Steel/Rebar", status: "scheduled", date: "Feb 28, 2026" },
      { id: "i4", type: "Plumbing Pressure Test", status: "pending", date: "TBD" },
      { id: "i5", type: "Electrical Bonding", status: "pending", date: "TBD" },
      { id: "i6", type: "Final Inspection", status: "pending", date: "TBD" },
    ],
    notes: [
      {
        id: "n1",
        category: "soil_issues",
        content: "Encountered rock layer at 4ft depth. Additional excavation equipment required. Client approved extra $2,500.",
        createdAt: "Feb 12, 2026",
        createdBy: "Mike Johnson",
        isImportant: true,
      },
      {
        id: "n2",
        category: "change_request",
        content: "Client requested upgrade to larger waterfall feature. Revised quote approved: +$3,200",
        createdAt: "Feb 8, 2026",
        createdBy: "Mike Johnson",
      },
      {
        id: "n3",
        category: "inspection",
        content: "Excavation inspection passed. Inspector noted excellent grade work.",
        createdAt: "Feb 14, 2026",
        createdBy: "Site Foreman",
      },
    ],
    permits: [
      { id: "p1", type: "Building Permit", status: "approved", number: "BP-2026-4521", submittedDate: "Jan 22, 2026", approvedDate: "Feb 3, 2026" },
      { id: "p2", type: "Electrical Permit", status: "approved", number: "EP-2026-1234", submittedDate: "Jan 25, 2026", approvedDate: "Feb 5, 2026" },
      { id: "p3", type: "Plumbing Permit", status: "approved", number: "PP-2026-5678", submittedDate: "Jan 25, 2026", approvedDate: "Feb 5, 2026" },
    ],
    crew: [
      { id: "c1", name: "Carlos Rodriguez", role: "Site Foreman", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", phone: "(512) 555-0201" },
      { id: "c2", name: "James Wilson", role: "Plumber", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", phone: "(512) 555-0202" },
      { id: "c3", name: "David Chen", role: "Steel/Rebar", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200", phone: "(512) 555-0203" },
    ],
  },
  {
    id: "pool-2",
    clientName: "Jennifer & Robert Adams",
    clientPhone: "(512) 555-0189",
    clientEmail: "adams.family@email.com",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    address: "8234 Hill Country Blvd",
    city: "Lakeway",
    state: "TX",
    zipCode: "78734",
    poolType: "infinity",
    poolSize: "20x40 ft",
    poolDepth: "4-6 ft",
    status: "design",
    progress: 10,
    budget: "$125,000",
    spent: "$12,500",
    startDate: "Feb 1, 2026",
    estimatedEndDate: "Jun 15, 2026",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    images: [],
    features: ["Infinity Edge", "Spa Attached", "Fire Bowls", "Swim-Up Bar", "Outdoor Kitchen Adjacent"],
    milestones: [
      { id: "m1", name: "Design Approval", status: "in_progress", targetDate: "Feb 15, 2026" },
      { id: "m2", name: "Permit Approval", status: "pending", targetDate: "Mar 1, 2026" },
      { id: "m3", name: "Excavation Complete", status: "pending", targetDate: "Mar 20, 2026" },
      { id: "m4", name: "Steel & Plumbing", status: "pending", targetDate: "Apr 5, 2026" },
      { id: "m5", name: "Gunite Shell", status: "pending", targetDate: "Apr 25, 2026" },
      { id: "m6", name: "Tile & Coping", status: "pending", targetDate: "May 10, 2026" },
      { id: "m7", name: "Decking Complete", status: "pending", targetDate: "May 25, 2026" },
      { id: "m8", name: "Equipment Install", status: "pending", targetDate: "Jun 5, 2026" },
      { id: "m9", name: "Final Finish", status: "pending", targetDate: "Jun 12, 2026" },
    ],
    inspections: [
      { id: "i1", type: "Pre-Construction", status: "pending", date: "TBD" },
    ],
    notes: [
      {
        id: "n1",
        category: "client_communication",
        content: "Client reviewing 3D rendering. Wants to see alternative tile options for infinity edge.",
        createdAt: "Feb 5, 2026",
        createdBy: "Sales Team",
      },
    ],
    permits: [],
    crew: [],
  },
  {
    id: "pool-3",
    clientName: "David & Lisa Martinez",
    clientPhone: "(512) 555-0245",
    clientEmail: "martinez.home@email.com",
    clientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    address: "1892 Sunset Canyon Road",
    city: "Round Rock",
    state: "TX",
    zipCode: "78681",
    poolType: "inground_fiberglass",
    poolSize: "14x28 ft",
    poolDepth: "3-6 ft",
    status: "completed",
    progress: 100,
    budget: "$52,000",
    spent: "$51,200",
    startDate: "Oct 15, 2025",
    estimatedEndDate: "Dec 20, 2025",
    actualEndDate: "Dec 18, 2025",
    coverImage: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800",
    images: [
      "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800",
      "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800",
    ],
    features: ["LED Lighting", "Tanning Ledge", "Automatic Cleaner", "Variable Speed Pump"],
    milestones: [
      { id: "m1", name: "Design Approval", status: "completed", targetDate: "Oct 20, 2025", completedDate: "Oct 18, 2025" },
      { id: "m2", name: "Permit Approval", status: "completed", targetDate: "Nov 1, 2025", completedDate: "Oct 30, 2025" },
      { id: "m3", name: "Shell Delivery", status: "completed", targetDate: "Nov 10, 2025", completedDate: "Nov 8, 2025" },
      { id: "m4", name: "Installation", status: "completed", targetDate: "Nov 20, 2025", completedDate: "Nov 18, 2025" },
      { id: "m5", name: "Decking", status: "completed", targetDate: "Dec 5, 2025", completedDate: "Dec 3, 2025" },
      { id: "m6", name: "Equipment Install", status: "completed", targetDate: "Dec 12, 2025", completedDate: "Dec 10, 2025" },
      { id: "m7", name: "Final Finish", status: "completed", targetDate: "Dec 18, 2025", completedDate: "Dec 18, 2025" },
    ],
    inspections: [
      { id: "i1", type: "Pre-Construction", status: "passed", date: "Nov 5, 2025", inspector: "City Inspector" },
      { id: "i2", type: "Electrical Bonding", status: "passed", date: "Dec 8, 2025", inspector: "City Inspector" },
      { id: "i3", type: "Final Inspection", status: "passed", date: "Dec 18, 2025", inspector: "City Inspector", notes: "All systems operational. Pool ready for use." },
    ],
    notes: [
      {
        id: "n1",
        category: "general",
        content: "Project completed 2 days ahead of schedule. Client very satisfied.",
        createdAt: "Dec 18, 2025",
        createdBy: "Project Manager",
      },
    ],
    permits: [
      { id: "p1", type: "Building Permit", status: "approved", number: "BP-2025-1892", approvedDate: "Oct 30, 2025" },
      { id: "p2", type: "Electrical Permit", status: "approved", number: "EP-2025-9012", approvedDate: "Nov 1, 2025" },
    ],
    crew: [
      { id: "c1", name: "Carlos Rodriguez", role: "Site Foreman", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", phone: "(512) 555-0201" },
    ],
  },
];

export const mockPoolInvitations: PoolProjectInvitation[] = [
  {
    id: "inv-1",
    clientName: "Amanda & Chris Taylor",
    clientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    clientType: "homeowner",
    projectAddress: "5678 Barton Creek Dr, Austin, TX 78735",
    projectImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    poolType: "inground_concrete",
    estimatedSize: "18x36 ft",
    estimatedBudget: "$75,000 - $95,000",
    timeline: "3-4 months",
    startDate: "Mar 1, 2026",
    features: ["Diving Board", "Slide", "LED Lighting", "Heating System"],
    notes: "Family with kids - safety features important. Looking for a fun, functional backyard pool.",
    sentAt: "2 hours ago",
    expiresAt: "Feb 10, 2026",
    status: "pending",
  },
  {
    id: "inv-2",
    clientName: "Heritage Homes Development",
    clientAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    clientType: "builder",
    projectAddress: "Lot 45, Cypress Ridge Estates, Cedar Park, TX",
    projectImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    poolType: "inground_fiberglass",
    estimatedSize: "12x24 ft",
    estimatedBudget: "$45,000 - $55,000",
    timeline: "6-8 weeks",
    startDate: "Feb 15, 2026",
    features: ["Spa Combo", "Energy Efficient Pump", "Automatic Cover"],
    notes: "Part of new home construction. Need coordination with general contractor.",
    sentAt: "1 day ago",
    expiresAt: "Feb 12, 2026",
    status: "pending",
  },
  {
    id: "inv-3",
    clientName: "Sunset Resort & Spa",
    clientAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
    clientType: "commercial",
    projectAddress: "2100 Resort Way, Dripping Springs, TX 78620",
    projectImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
    poolType: "infinity",
    estimatedSize: "30x60 ft",
    estimatedBudget: "$250,000 - $350,000",
    timeline: "5-6 months",
    startDate: "Apr 1, 2026",
    features: ["Infinity Edge", "Commercial Grade Equipment", "Multiple Depth Zones", "Handicap Access", "Spa Area"],
    notes: "Commercial resort pool. Must meet all ADA requirements. High-end finish expected.",
    sentAt: "3 days ago",
    expiresAt: "Feb 15, 2026",
    status: "pending",
  },
];
