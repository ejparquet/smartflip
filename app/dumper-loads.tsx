import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  X,
  Check,
  Trash2,
  Truck,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  FileText,
  Phone,
  ChevronDown,
  Layers,
  CalendarPlus,
  ListChecks,
  Receipt,
  PlayCircle,
  Hammer,
  TreeDeciduous,
  Shuffle,
  Box,
  Refrigerator,
  AlertTriangle,
  Container,
  TrendingUp,
  Users,

  BarChart3,
  Wallet,
  Briefcase,
  Send,
  Eye,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type LoadStatus = "scheduled" | "in_progress" | "completed" | "invoiced" | "paid";
type DebrisType = "demolition" | "construction" | "yard_waste" | "mixed" | "concrete" | "appliances" | "hazardous";
type JobStatus = "open" | "bidding" | "awarded";

interface DumpsterJob {
  id: string;
  title: string;
  clientName: string;
  location: string;
  debrisType: DebrisType;
  estimatedVolume: string;
  dumpsterSize: string;
  startDate: string;
  duration: string;
  budget: string;
  description: string;
  status: JobStatus;
  bidsCount: number;
  postedDate: string;
}

interface DumperLoad {
  id: string;
  loadNumber: string;
  date: string;
  debrisType: DebrisType;
  volume: string;
  weight?: string;
  haulerName: string;
  haulerPhone?: string;
  dumpSite: string;
  costPerLoad: number;
  dumpFee?: number;
  totalCost: number;
  projectName: string;
  status: LoadStatus;
  notes?: string;
  truckSize?: string;
}

const debrisTypeConfig: Record<DebrisType, { label: string; color: string }> = {
  demolition: { label: "Demolition", color: "#EF4444" },
  construction: { label: "Construction", color: "#272D53" },
  yard_waste: { label: "Yard Waste", color: "#22C55E" },
  mixed: { label: "Mixed", color: "#8B5CF6" },
  concrete: { label: "Concrete/Masonry", color: "#6B7280" },
  appliances: { label: "Appliances", color: "#3B82F6" },
  hazardous: { label: "Hazardous", color: "#DC2626" },
};

const statusConfig: Record<LoadStatus, { label: string; color: string }> = {
  scheduled: { label: "Scheduled", color: "#6B7280" },
  in_progress: { label: "In Progress", color: "#3B82F6" },
  completed: { label: "Completed", color: "#22C55E" },
  invoiced: { label: "Invoiced", color: "#272D53" },
  paid: { label: "Paid", color: "#10B981" },
};

const truckSizes = [
  "10 Yard Dumpster",
  "15 Yard Dumpster",
  "20 Yard Dumpster",
  "30 Yard Dumpster",
  "40 Yard Dumpster",
  "Dump Truck - Small",
  "Dump Truck - Standard",
  "Dump Truck - Large",
  "Roll-Off Container",
  "Trailer Load",
];

const mockJobs: DumpsterJob[] = [
  {
    id: "j1",
    title: "Kitchen Demo Debris Removal",
    clientName: "Johnson Remodeling Co.",
    location: "Austin, TX",
    debrisType: "demolition",
    estimatedVolume: "25 cubic yards",
    dumpsterSize: "30 Yard Dumpster",
    startDate: "2026-02-03",
    duration: "3 days",
    budget: "$800 - $1,200",
    description: "Need dumpster service for full kitchen demolition. Includes cabinets, countertops, flooring, and drywall.",
    status: "open",
    bidsCount: 4,
    postedDate: "2026-01-26",
  },
  {
    id: "j2",
    title: "Construction Site Cleanup",
    clientName: "BuildRight Construction",
    location: "Round Rock, TX",
    debrisType: "construction",
    estimatedVolume: "40 cubic yards",
    dumpsterSize: "40 Yard Dumpster",
    startDate: "2026-02-05",
    duration: "1 week",
    budget: "$1,500 - $2,000",
    description: "New home construction site needs ongoing debris removal. Weekly pickup required.",
    status: "bidding",
    bidsCount: 7,
    postedDate: "2026-01-24",
  },
  {
    id: "j3",
    title: "Yard Waste & Tree Removal",
    clientName: "Green Acres HOA",
    location: "Cedar Park, TX",
    debrisType: "yard_waste",
    estimatedVolume: "15 cubic yards",
    dumpsterSize: "20 Yard Dumpster",
    startDate: "2026-02-01",
    duration: "2 days",
    budget: "$400 - $600",
    description: "Community cleanup project. Tree trimmings, branches, and landscaping debris.",
    status: "open",
    bidsCount: 2,
    postedDate: "2026-01-27",
  },
  {
    id: "j4",
    title: "Concrete Driveway Removal",
    clientName: "Mike's Paving",
    location: "Pflugerville, TX",
    debrisType: "concrete",
    estimatedVolume: "12 cubic yards",
    dumpsterSize: "Dump Truck - Large",
    startDate: "2026-02-08",
    duration: "1 day",
    budget: "$600 - $900",
    description: "Broken concrete from driveway replacement. Heavy load - approx 15 tons.",
    status: "open",
    bidsCount: 1,
    postedDate: "2026-01-28",
  },
  {
    id: "j5",
    title: "Estate Cleanout - Mixed Debris",
    clientName: "Legacy Estate Services",
    location: "Georgetown, TX",
    debrisType: "mixed",
    estimatedVolume: "35 cubic yards",
    dumpsterSize: "30 Yard Dumpster",
    startDate: "2026-02-10",
    duration: "4 days",
    budget: "$1,000 - $1,400",
    description: "Full estate cleanout. Furniture, appliances, household items, and general debris.",
    status: "bidding",
    bidsCount: 5,
    postedDate: "2026-01-25",
  },
  {
    id: "j6",
    title: "Appliance Removal - Apartment Complex",
    clientName: "Sunset Apartments",
    location: "Austin, TX",
    debrisType: "appliances",
    estimatedVolume: "8 cubic yards",
    dumpsterSize: "15 Yard Dumpster",
    startDate: "2026-02-02",
    duration: "1 day",
    budget: "$350 - $500",
    description: "Removing 12 old refrigerators and 8 washers/dryers from apartment renovation.",
    status: "open",
    bidsCount: 3,
    postedDate: "2026-01-27",
  },
];

