import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Bell,
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  Leaf,
  Droplets,
  Wrench,
  Home,
  MapPin,
  Calendar,
  Zap,
  Users,
  FileText,
  Package,
  Shield,
  Camera,
  ClipboardList,
  MessageCircle,
  HardHat,
  Briefcase,
  Store,
  ShoppingBag,
  Truck,
  Settings,
  Receipt,
  PhoneCall,
  Calculator,
  Award,
  ClipboardCheck,
  Database,
  UserPlus,
  Mail,
  ArrowRight,
  CircuitBoard,
  Gauge,
  Lightbulb,
  Activity,
  Circle,
  BookOpen,
  Paintbrush,
  Palette,
  Layers,
  Ruler,
  CloudSun,
  Sparkles,
  Plus,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useService } from "@/contexts/ServiceContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useInvitations } from "@/contexts/InvitationsContext";
import StatCard from "@/components/StatCard";
import WeatherWidget from "@/components/WeatherWidget";
import { Professional, ProfessionalType } from "@/types";
import { mockLandscapeProjects } from "@/mocks/landscapers";
import { getPendingInvitations } from "@/mocks/invitations";

interface PendingJob {
  id: string;
  title: string;
  address: string;
  budget: string;
  timeline: string;
  isUrgent?: boolean;
}

const getRealtorPendingJobs = (): PendingJob[] => [
  { id: "r1", title: "Oak Valley Flip", address: "1234 Oak Valley Dr, Austin, TX", budget: "$3,500", timeline: "2 weeks" },
  { id: "r2", title: "Lakefront Listing", address: "567 Lakefront Blvd, Austin, TX", budget: "$4,200", timeline: "3 weeks" },
  { id: "r3", title: "Investment Property", address: "890 Commerce St, Round Rock, TX", budget: "$2,800", timeline: "1 week" },
];

const getLandscaperPendingJobs = (): PendingJob[] => 
  mockLandscapeProjects.filter(p => p.isNew).map(p => ({
    id: p.id,
    title: p.projectName,
    address: p.location,
    budget: p.budget,
    timeline: p.timeline,
    isUrgent: p.timeline.toLowerCase().includes("asap"),
  }));

const getContractorPendingJobs = (): PendingJob[] => [
  { id: "c1", title: "Kitchen Renovation", address: "456 Maple St, Austin, TX", budget: "$45,000", timeline: "6 weeks" },
  { id: "c2", title: "Bathroom Remodel", address: "789 Oak Dr, Round Rock, TX", budget: "$12,000", timeline: "2 weeks", isUrgent: true },
  { id: "c3", title: "Deck Addition", address: "123 Pine Ave, Cedar Park, TX", budget: "$8,500", timeline: "3 weeks" },
];

const getPlumberPendingJobs = (): PendingJob[] => [
  { id: "p1", title: "Emergency Pipe Repair", address: "567 Business Park Ave, Round Rock, TX", budget: "Hourly", timeline: "ASAP", isUrgent: true },
  { id: "p2", title: "Water Heater Install", address: "890 Lakefront Blvd, Lakeway, TX", budget: "$2,000", timeline: "This week" },
  { id: "p3", title: "Full Bath Plumbing", address: "234 Commerce St, Austin, TX", budget: "$6,000", timeline: "2 weeks" },
];

const getPendingJobsForType = (professionalType: ProfessionalType | undefined): PendingJob[] => {
  switch (professionalType) {
    case "realtor": return getRealtorPendingJobs();
    case "landscaper": return getLandscaperPendingJobs();
    case "contractor": return getContractorPendingJobs();
    case "plumber": return getPlumberPendingJobs();
    case "electrician": return getElectricianPendingJobs();
    case "interior_designer": return getInteriorDesignerPendingJobs();
    case "pool_company": return getPoolBuilderPendingJobs();
    case "dumpster_service": return getDumpsterPendingJobs();
    case "painter": return getPainterPendingJobs();
    default: return getContractorPendingJobs();
  }
};

