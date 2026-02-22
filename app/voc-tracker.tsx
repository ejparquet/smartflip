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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  Leaf,
  Droplets,
  Award,
  TrendingUp,
  Plus,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  Info,
  X,
  Paintbrush,
  BarChart3,
  Target,
  Clock,
  FileText,
  Trash2,
  Edit3,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface PaintProduct {
  id: string;
  name: string;
  brand: string;
  vocLevel: number;
  vocCategory: "zero" | "low" | "medium" | "high";
  gallonsUsed: number;
  isEcoFriendly: boolean;
  certifications: string[];
  dateAdded: string;
  color?: string;
  projectName?: string;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  requirement: string;
  progress: number;
  target: number;
  icon: string;
  achieved: boolean;
}

interface VOCGoal {
  id: string;
  title: string;
  targetPercentage: number;
  currentPercentage: number;
  deadline: string;
}

const mockPaints: PaintProduct[] = [
  {
    id: "1",
    name: "Natura Interior",
    brand: "Benjamin Moore",
    vocLevel: 0,
    vocCategory: "zero",
    gallonsUsed: 45,
    isEcoFriendly: true,
    certifications: ["GREENGUARD Gold", "Zero VOC"],
    dateAdded: "2024-01-15",
    color: "Cloud White",
    projectName: "Johnson Residence",
  },
  {
    id: "2",
    name: "Harmony Interior",
    brand: "Sherwin-Williams",
    vocLevel: 0,
    vocCategory: "zero",
    gallonsUsed: 32,
    isEcoFriendly: true,
    certifications: ["GREENGUARD Gold", "Zero VOC", "MPI Certified"],
    dateAdded: "2024-01-20",
    color: "Pure White",
    projectName: "Smith Office",
  },
  {
    id: "3",
    name: "Eco Spec WB",
    brand: "Benjamin Moore",
    vocLevel: 10,
    vocCategory: "low",
    gallonsUsed: 28,
    isEcoFriendly: true,
    certifications: ["Low VOC", "LEED Compliant"],
    dateAdded: "2024-02-01",
    color: "Soft Gray",
    projectName: "Downtown Cafe",
  },
  {
    id: "4",
    name: "Duration Home",
    brand: "Sherwin-Williams",
    vocLevel: 50,
    vocCategory: "low",
    gallonsUsed: 15,
    isEcoFriendly: true,
    certifications: ["Low VOC"],
    dateAdded: "2024-02-10",
    color: "Navy Blue",
    projectName: "Miller Kitchen",
  },
  {
    id: "5",
    name: "ProMar 200",
    brand: "Sherwin-Williams",
    vocLevel: 150,
    vocCategory: "medium",
    gallonsUsed: 8,
    isEcoFriendly: false,
    certifications: [],
    dateAdded: "2024-02-15",
    color: "Industrial Gray",
    projectName: "Warehouse Project",
  },
];

const certifications: Certification[] = [
  {
    id: "1",
    name: "Green Seal GS-11",
    description: "Paints and coatings environmental standard",
    requirement: "Use 80%+ Green Seal certified paints",
    progress: 72,
    target: 80,
    icon: "seal",
    achieved: false,
  },
  {
    id: "2",
    name: "LEED Contributor",
    description: "Leadership in Energy and Environmental Design",
    requirement: "Use 90%+ low/zero VOC paints for 6 months",
    progress: 94,
    target: 90,
    icon: "building",
    achieved: true,
  },
  {
    id: "3",
    name: "EPA Safer Choice",
    description: "EPA environmental safety program",
    requirement: "Complete 10 projects with zero VOC paints",
    progress: 7,
    target: 10,
    icon: "shield",
    achieved: false,
  },
  {
    id: "4",
    name: "GREENGUARD Gold",
    description: "Indoor air quality certification",
    requirement: "Maintain <50 g/L average VOC for 3 months",
    progress: 100,
    target: 100,
    icon: "award",
    achieved: true,
  },
];

const vocGoals: VOCGoal[] = [
  {
    id: "1",
    title: "Q1 Zero VOC Target",
    targetPercentage: 75,
    currentPercentage: 68,
    deadline: "2024-03-31",
  },
  {
    id: "2",
    title: "Annual Eco-Friendly Goal",
    targetPercentage: 90,
    currentPercentage: 82,
    deadline: "2024-12-31",
  },
];

