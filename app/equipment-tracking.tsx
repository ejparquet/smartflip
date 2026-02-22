import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Search,
  Plus,
  Wrench,
  Package,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  QrCode,
  History,
  Settings,
  DollarSign,
  Truck,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { Professional } from "@/types";

type EquipmentStatus = "available" | "in_use" | "maintenance" | "lost" | "retired";
type EquipmentCategory = "power_tools" | "hand_tools" | "safety" | "measuring" | "scaffolding" | "vehicles";

interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  serialNumber: string;
  image: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  assignedTo?: string;
  assignedProject?: string;
  location?: string;
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: "scheduled" | "repair" | "inspection";
  date: string;
  description: string;
  cost: number;
  performedBy: string;
}

const mockLandscapeEquipment: Equipment[] = [
  {
    id: "leq1",
    name: "John Deere Zero-Turn Mower",
    category: "power_tools",
    status: "in_use",
    serialNumber: "JD-ZTM-2023-456",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2023-04-15",
    purchasePrice: 12500,
    currentValue: 10000,
    lastMaintenance: "2026-01-15",
    nextMaintenance: "2026-04-15",
    assignedTo: "Carlos Rivera",
    assignedProject: "Commercial Lawn Maintenance",
    location: "567 Business Park Ave, Round Rock, TX",
    condition: "excellent",
  },
  {
    id: "leq2",
    name: "Bobcat Skid Steer S70",
    category: "vehicles",
    status: "in_use",
    serialNumber: "BOB-S70-2022-789",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
    purchaseDate: "2022-08-20",
    purchasePrice: 28000,
    currentValue: 22000,
    lastMaintenance: "2026-01-10",
    nextMaintenance: "2026-07-10",
    assignedTo: "Roberto Garcia",
    assignedProject: "Mueller Flip Full Landscape",
    location: "4521 Mueller Blvd, Austin, TX",
    condition: "good",
  },
  {
    id: "leq3",
    name: "Trencher (Walk-Behind)",
    category: "power_tools",
    status: "available",
    serialNumber: "TRENCH-WB-2024-123",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2024-03-10",
    purchasePrice: 8500,
    currentValue: 7500,
    condition: "excellent",
  },
  {
    id: "leq4",
    name: "Irrigation Controller Kit",
    category: "measuring",
    status: "in_use",
    serialNumber: "RAIN-BIRD-ESP-555",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200",
    purchaseDate: "2024-06-01",
    purchasePrice: 450,
    currentValue: 400,
    assignedTo: "Miguel Santos",
    assignedProject: "Mueller Flip Full Landscape",
    condition: "excellent",
  },
  {
    id: "leq5",
    name: "Plate Compactor",
    category: "power_tools",
    status: "available",
    serialNumber: "COMP-PC-2023-222",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
    purchaseDate: "2023-05-15",
    purchasePrice: 2200,
    currentValue: 1800,
    condition: "good",
  },
  {
    id: "leq6",
    name: "Stihl Chainsaw MS 261",
    category: "power_tools",
    status: "available",
    serialNumber: "STIHL-MS261-666",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2024-01-10",
    purchasePrice: 650,
    currentValue: 580,
    lastMaintenance: "2025-12-20",
    nextMaintenance: "2026-06-20",
    condition: "excellent",
  },
  {
    id: "leq7",
    name: "Landscape Trailer (16ft)",
    category: "vehicles",
    status: "in_use",
    serialNumber: "TRAIL-16-2022-777",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2022-03-15",
    purchasePrice: 5500,
    currentValue: 4200,
    assignedTo: "Crew",
    condition: "good",
  },
  {
    id: "leq8",
    name: "String Trimmer Set (3)",
    category: "hand_tools",
    status: "in_use",
    serialNumber: "ECHO-SRM-SET-888",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2024-04-01",
    purchasePrice: 1200,
    currentValue: 1000,
    assignedProject: "Commercial Lawn Maintenance",
    condition: "good",
  },
  {
    id: "leq9",
    name: "Wheelbarrows (5)",
    category: "hand_tools",
    status: "available",
    serialNumber: "WB-SET-5-999",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
    purchaseDate: "2023-02-01",
    purchasePrice: 500,
    currentValue: 350,
    condition: "fair",
  },
  {
    id: "leq10",
    name: "Safety Vest & Gear Kit (10)",
    category: "safety",
    status: "available",
    serialNumber: "SAFE-KIT-10-000",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200",
    purchaseDate: "2024-01-15",
    purchasePrice: 800,
    currentValue: 700,
    condition: "excellent",
  },
];

const mockLandscapeMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "lmr1",
    equipmentId: "leq1",
    equipmentName: "John Deere Zero-Turn Mower",
    type: "scheduled",
    date: "2026-01-15",
    description: "Blade sharpening, oil change, air filter replacement",
    cost: 250,
    performedBy: "John Deere Service Center",
  },
  {
    id: "lmr2",
    equipmentId: "leq2",
    equipmentName: "Bobcat Skid Steer S70",
    type: "scheduled",
    date: "2026-01-10",
    description: "Hydraulic fluid change, track inspection, greasing",
    cost: 450,
    performedBy: "Bobcat Dealer Service",
  },
  {
    id: "lmr3",
    equipmentId: "leq6",
    equipmentName: "Stihl Chainsaw MS 261",
    type: "repair",
    date: "2025-12-20",
    description: "Chain replacement, carburetor tune-up",
    cost: 120,
    performedBy: "Local Tool Shop",
  },
];

const mockEquipment: Equipment[] = [
  {
    id: "eq1",
    name: "DeWalt Table Saw (10 inch)",
    category: "power_tools",
    status: "in_use",
    serialNumber: "DW-TBS-2022-456",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200",
    purchaseDate: "2022-06-15",
    purchasePrice: 850,
    currentValue: 650,
    lastMaintenance: "2026-01-10",
    nextMaintenance: "2026-04-10",
    assignedTo: "Mike Thompson",
    assignedProject: "Beacon Hill Renovation",
    location: "42 Mount Vernon St, Boston, MA",
    condition: "good",
  },
  {
    id: "eq2",
    name: "Milwaukee Cordless Drill Set",
    category: "power_tools",
    status: "available",
    serialNumber: "MIL-DRL-5000-789",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200",
    purchaseDate: "2023-02-20",
    purchasePrice: 450,
    currentValue: 380,
    lastMaintenance: "2025-12-15",
    nextMaintenance: "2026-03-15",
    condition: "excellent",
  },
  {
    id: "eq3",
    name: "Bosch Rotary Hammer Drill",
    category: "power_tools",
    status: "in_use",
    serialNumber: "BOSCH-RH-2024-123",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2024-08-10",
    purchasePrice: 380,
    currentValue: 340,
    lastMaintenance: "2026-01-05",
    nextMaintenance: "2026-07-05",
    assignedTo: "Carlos Rodriguez",
    assignedProject: "South End Condo Flip",
    location: "156 Tremont St, Boston, MA",
    condition: "excellent",
  },
  {
    id: "eq4",
    name: "Laser Level System",
    category: "measuring",
    status: "available",
    serialNumber: "TOPCON-RL-H5A-456",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200",
    purchaseDate: "2024-11-01",
    purchasePrice: 1200,
    currentValue: 1050,
    condition: "excellent",
  },
  {
    id: "eq5",
    name: "Compressor (20 Gallon)",
    category: "power_tools",
    status: "maintenance",
    serialNumber: "COMP-20G-750-222",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
    purchaseDate: "2023-03-15",
    purchasePrice: 650,
    currentValue: 480,
    lastMaintenance: "2025-11-20",
    condition: "fair",
    notes: "Pressure valve issue - sent for repair",
  },
  {
    id: "eq6",
    name: "Scaffolding Set (28ft)",
    category: "scaffolding",
    status: "in_use",
    serialNumber: "SCAF-28-2000-001",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200",
    purchaseDate: "2023-05-10",
    purchasePrice: 2800,
    currentValue: 2200,
    assignedTo: "James Wilson",
    assignedProject: "Beacon Hill Renovation",
    location: "42 Mount Vernon St, Boston, MA",
    condition: "good",
  },
  {
    id: "eq7",
    name: "Measuring Tape Set (Pro)",
    category: "measuring",
    status: "available",
    serialNumber: "TAPE-PRO-333",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200",
    purchaseDate: "2024-06-01",
    purchasePrice: 120,
    currentValue: 100,
    condition: "excellent",
  },
  {
    id: "eq8",
    name: "Work Van (Ford Transit)",
    category: "vehicles",
    status: "in_use",
    serialNumber: "FORD-TRN-2023-444",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2023-03-15",
    purchasePrice: 38000,
    currentValue: 32000,
    lastMaintenance: "2025-12-01",
    nextMaintenance: "2026-03-01",
    assignedTo: "Tony Martinez",
    condition: "excellent",
  },
  {
    id: "eq9",
    name: "Tile Saw (Wet Cut)",
    category: "power_tools",
    status: "available",
    serialNumber: "MK-303-WET-555",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    purchaseDate: "2023-07-20",
    purchasePrice: 1200,
    currentValue: 950,
    condition: "good",
  },
  {
    id: "eq10",
    name: "Safety Harness Kit (5 sets)",
    category: "safety",
    status: "available",
    serialNumber: "SAFE-HAR-666",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200",
    purchaseDate: "2022-09-10",
    purchasePrice: 1200,
    currentValue: 900,
    condition: "good",
  },
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "mr1",
    equipmentId: "eq1",
    equipmentName: "DeWalt Table Saw (10 inch)",
    type: "scheduled",
    date: "2026-01-10",
    description: "Blade replacement, alignment check, dust collection service",
    cost: 180,
    performedBy: "Tool Service Center",
  },
  {
    id: "mr2",
    equipmentId: "eq8",
    equipmentName: "Work Van (Ford Transit)",
    type: "scheduled",
    date: "2026-01-05",
    description: "Oil change, brake inspection, tire rotation",
    cost: 285,
    performedBy: "Ford Service Center",
  },
  {
    id: "mr3",
    equipmentId: "eq5",
    equipmentName: "Compressor (20 Gallon)",
    type: "repair",
    date: "2026-01-20",
    description: "Pressure valve replacement - in progress",
    cost: 220,
    performedBy: "Industrial Tool Repair",
  },
  {
    id: "mr4",
    equipmentId: "eq6",
    equipmentName: "Scaffolding Set (28ft)",
    type: "inspection",
    date: "2026-01-05",
    description: "Annual safety inspection, locking mechanism check",
    cost: 150,
    performedBy: "Safety Equipment Pros",
  },
];

