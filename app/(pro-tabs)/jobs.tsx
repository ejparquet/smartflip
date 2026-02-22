import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MapPin, Clock, Building2, Users, Percent, Star, TrendingUp, Briefcase, CheckCircle, XCircle, ChevronRight, GraduationCap, Award, Scale, DollarSign, Leaf, Droplets, Wrench, Zap, HardHat, Hammer, FileText, Truck, Package, Trash2, Calendar, Phone } from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockRealEstateFirms } from "@/mocks/realtors";
import { mockLandscapeCompanies, mockLandscapeJobs } from "@/mocks/landscapers";
import { mockContractorStores } from "@/mocks/contractors";
import { RealEstateFirm, AgentTag, ProfessionalType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Professional } from "@/types";

type TabType = "firms" | "compare" | "my-applications" | "jobs" | "companies" | "projects" | "builders" | "hauling-jobs" | "hauling-companies";
type ApplicationStatus = "pending" | "under_review" | "interview" | "accepted" | "rejected";

interface Application {
  id: string;
  firmId: string;
  firmName: string;
  firmLogo: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdate: string;
  notes?: string;
}

const mockRealtorApplications: Application[] = [
  {
    id: "app1",
    firmId: "f2",
    firmName: "Keller Williams Realty",
    firmLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    status: "interview",
    appliedDate: "2026-01-15",
    lastUpdate: "2026-01-22",
    notes: "Interview scheduled for Feb 1st at 2 PM",
  },
  {
    id: "app2",
    firmId: "f4",
    firmName: "Compass",
    firmLogo: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400",
    status: "under_review",
    appliedDate: "2026-01-20",
    lastUpdate: "2026-01-21",
  },
  {
    id: "app3",
    firmId: "f1",
    firmName: "RE/MAX Premier",
    firmLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400",
    status: "accepted",
    appliedDate: "2026-01-05",
    lastUpdate: "2026-01-18",
    notes: "Offer: 75/30 split, $15K cap. Response needed by Feb 5th.",
  },
];

interface ContractorJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  projectType: string;
  budget: string;
  duration: string;
  description: string;
  requirements: string[];
  isUrgent?: boolean;
  postedDate: string;
}

interface ConstructionCompany {
  id: string;
  name: string;
  logo: string;
  address: string;
  rating: number;
  reviewCount: number;
  employeeCount: number;
  yearsInBusiness: number;
  specialties: string[];
  avgProjectValue: string;
  isHiring: boolean;
  benefits: string[];
}

const mockContractorJobs: ContractorJob[] = [
  {
    id: "cj1",
    title: "Lead Carpenter - Residential Renovations",
    company: "Sterling Construction",
    companyLogo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    location: "Austin, TX",
    projectType: "Full-time",
    budget: "$65,000 - $85,000/yr",
    duration: "Permanent",
    description: "Seeking experienced lead carpenter for high-end residential renovation projects. Must have strong framing and finishing skills.",
    requirements: ["10+ years experience", "Lead experience", "Own tools"],
    postedDate: "2 days ago",
  },
  {
    id: "cj2",
    title: "Kitchen & Bath Specialist",
    company: "Austin Remodeling Co.",
    companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400",
    location: "Round Rock, TX",
    projectType: "Contract",
    budget: "$45 - $65/hr",
    duration: "6 months",
    description: "Looking for skilled contractor specializing in kitchen and bathroom renovations for multiple flip projects.",
    requirements: ["Kitchen/bath experience", "Licensed", "Insured"],
    isUrgent: true,
    postedDate: "1 day ago",
  },
  {
    id: "cj3",
    title: "Framing Crew Lead",
    company: "Hill Country Homes",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    location: "Cedar Park, TX",
    projectType: "Full-time",
    budget: "$55,000 - $70,000/yr",
    duration: "Permanent",
    description: "New construction builder seeking framing crew lead for residential projects. Great benefits and growth opportunity.",
    requirements: ["5+ years framing", "Crew management", "Blueprint reading"],
    postedDate: "3 days ago",
  },
  {
    id: "cj4",
    title: "General Contractor - Flip Projects",
    company: "FlipPro Investments",
    companyLogo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    location: "Austin, TX",
    projectType: "Project-based",
    budget: "$15,000 - $45,000/project",
    duration: "Per project",
    description: "Real estate investment company seeking reliable GC for ongoing flip projects. Multiple properties available.",
    requirements: ["GC License", "Flip experience", "Fast turnaround"],
    isUrgent: true,
    postedDate: "Today",
  },
];

const mockConstructionCompanies: ConstructionCompany[] = [
  {
    id: "cc1",
    name: "Sterling Construction Group",
    logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    address: "1200 Congress Ave, Austin, TX 78701",
    rating: 4.8,
    reviewCount: 156,
    employeeCount: 85,
    yearsInBusiness: 22,
    specialties: ["Custom Homes", "Renovations", "Commercial"],
    avgProjectValue: "$450K",
    isHiring: true,
    benefits: ["Health Insurance", "401k Match", "Tool Allowance", "Paid Training"],
  },
  {
    id: "cc2",
    name: "Austin Remodeling Co.",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400",
    address: "4500 S Congress Ave, Austin, TX 78745",
    rating: 4.6,
    reviewCount: 98,
    employeeCount: 42,
    yearsInBusiness: 15,
    specialties: ["Kitchen & Bath", "Additions", "Whole House Remodels"],
    avgProjectValue: "$125K",
    isHiring: true,
    benefits: ["Competitive Pay", "Flexible Schedule", "Growth Opportunities"],
  },
  {
    id: "cc3",
    name: "Hill Country Homes",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    address: "200 E Main St, Round Rock, TX 78664",
    rating: 4.7,
    reviewCount: 203,
    employeeCount: 120,
    yearsInBusiness: 28,
    specialties: ["New Construction", "Custom Builds", "Luxury Homes"],
    avgProjectValue: "$650K",
    isHiring: true,
    benefits: ["Full Benefits", "Company Vehicle", "Profit Sharing", "PTO"],
  },
  {
    id: "cc4",
    name: "Precision Builders LLC",
    logo: "https://images.unsplash.com/photo-1541976590-713941681591?w=400",
    address: "789 Industrial Blvd, Pflugerville, TX 78660",
    rating: 4.5,
    reviewCount: 67,
    employeeCount: 35,
    yearsInBusiness: 10,
    specialties: ["Commercial TI", "Office Build-outs", "Retail"],
    avgProjectValue: "$280K",
    isHiring: false,
    benefits: ["Health Insurance", "Paid Holidays"],
  },
];

interface DumpsterJob {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  clientType: "contractor" | "realtor" | "homeowner" | "property_manager";
  location: string;
  debrisType: string;
  estimatedVolume: string;
  dumpsterSize: string;
  budget: string;
  timeline: string;
  description: string;
  requirements: string[];
  isUrgent?: boolean;
  postedDate: string;
  bidDeadline: string;
  bidsReceived: number;
}