const getStatsForType = (professionalType: ProfessionalType | undefined) => {
  switch (professionalType) {
    case "realtor":
      return {
        pending: { title: "Pending Deals", value: "3", color: Colors.warning },
        completed: { title: "Closings", value: "12", color: Colors.success },
        earnings: { title: "This Month", value: "$8,500", subtitle: "Commission", color: Colors.primary },
      };
    case "landscaper":
      return {
        pending: { title: "Pending Jobs", value: "4", color: Colors.warning },
        completed: { title: "Completed", value: "18", color: Colors.success },
        earnings: { title: "This Month", value: "$12,500", subtitle: "Revenue", color: Colors.primary },
      };
    case "contractor":
      return {
        pending: { title: "Active Projects", value: "5", color: Colors.warning },
        completed: { title: "Completed", value: "28", color: Colors.success },
        earnings: { title: "This Month", value: "$42,000", subtitle: "Revenue", color: Colors.primary },
      };
    case "plumber":
      return {
        pending: { title: "Open Jobs", value: "6", color: Colors.warning },
        completed: { title: "Completed", value: "32", color: Colors.success },
        earnings: { title: "This Month", value: "$8,200", subtitle: "Revenue", color: Colors.primary },
      };
    case "electrician":
      return {
        pending: { title: "Active Jobs", value: "4", color: Colors.warning },
        completed: { title: "Completed", value: "45", color: Colors.success },
        earnings: { title: "This Month", value: "$15,800", subtitle: "Revenue", color: Colors.primary },
      };
    case "interior_designer":
      return {
        pending: { title: "Active Projects", value: "3", color: Colors.warning },
        completed: { title: "Completed", value: "22", color: Colors.success },
        earnings: { title: "This Month", value: "$18,500", subtitle: "Revenue", color: Colors.primary },
      };
    case "pool_company":
      return {
        pending: { title: "Active Builds", value: "2", color: Colors.warning },
        completed: { title: "Completed", value: "15", color: Colors.success },
        earnings: { title: "This Month", value: "$52,000", subtitle: "Revenue", color: Colors.primary },
      };
    case "dumpster_service":
      return {
        pending: { title: "Active Rentals", value: "8", color: Colors.warning },
        completed: { title: "Deliveries", value: "42", color: Colors.success },
        earnings: { title: "This Month", value: "$9,800", subtitle: "Revenue", color: Colors.primary },
      };
    case "painter":
      return {
        pending: { title: "Active Jobs", value: "3", color: Colors.warning },
        completed: { title: "Completed", value: "38", color: Colors.success },
        earnings: { title: "This Month", value: "$14,200", subtitle: "Revenue", color: Colors.primary },
      };
    default:
      return {
        pending: { title: "Pending Jobs", value: "3", color: Colors.warning },
        completed: { title: "Completed", value: "12", color: Colors.success },
        earnings: { title: "This Month", value: "$5,500", subtitle: "Earnings", color: Colors.primary },
      };
  }
};

const getSectionTitle = (professionalType: ProfessionalType | undefined): string => {
  switch (professionalType) {
    case "realtor": return "Pending Opportunities";
    case "landscaper": return "New Project Requests";
    case "contractor": return "Job Requests";
    case "plumber": return "Service Requests";
    case "electrician": return "Electrical Jobs";
    case "interior_designer": return "Design Projects";
    case "pool_company": return "Pool Projects";
    case "dumpster_service": return "Hauling Requests";
    case "painter": return "Paint Jobs";
    default: return "Pending Requests";
  }
};

const getElectricianPendingJobs = (): PendingJob[] => [
  { id: "e1", title: "Panel Upgrade", address: "123 Tech Park Dr, Austin, TX", budget: "$3,500", timeline: "1 week" },
  { id: "e2", title: "Outlet Installation", address: "456 Office Plaza, Round Rock, TX", budget: "$800", timeline: "2 days" },
  { id: "e3", title: "Emergency Repair", address: "789 Main St, Cedar Park, TX", budget: "Hourly", timeline: "ASAP", isUrgent: true },
];

const getInteriorDesignerPendingJobs = (): PendingJob[] => [
  { id: "d1", title: "Living Room Redesign", address: "321 Luxury Lane, Austin, TX", budget: "$15,000", timeline: "4 weeks" },
  { id: "d2", title: "Home Office Setup", address: "654 Modern Ave, Westlake, TX", budget: "$8,000", timeline: "2 weeks" },
  { id: "d3", title: "Kitchen Consultation", address: "987 Design Blvd, Austin, TX", budget: "$2,500", timeline: "1 week" },
];