type TabType = "inventory" | "maintenance" | "checkout";

export default function EquipmentTrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const professional = user as Professional | null;
  const isLandscaper = professional?.professionalType === "landscaper";
  
  const equipmentData = isLandscaper ? mockLandscapeEquipment : mockEquipment;
  const maintenanceData = isLandscaper ? mockLandscapeMaintenanceRecords : mockMaintenanceRecords;
  
  const [activeTab, setActiveTab] = useState<TabType>("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<EquipmentCategory | "all">("all");

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case "available": return Colors.success;
      case "in_use": return "#3B82F6";
      case "maintenance": return "#272D53";
      case "lost": return Colors.error;
      case "retired": return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: EquipmentStatus) => {
    switch (status) {
      case "available": return "Available";
      case "in_use": return "In Use";
      case "maintenance": return "Maintenance";
      case "lost": return "Lost";
      case "retired": return "Retired";
    }
  };

  const getCategoryLabel = (category: EquipmentCategory) => {
    switch (category) {
      case "power_tools": return "Power Tools";
      case "hand_tools": return "Hand Tools";
      case "safety": return "Safety";
      case "measuring": return "Measuring";
      case "scaffolding": return "Scaffolding";
      case "vehicles": return "Vehicles";
    }
  };

  const getConditionColor = (condition: Equipment["condition"]) => {
    switch (condition) {
      case "excellent": return Colors.success;
      case "good": return "#3B82F6";
      case "fair": return "#272D53";
      case "poor": return Colors.error;
    }
  };

  const filteredEquipment = equipmentData.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || eq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: equipmentData.length,
    available: equipmentData.filter(e => e.status === "available").length,
    inUse: equipmentData.filter(e => e.status === "in_use").length,
    maintenance: equipmentData.filter(e => e.status === "maintenance").length,
    totalValue: equipmentData.reduce((sum, e) => sum + e.currentValue, 0),
  };

  const renderEquipmentCard = (equipment: Equipment) => (
    <TouchableOpacity key={equipment.id} style={styles.equipmentCard}>
      <View style={styles.equipmentHeader}>
        <Image source={{ uri: equipment.image }} style={styles.equipmentImage} contentFit="cover" />
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{equipment.name}</Text>
          <Text style={styles.equipmentSerial}>{equipment.serialNumber}</Text>
          <View style={styles.categoryRow}>
            <Wrench size={12} color={Colors.textSecondary} />
            <Text style={styles.categoryText}>{getCategoryLabel(equipment.category)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(equipment.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(equipment.status) }]}>
            {getStatusLabel(equipment.status)}
          </Text>
        </View>
      </View>

      {equipment.assignedTo && (
        <View style={styles.assignmentSection}>
          <View style={styles.assignmentRow}>
            <User size={14} color={Colors.textSecondary} />
            <Text style={styles.assignmentText}>{equipment.assignedTo}</Text>
          </View>
          {equipment.assignedProject && (
            <View style={styles.assignmentRow}>
              <Package size={14} color={Colors.textSecondary} />
              <Text style={styles.assignmentText}>{equipment.assignedProject}</Text>
            </View>
          )}
          {equipment.location && (
            <View style={styles.assignmentRow}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.assignmentText} numberOfLines={1}>{equipment.location}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.equipmentStats}>
        <View style={styles.equipmentStat}>
          <Text style={styles.statLabel}>Value</Text>
          <Text style={styles.statValue}>${equipment.currentValue.toLocaleString()}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.equipmentStat}>
          <Text style={styles.statLabel}>Condition</Text>
          <Text style={[styles.statValue, { color: getConditionColor(equipment.condition) }]}>
            {equipment.condition.charAt(0).toUpperCase() + equipment.condition.slice(1)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.equipmentStat}>
          <Text style={styles.statLabel}>Next Service</Text>
          <Text style={styles.statValue}>
            {equipment.nextMaintenance 
              ? new Date(equipment.nextMaintenance).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "N/A"}
          </Text>
        </View>
      </View>

      {equipment.notes && (
        <View style={styles.notesSection}>
          <AlertTriangle size={14} color="#272D53" />
          <Text style={styles.notesText}>{equipment.notes}</Text>
        </View>
      )}

      <View style={styles.equipmentActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <QrCode size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <History size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Settings size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        {equipment.status === "available" ? (
          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutBtnText}>Check Out</Text>
          </TouchableOpacity>
        ) : equipment.status === "in_use" ? (
          <TouchableOpacity style={styles.returnBtn}>
            <Text style={styles.returnBtnText}>Return</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderMaintenanceCard = (record: MaintenanceRecord) => (
    <View key={record.id} style={styles.maintenanceCard}>
      <View style={styles.maintenanceHeader}>
        <View style={[styles.maintenanceTypeIcon, { 
          backgroundColor: record.type === "repair" ? "#FEE2E2" : 
                           record.type === "scheduled" ? "#DBEAFE" : "#D1FAE5" 
        }]}>
          {record.type === "repair" ? (
            <Wrench size={18} color={Colors.error} />
          ) : record.type === "scheduled" ? (
            <Calendar size={18} color="#3B82F6" />
          ) : (
            <CheckCircle size={18} color={Colors.success} />
          )}
        </View>
        <View style={styles.maintenanceInfo}>
          <Text style={styles.maintenanceName}>{record.equipmentName}</Text>
          <Text style={styles.maintenanceType}>
            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
          </Text>
        </View>
        <Text style={styles.maintenanceCost}>${record.cost}</Text>
      </View>
      <Text style={styles.maintenanceDesc}>{record.description}</Text>
      <View style={styles.maintenanceFooter}>
        <View style={styles.maintenanceDate}>
          <Clock size={12} color={Colors.textSecondary} />
          <Text style={styles.maintenanceDateText}>
            {new Date(record.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.performedBy}>By: {record.performedBy}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: isLandscaper ? "Landscape Equipment" : "Construction Equipment",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Package size={18} color="#272D53" />
            <Text style={styles.statCardValue}>{stats.total}</Text>
            <Text style={styles.statCardLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={18} color={Colors.success} />
            <Text style={styles.statCardValue}>{stats.available}</Text>
            <Text style={styles.statCardLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Truck size={18} color="#3B82F6" />
            <Text style={styles.statCardValue}>{stats.inUse}</Text>
            <Text style={styles.statCardLabel}>In Use</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={18} color={Colors.success} />
            <Text style={styles.statCardValue}>${(stats.totalValue/1000).toFixed(0)}K</Text>
            <Text style={styles.statCardLabel}>Value</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "inventory", label: "Inventory", icon: Package },
            { key: "maintenance", label: "Maintenance", icon: Wrench },
            { key: "checkout", label: "Check Out", icon: Truck },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon size={16} color={activeTab === tab.key ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.scanButton}>
          <QrCode size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {activeTab === "inventory" && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          {(["all", "power_tools", "hand_tools", "scaffolding", "vehicles", "safety", "measuring"] as const).map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>
                {cat === "all" ? "All" : getCategoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "inventory" && filteredEquipment.map(eq => renderEquipmentCard(eq))}
        {activeTab === "maintenance" && (
          <>
            <Text style={styles.sectionTitle}>Maintenance History</Text>
            {maintenanceData.map(record => renderMaintenanceCard(record))}
          </>
        )}
        {activeTab === "checkout" && (
          <>
            <Text style={styles.sectionTitle}>Available for Checkout</Text>
            {equipmentData.filter(e => e.status === "available").map(eq => renderEquipmentCard(eq))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statCardLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#272D53",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  searchSection: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChips: {
    paddingHorizontal: 20,
    marginBottom: 8,
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
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  equipmentCard: {
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
  equipmentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  equipmentImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  equipmentSerial: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  assignmentSection: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  assignmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assignmentText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  equipmentStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  equipmentStat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8E9EE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: "#B45309",
  },
  equipmentActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#272D53",
    alignItems: "center",
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  returnBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  maintenanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  maintenanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  maintenanceTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  maintenanceType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  maintenanceCost: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  maintenanceDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  maintenanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  maintenanceDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  maintenanceDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  performedBy: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