interface HaulingCompany {
  id: string;
  name: string;
  logo: string;
  address: string;
  rating: number;
  reviewCount: number;
  fleetSize: number;
  yearsInBusiness: number;
  specialties: string[];
  serviceArea: string;
  isHiring: boolean;
  avgPayRate: string;
  benefits: string[];
}

const mockDumpsterJobs: DumpsterJob[] = [
  {
    id: "dj1",
    title: "Demolition Debris Removal - Kitchen Remodel",
    clientName: "Sterling Construction",
    clientAvatar: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    clientType: "contractor",
    location: "Austin, TX",
    debrisType: "Demolition",
    estimatedVolume: "15-20 cubic yards",
    dumpsterSize: "20 yard",
    budget: "$450 - $600",
    timeline: "Pickup within 3 days",
    description: "Kitchen demo complete. Need debris removal including cabinets, countertops, drywall, and flooring materials.",
    requirements: ["Same-day response", "Weekend availability", "Insured"],
    isUrgent: true,
    postedDate: "2 hours ago",
    bidDeadline: "Today 5:00 PM",
    bidsReceived: 3,
  },
  {
    id: "dj2",
    title: "Construction Site Cleanup - New Build",
    clientName: "Hill Country Homes",
    clientAvatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    clientType: "contractor",
    location: "Cedar Park, TX",
    debrisType: "Construction",
    estimatedVolume: "30-40 cubic yards",
    dumpsterSize: "40 yard",
    budget: "$800 - $1,200",
    timeline: "Weekly pickup - 3 month contract",
    description: "Ongoing construction debris removal for new home build. Need reliable weekly service with potential for long-term partnership.",
    requirements: ["Weekly availability", "Roll-off containers", "Licensed"],
    postedDate: "1 day ago",
    bidDeadline: "Jan 30, 2026",
    bidsReceived: 7,
  },
  {
    id: "dj3",
    title: "Flip Property Cleanout",
    clientName: "FlipPro Investments",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    clientType: "realtor",
    location: "Round Rock, TX",
    debrisType: "Mixed",
    estimatedVolume: "10-15 cubic yards",
    dumpsterSize: "15 yard",
    budget: "$350 - $500",
    timeline: "Next 48 hours",
    description: "Full property cleanout needed before renovation begins. Includes old furniture, appliances, yard waste, and general junk.",
    requirements: ["Appliance removal", "Flexible scheduling"],
    isUrgent: true,
    postedDate: "4 hours ago",
    bidDeadline: "Tomorrow 12:00 PM",
    bidsReceived: 5,
  },
  {
    id: "dj4",
    title: "Concrete & Masonry Disposal",
    clientName: "Austin Remodeling Co.",
    clientAvatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400",
    clientType: "contractor",
    location: "Austin, TX",
    debrisType: "Concrete/Masonry",
    estimatedVolume: "8-10 cubic yards",
    dumpsterSize: "10 yard heavy",
    budget: "$400 - $550",
    timeline: "Pickup needed Friday",
    description: "Driveway demo complete. Heavy concrete and masonry debris requiring specialized disposal.",
    requirements: ["Heavy load capacity", "Concrete recycling preferred"],
    postedDate: "Yesterday",
    bidDeadline: "Jan 29, 2026",
    bidsReceived: 2,
  },
  {
    id: "dj5",
    title: "Yard Waste Removal - Landscaping Project",
    clientName: "Green Vista Landscaping",
    clientAvatar: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    clientType: "contractor",
    location: "Lakeway, TX",
    debrisType: "Yard Waste",
    estimatedVolume: "20-25 cubic yards",
    dumpsterSize: "30 yard",
    budget: "$300 - $450",
    timeline: "Weekly for 2 months",
    description: "Large landscaping renovation generating significant yard waste. Trees, shrubs, soil, and organic materials.",
    requirements: ["Green waste certified", "Composting available"],
    postedDate: "2 days ago",
    bidDeadline: "Feb 1, 2026",
    bidsReceived: 4,
  },
  {
    id: "dj6",
    title: "Appliance & E-Waste Pickup",
    clientName: "Sarah Mitchell",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    clientType: "homeowner",
    location: "Pflugerville, TX",
    debrisType: "Appliances",
    estimatedVolume: "2-3 cubic yards",
    dumpsterSize: "Truck load",
    budget: "$150 - $250",
    timeline: "This weekend",
    description: "Replacing kitchen appliances. Need old refrigerator, dishwasher, and microwave removed. Also have old TV and computer equipment.",
    requirements: ["E-waste certified", "Haul away service"],
    postedDate: "6 hours ago",
    bidDeadline: "Jan 31, 2026",
    bidsReceived: 1,
  },
];

const mockHaulingCompanies: HaulingCompany[] = [
  {
    id: "hc1",
    name: "Texas Debris Solutions",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    address: "4500 Industrial Blvd, Austin, TX 78744",
    rating: 4.8,
    reviewCount: 234,
    fleetSize: 25,
    yearsInBusiness: 15,
    specialties: ["Construction Debris", "Demolition", "Roll-off Containers"],
    serviceArea: "Greater Austin Metro",
    isHiring: true,
    avgPayRate: "$22-30/hr",
    benefits: ["Health Insurance", "401k", "CDL Training", "Performance Bonuses"],
  },
  {
    id: "hc2",
    name: "Capital City Hauling",
    logo: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    address: "890 Commerce St, Round Rock, TX 78664",
    rating: 4.6,
    reviewCount: 156,
    fleetSize: 18,
    yearsInBusiness: 10,
    specialties: ["Residential Cleanout", "Junk Removal", "Recycling"],
    serviceArea: "Austin, Round Rock, Cedar Park",
    isHiring: true,
    avgPayRate: "$18-25/hr",
    benefits: ["Flexible Schedule", "Weekly Pay", "Growth Opportunities"],
  },
  {
    id: "hc3",
    name: "EcoWaste Management",
    logo: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    address: "2100 Green Valley Rd, Austin, TX 78745",
    rating: 4.9,
    reviewCount: 312,
    fleetSize: 35,
    yearsInBusiness: 22,
    specialties: ["Green Waste", "Recycling", "Hazardous Materials"],
    serviceArea: "Central Texas",
    isHiring: true,
    avgPayRate: "$24-32/hr",
    benefits: ["Full Benefits", "Company Vehicle", "Paid Training", "PTO"],
  },
  {
    id: "hc4",
    name: "Hill Country Disposal",
    logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
    address: "567 Quarry Rd, Cedar Park, TX 78613",
    rating: 4.5,
    reviewCount: 89,
    fleetSize: 12,
    yearsInBusiness: 8,
    specialties: ["Concrete", "Heavy Materials", "Commercial"],
    serviceArea: "Cedar Park, Leander, Liberty Hill",
    isHiring: false,
    avgPayRate: "$20-28/hr",
    benefits: ["Competitive Pay", "Overtime Available"],
  },
];