const mockLoads: DumperLoad[] = [
  {
    id: "1",
    loadNumber: "DL-001",
    date: "2026-01-28",
    debrisType: "demolition",
    volume: "20 cubic yards",
    weight: "4.5 tons",
    haulerName: "ABC Hauling",
    haulerPhone: "(555) 123-4567",
    dumpSite: "City Landfill - North",
    costPerLoad: 350,
    dumpFee: 75,
    totalCost: 425,
    projectName: "Kitchen Renovation",
    status: "completed",
    truckSize: "20 Yard Dumpster",
    notes: "Old cabinets and countertops",
  },
  {
    id: "2",
    loadNumber: "DL-002",
    date: "2026-01-29",
    debrisType: "construction",
    volume: "15 cubic yards",
    haulerName: "Quick Disposal Inc",
    haulerPhone: "(555) 987-6543",
    dumpSite: "County Recycling Center",
    costPerLoad: 275,
    dumpFee: 50,
    totalCost: 325,
    projectName: "Bathroom Remodel",
    status: "scheduled",
    truckSize: "15 Yard Dumpster",
  },
  {
    id: "3",
    loadNumber: "DL-003",
    date: "2026-01-27",
    debrisType: "yard_waste",
    volume: "10 cubic yards",
    weight: "1.2 tons",
    haulerName: "Green Waste Services",
    dumpSite: "Composting Facility",
    costPerLoad: 150,
    totalCost: 150,
    projectName: "Landscape Overhaul",
    status: "paid",
    truckSize: "Dump Truck - Small",
    notes: "Tree trimmings and old mulch",
  },
  {
    id: "4",
    loadNumber: "DL-004",
    date: "2026-01-30",
    debrisType: "concrete",
    volume: "8 cubic yards",
    weight: "12 tons",
    haulerName: "Heavy Haul Co",
    haulerPhone: "(555) 456-7890",
    dumpSite: "Concrete Recycling Depot",
    costPerLoad: 400,
    dumpFee: 100,
    totalCost: 500,
    projectName: "Driveway Replacement",
    status: "in_progress",
    truckSize: "Dump Truck - Large",
    notes: "Broken driveway concrete - heavy load",
  },
  {
    id: "5",
    loadNumber: "DL-005",
    date: "2026-01-26",
    debrisType: "mixed",
    volume: "30 cubic yards",
    haulerName: "ABC Hauling",
    haulerPhone: "(555) 123-4567",
    dumpSite: "City Landfill - South",
    costPerLoad: 450,
    dumpFee: 85,
    totalCost: 535,
    projectName: "Whole House Flip",
    status: "invoiced",
    truckSize: "30 Yard Dumpster",
  },
];

