import createContextHook from "@nkzw/create-context-hook";
import { useState, useMemo } from "react";
import { ProfessionalType } from "@/types";
import { 
  Home, 
  Briefcase, 
  HardHat, 
  Droplets, 
  Zap, 
  Trees, 
  Palette, 
  Waves,
  Building2,
  Wrench,
  Paintbrush,
  Plug,
  Sofa,
  Truck,
  Store,
  Leaf,
  Shovel,
  CircuitBoard,
  Package,
  Shield,
  Camera,
  Leaf as LeafIcon,
  HelpCircle,
  type LucideIcon
} from "lucide-react-native";

export interface ServiceConfig {
  type: ProfessionalType;
  displayName: string;
  shortName: string;
  icon: LucideIcon;
  color: string;
  accentColor: string;
  description: string;
  specialtiesLabel: string;
  defaultSpecialties: string[];
  jobLabel: string;
  jobsLabel: string;
  clientLabel: string;
  clientsLabel: string;
  projectLabel: string;
  projectsLabel: string;
  analyticsMetrics: AnalyticsMetric[];
  reviewCategories: ReviewCategory[];
  quickActions: QuickAction[];
  features: ServiceFeature[];
}

export interface AnalyticsMetric {
  id: string;
  label: string;
  key: string;
  format: "number" | "currency" | "percentage" | "days";
}

export interface ReviewCategory {
  id: string;
  label: string;
  key: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  route?: string;
}

export interface ServiceFeature {
  id: string;
  name: string;
  enabled: boolean;
}