const getPoolBuilderPendingJobs = (): PendingJob[] => [
  { id: "pb1", title: "New Pool Build", address: "111 Estate Dr, Lakeway, TX", budget: "$65,000", timeline: "8 weeks" },
  { id: "pb2", title: "Pool Renovation", address: "222 Resort Way, Austin, TX", budget: "$25,000", timeline: "4 weeks" },
  { id: "pb3", title: "Maintenance Service", address: "333 Palm St, Round Rock, TX", budget: "$200/month", timeline: "Ongoing" },
];

const getDumpsterPendingJobs = (): PendingJob[] => [
  { id: "ds1", title: "Construction Debris", address: "444 Build Site, Austin, TX", budget: "$450", timeline: "3 days" },
  { id: "ds2", title: "Junk Removal", address: "555 Clean Up Ave, Cedar Park, TX", budget: "$300", timeline: "Same day", isUrgent: true },
  { id: "ds3", title: "Dumpster Rental", address: "666 Reno Rd, Round Rock, TX", budget: "$350/week", timeline: "1 week" },
];

const getPainterPendingJobs = (): PendingJob[] => [
  { id: "pa1", title: "Interior Painting - 3BR Home", address: "777 Color Way, Austin, TX", budget: "$4,500", timeline: "1 week" },
  { id: "pa2", title: "Cabinet Refinishing", address: "888 Kitchen St, Pflugerville, TX", budget: "$2,800", timeline: "5 days", isUrgent: true },
  { id: "pa3", title: "Exterior House Painting", address: "999 Home Ave, Austin, TX", budget: "$8,200", timeline: "2 weeks" },
];