export default function VOCTrackerScreen() {
  const router = useRouter();
  const [paints, setPaints] = useState<PaintProduct[]>(mockPaints);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  const [newPaint, setNewPaint] = useState({
    name: "",
    brand: "",
    vocLevel: "",
    gallonsUsed: "",
    color: "",
    projectName: "",
  });

  const stats = useMemo(() => {
    const totalGallons = paints.reduce((sum, p) => sum + p.gallonsUsed, 0);
    const zeroVocGallons = paints
      .filter((p) => p.vocCategory === "zero")
      .reduce((sum, p) => sum + p.gallonsUsed, 0);
    const lowVocGallons = paints
      .filter((p) => p.vocCategory === "low")
      .reduce((sum, p) => sum + p.gallonsUsed, 0);
    const ecoFriendlyGallons = paints
      .filter((p) => p.isEcoFriendly)
      .reduce((sum, p) => sum + p.gallonsUsed, 0);
    const avgVoc =
      paints.reduce((sum, p) => sum + p.vocLevel * p.gallonsUsed, 0) /
      totalGallons;

    return {
      totalGallons,
      zeroVocGallons,
      lowVocGallons,
      ecoFriendlyGallons,
      avgVoc: avgVoc.toFixed(1),
      zeroVocPercentage: ((zeroVocGallons / totalGallons) * 100).toFixed(1),
      ecoFriendlyPercentage: ((ecoFriendlyGallons / totalGallons) * 100).toFixed(1),
    };
  }, [paints]);

  const filteredPaints = useMemo(() => {
    return paints.filter((paint) => {
      const matchesSearch =
        paint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paint.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterCategory === "all" || paint.vocCategory === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [paints, searchQuery, filterCategory]);

  const getVOCCategoryColor = (category: string) => {
    switch (category) {
      case "zero":
        return "#10B981";
      case "low":
        return "#3B82F6";
      case "medium":
        return "#272D53";
      case "high":
        return "#EF4444";
      default:
        return Colors.textSecondary;
    }
  };

  const getVOCCategoryLabel = (category: string) => {
    switch (category) {
      case "zero":
        return "Zero VOC";
      case "low":
        return "Low VOC";
      case "medium":
        return "Medium VOC";
      case "high":
        return "High VOC";
      default:
        return category;
    }
  };

  const getVOCCategory = (level: number): PaintProduct["vocCategory"] => {
    if (level === 0) return "zero";
    if (level <= 50) return "low";
    if (level <= 150) return "medium";
    return "high";
  };

  const handleAddPaint = () => {
    if (!newPaint.name || !newPaint.brand || !newPaint.vocLevel) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const vocLevel = parseInt(newPaint.vocLevel);
    const gallons = parseFloat(newPaint.gallonsUsed) || 0;

    const paint: PaintProduct = {
      id: Date.now().toString(),
      name: newPaint.name,
      brand: newPaint.brand,
      vocLevel,
      vocCategory: getVOCCategory(vocLevel),
      gallonsUsed: gallons,
      isEcoFriendly: vocLevel <= 50,
      certifications: vocLevel === 0 ? ["Zero VOC"] : vocLevel <= 50 ? ["Low VOC"] : [],
      dateAdded: new Date().toISOString().split("T")[0],
      color: newPaint.color || undefined,
      projectName: newPaint.projectName || undefined,
    };

    setPaints([paint, ...paints]);
    setNewPaint({
      name: "",
      brand: "",
      vocLevel: "",
      gallonsUsed: "",
      color: "",
      projectName: "",
    });
    setShowAddModal(false);
    Alert.alert("Success", "Paint product added to VOC tracker");
  };

  const handleDeletePaint = (id: string) => {
    Alert.alert(
      "Delete Paint",
      "Are you sure you want to remove this paint from tracking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setPaints(paints.filter((p) => p.id !== id)),
        },
      ]
    );
  };

  const renderStatCard = (
    icon: React.ReactNode,
    label: string,
    value: string,
    subValue?: string,
    color?: string
  ) => (
    <View style={[styles.statCard, color && { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={styles.statIconContainer}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
    </View>
  );

  const renderCertificationCard = (cert: Certification) => (
    <TouchableOpacity
      key={cert.id}
      style={[styles.certCard, cert.achieved && styles.certCardAchieved]}
      onPress={() => {
        setSelectedCert(cert);
        setShowCertModal(true);
      }}
    >
      <View style={styles.certHeader}>
        <View
          style={[
            styles.certIconContainer,
            cert.achieved && styles.certIconAchieved,
          ]}
        >
          {cert.achieved ? (
            <CheckCircle size={20} color="#10B981" />
          ) : (
            <Target size={20} color="#272D53" />
          )}
        </View>
        <View style={styles.certInfo}>
          <Text style={styles.certName}>{cert.name}</Text>
          <Text style={styles.certDescription} numberOfLines={1}>
            {cert.description}
          </Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </View>
      <View style={styles.certProgressContainer}>
        <View style={styles.certProgressBar}>
          <View
            style={[
              styles.certProgressFill,
              {
                width: `${Math.min(100, (cert.progress / cert.target) * 100)}%`,
                backgroundColor: cert.achieved ? "#10B981" : "#272D53",
              },
            ]}
          />
        </View>
        <Text style={styles.certProgressText}>
          {cert.progress}/{cert.target}
          {cert.name.includes("VOC") ? " g/L" : cert.name.includes("projects") ? " projects" : "%"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderGoalCard = (goal: VOCGoal) => {
    const isOnTrack = goal.currentPercentage >= goal.targetPercentage * 0.9;
    return (
      <View key={goal.id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleRow}>
            <Target size={16} color={isOnTrack ? "#10B981" : "#272D53"} />
            <Text style={styles.goalTitle}>{goal.title}</Text>
          </View>
          <View style={styles.goalDeadline}>
            <Clock size={12} color={Colors.textTertiary} />
            <Text style={styles.goalDeadlineText}>{goal.deadline}</Text>
          </View>
        </View>
        <View style={styles.goalProgressSection}>
          <View style={styles.goalProgressBar}>
            <View
              style={[
                styles.goalProgressFill,
                {
                  width: `${(goal.currentPercentage / goal.targetPercentage) * 100}%`,
                  backgroundColor: isOnTrack ? "#10B981" : "#272D53",
                },
              ]}
            />
            <View
              style={[
                styles.goalTargetLine,
                { left: `${100}%` },
              ]}
            />
          </View>
          <View style={styles.goalValues}>
            <Text style={styles.goalCurrentValue}>{goal.currentPercentage}%</Text>
            <Text style={styles.goalTargetValue}>Target: {goal.targetPercentage}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaintItem = (paint: PaintProduct) => (
    <View key={paint.id} style={styles.paintItem}>
      <View style={styles.paintHeader}>
        <View
          style={[
            styles.vocBadge,
            { backgroundColor: getVOCCategoryColor(paint.vocCategory) + "20" },
          ]}
        >
          <Droplets size={14} color={getVOCCategoryColor(paint.vocCategory)} />
          <Text
            style={[styles.vocBadgeText, { color: getVOCCategoryColor(paint.vocCategory) }]}
          >
            {paint.vocLevel} g/L
          </Text>
        </View>
        {paint.isEcoFriendly && (
          <View style={styles.ecoBadge}>
            <Leaf size={12} color="#10B981" />
            <Text style={styles.ecoBadgeText}>Eco-Friendly</Text>
          </View>
        )}
      </View>
      <View style={styles.paintContent}>
        <View style={styles.paintMainInfo}>
          <Text style={styles.paintName}>{paint.name}</Text>
          <Text style={styles.paintBrand}>{paint.brand}</Text>
          {paint.color && (
            <View style={styles.paintColorRow}>
              <View style={[styles.colorDot, { backgroundColor: "#CBD5E1" }]} />
              <Text style={styles.paintColor}>{paint.color}</Text>
            </View>
          )}
        </View>
        <View style={styles.paintStats}>
          <View style={styles.paintStatItem}>
            <Text style={styles.paintStatValue}>{paint.gallonsUsed}</Text>
            <Text style={styles.paintStatLabel}>gallons</Text>
          </View>
        </View>
      </View>
      {paint.projectName && (
        <View style={styles.paintProjectRow}>
          <Paintbrush size={12} color={Colors.textTertiary} />
          <Text style={styles.paintProjectName}>{paint.projectName}</Text>
        </View>
      )}
      {paint.certifications.length > 0 && (
        <View style={styles.paintCertsRow}>
          {paint.certifications.map((cert, index) => (
            <View key={index} style={styles.paintCertBadge}>
              <Text style={styles.paintCertText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.paintActions}>
        <TouchableOpacity style={styles.paintActionBtn}>
          <Edit3 size={16} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.paintActionBtn}
          onPress={() => handleDeletePaint(paint.id)}
        >
          <Trash2 size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerTitleContainer}>
          <Leaf size={24} color="#10B981" />
          <Text style={styles.headerTitle}>VOC Tracker</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Environmental Impact</Text>
            <Text style={styles.heroSubtitle}>
              Track your eco-friendly paint usage
            </Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.ecoFriendlyPercentage}%</Text>
              <Text style={styles.heroStatLabel}>Eco-Friendly</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.avgVoc}</Text>
              <Text style={styles.heroStatLabel}>Avg VOC (g/L)</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {renderStatCard(
            <Droplets size={20} color="#10B981" />,
            "Zero VOC",
            `${stats.zeroVocGallons} gal`,
            `${stats.zeroVocPercentage}% of total`,
            "#10B981"
          )}
          {renderStatCard(
            <TrendingUp size={20} color="#3B82F6" />,
            "Low VOC",
            `${stats.lowVocGallons} gal`,
            "≤50 g/L",
            "#3B82F6"
          )}
          {renderStatCard(
            <BarChart3 size={20} color="#8B5CF6" />,
            "Total Tracked",
            `${stats.totalGallons} gal`,
            `${paints.length} products`,
            "#8B5CF6"
          )}
          {renderStatCard(
            <Leaf size={20} color="#10B981" />,
            "Eco-Friendly",
            `${stats.ecoFriendlyGallons} gal`,
            "Certified green",
            "#10B981"
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#272D53" />
            <Text style={styles.sectionTitle}>Green Certifications</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Track progress toward environmental certifications
          </Text>
          {certifications.map(renderCertificationCard)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>VOC Goals</Text>
          </View>
          {vocGoals.map(renderGoalCard)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Paintbrush size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Paint Products</Text>
            <View style={styles.filterButton}>
              <Filter size={16} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search paints..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterTabs}>
            {["all", "zero", "low", "medium", "high"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterTab,
                  filterCategory === cat && styles.filterTabActive,
                ]}
                onPress={() => setFilterCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterCategory === cat && styles.filterTabTextActive,
                  ]}
                >
                  {cat === "all" ? "All" : getVOCCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredPaints.map(renderPaintItem)}

          {filteredPaints.length === 0 && (
            <View style={styles.emptyState}>
              <Droplets size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No paints found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Info size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>VOC Guidelines</Text>
          </View>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <View style={[styles.infoDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Zero VOC:</Text> 0-5 g/L - Safest option, no harmful emissions
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Low VOC:</Text> 5-50 g/L - Safe for most indoor use
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoDot, { backgroundColor: "#272D53" }]} />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Medium VOC:</Text> 50-150 g/L - Use with ventilation
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>High VOC:</Text> 150+ g/L - Outdoor/industrial use only
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Paint Product</Text>
            <TouchableOpacity onPress={handleAddPaint}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Paint Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Natura Interior"
                placeholderTextColor={Colors.textTertiary}
                value={newPaint.name}
                onChangeText={(text) => setNewPaint({ ...newPaint, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Benjamin Moore"
                placeholderTextColor={Colors.textTertiary}
                value={newPaint.brand}
                onChangeText={(text) => setNewPaint({ ...newPaint, brand: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>VOC Level (g/L) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 0, 25, 50"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={newPaint.vocLevel}
                onChangeText={(text) => setNewPaint({ ...newPaint, vocLevel: text })}
              />
              <Text style={styles.inputHint}>
                Check the paint can or technical data sheet for VOC content
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gallons Used</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={newPaint.gallonsUsed}
                onChangeText={(text) =>
                  setNewPaint({ ...newPaint, gallonsUsed: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Cloud White"
                placeholderTextColor={Colors.textTertiary}
                value={newPaint.color}
                onChangeText={(text) => setNewPaint({ ...newPaint, color: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Johnson Residence"
                placeholderTextColor={Colors.textTertiary}
                value={newPaint.projectName}
                onChangeText={(text) =>
                  setNewPaint({ ...newPaint, projectName: text })
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCertModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCertModal(false)}
      >
        <View style={styles.certModalOverlay}>
          <View style={styles.certModalContent}>
            <TouchableOpacity
              style={styles.certModalClose}
              onPress={() => setShowCertModal(false)}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            {selectedCert && (
              <>
                <View
                  style={[
                    styles.certModalIcon,
                    selectedCert.achieved && styles.certModalIconAchieved,
                  ]}
                >
                  {selectedCert.achieved ? (
                    <Award size={32} color="#10B981" />
                  ) : (
                    <Target size={32} color="#272D53" />
                  )}
                </View>
                <Text style={styles.certModalTitle}>{selectedCert.name}</Text>
                <Text style={styles.certModalDescription}>
                  {selectedCert.description}
                </Text>
                <View style={styles.certModalReq}>
                  <FileText size={16} color={Colors.textSecondary} />
                  <Text style={styles.certModalReqText}>
                    {selectedCert.requirement}
                  </Text>
                </View>
                <View style={styles.certModalProgressSection}>
                  <Text style={styles.certModalProgressLabel}>Progress</Text>
                  <View style={styles.certModalProgressBar}>
                    <View
                      style={[
                        styles.certModalProgressFill,
                        {
                          width: `${Math.min(
                            100,
                            (selectedCert.progress / selectedCert.target) * 100
                          )}%`,
                          backgroundColor: selectedCert.achieved
                            ? "#10B981"
                            : "#272D53",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.certModalProgressText}>
                    {selectedCert.progress} / {selectedCert.target}
                  </Text>
                </View>
                {selectedCert.achieved && (
                  <View style={styles.certModalAchievedBadge}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text style={styles.certModalAchievedText}>
                      Certification Achieved!
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: "#10B981",
    padding: 20,
    margin: 16,
    borderRadius: 16,
  },
  heroContent: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  heroStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
  },
  heroStatValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  heroStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statSubValue: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginLeft: 28,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  certCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  certCardAchieved: {
    borderColor: "#10B981",
    borderWidth: 1.5,
  },
  certHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  certIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E8E9EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  certIconAchieved: {
    backgroundColor: "#D1FAE5",
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  certDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  certProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  certProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  certProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  certProgressText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    minWidth: 60,
    textAlign: "right",
  },
  goalCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  goalDeadline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  goalDeadlineText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  goalProgressSection: {},
  goalProgressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  goalProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  goalTargetLine: {
    position: "absolute",
    top: -2,
    width: 2,
    height: 12,
    backgroundColor: Colors.text,
    borderRadius: 1,
  },
  goalValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  goalCurrentValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  goalTargetValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.text,
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  filterTabActive: {
    backgroundColor: "#10B981",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: "#FFF",
  },
  paintItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  paintHeader: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  vocBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  vocBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  ecoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ecoBadgeText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#10B981",
  },
  paintContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paintMainInfo: {
    flex: 1,
  },
  paintName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  paintBrand: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paintColorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  paintColor: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  paintStats: {
    alignItems: "flex-end",
  },
  paintStatItem: {
    alignItems: "flex-end",
  },
  paintStatValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  paintStatLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  paintProjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  paintProjectName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  paintCertsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  paintCertBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  paintCertText: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: "#6366F1",
  },
  paintActions: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    gap: 8,
  },
  paintActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: "#EFF6FF",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1E40AF",
  },
  infoContent: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: "600" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  certModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  certModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  certModalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  certModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E8E9EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  certModalIconAchieved: {
    backgroundColor: "#D1FAE5",
  },
  certModalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
  },
  certModalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  certModalReq: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    width: "100%",
    marginBottom: 16,
  },
  certModalReqText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  certModalProgressSection: {
    width: "100%",
    marginBottom: 16,
  },
  certModalProgressLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  certModalProgressBar: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 6,
  },
  certModalProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  certModalProgressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center",
  },
  certModalAchievedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  certModalAchievedText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#10B981",
  },
});