const serviceConfigs: Record<ProfessionalType, ServiceConfig> = {
  contractor: {
    type: "contractor",
    displayName: "General Contractor",
    shortName: "Contractor",
    icon: HardHat,
    color: "#272D53",
    accentColor: "#E8E9EE",
    description: "Construction and renovation professional",
    specialtiesLabel: "Specialties",
    defaultSpecialties: ["Renovations", "New Construction", "Remodeling", "Additions", "Commercial"],
    jobLabel: "Project",
    jobsLabel: "Projects",
    clientLabel: "Client",
    clientsLabel: "Clients",
    projectLabel: "Construction Project",
    projectsLabel: "Construction Projects",
    analyticsMetrics: [
      { id: "1", label: "Active Projects", key: "activeProjects", format: "number" },
      { id: "2", label: "Completed Projects", key: "completedProjects", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Project Value", key: "avgProjectValue", format: "currency" },
      { id: "5", label: "On-Time Completion", key: "onTimeRate", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Quality of Work", key: "quality" },
      { id: "2", label: "Timeliness", key: "timeliness" },
      { id: "3", label: "Communication", key: "communication" },
      { id: "4", label: "Professionalism", key: "professionalism" },
      { id: "5", label: "Value for Money", key: "value" },
    ],
    quickActions: [
      { id: "1", label: "Flip Projects", icon: Briefcase, route: "/contractor-projects" },
      { id: "2", label: "Stores", icon: Store, route: "/contractor-stores" },
      { id: "3", label: "Materials", icon: Wrench, route: "/contractor-stores" },
      { id: "4", label: "Tool Rental", icon: HardHat, route: "/contractor-stores" },
    ],
    features: [
      { id: "1", name: "projectTracking", enabled: true },
      { id: "2", name: "materialOrdering", enabled: true },
      { id: "3", name: "crewManagement", enabled: true },
      { id: "4", name: "permitTracking", enabled: true },
      { id: "5", name: "flipProjectInvitations", enabled: true },
      { id: "6", name: "contractorStores", enabled: true },
      { id: "7", name: "toolRental", enabled: true },
    ],
  },
  plumber: {
    type: "plumber",
    displayName: "Plumber",
    shortName: "Plumber",
    icon: Droplets,
    color: "#3B82F6",
    accentColor: "#DBEAFE",
    description: "Plumbing installation and repair specialist",
    specialtiesLabel: "Services",
    defaultSpecialties: ["Repairs", "Installation", "Emergency Services", "Water Heaters", "Drain Cleaning"],
    jobLabel: "Service Call",
    jobsLabel: "Service Calls",
    clientLabel: "Customer",
    clientsLabel: "Customers",
    projectLabel: "Plumbing Job",
    projectsLabel: "Plumbing Jobs",
    analyticsMetrics: [
      { id: "1", label: "Jobs Completed", key: "jobsCompleted", format: "number" },
      { id: "2", label: "Emergency Calls", key: "emergencyCalls", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Response Time", key: "avgResponseTime", format: "days" },
      { id: "5", label: "Repeat Customers", key: "repeatRate", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Response Time", key: "responseTime" },
      { id: "2", label: "Quality of Work", key: "quality" },
      { id: "3", label: "Cleanliness", key: "cleanliness" },
      { id: "4", label: "Communication", key: "communication" },
      { id: "5", label: "Pricing Fairness", key: "pricing" },
    ],
    quickActions: [
      { id: "1", label: "New Job", icon: Briefcase },
      { id: "2", label: "Emergency", icon: Droplets },
      { id: "3", label: "Parts", icon: Wrench },
    ],
    features: [
      { id: "1", name: "emergencyDispatch", enabled: true },
      { id: "2", name: "partsInventory", enabled: true },
      { id: "3", name: "serviceHistory", enabled: true },
      { id: "4", name: "warranties", enabled: true },
    ],
  },
  electrician: {
    type: "electrician",
    displayName: "Electrician",
    shortName: "Electrician",
    icon: Zap,
    color: "#EAB308",
    accentColor: "#FEF9C3",
    description: "Electrical installation and repair expert",
    specialtiesLabel: "Services",
    defaultSpecialties: ["Residential", "Commercial", "Panel Upgrades", "Rewiring", "Smart Home"],
    jobLabel: "Service Call",
    jobsLabel: "Service Calls",
    clientLabel: "Customer",
    clientsLabel: "Customers",
    projectLabel: "Electrical Job",
    projectsLabel: "Electrical Jobs",
    analyticsMetrics: [
      { id: "1", label: "Jobs Completed", key: "jobsCompleted", format: "number" },
      { id: "2", label: "Inspections Passed", key: "inspectionsPassed", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Job Value", key: "avgJobValue", format: "currency" },
      { id: "5", label: "Safety Rating", key: "safetyRating", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Safety Standards", key: "safety" },
      { id: "2", label: "Quality of Work", key: "quality" },
      { id: "3", label: "Code Compliance", key: "compliance" },
      { id: "4", label: "Communication", key: "communication" },
      { id: "5", label: "Cleanliness", key: "cleanliness" },
    ],
    quickActions: [
      { id: "1", label: "Service Calls", icon: Briefcase, route: "/electrical-service-calls" },
      { id: "2", label: "Estimates", icon: Zap, route: "/electrical-estimates" },
      { id: "3", label: "Load Calc", icon: Plug, route: "/load-calculator" },
      { id: "4", label: "Code Compliance", icon: Wrench, route: "/electrical-code-compliance" },
      { id: "5", label: "Licensing", icon: HardHat, route: "/electrical-licensing" },
      { id: "6", label: "Panel Schedules", icon: CircuitBoard, route: "/electrical-panel-schedule" },
      { id: "7", label: "Parts Database", icon: Package, route: "/electrical-parts-database" },
      { id: "8", label: "Warranties", icon: Shield, route: "/electrical-warranty-tracking" },
      { id: "9", label: "Photo Docs", icon: Camera, route: "/electrical-photo-documentation" },
      { id: "10", label: "Energy Audit", icon: LeafIcon, route: "/electrical-energy-audit" },
      { id: "11", label: "Troubleshoot", icon: HelpCircle, route: "/electrical-troubleshooting" },
    ],
    features: [
      { id: "1", name: "codeCompliance", enabled: true },
      { id: "2", name: "safetyChecklist", enabled: true },
      { id: "3", name: "permitManagement", enabled: true },
      { id: "4", name: "loadCalculations", enabled: true },
    ],
  },
  landscaper: {
    type: "landscaper",
    displayName: "Landscaper",
    shortName: "Landscaper",
    icon: Trees,
    color: "#22C55E",
    accentColor: "#DCFCE7",
    description: "Landscape design and maintenance professional",
    specialtiesLabel: "Services",
    defaultSpecialties: ["Design", "Installation", "Maintenance", "Irrigation", "Hardscaping", "Xeriscaping"],
    jobLabel: "Project",
    jobsLabel: "Projects",
    clientLabel: "Client",
    clientsLabel: "Clients",
    projectLabel: "Landscape Project",
    projectsLabel: "Landscape Projects",
    analyticsMetrics: [
      { id: "1", label: "Active Clients", key: "activeClients", format: "number" },
      { id: "2", label: "Projects Completed", key: "projectsCompleted", format: "number" },
      { id: "3", label: "Monthly Revenue", key: "monthlyRevenue", format: "currency" },
      { id: "4", label: "Flip Invitations", key: "flipInvitations", format: "number" },
      { id: "5", label: "Client Retention", key: "retentionRate", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Design Quality", key: "design" },
      { id: "2", label: "Plant Health", key: "plantHealth" },
      { id: "3", label: "Timeliness", key: "timeliness" },
      { id: "4", label: "Communication", key: "communication" },
      { id: "5", label: "Cleanup", key: "cleanup" },
    ],
    quickActions: [
      { id: "1", label: "Flip Projects", icon: Briefcase, route: "/landscape-projects" },
      { id: "2", label: "Stores", icon: Store, route: "/landscape-stores" },
      { id: "3", label: "Materials", icon: Leaf, route: "/landscape-stores" },
      { id: "4", label: "Equipment", icon: Shovel, route: "/landscape-stores" },
    ],
    features: [
      { id: "1", name: "seasonalScheduling", enabled: true },
      { id: "2", name: "plantDatabase", enabled: true },
      { id: "3", name: "irrigationPlanning", enabled: true },
      { id: "4", name: "beforeAfterPhotos", enabled: true },
      { id: "5", name: "flipProjectInvitations", enabled: true },
      { id: "6", name: "landscapeStores", enabled: true },
      { id: "7", name: "materialOrdering", enabled: true },
      { id: "8", name: "equipmentRental", enabled: true },
    ],
  },
  interior_designer: {
    type: "interior_designer",
    displayName: "Interior Designer",
    shortName: "Designer",
    icon: Palette,
    color: "#EC4899",
    accentColor: "#FCE7F3",
    description: "Interior design and decoration specialist",
    specialtiesLabel: "Styles",
    defaultSpecialties: ["Modern", "Traditional", "Minimalist", "Bohemian", "Industrial"],
    jobLabel: "Project",
    jobsLabel: "Projects",
    clientLabel: "Client",
    clientsLabel: "Clients",
    projectLabel: "Design Project",
    projectsLabel: "Design Projects",
    analyticsMetrics: [
      { id: "1", label: "Active Projects", key: "activeProjects", format: "number" },
      { id: "2", label: "Completed Projects", key: "completedProjects", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Project Value", key: "avgProjectValue", format: "currency" },
      { id: "5", label: "Client Satisfaction", key: "satisfaction", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Creativity", key: "creativity" },
      { id: "2", label: "Budget Management", key: "budget" },
      { id: "3", label: "Communication", key: "communication" },
      { id: "4", label: "Timeliness", key: "timeliness" },
      { id: "5", label: "Attention to Detail", key: "detail" },
    ],
    quickActions: [
      { id: "1", label: "New Project", icon: Briefcase },
      { id: "2", label: "Mood Board", icon: Palette },
      { id: "3", label: "Furniture", icon: Sofa },
    ],
    features: [
      { id: "1", name: "moodBoards", enabled: true },
      { id: "2", name: "vendorNetwork", enabled: true },
      { id: "3", name: "3dRendering", enabled: true },
      { id: "4", name: "budgetTracking", enabled: true },
    ],
  },
  pool_company: {
    type: "pool_company",
    displayName: "Pool Builder",
    shortName: "Pool Builder",
    icon: Waves,
    color: "#06B6D4",
    accentColor: "#CFFAFE",
    description: "Pool construction and maintenance expert",
    specialtiesLabel: "Services",
    defaultSpecialties: ["New Construction", "Renovation", "Maintenance", "Equipment", "Cleaning"],
    jobLabel: "Project",
    jobsLabel: "Projects",
    clientLabel: "Client",
    clientsLabel: "Clients",
    projectLabel: "Pool Project",
    projectsLabel: "Pool Projects",
    analyticsMetrics: [
      { id: "1", label: "Active Builds", key: "activeBuilds", format: "number" },
      { id: "2", label: "Maintenance Clients", key: "maintenanceClients", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Build Value", key: "avgBuildValue", format: "currency" },
      { id: "5", label: "Referral Rate", key: "referralRate", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Build Quality", key: "quality" },
      { id: "2", label: "Timeliness", key: "timeliness" },
      { id: "3", label: "Communication", key: "communication" },
      { id: "4", label: "Design", key: "design" },
      { id: "5", label: "Service Quality", key: "service" },
    ],
    quickActions: [
      { id: "1", label: "New Quote", icon: Briefcase },
      { id: "2", label: "Service Call", icon: Waves },
      { id: "3", label: "Equipment", icon: Wrench },
    ],
    features: [
      { id: "1", name: "designVisualization", enabled: true },
      { id: "2", name: "permitTracking", enabled: true },
      { id: "3", name: "maintenanceSchedule", enabled: true },
      { id: "4", name: "waterTesting", enabled: true },
    ],
  },
  dumpster_service: {
    type: "dumpster_service",
    displayName: "Dumpster & Hauling",
    shortName: "Hauling",
    icon: Truck,
    color: "#78716C",
    accentColor: "#F5F5F4",
    description: "Waste removal and dumpster rental service",
    specialtiesLabel: "Services",
    defaultSpecialties: ["Dumpster Rental", "Junk Removal", "Demolition", "Recycling", "Construction Debris"],
    jobLabel: "Delivery",
    jobsLabel: "Deliveries",
    clientLabel: "Customer",
    clientsLabel: "Customers",
    projectLabel: "Hauling Job",
    projectsLabel: "Hauling Jobs",
    analyticsMetrics: [
      { id: "1", label: "Active Rentals", key: "activeRentals", format: "number" },
      { id: "2", label: "Deliveries This Month", key: "monthlyDeliveries", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Rental Days", key: "avgRentalDays", format: "days" },
      { id: "5", label: "On-Time Delivery", key: "onTimeRate", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Punctuality", key: "punctuality" },
      { id: "2", label: "Pricing Clarity", key: "pricing" },
      { id: "3", label: "Communication", key: "communication" },
      { id: "4", label: "Cleanliness", key: "cleanliness" },
      { id: "5", label: "Flexibility", key: "flexibility" },
    ],
    quickActions: [
      { id: "1", label: "New Rental", icon: Briefcase },
      { id: "2", label: "Pickup", icon: Truck },
      { id: "3", label: "Schedule", icon: Home },
    ],
    features: [
      { id: "1", name: "fleetTracking", enabled: true },
      { id: "2", name: "capacityPlanning", enabled: true },
      { id: "3", name: "routeOptimization", enabled: true },
      { id: "4", name: "weightTracking", enabled: true },
    ],
  },
  realtor: {
    type: "realtor",
    displayName: "Real Estate Agent",
    shortName: "Realtor",
    icon: Building2,
    color: "#8B5CF6",
    accentColor: "#EDE9FE",
    description: "Licensed real estate professional",
    specialtiesLabel: "Specialties",
    defaultSpecialties: ["Investment Properties", "First-Time Buyers", "Luxury Homes", "Commercial", "Relocation"],
    jobLabel: "Deal",
    jobsLabel: "Deals",
    clientLabel: "Client",
    clientsLabel: "Clients",
    projectLabel: "Transaction",
    projectsLabel: "Transactions",
    analyticsMetrics: [
      { id: "1", label: "Total Leads", key: "totalLeads", format: "number" },
      { id: "2", label: "Conversions", key: "conversions", format: "number" },
      { id: "3", label: "Total Volume", key: "totalVolume", format: "currency" },
      { id: "4", label: "Avg Days to Close", key: "avgDaysToClose", format: "days" },
      { id: "5", label: "Closings", key: "closings", format: "number" },
    ],
    reviewCategories: [
      { id: "1", label: "Professionalism", key: "professionalism" },
      { id: "2", label: "Negotiation", key: "negotiation" },
      { id: "3", label: "Communication", key: "communication" },
      { id: "4", label: "Market Knowledge", key: "marketKnowledge" },
    ],
    quickActions: [
      { id: "1", label: "New Lead", icon: Briefcase },
      { id: "2", label: "Showing", icon: Building2 },
      { id: "3", label: "Listing", icon: Home },
    ],
    features: [
      { id: "1", name: "leadManagement", enabled: true },
      { id: "2", name: "marketInsights", enabled: true },
      { id: "3", name: "firmIntegration", enabled: true },
      { id: "4", name: "disclosures", enabled: true },
    ],
  },
  roofer: {
    type: "roofer",
    displayName: "Roofer",
    shortName: "Roofer",
    icon: HardHat,
    color: "#B45309",
    accentColor: "#E8E9EE",
    description: "Roofing installation, repair, and maintenance professional",
    specialtiesLabel: "Services",
    defaultSpecialties: ["Roof Replacement", "Storm Damage", "Shingle Roofing", "Metal Roofing", "Flat Roofs", "Inspections"],
    jobLabel: "Job",
    jobsLabel: "Jobs",
    clientLabel: "Customer",
    clientsLabel: "Customers",
    projectLabel: "Roofing Project",
    projectsLabel: "Roofing Projects",
    analyticsMetrics: [
      { id: "1", label: "Active Jobs", key: "activeJobs", format: "number" },
      { id: "2", label: "Completed Jobs", key: "completedJobs", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Job Value", key: "avgJobValue", format: "currency" },
      { id: "5", label: "Insurance Claims", key: "insuranceClaims", format: "number" },
    ],
    reviewCategories: [
      { id: "1", label: "Quality of Work", key: "quality" },
      { id: "2", label: "Timeliness", key: "timeliness" },
      { id: "3", label: "Communication", key: "communication" },
      { id: "4", label: "Cleanup", key: "cleanup" },
      { id: "5", label: "Warranty Service", key: "warranty" },
    ],
    quickActions: [
      { id: "1", label: "New Quote", icon: Briefcase },
      { id: "2", label: "Inspection", icon: Shield },
      { id: "3", label: "Materials", icon: Wrench },
    ],
    features: [
      { id: "1", name: "roofInspections", enabled: true },
      { id: "2", name: "stormDamageAssessment", enabled: true },
      { id: "3", name: "insuranceClaims", enabled: true },
      { id: "4", name: "materialEstimation", enabled: true },
    ],
  },
  painter: {
    type: "painter",
    displayName: "Painter",
    shortName: "Painter",
    icon: Paintbrush,
    color: "#272D53",
    accentColor: "#E8E9EE",
    description: "Professional painting services",
    specialtiesLabel: "Services",
    defaultSpecialties: ["Interior", "Exterior", "Commercial", "Cabinet Refinishing", "Specialty Finishes"],
    jobLabel: "Job",
    jobsLabel: "Jobs",
    clientLabel: "Customer",
    clientsLabel: "Customers",
    projectLabel: "Paint Job",
    projectsLabel: "Paint Jobs",
    analyticsMetrics: [
      { id: "1", label: "Jobs Completed", key: "jobsCompleted", format: "number" },
      { id: "2", label: "Sq Ft Painted", key: "sqftPainted", format: "number" },
      { id: "3", label: "Total Revenue", key: "totalRevenue", format: "currency" },
      { id: "4", label: "Avg Job Value", key: "avgJobValue", format: "currency" },
      { id: "5", label: "Repeat Rate", key: "repeatRate", format: "percentage" },
    ],
    reviewCategories: [
      { id: "1", label: "Quality of Work", key: "quality" },
      { id: "2", label: "Preparation", key: "preparation" },
      { id: "3", label: "Cleanliness", key: "cleanliness" },
      { id: "4", label: "Timeliness", key: "timeliness" },
      { id: "5", label: "Communication", key: "communication" },
    ],
    quickActions: [
      { id: "1", label: "New Quote", icon: Briefcase },
      { id: "2", label: "Colors", icon: Paintbrush },
      { id: "3", label: "Supplies", icon: Wrench },
    ],
    features: [
      { id: "1", name: "colorConsultation", enabled: true },
      { id: "2", name: "surfacePrep", enabled: true },
      { id: "3", name: "materialEstimation", enabled: true },
      { id: "4", name: "weatherTracking", enabled: true },
    ],
  },
};

interface ServiceContextState {
  currentService: ProfessionalType | null;
  serviceConfig: ServiceConfig | null;
  setCurrentService: (type: ProfessionalType | null) => void;
  getServiceConfig: (type: ProfessionalType) => ServiceConfig;
  allServices: ServiceConfig[];
}

export const [ServiceProvider, useService] = createContextHook<ServiceContextState>(() => {
  const [currentService, setCurrentService] = useState<ProfessionalType | null>(null);

  const serviceConfig = useMemo(() => {
    if (!currentService) return null;
    return serviceConfigs[currentService];
  }, [currentService]);

  const getServiceConfig = (type: ProfessionalType): ServiceConfig => {
    return serviceConfigs[type];
  };

  const allServices = useMemo(() => Object.values(serviceConfigs), []);

  return {
    currentService,
    serviceConfig,
    setCurrentService,
    getServiceConfig,
    allServices,
  };
});

export { serviceConfigs };
