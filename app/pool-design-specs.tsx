import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import {
  Search,
  X,
  Plus,
  Droplets,
  FileText,
  Image as ImageIcon,
  File,
  Clock,
  ChevronRight,
  ArrowLeft,
  Upload,
  Layers,
  Ruler,
  Calculator,
  Settings2,
  History,
  CheckCircle,
  Edit3,
  Trash2,
  Download,
  Copy,
  MoreVertical,
  Gauge,
  Thermometer,
  Waves,
  Filter,
  Zap,
  Box,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

const { width } = Dimensions.get("window");

type TabType = "designs" | "specs" | "equipment";

interface DesignFile {
  id: string;
  name: string;
  type: "pdf" | "cad" | "image";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  thumbnail: string;
  projectId: string;
  projectName: string;
  version: number;
  versions: DesignVersion[];
  notes: string;
}

interface DesignVersion {
  id: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  changes: string;
  thumbnail: string;
}

interface PoolSpec {
  id: string;
  projectId: string;
  projectName: string;
  dimensions: {
    length: number;
    width: number;
    shallowDepth: number;
    deepDepth: number;
    shape: string;
  };
  volume: {
    gallons: number;
    liters: number;
  };
  surfaceArea: number;
  perimeter: number;
  lastUpdated: string;
  updatedBy: string;
  versions: SpecVersion[];
}

interface SpecVersion {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  changes: string;
}

interface Equipment {
  id: string;
  name: string;
  category: "pump" | "filter" | "heater" | "salt_system" | "lighting" | "automation" | "cleaner" | "other";
  brand: string;
  model: string;
  specs: string;
  quantity: number;
  unitPrice: number;
  projectId: string;
  projectName: string;
  status: "selected" | "ordered" | "installed";
}

const mockDesigns: DesignFile[] = [
  {
    id: "1",
    name: "Henderson Pool - Final Design",
    type: "cad",
    size: "4.2 MB",
    uploadedAt: "Jan 15, 2025",
    uploadedBy: "Mike Johnson",
    thumbnail: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=400",
    projectId: "p1",
    projectName: "Henderson Residence",
    version: 3,
    versions: [
      { id: "v3", version: 3, uploadedAt: "Jan 15, 2025", uploadedBy: "Mike Johnson", changes: "Added spa connection, updated decking layout", thumbnail: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=400" },
      { id: "v2", version: 2, uploadedAt: "Jan 8, 2025", uploadedBy: "Mike Johnson", changes: "Revised dimensions per client feedback", thumbnail: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=400" },
      { id: "v1", version: 1, uploadedAt: "Jan 2, 2025", uploadedBy: "Sarah Davis", changes: "Initial design draft", thumbnail: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=400" },
    ],
    notes: "Client approved final version with spa addition",
  },
  {
    id: "2",
    name: "Garcia Pool - Concept",
    type: "pdf",
    size: "2.8 MB",
    uploadedAt: "Jan 20, 2025",
    uploadedBy: "Sarah Davis",
    thumbnail: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400",
    projectId: "p2",
    projectName: "Garcia Family Pool",
    version: 1,
    versions: [
      { id: "v1", version: 1, uploadedAt: "Jan 20, 2025", uploadedBy: "Sarah Davis", changes: "Initial concept presentation", thumbnail: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400" },
    ],
    notes: "Awaiting client approval",
  },
  {
    id: "3",
    name: "Thompson Pool - 3D Render",
    type: "image",
    size: "8.5 MB",
    uploadedAt: "Jan 18, 2025",
    uploadedBy: "Mike Johnson",
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    projectId: "p3",
    projectName: "Thompson Estate",
    version: 2,
    versions: [
      { id: "v2", version: 2, uploadedAt: "Jan 18, 2025", uploadedBy: "Mike Johnson", changes: "Updated water feature rendering", thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400" },
      { id: "v1", version: 1, uploadedAt: "Jan 10, 2025", uploadedBy: "Mike Johnson", changes: "Initial 3D render", thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400" },
    ],
    notes: "High-end infinity edge design",
  },
];

const mockSpecs: PoolSpec[] = [
  {
    id: "1",
    projectId: "p1",
    projectName: "Henderson Residence",
    dimensions: {
      length: 40,
      width: 18,
      shallowDepth: 3.5,
      deepDepth: 8,
      shape: "Rectangle with Spa",
    },
    volume: { gallons: 32500, liters: 123028 },
    surfaceArea: 720,
    perimeter: 116,
    lastUpdated: "Jan 15, 2025",
    updatedBy: "Mike Johnson",
    versions: [
      { id: "sv3", version: 3, updatedAt: "Jan 15, 2025", updatedBy: "Mike Johnson", changes: "Added spa volume calculations" },
      { id: "sv2", version: 2, updatedAt: "Jan 8, 2025", updatedBy: "Mike Johnson", changes: "Adjusted depths" },
      { id: "sv1", version: 1, updatedAt: "Jan 2, 2025", updatedBy: "Sarah Davis", changes: "Initial specifications" },
    ],
  },
  {
    id: "2",
    projectId: "p2",
    projectName: "Garcia Family Pool",
    dimensions: {
      length: 32,
      width: 16,
      shallowDepth: 3,
      deepDepth: 6,
      shape: "Freeform",
    },
    volume: { gallons: 18500, liters: 70030 },
    surfaceArea: 512,
    perimeter: 96,
    lastUpdated: "Jan 20, 2025",
    updatedBy: "Sarah Davis",
    versions: [
      { id: "sv1", version: 1, updatedAt: "Jan 20, 2025", updatedBy: "Sarah Davis", changes: "Initial specifications" },
    ],
  },
  {
    id: "3",
    projectId: "p3",
    projectName: "Thompson Estate",
    dimensions: {
      length: 60,
      width: 25,
      shallowDepth: 4,
      deepDepth: 10,
      shape: "Infinity Edge",
    },
    volume: { gallons: 56000, liters: 211983 },
    surfaceArea: 1500,
    perimeter: 170,
    lastUpdated: "Jan 18, 2025",
    updatedBy: "Mike Johnson",
    versions: [
      { id: "sv2", version: 2, updatedAt: "Jan 18, 2025", updatedBy: "Mike Johnson", changes: "Updated infinity edge calculations" },
      { id: "sv1", version: 1, updatedAt: "Jan 10, 2025", updatedBy: "Sarah Davis", changes: "Initial specifications" },
    ],
  },
];

const mockEquipment: Equipment[] = [
  { id: "e1", name: "Variable Speed Pool Pump", category: "pump", brand: "Pentair", model: "IntelliFlo VSF", specs: "3HP, Variable Speed, Energy Efficient", quantity: 1, unitPrice: 1849, projectId: "p1", projectName: "Henderson Residence", status: "installed" },
  { id: "e2", name: "Cartridge Filter", category: "filter", brand: "Hayward", model: "SwimClear C5030", specs: "525 sq ft filtration area", quantity: 1, unitPrice: 1299, projectId: "p1", projectName: "Henderson Residence", status: "installed" },
  { id: "e3", name: "Gas Pool Heater", category: "heater", brand: "Raypak", model: "R406A", specs: "406K BTU, Digital Controls", quantity: 1, unitPrice: 3499, projectId: "p1", projectName: "Henderson Residence", status: "ordered" },
  { id: "e4", name: "Salt Chlorine Generator", category: "salt_system", brand: "Hayward", model: "AquaRite S3", specs: "40K gallons capacity", quantity: 1, unitPrice: 1599, projectId: "p1", projectName: "Henderson Residence", status: "selected" },
  { id: "e5", name: "LED Pool Light", category: "lighting", brand: "Pentair", model: "IntelliBrite 5G", specs: "Color-changing, 12V", quantity: 4, unitPrice: 599, projectId: "p1", projectName: "Henderson Residence", status: "ordered" },
  { id: "e6", name: "Pool Automation System", category: "automation", brand: "Pentair", model: "IntelliCenter", specs: "Complete pool/spa control", quantity: 1, unitPrice: 2899, projectId: "p1", projectName: "Henderson Residence", status: "selected" },
  { id: "e7", name: "Robotic Pool Cleaner", category: "cleaner", brand: "Dolphin", model: "Premier", specs: "Wi-Fi enabled, wall climbing", quantity: 1, unitPrice: 1299, projectId: "p2", projectName: "Garcia Family Pool", status: "selected" },
  { id: "e8", name: "Heat Pump", category: "heater", brand: "Hayward", model: "HeatPro VS", specs: "Variable speed, 140K BTU", quantity: 1, unitPrice: 4299, projectId: "p3", projectName: "Thompson Estate", status: "ordered" },
];

const categoryConfig = {
  pump: { label: "Pump", color: "#3B82F6", bg: "#DBEAFE", icon: Gauge },
  filter: { label: "Filter", color: "#22C55E", bg: "#DCFCE7", icon: Filter },
  heater: { label: "Heater", color: "#EF4444", bg: "#FEE2E2", icon: Thermometer },
  salt_system: { label: "Salt System", color: "#8B5CF6", bg: "#EDE9FE", icon: Waves },
  lighting: { label: "Lighting", color: "#272D53", bg: "#E8E9EE", icon: Zap },
  automation: { label: "Automation", color: "#06B6D4", bg: "#CFFAFE", icon: Settings2 },
  cleaner: { label: "Cleaner", color: "#EC4899", bg: "#FCE7F3", icon: Droplets },
  other: { label: "Other", color: "#6B7280", bg: "#F3F4F6", icon: Box },
};

const statusConfig = {
  selected: { label: "Selected", color: "#272D53", bg: "#E8E9EE" },
  ordered: { label: "Ordered", color: "#3B82F6", bg: "#DBEAFE" },
  installed: { label: "Installed", color: "#22C55E", bg: "#DCFCE7" },
};

const fileTypeConfig = {
  pdf: { label: "PDF", color: "#EF4444", icon: FileText },
  cad: { label: "CAD", color: "#3B82F6", icon: Layers },
  image: { label: "Image", color: "#22C55E", icon: ImageIcon },
};

export default function PoolDesignSpecsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("designs");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<DesignFile | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<PoolSpec | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAddDesignModal, setShowAddDesignModal] = useState(false);
  const [showAddSpecModal, setShowAddSpecModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const [newSpec, setNewSpec] = useState({
    projectName: "",
    length: "",
    width: "",
    shallowDepth: "",
    deepDepth: "",
    shape: "Rectangle",
  });

  const filteredDesigns = useMemo(() => {
    if (!searchQuery) return mockDesigns;
    return mockDesigns.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredSpecs = useMemo(() => {
    if (!searchQuery) return mockSpecs;
    return mockSpecs.filter(s =>
      s.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery) return mockEquipment;
    return mockEquipment.filter(e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const calculateVolume = (length: number, width: number, shallowDepth: number, deepDepth: number) => {
    const avgDepth = (shallowDepth + deepDepth) / 2;
    const cubicFeet = length * width * avgDepth;
    const gallons = Math.round(cubicFeet * 7.48);
    const liters = Math.round(gallons * 3.785);
    return { gallons, liters };
  };

  const handleUploadDesign = () => {
    Alert.alert("Upload Design", "Select file type to upload", [
      { text: "PDF Document", onPress: () => Alert.alert("Success", "PDF upload initiated") },
      { text: "CAD File", onPress: () => Alert.alert("Success", "CAD upload initiated") },
      { text: "Image", onPress: () => Alert.alert("Success", "Image upload initiated") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSaveSpec = () => {
    if (!newSpec.projectName || !newSpec.length || !newSpec.width) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }
    Alert.alert("Success", "Pool specifications saved!");
    setShowAddSpecModal(false);
    setNewSpec({ projectName: "", length: "", width: "", shallowDepth: "", deepDepth: "", shape: "Rectangle" });
  };

  const renderDesignsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockDesigns.length}</Text>
          <Text style={styles.statLabel}>Total Designs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockDesigns.filter(d => d.type === "cad").length}</Text>
          <Text style={styles.statLabel}>CAD Files</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockDesigns.reduce((sum, d) => sum + d.versions.length, 0)}</Text>
          <Text style={styles.statLabel}>Versions</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDesign}>
        <Upload size={20} color="#FFF" />
        <Text style={styles.uploadButtonText}>Upload New Design</Text>
      </TouchableOpacity>

      {filteredDesigns.map((design) => {
        const typeConfig = fileTypeConfig[design.type];
        const TypeIcon = typeConfig.icon;

        return (
          <TouchableOpacity
            key={design.id}
            style={styles.designCard}
            onPress={() => setSelectedDesign(design)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: design.thumbnail }} style={styles.designThumbnail} contentFit="cover" />
            <View style={styles.designContent}>
              <View style={styles.designHeader}>
                <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
                  <TypeIcon size={12} color={typeConfig.color} />
                  <Text style={[styles.typeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                </View>
                <View style={styles.versionBadge}>
                  <History size={12} color="#6B7280" />
                  <Text style={styles.versionText}>v{design.version}</Text>
                </View>
              </View>

              <Text style={styles.designName} numberOfLines={1}>{design.name}</Text>
              <Text style={styles.projectName}>{design.projectName}</Text>

              <View style={styles.designMeta}>
                <Text style={styles.fileSize}>{design.size}</Text>
                <View style={styles.metaDivider} />
                <Text style={styles.uploadDate}>{design.uploadedAt}</Text>
              </View>

              <View style={styles.designFooter}>
                <Text style={styles.uploadedBy}>by {design.uploadedBy}</Text>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {filteredDesigns.length === 0 && (
        <View style={styles.emptyState}>
          <FileText size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Designs Found</Text>
          <Text style={styles.emptySubtitle}>Upload your first pool design to get started</Text>
        </View>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderSpecsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockSpecs.length}</Text>
          <Text style={styles.statLabel}>Pool Specs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(mockSpecs.reduce((sum, s) => sum + s.volume.gallons, 0) / 1000)}K
          </Text>
          <Text style={styles.statLabel}>Avg. Gallons</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {mockSpecs.reduce((sum, s) => sum + s.versions.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Revisions</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={() => setShowAddSpecModal(true)}>
        <Calculator size={20} color="#FFF" />
        <Text style={styles.uploadButtonText}>Add Pool Specifications</Text>
      </TouchableOpacity>

      {filteredSpecs.map((spec) => (
        <TouchableOpacity
          key={spec.id}
          style={styles.specCard}
          onPress={() => setSelectedSpec(spec)}
          activeOpacity={0.7}
        >
          <View style={styles.specHeader}>
            <View style={styles.specIconContainer}>
              <Ruler size={24} color="#0EA5E9" />
            </View>
            <View style={styles.specTitleContainer}>
              <Text style={styles.specProjectName}>{spec.projectName}</Text>
              <Text style={styles.specShape}>{spec.dimensions.shape}</Text>
            </View>
            <View style={styles.versionBadge}>
              <History size={12} color="#6B7280" />
              <Text style={styles.versionText}>v{spec.versions.length}</Text>
            </View>
          </View>

          <View style={styles.dimensionsGrid}>
            <View style={styles.dimensionItem}>
              <Text style={styles.dimensionLabel}>Length</Text>
              <Text style={styles.dimensionValue}>{spec.dimensions.length} ft</Text>
            </View>
            <View style={styles.dimensionItem}>
              <Text style={styles.dimensionLabel}>Width</Text>
              <Text style={styles.dimensionValue}>{spec.dimensions.width} ft</Text>
            </View>
            <View style={styles.dimensionItem}>
              <Text style={styles.dimensionLabel}>Shallow</Text>
              <Text style={styles.dimensionValue}>{spec.dimensions.shallowDepth} ft</Text>
            </View>
            <View style={styles.dimensionItem}>
              <Text style={styles.dimensionLabel}>Deep</Text>
              <Text style={styles.dimensionValue}>{spec.dimensions.deepDepth} ft</Text>
            </View>
          </View>

          <View style={styles.volumeSection}>
            <View style={styles.volumeItem}>
              <Droplets size={16} color="#0EA5E9" />
              <Text style={styles.volumeValue}>{spec.volume.gallons.toLocaleString()} gal</Text>
            </View>
            <View style={styles.volumeDivider} />
            <View style={styles.volumeItem}>
              <Text style={styles.volumeSecondary}>{spec.volume.liters.toLocaleString()} L</Text>
            </View>
          </View>

          <View style={styles.specFooter}>
            <Text style={styles.specMeta}>Updated {spec.lastUpdated} by {spec.updatedBy}</Text>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </View>
        </TouchableOpacity>
      ))}

      {filteredSpecs.length === 0 && (
        <View style={styles.emptyState}>
          <Ruler size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Specifications</Text>
          <Text style={styles.emptySubtitle}>Add pool dimensions and calculations</Text>
        </View>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderEquipmentTab = () => {
    const groupedEquipment = filteredEquipment.reduce((acc, eq) => {
      if (!acc[eq.projectName]) acc[eq.projectName] = [];
      acc[eq.projectName].push(eq);
      return acc;
    }, {} as Record<string, Equipment[]>);

    const totalValue = filteredEquipment.reduce((sum, eq) => sum + (eq.unitPrice * eq.quantity), 0);

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredEquipment.length}</Text>
            <Text style={styles.statLabel}>Equipment</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${Math.round(totalValue / 1000)}K</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredEquipment.filter(e => e.status === "installed").length}</Text>
            <Text style={styles.statLabel}>Installed</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={() => setShowEquipmentModal(true)}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.uploadButtonText}>Add Equipment</Text>
        </TouchableOpacity>

        {Object.entries(groupedEquipment).map(([projectName, equipment]) => (
          <View key={projectName} style={styles.equipmentGroup}>
            <Text style={styles.equipmentGroupTitle}>{projectName}</Text>
            {equipment.map((item) => {
              const catConfig = categoryConfig[item.category];
              const statConfig = statusConfig[item.status];
              const CatIcon = catConfig.icon;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.equipmentCard}
                  onPress={() => setSelectedEquipment(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.equipmentIconContainer, { backgroundColor: catConfig.bg }]}>
                    <CatIcon size={20} color={catConfig.color} />
                  </View>
                  <View style={styles.equipmentContent}>
                    <View style={styles.equipmentHeader}>
                      <Text style={styles.equipmentName} numberOfLines={1}>{item.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statConfig.bg }]}>
                        <Text style={[styles.statusText, { color: statConfig.color }]}>{statConfig.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.equipmentBrand}>{item.brand} {item.model}</Text>
                    <View style={styles.equipmentFooter}>
                      <Text style={styles.equipmentSpecs} numberOfLines={1}>{item.specs}</Text>
                      <Text style={styles.equipmentPrice}>
                        ${(item.unitPrice * item.quantity).toLocaleString()}
                        {item.quantity > 1 && <Text style={styles.quantityText}> (×{item.quantity})</Text>}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {filteredEquipment.length === 0 && (
          <View style={styles.emptyState}>
            <Settings2 size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Equipment</Text>
            <Text style={styles.emptySubtitle}>Add pumps, filters, heaters, and more</Text>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Design & Specs</Text>
            <Text style={styles.headerSubtitle}>Pool designs, dimensions & equipment</Text>
          </View>
          <View style={styles.headerBadge}>
            <Layers size={20} color="#FFF" />
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search designs, specs, equipment..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.tabBar}>
          {[
            { id: "designs" as const, label: "Designs", icon: FileText },
            { id: "specs" as const, label: "Specs", icon: Ruler },
            { id: "equipment" as const, label: "Equipment", icon: Settings2 },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <TabIcon size={18} color={isActive ? "#0EA5E9" : Colors.textSecondary} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === "designs" && renderDesignsTab()}
        {activeTab === "specs" && renderSpecsTab()}
        {activeTab === "equipment" && renderEquipmentTab()}
      </SafeAreaView>

      <Modal
        visible={!!selectedDesign}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDesign(null)}
      >
        {selectedDesign && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedDesign(null)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Design Details</Text>
              <TouchableOpacity>
                <MoreVertical size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedDesign.thumbnail }} style={styles.modalImage} contentFit="cover" />

              <View style={styles.modalBody}>
                <View style={styles.modalBadges}>
                  <View style={[styles.typeBadge, { backgroundColor: `${fileTypeConfig[selectedDesign.type].color}20` }]}>
                    {React.createElement(fileTypeConfig[selectedDesign.type].icon, { size: 14, color: fileTypeConfig[selectedDesign.type].color })}
                    <Text style={[styles.typeText, { color: fileTypeConfig[selectedDesign.type].color }]}>
                      {fileTypeConfig[selectedDesign.type].label}
                    </Text>
                  </View>
                  <View style={styles.versionBadgeLarge}>
                    <History size={14} color="#0EA5E9" />
                    <Text style={styles.versionTextLarge}>Version {selectedDesign.version}</Text>
                  </View>
                </View>

                <Text style={styles.modalDesignName}>{selectedDesign.name}</Text>
                <Text style={styles.modalProjectName}>{selectedDesign.projectName}</Text>

                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>File Size</Text>
                    <Text style={styles.infoValue}>{selectedDesign.size}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Uploaded</Text>
                    <Text style={styles.infoValue}>{selectedDesign.uploadedAt}</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Uploaded By</Text>
                    <Text style={styles.infoValue}>{selectedDesign.uploadedBy}</Text>
                  </View>
                </View>

                {selectedDesign.notes && (
                  <View style={styles.notesCard}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{selectedDesign.notes}</Text>
                  </View>
                )}

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Version History</Text>
                  <Text style={styles.sectionCount}>{selectedDesign.versions.length} versions</Text>
                </View>

                {selectedDesign.versions.map((version, idx) => (
                  <View key={version.id} style={[styles.versionItem, idx === 0 && styles.versionItemCurrent]}>
                    <View style={[styles.versionDot, idx === 0 && styles.versionDotCurrent]} />
                    <View style={styles.versionContent}>
                      <View style={styles.versionHeader}>
                        <Text style={styles.versionNumber}>v{version.version}</Text>
                        {idx === 0 && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.versionChanges}>{version.changes}</Text>
                      <Text style={styles.versionMeta}>{version.uploadedAt} • {version.uploadedBy}</Text>
                    </View>
                    {idx === 0 && (
                      <TouchableOpacity style={styles.downloadBtn}>
                        <Download size={18} color="#0EA5E9" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Download size={18} color="#0EA5E9" />
                    <Text style={styles.actionBtnText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Copy size={18} color="#0EA5E9" />
                    <Text style={styles.actionBtnText}>Duplicate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Edit3 size={18} color="#0EA5E9" />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={!!selectedSpec}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSpec(null)}
      >
        {selectedSpec && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedSpec(null)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Pool Specifications</Text>
              <TouchableOpacity>
                <Edit3 size={24} color="#0EA5E9" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.specModalHeader}>
                <View style={styles.specIconLarge}>
                  <Ruler size={32} color="#0EA5E9" />
                </View>
                <Text style={styles.specModalTitle}>{selectedSpec.projectName}</Text>
                <Text style={styles.specModalShape}>{selectedSpec.dimensions.shape}</Text>
              </View>

              <View style={styles.dimensionsCard}>
                <Text style={styles.cardTitle}>Dimensions</Text>
                <View style={styles.dimensionsGridLarge}>
                  <View style={styles.dimensionItemLarge}>
                    <Text style={styles.dimensionLabelLarge}>Length</Text>
                    <Text style={styles.dimensionValueLarge}>{selectedSpec.dimensions.length} ft</Text>
                  </View>
                  <View style={styles.dimensionItemLarge}>
                    <Text style={styles.dimensionLabelLarge}>Width</Text>
                    <Text style={styles.dimensionValueLarge}>{selectedSpec.dimensions.width} ft</Text>
                  </View>
                  <View style={styles.dimensionItemLarge}>
                    <Text style={styles.dimensionLabelLarge}>Shallow End</Text>
                    <Text style={styles.dimensionValueLarge}>{selectedSpec.dimensions.shallowDepth} ft</Text>
                  </View>
                  <View style={styles.dimensionItemLarge}>
                    <Text style={styles.dimensionLabelLarge}>Deep End</Text>
                    <Text style={styles.dimensionValueLarge}>{selectedSpec.dimensions.deepDepth} ft</Text>
                  </View>
                </View>
              </View>

              <View style={styles.calculationsCard}>
                <Text style={styles.cardTitle}>Volume Calculations</Text>
                <View style={styles.volumeDisplay}>
                  <View style={styles.volumeMain}>
                    <Droplets size={28} color="#0EA5E9" />
                    <Text style={styles.volumeMainValue}>{selectedSpec.volume.gallons.toLocaleString()}</Text>
                    <Text style={styles.volumeMainUnit}>gallons</Text>
                  </View>
                  <Text style={styles.volumeSecondaryDisplay}>{selectedSpec.volume.liters.toLocaleString()} liters</Text>
                </View>

                <View style={styles.additionalCalcs}>
                  <View style={styles.calcItem}>
                    <Text style={styles.calcLabel}>Surface Area</Text>
                    <Text style={styles.calcValue}>{selectedSpec.surfaceArea} sq ft</Text>
                  </View>
                  <View style={styles.calcItem}>
                    <Text style={styles.calcLabel}>Perimeter</Text>
                    <Text style={styles.calcValue}>{selectedSpec.perimeter} ft</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Revision History</Text>
                <Text style={styles.sectionCount}>{selectedSpec.versions.length} revisions</Text>
              </View>

              {selectedSpec.versions.map((version, idx) => (
                <View key={version.id} style={[styles.versionItem, idx === 0 && styles.versionItemCurrent]}>
                  <View style={[styles.versionDot, idx === 0 && styles.versionDotCurrent]} />
                  <View style={styles.versionContent}>
                    <View style={styles.versionHeader}>
                      <Text style={styles.versionNumber}>v{version.version}</Text>
                      {idx === 0 && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.versionChanges}>{version.changes}</Text>
                    <Text style={styles.versionMeta}>{version.updatedAt} • {version.updatedBy}</Text>
                  </View>
                </View>
              ))}

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={showAddSpecModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddSpecModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddSpecModal(false)}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Pool Specs</Text>
            <TouchableOpacity onPress={handleSaveSpec}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            <Text style={styles.inputLabel}>Project Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Johnson Residence"
              placeholderTextColor={Colors.textTertiary}
              value={newSpec.projectName}
              onChangeText={(text) => setNewSpec({ ...newSpec, projectName: text })}
            />

            <Text style={styles.inputLabel}>Pool Shape</Text>
            <View style={styles.shapeOptions}>
              {["Rectangle", "Freeform", "L-Shape", "Kidney", "Infinity Edge"].map((shape) => (
                <TouchableOpacity
                  key={shape}
                  style={[styles.shapeOption, newSpec.shape === shape && styles.shapeOptionActive]}
                  onPress={() => setNewSpec({ ...newSpec, shape })}
                >
                  <Text style={[styles.shapeOptionText, newSpec.shape === shape && styles.shapeOptionTextActive]}>
                    {shape}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Dimensions (feet)</Text>
            <View style={styles.dimensionInputs}>
              <View style={styles.dimensionInputWrapper}>
                <Text style={styles.dimensionInputLabel}>Length *</Text>
                <TextInput
                  style={styles.dimensionInput}
                  placeholder="40"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={newSpec.length}
                  onChangeText={(text) => setNewSpec({ ...newSpec, length: text })}
                />
              </View>
              <View style={styles.dimensionInputWrapper}>
                <Text style={styles.dimensionInputLabel}>Width *</Text>
                <TextInput
                  style={styles.dimensionInput}
                  placeholder="18"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={newSpec.width}
                  onChangeText={(text) => setNewSpec({ ...newSpec, width: text })}
                />
              </View>
            </View>

            <View style={styles.dimensionInputs}>
              <View style={styles.dimensionInputWrapper}>
                <Text style={styles.dimensionInputLabel}>Shallow Depth</Text>
                <TextInput
                  style={styles.dimensionInput}
                  placeholder="3.5"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={newSpec.shallowDepth}
                  onChangeText={(text) => setNewSpec({ ...newSpec, shallowDepth: text })}
                />
              </View>
              <View style={styles.dimensionInputWrapper}>
                <Text style={styles.dimensionInputLabel}>Deep Depth</Text>
                <TextInput
                  style={styles.dimensionInput}
                  placeholder="8"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={newSpec.deepDepth}
                  onChangeText={(text) => setNewSpec({ ...newSpec, deepDepth: text })}
                />
              </View>
            </View>

            {newSpec.length && newSpec.width && (
              <View style={styles.calculationPreview}>
                <Calculator size={20} color="#0EA5E9" />
                <View style={styles.calculationPreviewContent}>
                  <Text style={styles.calculationPreviewTitle}>Estimated Volume</Text>
                  <Text style={styles.calculationPreviewValue}>
                    {calculateVolume(
                      parseFloat(newSpec.length) || 0,
                      parseFloat(newSpec.width) || 0,
                      parseFloat(newSpec.shallowDepth) || 4,
                      parseFloat(newSpec.deepDepth) || 8
                    ).gallons.toLocaleString()} gallons
                  </Text>
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEquipmentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEquipmentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEquipmentModal(false)}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Equipment</Text>
            <TouchableOpacity onPress={() => { Alert.alert("Success", "Equipment added!"); setShowEquipmentModal(false); }}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            <Text style={styles.inputLabel}>Equipment Category</Text>
            <View style={styles.categoryGrid}>
              {Object.entries(categoryConfig).map(([key, config]) => {
                const CatIcon = config.icon;
                return (
                  <TouchableOpacity key={key} style={[styles.categoryOption, { borderColor: config.color }]}>
                    <View style={[styles.categoryIconSmall, { backgroundColor: config.bg }]}>
                      <CatIcon size={18} color={config.color} />
                    </View>
                    <Text style={styles.categoryOptionText}>{config.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Equipment Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Variable Speed Pool Pump"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.inputLabel}>Brand</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Pentair"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.inputLabel}>Model</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., IntelliFlo VSF"
              placeholderTextColor={Colors.textTertiary}
            />

            <Text style={styles.inputLabel}>Specifications</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              placeholder="e.g., 3HP, Variable Speed, Energy Efficient"
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.dimensionInputs}>
              <View style={styles.dimensionInputWrapper}>
                <Text style={styles.dimensionInputLabel}>Quantity</Text>
                <TextInput
                  style={styles.dimensionInput}
                  placeholder="1"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.dimensionInputWrapper}>
                <Text style={styles.dimensionInputLabel}>Unit Price ($)</Text>
                <TextInput
                  style={styles.dimensionInput}
                  placeholder="1849"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>
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
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#0EA5E9",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#0EA5E9",
  },
  tabContent: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  designCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  designThumbnail: {
    width: 100,
    height: 100,
  },
  designContent: {
    flex: 1,
    padding: 12,
  },
  designHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  versionText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  designName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  projectName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  designMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fileSize: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textTertiary,
    marginHorizontal: 8,
  },
  uploadDate: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  designFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadedBy: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  specCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  specHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  specIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  specTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  specProjectName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  specShape: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dimensionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  dimensionItem: {
    width: (width - 40 - 28 - 24) / 4,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  dimensionLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  dimensionValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  volumeSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  volumeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#0369A1",
  },
  volumeDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#7DD3FC",
    marginHorizontal: 12,
  },
  volumeSecondary: {
    fontSize: 12,
    color: "#0369A1",
  },
  specFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specMeta: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  equipmentGroup: {
    marginBottom: 16,
  },
  equipmentGroupTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  equipmentCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  equipmentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  equipmentContent: {
    flex: 1,
    marginLeft: 12,
  },
  equipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  equipmentBrand: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  equipmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  equipmentSpecs: {
    fontSize: 11,
    color: Colors.textTertiary,
    flex: 1,
    marginRight: 8,
  },
  equipmentPrice: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#0EA5E9",
  },
  quantityText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 220,
  },
  modalBody: {
    padding: 20,
  },
  modalBadges: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  versionBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionTextLarge: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#0369A1",
  },
  modalDesignName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  modalProjectName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  notesCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  versionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 12,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
  },
  versionItemCurrent: {
    borderLeftColor: "#0EA5E9",
  },
  versionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginLeft: -17,
    marginTop: 4,
    marginRight: 12,
  },
  versionDotCurrent: {
    backgroundColor: "#0EA5E9",
  },
  versionContent: {
    flex: 1,
  },
  versionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  currentBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#22C55E",
  },
  versionChanges: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  versionMeta: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  specModalHeader: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.surface,
  },
  specIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  specModalTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  specModalShape: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dimensionsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  dimensionsGridLarge: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dimensionItemLarge: {
    width: (width - 40 - 32 - 12) / 2,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  dimensionLabelLarge: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dimensionValueLarge: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  calculationsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  volumeDisplay: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 14,
    marginBottom: 16,
  },
  volumeMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  volumeMainValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#0369A1",
  },
  volumeMainUnit: {
    fontSize: 16,
    color: "#0369A1",
    fontWeight: "500" as const,
  },
  volumeSecondaryDisplay: {
    fontSize: 14,
    color: "#0369A1",
  },
  additionalCalcs: {
    flexDirection: "row",
    gap: 12,
  },
  calcItem: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  calcLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  calcValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  formContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  shapeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  shapeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  shapeOptionActive: {
    backgroundColor: "#0EA5E9",
  },
  shapeOptionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  shapeOptionTextActive: {
    color: "#FFF",
  },
  dimensionInputs: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  dimensionInputWrapper: {
    flex: 1,
  },
  dimensionInputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  dimensionInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    textAlign: "center",
  },
  calculationPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    padding: 16,
    backgroundColor: "#E0F2FE",
    borderRadius: 14,
  },
  calculationPreviewContent: {
    flex: 1,
  },
  calculationPreviewTitle: {
    fontSize: 12,
    color: "#0369A1",
    marginBottom: 2,
  },
  calculationPreviewValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#0369A1",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: Colors.surface,
  },
  categoryIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text,
  },
});