export default function DumperLoadsScreen() {
  console.log("DumperLoadsScreen loaded");
  const router = useRouter();
  const [loads, setLoads] = useState<DumperLoad[]>(mockLoads);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDebrisTypePicker, setShowDebrisTypePicker] = useState(false);
  const [showTruckSizePicker, setShowTruckSizePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"loads" | "jobs" | "status" | "debris" | "trucks" | "info">("loads");
  const [jobs] = useState<DumpsterJob[]>(mockJobs);
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [filterDebrisType, setFilterDebrisType] = useState<string>("all");
  const [newLoad, setNewLoad] = useState({
    date: "",
    debrisType: "mixed" as DebrisType,
    volume: "",
    weight: "",
    haulerName: "",
    haulerPhone: "",
    dumpSite: "",
    costPerLoad: "",
    dumpFee: "",
    projectName: "",
    truckSize: "",
    notes: "",
  });

  const totalLoads = loads.length;
  const totalCost = loads.reduce((sum, l) => sum + l.totalCost, 0);
  const completedLoads = loads.filter(l => l.status === "completed" || l.status === "invoiced" || l.status === "paid").length;
  const scheduledLoads = loads.filter(l => l.status === "scheduled").length;

  const filteredLoads = loads.filter((l) => {
    const statusMatch = filterStatus === "all" || l.status === filterStatus;
    const debrisMatch = filterDebrisType === "all" || l.debrisType === filterDebrisType;
    return statusMatch && debrisMatch;
  });



  const handleAddLoad = () => {
    if (!newLoad.haulerName || !newLoad.costPerLoad) {
      Alert.alert("Error", "Please fill in hauler name and cost");
      return;
    }

    const costPerLoad = parseFloat(newLoad.costPerLoad) || 0;
    const dumpFee = parseFloat(newLoad.dumpFee) || 0;

    const load: DumperLoad = {
      id: Date.now().toString(),
      loadNumber: `DL-${(loads.length + 1).toString().padStart(3, "0")}`,
      date: newLoad.date || new Date().toISOString().split("T")[0],
      debrisType: newLoad.debrisType,
      volume: newLoad.volume || "Not specified",
      weight: newLoad.weight || undefined,
      haulerName: newLoad.haulerName,
      haulerPhone: newLoad.haulerPhone || undefined,
      dumpSite: newLoad.dumpSite || "Not specified",
      costPerLoad,
      dumpFee: dumpFee || undefined,
      totalCost: costPerLoad + dumpFee,
      projectName: newLoad.projectName || "General",
      status: "scheduled",
      truckSize: newLoad.truckSize || undefined,
      notes: newLoad.notes || undefined,
    };

    setLoads([load, ...loads]);
    setNewLoad({
      date: "",
      debrisType: "mixed",
      volume: "",
      weight: "",
      haulerName: "",
      haulerPhone: "",
      dumpSite: "",
      costPerLoad: "",
      dumpFee: "",
      projectName: "",
      truckSize: "",
      notes: "",
    });
    setShowAddModal(false);
  };

  const updateStatus = (id: string, newStatus: LoadStatus) => {
    setLoads(loads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  const deleteLoad = (id: string) => {
    Alert.alert("Delete Load", "Are you sure you want to delete this load?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setLoads(loads.filter((l) => l.id !== id)) },
    ]);
  };

  const getNextStatus = (currentStatus: LoadStatus): LoadStatus | null => {
    const flow: LoadStatus[] = ["scheduled", "in_progress", "completed", "invoiced", "paid"];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex < flow.length - 1) {
      return flow[currentIndex + 1];
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Dumper Loads</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={24} color={Colors.navy} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Truck size={20} color="#272D53" strokeWidth={1.5} />
            <Text style={styles.statValue}>{totalLoads}</Text>
            <Text style={styles.statLabel}>Total Loads</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#22C55E" strokeWidth={1.5} />
            <Text style={styles.statValue}>${totalCost.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Cost</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle2 size={20} color="#3B82F6" strokeWidth={1.5} />
            <Text style={styles.statValue}>{completedLoads}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#8B5CF6" strokeWidth={1.5} />
            <Text style={styles.statValue}>{scheduledLoads}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => setShowAddModal(true)}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Plus size={20} color="#2563EB" strokeWidth={2} />
              </View>
              <Text style={styles.quickActionLabel}>New Load</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => { setActiveTab("loads"); setFilterStatus("scheduled"); }}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#F3F4F6" }]}>
                <CalendarPlus size={20} color="#6B7280" strokeWidth={1.5} />
              </View>
              <Text style={styles.quickActionLabel}>Scheduled</Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>{loads.filter(l => l.status === "scheduled").length}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => { setActiveTab("loads"); setFilterStatus("in_progress"); }}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                <PlayCircle size={20} color="#3B82F6" strokeWidth={1.5} />
              </View>
              <Text style={styles.quickActionLabel}>In Progress</Text>
              <View style={[styles.quickActionBadge, { backgroundColor: "#3B82F6" }]}>
                <Text style={styles.quickActionBadgeText}>{loads.filter(l => l.status === "in_progress").length}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => { setActiveTab("loads"); setFilterStatus("completed"); }}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#D1FAE5" }]}>
                <CheckCircle2 size={20} color="#22C55E" strokeWidth={1.5} />
              </View>
              <Text style={styles.quickActionLabel}>Completed</Text>
              <View style={[styles.quickActionBadge, { backgroundColor: "#22C55E" }]}>
                <Text style={styles.quickActionBadgeText}>{loads.filter(l => l.status === "completed").length}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => { setActiveTab("loads"); setFilterStatus("invoiced"); }}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#E8E9EE" }]}>
                <Receipt size={20} color="#272D53" strokeWidth={1.5} />
              </View>
              <Text style={styles.quickActionLabel}>Invoiced</Text>
              <View style={[styles.quickActionBadge, { backgroundColor: "#272D53" }]}>
                <Text style={styles.quickActionBadgeText}>{loads.filter(l => l.status === "invoiced").length}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => { setActiveTab("loads"); setFilterStatus("paid"); }}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#D1FAE5" }]}>
                <Wallet size={20} color="#10B981" strokeWidth={1.5} />
              </View>
              <Text style={styles.quickActionLabel}>Paid</Text>
              <View style={[styles.quickActionBadge, { backgroundColor: "#10B981" }]}>
                <Text style={styles.quickActionBadgeText}>{loads.filter(l => l.status === "paid").length}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => { setActiveTab("loads"); setFilterStatus("all"); }}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#E0E7FF" }]}>
                <ListChecks size={20} color="#4F46E5" strokeWidth={1.5} />
              </View>
              <Text style={styles.quickActionLabel}>View All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.mainTabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainTabBarScroll}>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === "loads" && styles.mainTabActive]}
              onPress={() => setActiveTab("loads")}
            >
              <Truck size={18} color={activeTab === "loads" ? "#FFFFFF" : "#6B7280"} strokeWidth={1.5} />
              <Text style={[styles.mainTabText, activeTab === "loads" && styles.mainTabTextActive]}>My Loads</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === "jobs" && styles.mainTabActive]}
              onPress={() => setActiveTab("jobs")}
            >
              <Briefcase size={18} color={activeTab === "jobs" ? "#FFFFFF" : "#6B7280"} strokeWidth={1.5} />
              <Text style={[styles.mainTabText, activeTab === "jobs" && styles.mainTabTextActive]}>Jobs & Bids</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === "status" && styles.mainTabActive]}
              onPress={() => setActiveTab("status")}
            >
              <Clock size={18} color={activeTab === "status" ? "#FFFFFF" : "#6B7280"} strokeWidth={1.5} />
              <Text style={[styles.mainTabText, activeTab === "status" && styles.mainTabTextActive]}>By Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === "debris" && styles.mainTabActive]}
              onPress={() => setActiveTab("debris")}
            >
              <Layers size={18} color={activeTab === "debris" ? "#FFFFFF" : "#6B7280"} strokeWidth={1.5} />
              <Text style={[styles.mainTabText, activeTab === "debris" && styles.mainTabTextActive]}>Debris Types</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === "trucks" && styles.mainTabActive]}
              onPress={() => setActiveTab("trucks")}
            >
              <Container size={18} color={activeTab === "trucks" ? "#FFFFFF" : "#6B7280"} strokeWidth={1.5} />
              <Text style={[styles.mainTabText, activeTab === "trucks" && styles.mainTabTextActive]}>Truck Sizes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainTab, activeTab === "info" && styles.mainTabActive]}
              onPress={() => setActiveTab("info")}
            >
              <FileText size={18} color={activeTab === "info" ? "#FFFFFF" : "#6B7280"} strokeWidth={1.5} />
              <Text style={[styles.mainTabText, activeTab === "info" && styles.mainTabTextActive]}>Info Guide</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {activeTab === "loads" && (
          <>
            <View style={styles.filterRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {["all", "scheduled", "in_progress", "completed", "invoiced", "paid"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                      {status === "all" ? "All" : status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {filteredLoads.length === 0 ? (
                <View style={styles.emptyState}>
                  <Truck size={48} color="#D1D5DB" strokeWidth={1.5} />
                  <Text style={styles.emptyText}>No loads found</Text>
                  <Text style={styles.emptySubtext}>Tap + to add a new dumper load</Text>
                </View>
              ) : (
                filteredLoads.map((load) => {
                  const debrisConfig = debrisTypeConfig[load.debrisType];
                  const statusCfg = statusConfig[load.status];
                  const nextStatus = getNextStatus(load.status);

                  return (
                    <View key={load.id} style={styles.loadCard}>
                      <View style={styles.loadHeader}>
                        <View style={styles.loadNumberRow}>
                          <Text style={styles.loadNumber}>{load.loadNumber}</Text>
                          <View style={[styles.debrisBadge, { backgroundColor: `${debrisConfig.color}15` }]}>
                            <Text style={[styles.debrisText, { color: debrisConfig.color }]}>{debrisConfig.label}</Text>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}15` }]}>
                          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                        </View>
                      </View>

                      <View style={styles.loadDetails}>
                        <View style={styles.detailRow}>
                          <Calendar size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.detailText}>{load.date}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Building2 size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.detailText}>{load.projectName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Truck size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.detailText}>{load.haulerName}</Text>
                        </View>
                        {load.truckSize && (
                          <View style={styles.detailRow}>
                            <Layers size={14} color="#6B7280" strokeWidth={1.5} />
                            <Text style={styles.detailText}>{load.truckSize}</Text>
                          </View>
                        )}
                        <View style={styles.detailRow}>
                          <MapPin size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.detailText}>{load.dumpSite}</Text>
                        </View>
                      </View>

                      <View style={styles.volumeRow}>
                        <View style={styles.volumeItem}>
                          <Text style={styles.volumeLabel}>Volume</Text>
                          <Text style={styles.volumeValue}>{load.volume}</Text>
                        </View>
                        {load.weight && (
                          <View style={styles.volumeItem}>
                            <Text style={styles.volumeLabel}>Weight</Text>
                            <Text style={styles.volumeValue}>{load.weight}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.costBreakdown}>
                        <View style={styles.costRow}>
                          <Text style={styles.costLabel}>Hauling Cost</Text>
                          <Text style={styles.costValue}>${load.costPerLoad.toFixed(2)}</Text>
                        </View>
                        {load.dumpFee && (
                          <View style={styles.costRow}>
                            <Text style={styles.costLabel}>Dump Fee</Text>
                            <Text style={styles.costValue}>${load.dumpFee.toFixed(2)}</Text>
                          </View>
                        )}
                        <View style={[styles.costRow, styles.totalRow]}>
                          <Text style={styles.totalLabel}>Total</Text>
                          <Text style={styles.totalValue}>${load.totalCost.toFixed(2)}</Text>
                        </View>
                      </View>

                      {load.notes && (
                        <View style={styles.notesSection}>
                          <FileText size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.notesText}>{load.notes}</Text>
                        </View>
                      )}

                      <View style={styles.actionRow}>
                        {load.haulerPhone && (
                          <TouchableOpacity style={styles.callButton}>
                            <Phone size={16} color={Colors.navy} strokeWidth={1.5} />
                            <Text style={styles.callButtonText}>Call Hauler</Text>
                          </TouchableOpacity>
                        )}
                        {nextStatus && (
                          <TouchableOpacity
                            style={styles.updateStatusButton}
                            onPress={() => updateStatus(load.id, nextStatus)}
                          >
                            <Check size={16} color="#FFFFFF" strokeWidth={2} />
                            <Text style={styles.updateStatusText}>
                              Mark {statusConfig[nextStatus].label}
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteLoad(load.id)}>
                          <Trash2 size={16} color="#EF4444" strokeWidth={1.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}

        {activeTab === "jobs" && (
          <>
            <View style={styles.jobsHeader}>
              <Text style={styles.jobsHeaderTitle}>Available Opportunities</Text>
              <Text style={styles.jobsHeaderSubtitle}>{jobs.filter(j => j.status === "open" || j.status === "bidding").length} jobs accepting bids</Text>
            </View>
            <View style={styles.jobFilterRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {["all", "open", "bidding"].map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, jobFilter === filter && styles.filterChipActive]}
                    onPress={() => setJobFilter(filter)}
                  >
                    <Text style={[styles.filterChipText, jobFilter === filter && styles.filterChipTextActive]}>
                      {filter === "all" ? "All Jobs" : filter === "open" ? "Open" : "Accepting Bids"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {jobs
                .filter(job => jobFilter === "all" || job.status === jobFilter)
                .map((job) => {
                  const debrisConfig = debrisTypeConfig[job.debrisType];
                  return (
                    <View key={job.id} style={styles.jobCard}>
                      <View style={styles.jobCardHeader}>
                        <View style={styles.jobTitleRow}>
                          <Text style={styles.jobTitle}>{job.title}</Text>
                          <View style={[styles.jobStatusBadge, { backgroundColor: job.status === "open" ? "#D1FAE5" : "#E8E9EE" }]}>
                            <Text style={[styles.jobStatusText, { color: job.status === "open" ? "#059669" : "#D97706" }]}>
                              {job.status === "open" ? "Open" : "Bidding"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.jobClient}>{job.clientName}</Text>
                      </View>

                      <View style={styles.jobInfoGrid}>
                        <View style={styles.jobInfoItem}>
                          <MapPin size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.jobInfoText}>{job.location}</Text>
                        </View>
                        <View style={styles.jobInfoItem}>
                          <Calendar size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.jobInfoText}>Start: {job.startDate}</Text>
                        </View>
                        <View style={styles.jobInfoItem}>
                          <Clock size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.jobInfoText}>{job.duration}</Text>
                        </View>
                        <View style={styles.jobInfoItem}>
                          <Container size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.jobInfoText}>{job.dumpsterSize}</Text>
                        </View>
                      </View>

                      <View style={styles.jobDetailsRow}>
                        <View style={[styles.debrisBadge, { backgroundColor: `${debrisConfig.color}15` }]}>
                          <Text style={[styles.debrisText, { color: debrisConfig.color }]}>{debrisConfig.label}</Text>
                        </View>
                        <Text style={styles.jobVolume}>{job.estimatedVolume}</Text>
                      </View>

                      <Text style={styles.jobDescription}>{job.description}</Text>

                      <View style={styles.jobBudgetRow}>
                        <View style={styles.jobBudgetInfo}>
                          <DollarSign size={16} color="#059669" strokeWidth={2} />
                          <Text style={styles.jobBudgetText}>{job.budget}</Text>
                        </View>
                        <View style={styles.jobBidsInfo}>
                          <Users size={14} color="#6B7280" strokeWidth={1.5} />
                          <Text style={styles.jobBidsText}>{job.bidsCount} bids</Text>
                        </View>
                      </View>

                      <View style={styles.jobActions}>
                        <TouchableOpacity style={styles.jobViewBtn}>
                          <Eye size={16} color="#4B5563" strokeWidth={1.5} />
                          <Text style={styles.jobViewBtnText}>View Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.jobBidBtn}>
                          <Send size={16} color="#FFFFFF" strokeWidth={2} />
                          <Text style={styles.jobBidBtnText}>Submit Bid</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.jobPosted}>Posted {job.postedDate}</Text>
                    </View>
                  );
                })}
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}

        {activeTab === "status" && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.infoScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.infoSectionTitle}>Status Workflow</Text>
            <Text style={styles.infoDescription}>Loads progress through these statuses:</Text>
            
            <View style={styles.statusFlowContainer}>
              {(["scheduled", "in_progress", "completed", "invoiced", "paid"] as LoadStatus[]).map((status, index) => {
                const count = loads.filter(l => l.status === status).length;
                return (
                  <View key={status}>
                    <TouchableOpacity 
                      style={styles.statusFlowCard}
                      onPress={() => {
                        setActiveTab("loads");
                        setFilterStatus(status);
                      }}
                    >
                      <View style={[styles.statusFlowBadge, { backgroundColor: statusConfig[status].color }]}>
                        <Text style={styles.statusFlowNumber}>{index + 1}</Text>
                      </View>
                      <View style={styles.statusFlowInfo}>
                        <Text style={styles.statusFlowLabel}>{statusConfig[status].label}</Text>
                        <Text style={styles.statusFlowCount}>{count} load{count !== 1 ? "s" : ""}</Text>
                      </View>
                      <View style={[styles.statusDot, { backgroundColor: statusConfig[status].color }]} />
                    </TouchableOpacity>
                    {index < 4 && (
                      <View style={styles.statusArrow}>
                        <ChevronDown size={20} color="#D1D5DB" />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Quick Stats</Text>
              <View style={styles.infoStatsGrid}>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatValue}>{totalLoads}</Text>
                  <Text style={styles.infoStatLabel}>Total Loads</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatValue}>${totalCost.toLocaleString()}</Text>
                  <Text style={styles.infoStatLabel}>Total Cost</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatValue}>{completedLoads}</Text>
                  <Text style={styles.infoStatLabel}>Completed</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatValue}>{scheduledLoads}</Text>
                  <Text style={styles.infoStatLabel}>Scheduled</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {activeTab === "debris" && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.infoScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.infoSectionTitle}>Debris Types</Text>
            <Text style={styles.infoDescription}>Color-coded categories for easy tracking:</Text>
            
            <View style={styles.debrisGrid}>
              {(Object.keys(debrisTypeConfig) as DebrisType[]).map((type) => {
                const config = debrisTypeConfig[type];
                const count = loads.filter(l => l.debrisType === type).length;
                const totalForType = loads.filter(l => l.debrisType === type).reduce((sum, l) => sum + l.totalCost, 0);
                const IconComponent = type === "demolition" ? Hammer : 
                                     type === "construction" ? Building2 :
                                     type === "yard_waste" ? TreeDeciduous :
                                     type === "mixed" ? Shuffle :
                                     type === "concrete" ? Box :
                                     type === "appliances" ? Refrigerator : AlertTriangle;
                return (
                  <TouchableOpacity 
                    key={type} 
                    style={styles.debrisTypeCard}
                    onPress={() => {
                      setActiveTab("loads");
                      setFilterDebrisType(type);
                    }}
                  >
                    <View style={[styles.debrisIconContainer, { backgroundColor: `${config.color}20` }]}>
                      <IconComponent size={24} color={config.color} strokeWidth={1.5} />
                    </View>
                    <Text style={styles.debrisTypeLabel}>{config.label}</Text>
                    <Text style={styles.debrisTypeCount}>{count} load{count !== 1 ? "s" : ""}</Text>
                    {totalForType > 0 && (
                      <Text style={[styles.debrisTypeCost, { color: config.color }]}>${totalForType.toLocaleString()}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {activeTab === "trucks" && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.infoScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.infoSectionTitle}>Truck & Container Sizes</Text>
            <Text style={styles.infoDescription}>Available options for hauling:</Text>
            
            <View style={styles.truckCategoryCard}>
              <View style={styles.truckCategoryHeader}>
                <Container size={22} color="#2563EB" strokeWidth={1.5} />
                <Text style={styles.truckCategoryTitle}>Dumpsters</Text>
              </View>
              <View style={styles.truckSizeList}>
                {["10 Yard", "15 Yard", "20 Yard", "30 Yard", "40 Yard"].map((size, i) => (
                  <View key={size} style={styles.truckSizeItem}>
                    <Text style={styles.truckSizeName}>{size} Dumpster</Text>
                    <Text style={styles.truckSizeDesc}>
                      {i === 0 ? "Small projects" : i === 1 ? "Medium cleanouts" : i === 2 ? "Remodeling" : i === 3 ? "Construction" : "Large demolition"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.truckCategoryCard}>
              <View style={styles.truckCategoryHeader}>
                <Truck size={22} color="#D97706" strokeWidth={1.5} />
                <Text style={styles.truckCategoryTitle}>Dump Trucks</Text>
              </View>
              <View style={styles.truckSizeList}>
                {["Small", "Standard", "Large"].map((size, i) => (
                  <View key={size} style={styles.truckSizeItem}>
                    <Text style={styles.truckSizeName}>Dump Truck - {size}</Text>
                    <Text style={styles.truckSizeDesc}>
                      {i === 0 ? "5-8 cubic yards" : i === 1 ? "10-14 cubic yards" : "16-20 cubic yards"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.truckCategoryCard}>
              <View style={styles.truckCategoryHeader}>
                <Box size={22} color="#059669" strokeWidth={1.5} />
                <Text style={styles.truckCategoryTitle}>Other Options</Text>
              </View>
              <View style={styles.truckSizeList}>
                <View style={styles.truckSizeItem}>
                  <Text style={styles.truckSizeName}>Roll-Off Container</Text>
                  <Text style={styles.truckSizeDesc}>Various sizes, ideal for construction sites</Text>
                </View>
                <View style={styles.truckSizeItem}>
                  <Text style={styles.truckSizeName}>Trailer Load</Text>
                  <Text style={styles.truckSizeDesc}>Flexible sizing for smaller jobs</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {activeTab === "info" && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.infoScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.infoSectionTitle}>Feature Guide</Text>
            <Text style={styles.infoDescription}>Everything you can do with Dumper Loads:</Text>
            
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#DBEAFE" }]}>
                <FileText size={20} color="#2563EB" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Load Details</Text>
                <Text style={styles.featureDesc}>Load number, date, debris type, volume, weight, truck size</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#FEE2E2" }]}>
                <Layers size={20} color="#EF4444" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Debris Types</Text>
                <Text style={styles.featureDesc}>Demolition, Construction, Yard Waste, Mixed, Concrete/Masonry, Appliances, Hazardous (color-coded)</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#E8E9EE" }]}>
                <Truck size={20} color="#D97706" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Truck Sizes</Text>
                <Text style={styles.featureDesc}>10-40 yard dumpsters, dump trucks (small/standard/large), roll-off containers, trailer loads</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#D1FAE5" }]}>
                <DollarSign size={20} color="#059669" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Cost Tracking</Text>
                <Text style={styles.featureDesc}>Hauling cost + dump fees = total cost breakdown per load</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#E0E7FF" }]}>
                <Users size={20} color="#4F46E5" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Hauler Info</Text>
                <Text style={styles.featureDesc}>Name, phone, dump site location with Call Hauler button</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#FCE7F3" }]}>
                <Building2 size={20} color="#DB2777" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Project Linking</Text>
                <Text style={styles.featureDesc}>Associate loads with specific projects for organization</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#ECFDF5" }]}>
                <TrendingUp size={20} color="#10B981" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Status Workflow</Text>
                <Text style={styles.featureDesc}>Scheduled → In Progress → Completed → Invoiced → Paid with Mark Next Status button</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#F3F4F6" }]}>
                <BarChart3 size={20} color="#6B7280" strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Summary Stats</Text>
                <Text style={styles.featureDesc}>Total loads, total cost, completed count, scheduled count displayed at the top</Text>
              </View>
            </View>

            <View style={styles.quickTipCard}>
              <Text style={styles.quickTipTitle}>Quick Tip</Text>
              <Text style={styles.quickTipText}>Use the tabs above to filter by Status or Debris Type. Tap any card to jump to filtered loads!</Text>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Dumper Load</Text>
            <TouchableOpacity onPress={handleAddLoad}>
              <Check size={24} color={Colors.navy} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={newLoad.date}
                onChangeText={(text) => setNewLoad({ ...newLoad, date: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Debris Type *</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDebrisTypePicker(!showDebrisTypePicker)}>
                <Text style={styles.pickerButtonText}>{debrisTypeConfig[newLoad.debrisType].label}</Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              {showDebrisTypePicker && (
                <View style={styles.pickerOptions}>
                  {(Object.keys(debrisTypeConfig) as DebrisType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.pickerOption}
                      onPress={() => {
                        setNewLoad({ ...newLoad, debrisType: type });
                        setShowDebrisTypePicker(false);
                      }}
                    >
                      <View style={[styles.debrisDot, { backgroundColor: debrisTypeConfig[type].color }]} />
                      <Text style={styles.pickerOptionText}>{debrisTypeConfig[type].label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Truck/Container Size</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTruckSizePicker(!showTruckSizePicker)}>
                <Text style={[styles.pickerButtonText, !newLoad.truckSize && styles.placeholderText]}>
                  {newLoad.truckSize || "Select size"}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              {showTruckSizePicker && (
                <View style={styles.pickerOptions}>
                  {truckSizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={styles.pickerOption}
                      onPress={() => {
                        setNewLoad({ ...newLoad, truckSize: size });
                        setShowTruckSizePicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Volume</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 20 cubic yards"
                  placeholderTextColor="#9CA3AF"
                  value={newLoad.volume}
                  onChangeText={(text) => setNewLoad({ ...newLoad, volume: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Weight (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 4.5 tons"
                  placeholderTextColor="#9CA3AF"
                  value={newLoad.weight}
                  onChangeText={(text) => setNewLoad({ ...newLoad, weight: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hauler Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., ABC Hauling"
                placeholderTextColor="#9CA3AF"
                value={newLoad.haulerName}
                onChangeText={(text) => setNewLoad({ ...newLoad, haulerName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hauler Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={newLoad.haulerPhone}
                onChangeText={(text) => setNewLoad({ ...newLoad, haulerPhone: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dump Site</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., City Landfill"
                placeholderTextColor="#9CA3AF"
                value={newLoad.dumpSite}
                onChangeText={(text) => setNewLoad({ ...newLoad, dumpSite: text })}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Hauling Cost *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="$0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={newLoad.costPerLoad}
                  onChangeText={(text) => setNewLoad({ ...newLoad, costPerLoad: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Dump Fee</Text>
                <TextInput
                  style={styles.input}
                  placeholder="$0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={newLoad.dumpFee}
                  onChangeText={(text) => setNewLoad({ ...newLoad, dumpFee: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Link to a project"
                placeholderTextColor="#9CA3AF"
                value={newLoad.projectName}
                onChangeText={(text) => setNewLoad({ ...newLoad, projectName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional details about the load..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={newLoad.notes}
                onChangeText={(text) => setNewLoad({ ...newLoad, notes: text })}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  quickActionsContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  quickActionsScroll: {
    paddingHorizontal: 12,
    gap: 10,
  },
  quickActionBtn: {
    alignItems: "center",
    width: 72,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#4B5563",
    textAlign: "center" as const,
  },
  quickActionBadge: {
    position: "absolute" as const,
    top: -2,
    right: 8,
    backgroundColor: "#6B7280",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  quickActionBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  mainTabBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  mainTabBarScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  mainTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  mainTabActive: {
    backgroundColor: Colors.navy,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  mainTabTextActive: {
    color: "#FFFFFF",
  },
  filterRow: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoScrollContent: {
    padding: 16,
  },
  infoSectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  statusFlowContainer: {
    marginBottom: 20,
  },
  statusFlowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statusFlowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusFlowNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  statusFlowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusFlowLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  statusFlowCount: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusArrow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  infoStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoStatItem: {
    width: "50%",
    paddingVertical: 8,
  },
  infoStatValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  infoStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  debrisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  debrisTypeCard: {
    width: "50%",
    padding: 6,
  },
  debrisIconContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  debrisTypeLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 8,
    textAlign: "center" as const,
  },
  debrisTypeCount: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center" as const,
    marginTop: 2,
  },
  debrisTypeCost: {
    fontSize: 13,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    marginTop: 4,
  },
  truckCategoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  truckCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  truckCategoryTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  truckSizeList: {
    gap: 10,
  },
  truckSizeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  truckSizeName: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
  },
  truckSizeDesc: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  quickTipCard: {
    backgroundColor: "#E8E9EE",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  quickTipTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#92400E",
    marginBottom: 6,
  },
  quickTipText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#D1D5DB",
    marginTop: 4,
  },
  loadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  loadNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadNumber: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  debrisBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  debrisText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  loadDetails: {
    gap: 6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#4B5563",
  },
  volumeRow: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 12,
  },
  volumeItem: {
    flex: 1,
  },
  volumeLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  volumeValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  costBreakdown: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  costLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  costValue: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500" as const,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E8E9EE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.navy,
  },
  updateStatusButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.navy,
  },
  updateStatusText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  jobsHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  jobsHeaderTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  jobsHeaderSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  jobFilterRow: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  jobCardHeader: {
    marginBottom: 14,
  },
  jobTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#1F2937",
    flex: 1,
  },
  jobStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jobStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  jobClient: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  jobInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  jobInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "45%",
  },
  jobInfoText: {
    fontSize: 13,
    color: "#4B5563",
  },
  jobDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  jobVolume: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  jobDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
  },
  jobBudgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  jobBudgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobBudgetText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#059669",
  },
  jobBidsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobBidsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  jobActions: {
    flexDirection: "row",
    gap: 10,
  },
  jobViewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  jobViewBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#4B5563",
  },
  jobBidBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#22C55E",
  },
  jobBidBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  jobPosted: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 12,
    textAlign: "right" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  pickerOptions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#1F2937",
  },
  debrisDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