const mockDumpsterApplications: Application[] = [
  {
    id: "dapp1",
    firmId: "hc1",
    firmName: "Texas Debris Solutions",
    firmLogo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    status: "interview",
    appliedDate: "2026-01-22",
    lastUpdate: "2026-01-26",
    notes: "Skills test and driving evaluation scheduled for Jan 30th",
  },
  {
    id: "dapp2",
    firmId: "hc3",
    firmName: "EcoWaste Management",
    firmLogo: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    status: "accepted",
    appliedDate: "2026-01-15",
    lastUpdate: "2026-01-24",
    notes: "Offer: $26/hr + benefits. CDL training provided. Start date: Feb 5th",
  },
  {
    id: "dapp3",
    firmId: "hc2",
    firmName: "Capital City Hauling",
    firmLogo: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    status: "under_review",
    appliedDate: "2026-01-25",
    lastUpdate: "2026-01-26",
  },
];

const mockContractorApplications: Application[] = [
  {
    id: "capp1",
    firmId: "cc1",
    firmName: "Sterling Construction Group",
    firmLogo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    status: "interview",
    appliedDate: "2026-01-20",
    lastUpdate: "2026-01-25",
    notes: "Skills assessment scheduled for Jan 30th at job site",
  },
  {
    id: "capp2",
    firmId: "cc2",
    firmName: "Austin Remodeling Co.",
    firmLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400",
    status: "accepted",
    appliedDate: "2026-01-15",
    lastUpdate: "2026-01-22",
    notes: "Offer: $55/hr for K&B projects. Start date: Feb 3rd",
  },
  {
    id: "capp3",
    firmId: "cc3",
    firmName: "Hill Country Homes",
    firmLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    status: "under_review",
    appliedDate: "2026-01-24",
    lastUpdate: "2026-01-25",
  },
];

const mockLandscaperApplications: Application[] = [
  {
    id: "lapp1",
    firmId: "lc1",
    firmName: "Green Vista Landscaping",
    firmLogo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    status: "interview",
    appliedDate: "2026-01-18",
    lastUpdate: "2026-01-24",
    notes: "Skills assessment scheduled for Jan 30th",
  },
  {
    id: "lapp2",
    firmId: "lc2",
    firmName: "Austin Elite Landscapes",
    firmLogo: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400",
    status: "accepted",
    appliedDate: "2026-01-10",
    lastUpdate: "2026-01-20",
    notes: "Offer: $24/hr + benefits. Start date flexible.",
  },
];