const painterQuickActions = [
  { id: "paint-calc", label: "Paint Calc", icon: Calculator, color: "#272D53", route: "/paint-calculator" },
  { id: "estimates", label: "Estimates", icon: FileText, color: "#22C55E", route: "/estimate-generator" },
  { id: "color-palette", label: "Color Palette", icon: Palette, color: "#EC4899", route: "/color-palette" },
  { id: "jobs", label: "Jobs", icon: Briefcase, color: "#1E3A5F", route: "/(pro-tabs)/jobs" },
  { id: "materials", label: "Materials", icon: Package, color: "#6366F1", route: "/material-tracking" },
  { id: "surface-prep", label: "Surface Prep", icon: Layers, color: "#272D53", route: "/painter-surface-prep" },
  { id: "measurements", label: "Measurements", icon: Ruler, color: "#0EA5E9", route: "/estimate-generator" },
  { id: "weather", label: "Weather", icon: CloudSun, color: "#64748B", route: "/painter-safety" },
  { id: "stores", label: "Paint Stores", icon: Store, color: "#10B981", route: "/(pro-tabs)/stores" },
  { id: "specialty", label: "Specialty", icon: Sparkles, color: "#8B5CF6", route: "/painter-specialty" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/photo-documentation" },
  { id: "invoices", label: "Invoices", icon: Receipt, color: "#272D53", route: "/invoices" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#0284C7", route: "/client-portal" },
  { id: "crew", label: "Crew", icon: Users, color: "#3B82F6", route: "/crew-management" },
  { id: "safety", label: "Safety", icon: Shield, color: "#EF4444", route: "/painter-safety" },
  { id: "invitations", label: "Invitations", icon: UserPlus, color: "#EC4899", route: "/project-invitations" },
];

const getJobIcon = (professionalType: ProfessionalType | undefined) => {
  switch (professionalType) {
    case "realtor": return Home;
    case "landscaper": return Leaf;
    case "plumber": return Droplets;
    case "contractor": return Wrench;
    case "electrician": return Zap;
    case "interior_designer": return Home;
    case "pool_company": return Droplets;
    case "dumpster_service": return Wrench;
    case "painter": return Paintbrush;
    default: return Wrench;
  }
};

const contractorQuickActions = [
  { id: "jobs", label: "Jobs", icon: Briefcase, color: "#1E3A5F", route: "/(pro-tabs)/jobs" },
  { id: "bids", label: "Bids", icon: FileText, color: "#3B82F6", route: "/(pro-tabs)/bids" },
  { id: "stores", label: "Stores", icon: Store, color: "#10B981", route: "/(pro-tabs)/stores" },
  { id: "crew", label: "Crew", icon: Users, color: "#272D53", route: "/crew-management" },
  { id: "materials", label: "Materials", icon: Package, color: "#6366F1", route: "/material-tracking" },
  { id: "dumper-loads", label: "Dumper Loads", icon: Truck, color: "#78716C", route: "/dumper-loads" },
  { id: "docs", label: "Documents", icon: FileText, color: "#8B5CF6", route: "/document-management" },
  { id: "equipment", label: "Equipment", icon: HardHat, color: "#EC4899", route: "/equipment-tracking" },
  { id: "safety", label: "Safety", icon: Shield, color: "#EF4444", route: "/contractor-safety" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/photo-documentation" },
  { id: "punchlist", label: "Punch List", icon: ClipboardList, color: "#272D53", route: "/punch-list" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#14B8A6", route: "/client-portal" },
];

const plumberQuickActions = [
  { id: "service-calls", label: "Service Calls", icon: PhoneCall, color: "#DC2626", route: "/service-calls" },
  { id: "estimates", label: "Estimates", icon: Calculator, color: "#22C55E", route: "/estimate-generator" },
  { id: "licensing", label: "Licensing", icon: Award, color: "#8B5CF6", route: "/licensing-certifications" },
  { id: "code-compliance", label: "Code Compliance", icon: ClipboardCheck, color: "#0EA5E9", route: "/code-compliance" },
  { id: "warranties", label: "Warranties", icon: Shield, color: "#272D53", route: "/warranty-tracking" },
  { id: "fixtures", label: "Fixtures DB", icon: Database, color: "#14B8A6", route: "/fixture-database" },
  { id: "stores", label: "Stores", icon: Store, color: "#10B981", route: "/material-stores" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, color: "#6366F1", route: "/marketplace" },
  { id: "materials", label: "Materials", icon: Package, color: "#64748B", route: "/material-tracking" },
  { id: "invoices", label: "Invoices", icon: Receipt, color: "#272D53", route: "/invoices" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/photo-documentation" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#3B82F6", route: "/client-portal" },
  { id: "invitations", label: "Invitations", icon: UserPlus, color: "#EC4899", route: "/project-invitations" },
];

const electricianQuickActions = [
  { id: "service-calls", label: "Service Calls", icon: PhoneCall, color: "#DC2626", route: "/electrical-service-calls" },
  { id: "estimates", label: "Estimates", icon: Calculator, color: "#22C55E", route: "/electrical-estimates" },
  { id: "panel-schedule", label: "Panel Schedule", icon: CircuitBoard, color: "#1E3A5F", route: "/electrical-panel-schedule" },
  { id: "parts-db", label: "Parts DB", icon: Database, color: "#6366F1", route: "/electrical-parts-database" },
  { id: "load-calc", label: "Load Calc", icon: Gauge, color: "#EAB308", route: "/load-calculator" },
  { id: "voltage-drop", label: "Voltage Drop", icon: Activity, color: "#272D53", route: "/voltage-drop-calculator" },
  { id: "conduit-fill", label: "Conduit Fill", icon: Circle, color: "#14B8A6", route: "/conduit-fill-calculator" },
  { id: "wire-reference", label: "Wire Ref", icon: BookOpen, color: "#64748B", route: "/wire-reference" },
  { id: "code-compliance", label: "NEC Codes", icon: ClipboardCheck, color: "#0EA5E9", route: "/electrical-code-compliance" },
  { id: "permits", label: "Permits", icon: FileText, color: "#3B82F6", route: "/electrical-permits" },
  { id: "safety", label: "Safety", icon: Shield, color: "#EF4444", route: "/electrical-safety" },
  { id: "licensing", label: "Licensing", icon: Award, color: "#8B5CF6", route: "/electrical-licensing" },
  { id: "warranties", label: "Warranties", icon: Shield, color: "#10B981", route: "/electrical-warranty-tracking" },
  { id: "energy-audit", label: "Energy Audit", icon: Lightbulb, color: "#FBBF24", route: "/electrical-energy-audit" },
  { id: "troubleshoot", label: "Troubleshoot", icon: Settings, color: "#78716C", route: "/electrical-troubleshooting" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/electrical-photo-documentation" },
  { id: "stores", label: "Stores", icon: Store, color: "#059669", route: "/material-stores" },
  { id: "materials", label: "Materials", icon: Package, color: "#7C3AED", route: "/material-tracking" },
  { id: "invoices", label: "Invoices", icon: Receipt, color: "#272D53", route: "/invoices" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#0284C7", route: "/client-portal" },
  { id: "invitations", label: "Invitations", icon: UserPlus, color: "#EC4899", route: "/project-invitations" },
];

const interiorDesignerQuickActions = [
  { id: "projects", label: "Projects", icon: Briefcase, color: "#EC4899", route: "/design-projects" },
  { id: "mood-boards", label: "Mood Boards", icon: Camera, color: "#8B5CF6", route: "/mood-boards" },
  { id: "estimates", label: "Estimates", icon: Calculator, color: "#22C55E", route: "/design-estimates" },
  { id: "room-planner", label: "Room Planner", icon: Home, color: "#3B82F6", route: "/room-planner" },
  { id: "furniture-db", label: "Furniture DB", icon: Database, color: "#272D53", route: "/furniture-database" },
  { id: "color-palette", label: "Color Palette", icon: Lightbulb, color: "#14B8A6", route: "/color-palette" },
  { id: "vendors", label: "Vendors", icon: Store, color: "#6366F1", route: "/design-vendors" },
  { id: "stores", label: "Stores", icon: ShoppingBag, color: "#059669", route: "/design-stores" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/design-photo-documentation" },
  { id: "invoices", label: "Invoices", icon: Receipt, color: "#272D53", route: "/invoices" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#0284C7", route: "/client-portal" },
  { id: "invitations", label: "Invitations", icon: UserPlus, color: "#EC4899", route: "/project-invitations" },
];

const poolBuilderQuickActions = [
  { id: "add-pool", label: "Add Pool", icon: Plus, color: "#0EA5E9", route: "/pool-builder-projects?action=add" },
  { id: "projects", label: "Projects", icon: Droplets, color: "#0EA5E9", route: "/pool-builder-projects" },
  { id: "estimates", label: "Estimates", icon: Calculator, color: "#22C55E", route: "/estimate-generator?role=pool" },
  { id: "permits", label: "Permits", icon: FileText, color: "#3B82F6", route: "/pool-permits" },
  { id: "crew", label: "Crew", icon: Users, color: "#272D53", route: "/crew-management" },
  { id: "materials", label: "Materials", icon: Package, color: "#6366F1", route: "/material-tracking" },
  { id: "equipment", label: "Equipment", icon: HardHat, color: "#78716C", route: "/equipment-tracking" },
  { id: "safety", label: "Safety", icon: Shield, color: "#EF4444", route: "/pool-safety" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/pool-photo-documentation" },
  { id: "invoices", label: "Invoices", icon: Receipt, color: "#272D53", route: "/invoices" },
  { id: "stores", label: "Stores", icon: Store, color: "#059669", route: "/(pro-tabs)/stores" },
  { id: "docs", label: "Documents", icon: FileText, color: "#64748B", route: "/document-management" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#0284C7", route: "/client-portal" },
];

const landscaperQuickActions = [
  { id: "projects", label: "Flip Projects", icon: Briefcase, color: "#22C55E", route: "/landscape-projects" },
  { id: "stores", label: "Stores", icon: Store, color: "#10B981", route: "/landscape-stores" },
  { id: "materials", label: "Materials", icon: Package, color: "#6366F1", route: "/material-tracking" },
  { id: "estimates", label: "Estimates", icon: Calculator, color: "#272D53", route: "/estimate-generator" },
  { id: "crew", label: "Crew", icon: Users, color: "#3B82F6", route: "/crew-management" },
  { id: "equipment", label: "Equipment", icon: HardHat, color: "#78716C", route: "/equipment-tracking" },
  { id: "weather", label: "Weather", icon: CloudSun, color: "#0EA5E9", route: "/weather" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/photo-documentation" },
  { id: "invoices", label: "Invoices", icon: Receipt, color: "#272D53", route: "/invoices" },
  { id: "safety", label: "Safety", icon: Shield, color: "#EF4444", route: "/contractor-safety" },
  { id: "docs", label: "Documents", icon: FileText, color: "#64748B", route: "/document-management" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#0284C7", route: "/client-portal" },
];

const dumpsterServiceQuickActions = [
  { id: "dumper-loads", label: "Dumper Loads", icon: Truck, color: "#78716C", route: "/dumper-loads" },
  { id: "jobs", label: "Jobs", icon: Briefcase, color: "#1E3A5F", route: "/(pro-tabs)/jobs" },
  { id: "delivery", label: "Delivery", icon: MapPin, color: "#10B981", route: "/delivery-tracking" },
  { id: "estimates", label: "Estimates", icon: Calculator, color: "#22C55E", route: "/estimate-generator" },
  { id: "invoices", label: "Invoices", icon: Receipt, color: "#272D53", route: "/invoices" },

  { id: "crew", label: "Crew", icon: Users, color: "#3B82F6", route: "/crew-management" },
  { id: "safety", label: "Safety", icon: Shield, color: "#EF4444", route: "/contractor-safety" },
  { id: "photos", label: "Photos", icon: Camera, color: "#06B6D4", route: "/photo-documentation" },
  { id: "docs", label: "Documents", icon: FileText, color: "#64748B", route: "/document-management" },
  { id: "clients", label: "Clients", icon: MessageCircle, color: "#0284C7", route: "/client-portal" },
];

export default function ProDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { serviceConfig } = useService();
  const { theme } = useTheme();
  const { updateJobStatus, getPendingJobsForType: getContextPendingJobs } = useInvitations();
  const professional = user as Professional | null;
  const isRealtor = professional?.professionalType === "realtor";
  const isLandscaper = professional?.professionalType === "landscaper";

  const pendingJobs = isRealtor 
    ? getContextPendingJobs("realtor").map(j => ({ id: j.id, title: j.title, address: j.address, budget: j.budget, timeline: j.timeline, isUrgent: j.isUrgent }))
    : isLandscaper
    ? getContextPendingJobs("landscaper").map(j => ({ id: j.id, title: j.title, address: j.address, budget: j.budget, timeline: j.timeline, isUrgent: j.isUrgent }))
    : getPendingJobsForType(professional?.professionalType);
  const stats = getStatsForType(professional?.professionalType);
  const sectionTitle = getSectionTitle(professional?.professionalType);
  const JobIcon = serviceConfig?.icon || getJobIcon(professional?.professionalType);
  const serviceColor = serviceConfig?.color || Colors.primary;
  const isContractor = professional?.professionalType === "contractor";
  const isPlumber = professional?.professionalType === "plumber";
  const isElectrician = professional?.professionalType === "electrician";
  const isInteriorDesigner = professional?.professionalType === "interior_designer";
  const isDumpsterService = professional?.professionalType === "dumpster_service";
  const isPoolBuilder = professional?.professionalType === "pool_company";
  const isPainter = professional?.professionalType === "painter";

  const ds = useMemo(() => ({
    container: { backgroundColor: theme.background },
    safeArea: { backgroundColor: theme.surface },
    header: { backgroundColor: theme.surface, borderBottomColor: theme.borderLight },
    greeting: { color: theme.textSecondary },
    userName: { color: theme.text },
    notificationButton: { backgroundColor: theme.surfaceSecondary },
    sectionTitle: { color: theme.text },
    jobCard: { backgroundColor: theme.surface },
    jobTitle: { color: theme.text },
    jobAddress: { color: theme.textSecondary },
    jobDetailText: { color: theme.textSecondary },
    declineButton: { borderColor: theme.border },
    declineText: { color: theme.textSecondary },
    ratingCard: { backgroundColor: theme.surface },
    ratingValue: { color: theme.text },
    ratingLabel: { color: theme.textSecondary },
    viewReviewsButton: { backgroundColor: theme.surfaceSecondary },
    viewReviewsText: { color: theme.navy },
    quickActionCard: { backgroundColor: theme.surface },
    quickActionLabel: { color: theme.text },
    invitationCard: { backgroundColor: theme.surface },
    invitationTitle: { color: theme.text },
    invitationAddress: { color: theme.textSecondary },
    inviterName: { color: theme.textSecondary },
    invitationRole: { color: theme.navy },
    emptyStateTitle: { color: theme.text },
    emptyStateText: { color: theme.textSecondary },
    seeAllText: { color: theme.navy },
    emptyInvitations: { backgroundColor: theme.surface },
    emptyInvitationsText: { color: theme.textTertiary },
    invitationBadge: { backgroundColor: theme.navy },
  }), [theme]);

  return (
    <View style={[styles.container, ds.container]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, ds.safeArea]}>
        <View style={[styles.header, ds.header]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, ds.greeting]}>Welcome back,</Text>
            <Text style={[styles.userName, ds.userName]}>{professional?.name || "Professional"}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.notificationButton, ds.notificationButton]}
              onPress={() => {
                Alert.alert(
                  "Notifications",
                  "You have 3 new notifications:",
                  [
                    { text: "View All", onPress: () => console.log("[Dashboard] View all notifications") },
                    { text: "Dismiss", style: "cancel" },
                  ]
                );
              }}
            >
              <Bell size={22} color={theme.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(pro-tabs)/profile" as any)}>
              <Image
                source={{ uri: professional?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" }}
                style={styles.avatar}
                contentFit="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, ds.sectionTitle]}>{sectionTitle}</Text>
          
          {pendingJobs.map((job) => (
            <TouchableOpacity key={job.id} style={[styles.jobCard, ds.jobCard]} onPress={() => router.push(`/job-request/${job.id}` as any)}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <View style={styles.jobTitleRow}>
                    <Text style={[styles.jobTitle, ds.jobTitle]}>{job.title}</Text>
                    {job.isUrgent && (
                      <View style={styles.urgentBadge}>
                        <Zap size={10} color={Colors.white} />
                        <Text style={styles.urgentText}>Urgent</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.jobAddressRow}>
                    <MapPin size={12} color={theme.textSecondary} />
                    <Text style={[styles.jobAddress, ds.jobAddress]}>{job.address}</Text>
                  </View>
                </View>
                <View style={[styles.jobBadge, { backgroundColor: serviceColor }]}>
                  <Text style={styles.jobBadgeText}>New</Text>
                </View>
              </View>
              <View style={styles.jobDetails}>
                <View style={styles.jobDetail}>
                  <DollarSign size={14} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, ds.jobDetailText]}>{job.budget}</Text>
                </View>
                <View style={styles.jobDetail}>
                  <Calendar size={14} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, ds.jobDetailText]}>{job.timeline}</Text>
                </View>
              </View>
              <View style={styles.jobActions}>
                <TouchableOpacity 
                  style={[styles.declineButton, ds.declineButton]}
                  onPress={() => {
                    console.log("[Dashboard] Declining job:", job.id);
                    if (isRealtor || isLandscaper) {
                      updateJobStatus(job.id, "declined");
                    }
                  }}
                >
                  <Text style={[styles.declineText, ds.declineText]}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.acceptButton, { backgroundColor: serviceColor }]}
                  onPress={() => {
                    console.log("[Dashboard] Accepting job:", job.id);
                    if (isRealtor || isLandscaper) {
                      updateJobStatus(job.id, "accepted");
                    }
                  }}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {pendingJobs.length === 0 && (
            <View style={styles.emptyState}>
              <JobIcon size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyStateTitle, ds.emptyStateTitle]}>No Pending Requests</Text>
              <Text style={[styles.emptyStateText, ds.emptyStateText]}>New opportunities will appear here</Text>
            </View>
          )}
        </View>

        <View style={[styles.ratingCard, ds.ratingCard]}>
          <View style={styles.ratingContent}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  color={theme.accent}
                  fill={star <= (professional?.rating || 4.5) ? theme.accent : "transparent"}
                />
              ))}
            </View>
            <Text style={[styles.ratingValue, ds.ratingValue]}>{professional?.rating?.toFixed(1) || "4.5"}</Text>
            <Text style={[styles.ratingLabel, ds.ratingLabel]}>
              Based on {professional?.reviewCount || 0} reviews
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.viewReviewsButton, ds.viewReviewsButton]}
            onPress={() => router.push("/(pro-tabs)/reviews" as any)}
          >
            <Text style={[styles.viewReviewsText, ds.viewReviewsText]}>View All</Text>
          </TouchableOpacity>
        </View>

        <WeatherWidget serviceColor={serviceColor} showWorkCondition={true} />

        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <StatCard
              title={stats.pending.title}
              value={stats.pending.value}
              icon={<Clock size={18} color={stats.pending.color} />}
              color={stats.pending.color}
            />
            <StatCard
              title={stats.completed.title}
              value={stats.completed.value}
              icon={<CheckCircle size={18} color={stats.completed.color} />}
              color={stats.completed.color}
            />
          </View>
          <View style={[styles.statsRow, { marginTop: 16 }]}>
            <StatCard
              title={stats.earnings.title}
              value={stats.earnings.value}
              icon={<DollarSign size={18} color={stats.earnings.color} />}
              color={stats.earnings.color}
              subtitle={stats.earnings.subtitle}
            />
          </View>
        </View>

        {isContractor && (
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, ds.sectionTitle]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {contractorQuickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, ds.quickActionCard]}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <action.icon size={22} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, ds.quickActionLabel]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isDumpsterService && (
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, ds.sectionTitle]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {dumpsterServiceQuickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, ds.quickActionCard]}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <action.icon size={22} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, ds.quickActionLabel]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isPoolBuilder && (
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, ds.sectionTitle]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {poolBuilderQuickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, ds.quickActionCard]}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <action.icon size={22} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, ds.quickActionLabel]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isLandscaper && (
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, ds.sectionTitle]}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {landscaperQuickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, ds.quickActionCard]}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <action.icon size={22} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, ds.quickActionLabel]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {(isPlumber || isElectrician || isInteriorDesigner || isPainter) && (
          <>
            <View style={styles.invitationsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, ds.sectionTitle]}>Project Invitations</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => router.push("/project-invitations" as any)}
                >
                  <Text style={[styles.seeAllText, ds.seeAllText]}>See All</Text>
                  <ArrowRight size={14} color={serviceColor} />
                </TouchableOpacity>
              </View>
              
              {getPendingInvitations().slice(0, 2).map((invitation) => (
                <TouchableOpacity 
                  key={invitation.id} 
                  style={[styles.invitationCard, ds.invitationCard]}
                  onPress={() => router.push("/project-invitations" as any)}
                >
                  <Image
                    source={{ uri: invitation.projectImage }}
                    style={styles.invitationImage}
                    contentFit="cover"
                  />
                  <View style={styles.invitationContent}>
                    <View style={styles.invitationHeader}>
                      <Text style={[styles.invitationTitle, ds.invitationTitle]} numberOfLines={1}>{invitation.projectName}</Text>
                      <View style={[styles.invitationTypeBadge, { backgroundColor: invitation.projectType === 'flip' ? '#10B98120' : '#6366F120' }]}>
                        <Text style={[styles.invitationTypeText, { color: invitation.projectType === 'flip' ? '#10B981' : '#6366F1' }]}>
                          {invitation.projectType.charAt(0).toUpperCase() + invitation.projectType.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.invitationAddressRow}>
                      <MapPin size={12} color={theme.textSecondary} />
                      <Text style={[styles.invitationAddress, ds.invitationAddress]} numberOfLines={1}>{invitation.projectAddress}</Text>
                    </View>
                    <View style={styles.invitationMeta}>
                      <View style={styles.inviterInfo}>
                        <Image
                          source={{ uri: invitation.inviterAvatar }}
                          style={styles.inviterAvatar}
                          contentFit="cover"
                        />
                        <Text style={[styles.inviterName, ds.inviterName]}>{invitation.inviterName}</Text>
                      </View>
                      <Text style={[styles.invitationRole, ds.invitationRole]}>{invitation.role}</Text>
                    </View>
                  </View>
                  <View style={[styles.invitationBadge, ds.invitationBadge]}>
                    <Mail size={14} color={theme.white} />
                  </View>
                </TouchableOpacity>
              ))}
              
              {getPendingInvitations().length === 0 && (
                <View style={[styles.emptyInvitations, ds.emptyInvitations]}>
                  <UserPlus size={32} color={theme.textTertiary} />
                  <Text style={[styles.emptyInvitationsText, ds.emptyInvitationsText]}>No pending invitations</Text>
                </View>
              )}
            </View>

            <View style={styles.quickActionsSection}>
              <Text style={[styles.sectionTitle, ds.sectionTitle]}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {(isElectrician ? electricianQuickActions : isInteriorDesigner ? interiorDesignerQuickActions : isPainter ? painterQuickActions : plumberQuickActions).map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[styles.quickActionCard, ds.quickActionCard]}
                    onPress={() => router.push(action.route as any)}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                      <action.icon size={22} color={action.color} />
                    </View>
                    <Text style={[styles.quickActionLabel, ds.quickActionLabel]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  ratingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingContent: {},
  ratingStars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  ratingLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewReviewsButton: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewReviewsText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  jobAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  jobAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  jobBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jobBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  jobDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  jobDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  jobActions: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  declineText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 0,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "31%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center" as const,
  },
  invitationsSection: {
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  invitationCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden" as const,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  invitationImage: {
    width: 90,
    height: 100,
  },
  invitationContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between" as const,
  },
  invitationHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  invitationTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  invitationTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  invitationTypeText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  invitationAddressRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 4,
  },
  invitationAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  invitationMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginTop: 6,
  },
  inviterInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  inviterAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  inviterName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  invitationRole: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  invitationBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  emptyInvitations: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center" as const,
  },
  emptyInvitationsText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
  },
});