export default function JobsScreen() {
  const { user } = useAuth();
  const professional = user as Professional | null;
  const isRealtor = professional?.professionalType === "realtor";
  const isLandscaper = professional?.professionalType === "landscaper";
  const isContractor = professional?.professionalType === "contractor";
  const isDumpsterService = professional?.professionalType === "dumpster_service";

  const defaultTab = isRealtor ? "firms" : isContractor ? "projects" : isDumpsterService ? "hauling-jobs" : "jobs";
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [selectedFirmsForCompare, setSelectedFirmsForCompare] = useState<string[]>([]);

  const applications = isRealtor ? mockRealtorApplications : isContractor ? mockContractorApplications : isDumpsterService ? mockDumpsterApplications : mockLandscaperApplications;

  const hiringFirms = useMemo(() => {
    return mockRealEstateFirms.filter((f) => f.isHiring);
  }, []);

  const hiringCompanies = useMemo(() => {
    return mockLandscapeCompanies.filter((c) => c.isHiring);
  }, []);

  const hiringConstructionCompanies = useMemo(() => {
    return mockConstructionCompanies.filter((c) => c.isHiring);
  }, []);

  const hiringHaulingCompanies = useMemo(() => {
    return mockHaulingCompanies.filter((c) => c.isHiring);
  }, []);

  const getApplicationStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "pending": return Colors.textSecondary;
      case "under_review": return Colors.warning;
      case "interview": return "#8B5CF6";
      case "accepted": return Colors.success;
      case "rejected": return Colors.error;
    }
  };

  const getApplicationStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "under_review": return "Under Review";
      case "interview": return "Interview";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
    }
  };

  const getAgentTagStyle = (tag?: AgentTag) => {
    switch (tag) {
      case "top_producer": return { bg: "#E8E9EE", text: "#D97706", label: "Top Producer" };
      case "mentor": return { bg: "#DBEAFE", text: "#2563EB", label: "Mentor" };
      case "new": return { bg: "#D1FAE5", text: "#059669", label: "New" };
      default: return null;
    }
  };

  const toggleFirmCompare = (firmId: string) => {
    setSelectedFirmsForCompare((prev) => {
      if (prev.includes(firmId)) return prev.filter((id) => id !== firmId);
      if (prev.length >= 3) return prev;
      return [...prev, firmId];
    });
  };

  const getSelectedFirmsData = () => {
    return selectedFirmsForCompare.map((id) => mockRealEstateFirms.find((f) => f.id === id)).filter(Boolean) as RealEstateFirm[];
  };

  const getDebrisTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "demolition": return "#EF4444";
      case "construction": return "#272D53";
      case "yard waste": return "#22C55E";
      case "mixed": return "#8B5CF6";
      case "concrete/masonry": return "#6B7280";
      case "appliances": return "#3B82F6";
      case "hazardous": return "#DC2626";
      default: return "#78716C";
    }
  };

  const getTabsForType = (): { key: TabType; label: string; icon: React.ReactNode }[] => {
    if (isRealtor) {
      return [
        { key: "firms", label: "Firms & Jobs", icon: <Building2 size={16} color={activeTab === "firms" ? Colors.white : Colors.textSecondary} /> },
        { key: "compare", label: "Compare", icon: <Scale size={16} color={activeTab === "compare" ? Colors.white : Colors.textSecondary} /> },
        { key: "my-applications", label: "My Applications", icon: <Briefcase size={16} color={activeTab === "my-applications" ? Colors.white : Colors.textSecondary} /> },
      ];
    }
    if (isContractor) {
      return [
        { key: "projects", label: "Projects & Jobs", icon: <HardHat size={16} color={activeTab === "projects" ? Colors.white : Colors.textSecondary} /> },
        { key: "builders", label: "Builders", icon: <Building2 size={16} color={activeTab === "builders" ? Colors.white : Colors.textSecondary} /> },
        { key: "my-applications", label: "My Applications", icon: <FileText size={16} color={activeTab === "my-applications" ? Colors.white : Colors.textSecondary} /> },
      ];
    }
    if (isDumpsterService) {
      return [
        { key: "hauling-jobs", label: "Bid Opportunities", icon: <Truck size={16} color={activeTab === "hauling-jobs" ? Colors.white : Colors.textSecondary} /> },
        { key: "hauling-companies", label: "Companies", icon: <Building2 size={16} color={activeTab === "hauling-companies" ? Colors.white : Colors.textSecondary} /> },
        { key: "my-applications", label: "My Bids", icon: <FileText size={16} color={activeTab === "my-applications" ? Colors.white : Colors.textSecondary} /> },
      ];
    }
    return [
      { key: "jobs", label: "Job Listings", icon: <Briefcase size={16} color={activeTab === "jobs" ? Colors.white : Colors.textSecondary} /> },
      { key: "companies", label: "Companies", icon: <Building2 size={16} color={activeTab === "companies" ? Colors.white : Colors.textSecondary} /> },
      { key: "my-applications", label: "My Applications", icon: <CheckCircle size={16} color={activeTab === "my-applications" ? Colors.white : Colors.textSecondary} /> },
    ];
  };

  const tabs = getTabsForType();

  const renderFirmCard = (firm: RealEstateFirm, showCompareToggle = false) => {
    const isSelected = selectedFirmsForCompare.includes(firm.id);
    return (
      <TouchableOpacity key={firm.id} style={[styles.firmCard, isSelected && showCompareToggle && styles.firmCardSelected]} onPress={() => router.push(`/firm/${firm.id}` as any)} activeOpacity={0.7}>
        <View style={styles.firmHeader}>
          <Image source={{ uri: firm.logo }} style={styles.firmCardLogo} contentFit="cover" />
          <View style={styles.firmInfo}>
            <View style={styles.firmNameRow}>
              <Text style={styles.firmCardName}>{firm.name}</Text>
              {firm.isHiring && (
                <View style={styles.hiringBadge}>
                  <Briefcase size={10} color={Colors.success} />
                  <Text style={styles.hiringText}>Hiring</Text>
                </View>
              )}
            </View>
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>{firm.address}</Text>
            </View>
            <View style={styles.firmMetaRow}>
              <Star size={12} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.firmRatingText}>{firm.rating} ({firm.reviewCount})</Text>
              <Users size={12} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
              <Text style={styles.firmRatingText}>{firm.agentCount} agents</Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </View>
        <View style={styles.firmStats}>
          <View style={styles.firmStat}>
            <Text style={styles.firmStatLabel}>Split</Text>
            <Text style={styles.firmStatValue} numberOfLines={1}>{firm.commissionSplit || "N/A"}</Text>
          </View>
          <View style={styles.firmStatDivider} />
          <View style={styles.firmStat}>
            <Text style={styles.firmStatLabel}>Fees</Text>
            <Text style={styles.firmStatValue} numberOfLines={1}>{firm.fees || "N/A"}</Text>
          </View>
          <View style={styles.firmStatDivider} />
          <View style={styles.firmStat}>
            <Text style={styles.firmStatLabel}>Leads</Text>
            {firm.leadsProvided ? <CheckCircle size={16} color={Colors.success} /> : <XCircle size={16} color={Colors.error} />}
          </View>
        </View>
        {firm.featuredAgents && firm.featuredAgents.length > 0 && (
          <View style={styles.featuredAgentsSection}>
            <Text style={styles.featuredAgentsLabel}>Featured Agents:</Text>
            <View style={styles.featuredAgentsList}>
              {firm.featuredAgents.slice(0, 3).map((agent) => {
                const tagStyle = getAgentTagStyle(agent.tag);
                return (
                  <View key={agent.id} style={styles.featuredAgentChip}>
                    <Image source={{ uri: agent.avatar }} style={styles.featuredAgentAvatar} contentFit="cover" />
                    {tagStyle && (
                      <View style={[styles.agentMiniTag, { backgroundColor: tagStyle.bg }]}>
                        <Text style={[styles.agentMiniTagText, { color: tagStyle.text }]}>{tagStyle.label}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
        <View style={styles.specialtiesTags}>
          {firm.specialties.slice(0, 3).map((spec, idx) => (
            <View key={idx} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{spec}</Text>
            </View>
          ))}
        </View>
        <View style={styles.firmActions}>
          {showCompareToggle ? (
            <TouchableOpacity style={[styles.compareToggleBtn, isSelected && styles.compareToggleBtnActive]} onPress={(e) => { e.stopPropagation(); toggleFirmCompare(firm.id); }}>
              <Text style={[styles.compareToggleText, isSelected && styles.compareToggleTextActive]}>{isSelected ? "Selected" : "Add to Compare"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.viewProfileBtn} onPress={() => router.push(`/firm/${firm.id}` as any)}>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
          )}
          {firm.isHiring && (
            <TouchableOpacity style={styles.requestJoinBtn} onPress={() => router.push(`/firm/${firm.id}` as any)}>
              <Text style={styles.requestJoinText}>Request to Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderLandscapeJobCard = (job: typeof mockLandscapeJobs[0]) => (
    <TouchableOpacity key={job.id} style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Image source={{ uri: job.companyLogo }} style={styles.jobCompanyLogo} contentFit="cover" />
        <View style={styles.jobInfo}>
          <View style={styles.jobTitleRow}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {job.isUrgent && (
              <View style={styles.urgentBadge}>
                <Zap size={10} color={Colors.white} />
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={styles.jobCompany}>{job.company}</Text>
          <View style={styles.jobMetaRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.jobMetaText}>{job.location}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.jobDescription} numberOfLines={2}>{job.description}</Text>
      <View style={styles.jobDetails}>
        <View style={styles.jobDetail}>
          <DollarSign size={14} color={Colors.success} />
          <Text style={styles.jobDetailText}>{job.payRate}</Text>
        </View>
        <View style={styles.jobDetail}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.jobDetailText}>{job.jobType}</Text>
        </View>
      </View>
      <View style={styles.requirementsTags}>
        {job.requirements.slice(0, 2).map((req, idx) => (
          <View key={idx} style={styles.requirementTag}>
            <Text style={styles.requirementText}>{req}</Text>
          </View>
        ))}
      </View>
      <View style={styles.jobActions}>
        <TouchableOpacity style={styles.saveJobBtn}>
          <Text style={styles.saveJobText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderLandscapeCompanyCard = (company: typeof mockLandscapeCompanies[0]) => (
    <TouchableOpacity key={company.id} style={styles.firmCard}>
      <View style={styles.firmHeader}>
        <Image source={{ uri: company.logo }} style={styles.firmCardLogo} contentFit="cover" />
        <View style={styles.firmInfo}>
          <View style={styles.firmNameRow}>
            <Text style={styles.firmCardName}>{company.name}</Text>
            {company.isHiring && (
              <View style={styles.hiringBadge}>
                <Briefcase size={10} color={Colors.success} />
                <Text style={styles.hiringText}>Hiring</Text>
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>{company.address}</Text>
          </View>
          <View style={styles.firmMetaRow}>
            <Star size={12} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.firmRatingText}>{company.rating} ({company.reviewCount})</Text>
            <Users size={12} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
            <Text style={styles.firmRatingText}>{company.employeeCount} employees</Text>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textSecondary} />
      </View>
      <View style={styles.firmStats}>
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Pay Rate</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.hourlyRate}</Text>
        </View>
        <View style={styles.firmStatDivider} />
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Experience</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.yearsInBusiness} yrs</Text>
        </View>
        <View style={styles.firmStatDivider} />
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Insured</Text>
          <CheckCircle size={16} color={Colors.success} />
        </View>
      </View>
      <View style={styles.specialtiesTags}>
        {company.specialties.slice(0, 3).map((spec, idx) => (
          <View key={idx} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{spec}</Text>
          </View>
        ))}
      </View>
      <View style={styles.firmActions}>
        <TouchableOpacity style={styles.viewProfileBtn}>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
        {company.isHiring && (
          <TouchableOpacity style={styles.requestJoinBtn}>
            <Text style={styles.requestJoinText}>Apply</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFirms = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Real Estate Firms Hiring</Text>
        <Text style={styles.sectionSubtitle}>{hiringFirms.length} firms actively recruiting</Text>
      </View>
      {hiringFirms.map((firm) => renderFirmCard(firm, false))}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>All Firms</Text>
        <Text style={styles.sectionSubtitle}>{mockRealEstateFirms.length} firms in your area</Text>
      </View>
      {mockRealEstateFirms.map((firm) => renderFirmCard(firm, false))}
    </>
  );

  const renderJobs = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Positions</Text>
        <Text style={styles.sectionSubtitle}>{mockLandscapeJobs.length} jobs matching your skills</Text>
      </View>
      {mockLandscapeJobs.map((job) => renderLandscapeJobCard(job))}
    </>
  );

  const renderCompanies = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Companies Hiring</Text>
        <Text style={styles.sectionSubtitle}>{hiringCompanies.length} companies actively recruiting</Text>
      </View>
      {hiringCompanies.map((company) => renderLandscapeCompanyCard(company))}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>All Companies</Text>
        <Text style={styles.sectionSubtitle}>{mockLandscapeCompanies.length} companies in your area</Text>
      </View>
      {mockLandscapeCompanies.map((company) => renderLandscapeCompanyCard(company))}
    </>
  );

  const renderContractorJobCard = (job: ContractorJob) => (
    <TouchableOpacity key={job.id} style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Image source={{ uri: job.companyLogo }} style={styles.jobCompanyLogo} contentFit="cover" />
        <View style={styles.jobInfo}>
          <View style={styles.jobTitleRow}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {job.isUrgent && (
              <View style={styles.urgentBadge}>
                <Zap size={10} color={Colors.white} />
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={styles.jobCompany}>{job.company}</Text>
          <View style={styles.jobMetaRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.jobMetaText}>{job.location}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.jobDescription} numberOfLines={2}>{job.description}</Text>
      <View style={styles.jobDetails}>
        <View style={styles.jobDetail}>
          <DollarSign size={14} color={Colors.success} />
          <Text style={styles.jobDetailText}>{job.budget}</Text>
        </View>
        <View style={styles.jobDetail}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.jobDetailText}>{job.duration}</Text>
        </View>
      </View>
      <View style={styles.requirementsTags}>
        {job.requirements.slice(0, 3).map((req, idx) => (
          <View key={idx} style={styles.requirementTag}>
            <Text style={styles.requirementText}>{req}</Text>
          </View>
        ))}
      </View>
      <View style={styles.jobActions}>
        <TouchableOpacity style={styles.saveJobBtn}>
          <Text style={styles.saveJobText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.applyBtn, { backgroundColor: "#272D53" }]}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderConstructionCompanyCard = (company: ConstructionCompany) => (
    <TouchableOpacity key={company.id} style={styles.firmCard}>
      <View style={styles.firmHeader}>
        <Image source={{ uri: company.logo }} style={styles.firmCardLogo} contentFit="cover" />
        <View style={styles.firmInfo}>
          <View style={styles.firmNameRow}>
            <Text style={styles.firmCardName}>{company.name}</Text>
            {company.isHiring && (
              <View style={styles.hiringBadge}>
                <Briefcase size={10} color={Colors.success} />
                <Text style={styles.hiringText}>Hiring</Text>
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>{company.address}</Text>
          </View>
          <View style={styles.firmMetaRow}>
            <Star size={12} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.firmRatingText}>{company.rating} ({company.reviewCount})</Text>
            <Users size={12} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
            <Text style={styles.firmRatingText}>{company.employeeCount} employees</Text>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textSecondary} />
      </View>
      <View style={styles.firmStats}>
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Avg Project</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.avgProjectValue}</Text>
        </View>
        <View style={styles.firmStatDivider} />
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Experience</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.yearsInBusiness} yrs</Text>
        </View>
        <View style={styles.firmStatDivider} />
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Benefits</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.benefits.length}+</Text>
        </View>
      </View>
      <View style={styles.specialtiesTags}>
        {company.specialties.slice(0, 3).map((spec, idx) => (
          <View key={idx} style={[styles.specialtyTag, { backgroundColor: "#E8E9EE" }]}>
            <Text style={[styles.specialtyText, { color: "#B45309" }]}>{spec}</Text>
          </View>
        ))}
      </View>
      <View style={styles.firmActions}>
        <TouchableOpacity style={styles.viewProfileBtn}>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
        {company.isHiring && (
          <TouchableOpacity style={[styles.requestJoinBtn, { backgroundColor: "#272D53" }]}>
            <Text style={styles.requestJoinText}>Apply</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContractorProjects = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Projects</Text>
        <Text style={styles.sectionSubtitle}>{mockContractorJobs.length} projects matching your skills</Text>
      </View>
      {mockContractorJobs.map((job) => renderContractorJobCard(job))}
    </>
  );

  const renderBuilders = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Construction Companies Hiring</Text>
        <Text style={styles.sectionSubtitle}>{hiringConstructionCompanies.length} companies actively recruiting</Text>
      </View>
      {hiringConstructionCompanies.map((company) => renderConstructionCompanyCard(company))}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>All Construction Companies</Text>
        <Text style={styles.sectionSubtitle}>{mockConstructionCompanies.length} companies in your area</Text>
      </View>
      {mockConstructionCompanies.map((company) => renderConstructionCompanyCard(company))}
    </>
  );

  const renderDumpsterJobCard = (job: DumpsterJob) => {
    const debrisColor = getDebrisTypeColor(job.debrisType);
    return (
      <TouchableOpacity key={job.id} style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Image source={{ uri: job.clientAvatar }} style={styles.jobCompanyLogo} contentFit="cover" />
          <View style={styles.jobInfo}>
            <View style={styles.jobTitleRow}>
              <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
              {job.isUrgent && (
                <View style={styles.urgentBadge}>
                  <Zap size={10} color={Colors.white} />
                  <Text style={styles.urgentText}>Urgent</Text>
                </View>
              )}
            </View>
            <Text style={styles.jobCompany}>{job.clientName}</Text>
            <View style={styles.jobMetaRow}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text style={styles.jobMetaText}>{job.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.dumpsterJobMeta}>
          <View style={[styles.debrisTypeBadge, { backgroundColor: `${debrisColor}15` }]}>
            <Trash2 size={12} color={debrisColor} />
            <Text style={[styles.debrisTypeText, { color: debrisColor }]}>{job.debrisType}</Text>
          </View>
          <View style={styles.dumpsterSizeBadge}>
            <Package size={12} color={Colors.textSecondary} />
            <Text style={styles.dumpsterSizeText}>{job.dumpsterSize}</Text>
          </View>
          <View style={styles.bidCountBadge}>
            <Users size={12} color="#8B5CF6" />
            <Text style={styles.bidCountText}>{job.bidsReceived} bids</Text>
          </View>
        </View>
        <Text style={styles.jobDescription} numberOfLines={2}>{job.description}</Text>
        <View style={styles.jobDetails}>
          <View style={styles.jobDetail}>
            <DollarSign size={14} color={Colors.success} />
            <Text style={styles.jobDetailText}>{job.budget}</Text>
          </View>
          <View style={styles.jobDetail}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.jobDetailText}>{job.timeline}</Text>
          </View>
        </View>
        <View style={styles.bidDeadlineRow}>
          <Calendar size={12} color={Colors.warning} />
          <Text style={styles.bidDeadlineText}>Bid by: {job.bidDeadline}</Text>
        </View>
        <View style={styles.requirementsTags}>
          {job.requirements.slice(0, 3).map((req, idx) => (
            <View key={idx} style={styles.requirementTag}>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>
        <View style={styles.jobActions}>
          <TouchableOpacity style={styles.saveJobBtn}>
            <Phone size={16} color={Colors.text} />
            <Text style={styles.saveJobText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: "#78716C" }]}>
            <Text style={styles.applyText}>Submit Bid</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHaulingCompanyCard = (company: HaulingCompany) => (
    <TouchableOpacity key={company.id} style={styles.firmCard}>
      <View style={styles.firmHeader}>
        <Image source={{ uri: company.logo }} style={styles.firmCardLogo} contentFit="cover" />
        <View style={styles.firmInfo}>
          <View style={styles.firmNameRow}>
            <Text style={styles.firmCardName}>{company.name}</Text>
            {company.isHiring && (
              <View style={styles.hiringBadge}>
                <Briefcase size={10} color={Colors.success} />
                <Text style={styles.hiringText}>Hiring</Text>
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>{company.address}</Text>
          </View>
          <View style={styles.firmMetaRow}>
            <Star size={12} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.firmRatingText}>{company.rating} ({company.reviewCount})</Text>
            <Truck size={12} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
            <Text style={styles.firmRatingText}>{company.fleetSize} trucks</Text>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textSecondary} />
      </View>
      <View style={styles.firmStats}>
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Pay Rate</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.avgPayRate}</Text>
        </View>
        <View style={styles.firmStatDivider} />
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Experience</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.yearsInBusiness} yrs</Text>
        </View>
        <View style={styles.firmStatDivider} />
        <View style={styles.firmStat}>
          <Text style={styles.firmStatLabel}>Service Area</Text>
          <Text style={styles.firmStatValue} numberOfLines={1}>{company.serviceArea.split(",")[0]}</Text>
        </View>
      </View>
      <View style={styles.specialtiesTags}>
        {company.specialties.slice(0, 3).map((spec, idx) => (
          <View key={idx} style={[styles.specialtyTag, { backgroundColor: "#F5F5F4" }]}>
            <Text style={[styles.specialtyText, { color: "#57534E" }]}>{spec}</Text>
          </View>
        ))}
      </View>
      {company.benefits.length > 0 && (
        <View style={styles.benefitsPreview}>
          <Text style={styles.benefitsLabel}>Benefits:</Text>
          <Text style={styles.benefitsText} numberOfLines={1}>{company.benefits.slice(0, 3).join(" • ")}</Text>
        </View>
      )}
      <View style={styles.firmActions}>
        <TouchableOpacity style={styles.viewProfileBtn}>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
        {company.isHiring && (
          <TouchableOpacity style={[styles.requestJoinBtn, { backgroundColor: "#78716C" }]}>
            <Text style={styles.requestJoinText}>Apply</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHaulingJobs = () => {
    const urgentJobs = mockDumpsterJobs.filter(j => j.isUrgent);
    const regularJobs = mockDumpsterJobs.filter(j => !j.isUrgent);
    return (
      <>
        <View style={styles.haulingStatsRow}>
          <View style={[styles.haulingStat, { backgroundColor: "#FEF2F2" }]}>
            <Zap size={18} color="#EF4444" />
            <Text style={styles.haulingStatValue}>{urgentJobs.length}</Text>
            <Text style={styles.haulingStatLabel}>Urgent</Text>
          </View>
          <View style={[styles.haulingStat, { backgroundColor: "#F0FDF4" }]}>
            <Truck size={18} color="#22C55E" />
            <Text style={styles.haulingStatValue}>{mockDumpsterJobs.length}</Text>
            <Text style={styles.haulingStatLabel}>Available</Text>
          </View>
          <View style={[styles.haulingStat, { backgroundColor: "#F5F5F4" }]}>
            <DollarSign size={18} color="#78716C" />
            <Text style={styles.haulingStatValue}>$5.2K</Text>
            <Text style={styles.haulingStatLabel}>Total Value</Text>
          </View>
        </View>
        {urgentJobs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Zap size={18} color="#EF4444" />
                <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>Urgent - Bid Now</Text>
              </View>
              <Text style={styles.sectionSubtitle}>{urgentJobs.length} jobs need immediate response</Text>
            </View>
            {urgentJobs.map((job) => renderDumpsterJobCard(job))}
          </>
        )}
        <View style={[styles.sectionHeader, { marginTop: urgentJobs.length > 0 ? 20 : 0 }]}>
          <Text style={styles.sectionTitle}>All Opportunities</Text>
          <Text style={styles.sectionSubtitle}>{regularJobs.length} hauling jobs in your area</Text>
        </View>
        {regularJobs.map((job) => renderDumpsterJobCard(job))}
      </>
    );
  };

  const renderHaulingCompanies = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Companies Hiring</Text>
        <Text style={styles.sectionSubtitle}>{hiringHaulingCompanies.length} hauling companies actively recruiting</Text>
      </View>
      {hiringHaulingCompanies.map((company) => renderHaulingCompanyCard(company))}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>All Hauling Companies</Text>
        <Text style={styles.sectionSubtitle}>{mockHaulingCompanies.length} companies in your area</Text>
      </View>
      {mockHaulingCompanies.map((company) => renderHaulingCompanyCard(company))}
    </>
  );

  const renderCompare = () => (
    <>
      <View style={styles.compareHeader}>
        <Text style={styles.compareTitle}>Compare Firms</Text>
        <Text style={styles.compareSubtitle}>Select up to 3 firms to compare side-by-side</Text>
      </View>
      {selectedFirmsForCompare.length > 0 && (
        <View style={styles.compareSelectedSection}>
          <Text style={styles.compareSelectedTitle}>{selectedFirmsForCompare.length} firm{selectedFirmsForCompare.length > 1 ? "s" : ""} selected</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compareTableScroll}>
            <View style={styles.compareTable}>
              <View style={styles.compareRowHeader}>
                <View style={styles.compareLabelCell}><Text style={styles.compareLabelText}>Firm</Text></View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <Image source={{ uri: firm.logo }} style={styles.compareFirmLogo} contentFit="cover" />
                    <Text style={styles.compareFirmName} numberOfLines={2}>{firm.name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.compareRow}>
                <View style={styles.compareLabelCell}><Star size={14} color={Colors.textSecondary} /><Text style={styles.compareLabelText}>Rating</Text></View>
                {getSelectedFirmsData().map((firm) => (<View key={firm.id} style={styles.compareValueCell}><Text style={styles.compareValueText}>{firm.rating} ({firm.reviewCount})</Text></View>))}
              </View>
              <View style={styles.compareRow}>
                <View style={styles.compareLabelCell}><Percent size={14} color={Colors.textSecondary} /><Text style={styles.compareLabelText}>Split</Text></View>
                {getSelectedFirmsData().map((firm) => (<View key={firm.id} style={styles.compareValueCell}><Text style={styles.compareValueText} numberOfLines={2}>{firm.commissionSplit || "N/A"}</Text></View>))}
              </View>
              <View style={styles.compareRow}>
                <View style={styles.compareLabelCell}><DollarSign size={14} color={Colors.textSecondary} /><Text style={styles.compareLabelText}>Fees</Text></View>
                {getSelectedFirmsData().map((firm) => (<View key={firm.id} style={styles.compareValueCell}><Text style={styles.compareValueText} numberOfLines={2}>{firm.fees || "N/A"}</Text></View>))}
              </View>
              <View style={styles.compareRow}>
                <View style={styles.compareLabelCell}><DollarSign size={14} color={Colors.textSecondary} /><Text style={styles.compareLabelText}>Cap</Text></View>
                {getSelectedFirmsData().map((firm) => (<View key={firm.id} style={styles.compareValueCell}><Text style={styles.compareValueText} numberOfLines={2}>{firm.capAmount || "N/A"}</Text></View>))}
              </View>
              <View style={styles.compareRow}>
                <View style={styles.compareLabelCell}><GraduationCap size={14} color={Colors.textSecondary} /><Text style={styles.compareLabelText}>Training</Text></View>
                {getSelectedFirmsData().map((firm) => (<View key={firm.id} style={styles.compareValueCell}><Text style={styles.compareValueText} numberOfLines={3}>{firm.trainingProgram || "N/A"}</Text></View>))}
              </View>
              <View style={styles.compareRow}>
                <View style={styles.compareLabelCell}><Users size={14} color={Colors.textSecondary} /><Text style={styles.compareLabelText}>Leads</Text></View>
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    {firm.leadsProvided ? (
                      <View style={styles.compareLeadsYes}><CheckCircle size={16} color={Colors.success} /><Text style={{ color: Colors.success, fontWeight: "600" as const }}>Yes</Text></View>
                    ) : (
                      <View style={styles.compareLeadsNo}><XCircle size={16} color={Colors.error} /><Text style={{ color: Colors.error, fontWeight: "600" as const }}>No</Text></View>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.compareActions}>
                <View style={styles.compareLabelCell} />
                {getSelectedFirmsData().map((firm) => (
                  <View key={firm.id} style={styles.compareValueCell}>
                    <TouchableOpacity style={styles.compareViewBtn} onPress={() => router.push(`/firm/${firm.id}` as any)}>
                      <Text style={styles.compareViewBtnText}>View Profile</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Select Firms to Compare</Text></View>
      {mockRealEstateFirms.map((firm) => renderFirmCard(firm, true))}
    </>
  );

  const renderApplications = () => (
    <>
      <View style={styles.applicationsSummary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{applications.length}</Text>
          <Text style={styles.summaryLabel}>Total Applications</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>{applications.filter((a) => a.status === "accepted").length}</Text>
          <Text style={styles.summaryLabel}>Accepted</Text>
        </View>
      </View>
      {applications.map((app) => (
        <TouchableOpacity key={app.id} style={styles.applicationCard} onPress={() => isRealtor ? router.push(`/firm/${app.firmId}` as any) : null}>
          <View style={styles.applicationHeader}>
            <Image source={{ uri: app.firmLogo }} style={styles.applicationLogo} contentFit="cover" />
            <View style={styles.applicationInfo}>
              <Text style={styles.applicationFirmName}>{app.firmName}</Text>
              <Text style={styles.applicationDate}>Applied {new Date(app.appliedDate).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.applicationStatusBadge, { backgroundColor: `${getApplicationStatusColor(app.status)}15` }]}>
              <Text style={[styles.applicationStatusText, { color: getApplicationStatusColor(app.status) }]}>{getApplicationStatusLabel(app.status)}</Text>
            </View>
          </View>
          {app.notes && (
            <View style={styles.applicationNotesContainer}>
              <Text style={styles.applicationNotes}>{app.notes}</Text>
            </View>
          )}
          <View style={styles.applicationFooter}>
            <View style={styles.applicationLastUpdate}>
              <Clock size={12} color={Colors.textSecondary} />
              <Text style={styles.applicationLastUpdateText}>Last updated {new Date(app.lastUpdate).toLocaleDateString()}</Text>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      ))}
      {applications.length === 0 && (
        <View style={styles.emptyState}>
          <Briefcase size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
          <Text style={styles.emptyStateSubtitle}>{isRealtor ? "Browse firms and submit your first application" : isContractor ? "Browse projects and construction companies to apply" : "Browse jobs and companies to apply"}</Text>
        </View>
      )}
    </>
  );

  const getHeaderTitle = () => {
    if (isRealtor) return "Real Estate Firms";
    if (isLandscaper) return "Landscape Jobs";
    if (isContractor) return "Construction Jobs";
    if (isDumpsterService) return "Hauling Opportunities";
    return "Jobs & Opportunities";
  };

  const getHeaderSubtitle = () => {
    if (isRealtor) return "Find your next brokerage opportunity";
    if (isLandscaper) return "Find landscape positions near you";
    if (isContractor) return "Find construction projects & companies";
    if (isDumpsterService) return "Find debris removal jobs & submit bids";
    return "Find your next opportunity";
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{getHeaderTitle()}</Text>
          <Text style={styles.subtitle}>{getHeaderSubtitle()}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer} contentContainerStyle={styles.tabContent}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tabChip, activeTab === tab.key && styles.tabChipActive]} onPress={() => setActiveTab(tab.key)}>
              {tab.icon}
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "firms" && renderFirms()}
        {activeTab === "jobs" && renderJobs()}
        {activeTab === "companies" && renderCompanies()}
        {activeTab === "compare" && renderCompare()}
        {activeTab === "projects" && renderContractorProjects()}
        {activeTab === "builders" && renderBuilders()}
        {activeTab === "hauling-jobs" && renderHaulingJobs()}
        {activeTab === "hauling-companies" && renderHaulingCompanies()}
        {activeTab === "my-applications" && renderApplications()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { backgroundColor: Colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800" as const, color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  tabContainer: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  tabContent: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  tabChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.surfaceSecondary, marginRight: 8 },
  tabChipActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: "600" as const, color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const, color: Colors.text },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  firmCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  firmCardSelected: { borderWidth: 2, borderColor: Colors.primary },
  firmHeader: { flexDirection: "row", alignItems: "center" },
  firmCardLogo: { width: 56, height: 56, borderRadius: 14, marginRight: 12 },
  firmInfo: { flex: 1 },
  firmNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  firmCardName: { fontSize: 17, fontWeight: "700" as const, color: Colors.text },
  hiringBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${Colors.success}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  hiringText: { fontSize: 10, fontWeight: "700" as const, color: Colors.success },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  locationText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  firmMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  firmRatingText: { fontSize: 12, color: Colors.textSecondary },
  firmStats: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  firmStat: { flex: 1, alignItems: "center" },
  firmStatValue: { fontSize: 13, fontWeight: "700" as const, color: Colors.text, textAlign: "center" as const },
  firmStatLabel: { fontSize: 11, color: Colors.textTertiary, marginBottom: 4 },
  firmStatDivider: { width: 1, height: 32, backgroundColor: Colors.borderLight },
  featuredAgentsSection: { marginTop: 12 },
  featuredAgentsLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 8 },
  featuredAgentsList: { flexDirection: "row", gap: 8 },
  featuredAgentChip: { alignItems: "center" },
  featuredAgentAvatar: { width: 36, height: 36, borderRadius: 18, marginBottom: 4 },
  agentMiniTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  agentMiniTagText: { fontSize: 8, fontWeight: "600" as const },
  specialtiesTags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  specialtyTag: { backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  specialtyText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500" as const },
  firmActions: { flexDirection: "row", gap: 10, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  viewProfileBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  viewProfileText: { fontSize: 14, fontWeight: "600" as const, color: Colors.text },
  requestJoinBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  requestJoinText: { fontSize: 14, fontWeight: "600" as const, color: Colors.white },
  compareToggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  compareToggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  compareToggleText: { fontSize: 14, fontWeight: "600" as const, color: Colors.text },
  compareToggleTextActive: { color: Colors.white },
  compareHeader: { marginBottom: 16 },
  compareTitle: { fontSize: 18, fontWeight: "700" as const, color: Colors.text },
  compareSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  compareSelectedSection: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  compareSelectedTitle: { fontSize: 14, fontWeight: "600" as const, color: Colors.primary, marginBottom: 12 },
  compareTableScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  compareTable: { paddingBottom: 8 },
  compareRowHeader: { flexDirection: "row", paddingVertical: 12, backgroundColor: Colors.surfaceSecondary, borderRadius: 10, marginBottom: 8 },
  compareRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  compareLabelCell: { width: 90, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8 },
  compareLabelText: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  compareValueCell: { width: 120, alignItems: "center", paddingHorizontal: 8 },
  compareFirmLogo: { width: 36, height: 36, borderRadius: 8, marginBottom: 6 },
  compareFirmName: { fontSize: 11, fontWeight: "600" as const, color: Colors.text, textAlign: "center" as const },
  compareValueText: { fontSize: 12, color: Colors.text, textAlign: "center" as const, lineHeight: 16 },
  compareLeadsYes: { flexDirection: "row", alignItems: "center", gap: 4 },
  compareLeadsNo: { flexDirection: "row", alignItems: "center", gap: 4 },
  compareActions: { flexDirection: "row", paddingTop: 12 },
  compareViewBtn: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  compareViewBtnText: { fontSize: 11, fontWeight: "600" as const, color: Colors.white },
  applicationsSummary: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, alignItems: "center", shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryValue: { fontSize: 22, fontWeight: "800" as const, color: Colors.primary },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  applicationCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  applicationHeader: { flexDirection: "row", alignItems: "center" },
  applicationLogo: { width: 50, height: 50, borderRadius: 12, marginRight: 12 },
  applicationInfo: { flex: 1 },
  applicationFirmName: { fontSize: 16, fontWeight: "700" as const, color: Colors.text },
  applicationDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  applicationStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  applicationStatusText: { fontSize: 11, fontWeight: "700" as const },
  applicationNotesContainer: { backgroundColor: Colors.surfaceSecondary, borderRadius: 10, padding: 12, marginTop: 12 },
  applicationNotes: { fontSize: 13, color: Colors.text, lineHeight: 18 },
  applicationFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  applicationLastUpdate: { flexDirection: "row", alignItems: "center", gap: 4 },
  applicationLastUpdateText: { fontSize: 12, color: Colors.textSecondary },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: "600" as const, color: Colors.text, marginTop: 16 },
  emptyStateSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  dumpsterJobMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  debrisTypeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  debrisTypeText: { fontSize: 12, fontWeight: "600" as const },
  dumpsterSizeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  dumpsterSizeText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500" as const },
  bidCountBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EDE9FE", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  bidCountText: { fontSize: 12, color: "#8B5CF6", fontWeight: "600" as const },
  bidDeadlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, backgroundColor: "#FFFBEB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start" },
  bidDeadlineText: { fontSize: 12, color: "#B45309", fontWeight: "600" as const },
  haulingStatsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  haulingStat: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12 },
  haulingStatValue: { fontSize: 20, fontWeight: "800" as const, color: Colors.text, marginTop: 4 },
  haulingStatLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  benefitsPreview: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  benefitsLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: "600" as const },
  benefitsText: { fontSize: 11, color: Colors.text, flex: 1 },
  jobCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: Colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  jobHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  jobCompanyLogo: { width: 48, height: 48, borderRadius: 12, marginRight: 12 },
  jobInfo: { flex: 1 },
  jobTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  jobTitle: { fontSize: 16, fontWeight: "700" as const, color: Colors.text, flex: 1 },
  urgentBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  urgentText: { fontSize: 10, fontWeight: "700" as const, color: Colors.white },
  jobCompany: { fontSize: 14, color: Colors.primary, fontWeight: "600" as const, marginTop: 2 },
  jobMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  jobMetaText: { fontSize: 12, color: Colors.textSecondary },
  jobDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  jobDetails: { flexDirection: "row", gap: 20, marginBottom: 12 },
  jobDetail: { flexDirection: "row", alignItems: "center", gap: 6 },
  jobDetailText: { fontSize: 14, color: Colors.text, fontWeight: "600" as const },
  requirementsTags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  requirementTag: { backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  requirementText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500" as const },
  jobActions: { flexDirection: "row", gap: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  saveJobBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  saveJobText: { fontSize: 14, fontWeight: "600" as const, color: Colors.text },
  applyBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  applyText: { fontSize: 14, fontWeight: "600" as const, color: Colors.white },
});
