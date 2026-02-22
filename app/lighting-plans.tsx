import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Lightbulb,
  Sun,
  Sunset,
  Moon,
  Lamp,
  LampDesk,
  LampFloor,
  LampCeiling,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Info,
  Calculator,
  Sparkles,
  Eye,
  Home,
  Bed,
  UtensilsCrossed,
  Bath,
  Briefcase,
  Check,
  Edit3,
  Trash2,
  Copy,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface LightingLayer {
  id: string;
  name: string;
  icon: any;
  description: string;
  examples: string[];
  color: string;
}

interface LightFixture {
  id: string;
  name: string;
  type: "ambient" | "task" | "accent" | "decorative";
  lumens: number;
  wattage: number;
  location: string;
  controlType: string;
  notes?: string;
}

interface LightingPlan {
  id: string;
  roomName: string;
  roomType: string;
  sqFt: number;
  fixtures: LightFixture[];
  createdAt: string;
}

const lightingLayers: LightingLayer[] = [
  {
    id: "ambient",
    name: "Ambient",
    icon: Sun,
    description: "General illumination that fills the entire room",
    examples: ["Recessed lights", "Chandeliers", "Flush mounts", "Cove lighting"],
    color: "#272D53",
  },
  {
    id: "task",
    name: "Task",
    icon: LampDesk,
    description: "Focused light for specific activities",
    examples: ["Under-cabinet lights", "Desk lamps", "Pendant over island", "Vanity lights"],
    color: "#3B82F6",
  },
  {
    id: "accent",
    name: "Accent",
    icon: Sparkles,
    description: "Highlights architectural features or artwork",
    examples: ["Track lights", "Picture lights", "Wall washers", "Uplights"],
    color: "#8B5CF6",
  },
  {
    id: "decorative",
    name: "Decorative",
    icon: Lamp,
    description: "Fixtures that serve as visual focal points",
    examples: ["Statement chandeliers", "Sculptural sconces", "Designer pendants"],
    color: "#EC4899",
  },
];

const roomLumenGuide: Record<string, { minLumens: number; maxLumens: number; description: string }> = {
  living: { minLumens: 1500, maxLumens: 3000, description: "Living rooms need flexible lighting for various activities" },
  bedroom: { minLumens: 1000, maxLumens: 2000, description: "Bedrooms benefit from dimmable, layered lighting" },
  kitchen: { minLumens: 3000, maxLumens: 4000, description: "Kitchens require bright task lighting plus ambient" },
  bathroom: { minLumens: 4000, maxLumens: 8000, description: "Bathrooms need high lumens at face level for grooming" },
  office: { minLumens: 3000, maxLumens: 6000, description: "Offices need bright, even light to reduce eye strain" },
  dining: { minLumens: 3000, maxLumens: 6000, description: "Dining areas benefit from dimmable overhead fixtures" },
};

const mockPlans: LightingPlan[] = [
  {
    id: "lp-1",
    roomName: "Westlake Living Room",
    roomType: "living",
    sqFt: 400,
    fixtures: [
      { id: "f-1", name: "Recessed LED Cans", type: "ambient", lumens: 800, wattage: 10, location: "Ceiling grid (6)", controlType: "Dimmer" },
      { id: "f-2", name: "Arc Floor Lamp", type: "task", lumens: 600, wattage: 8, location: "Reading corner", controlType: "Switch" },
      { id: "f-3", name: "Picture Lights", type: "accent", lumens: 300, wattage: 4, location: "Above art (3)", controlType: "Switch" },
      { id: "f-4", name: "Table Lamps", type: "decorative", lumens: 450, wattage: 6, location: "End tables (2)", controlType: "Switch" },
    ],
    createdAt: "2026-01-20",
  },
  {
    id: "lp-2",
    roomName: "Mueller Kitchen",
    roomType: "kitchen",
    sqFt: 250,
    fixtures: [
      { id: "f-5", name: "Pendant Cluster", type: "ambient", lumens: 1200, wattage: 15, location: "Over island (3)", controlType: "Dimmer" },
      { id: "f-6", name: "Under Cabinet LEDs", type: "task", lumens: 400, wattage: 5, location: "Counter runs", controlType: "Switch" },
      { id: "f-7", name: "Recessed Cans", type: "ambient", lumens: 800, wattage: 10, location: "Perimeter (4)", controlType: "Dimmer" },
    ],
    createdAt: "2026-01-18",
  },
];

export default function LightingPlansScreen() {
  const { theme } = useTheme();
  const [plans, setPlans] = useState<LightingPlan[]>(mockPlans);
  const [selectedPlan, setSelectedPlan] = useState<LightingPlan | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLayerInfo, setShowLayerInfo] = useState<string | null>(null);
  
  const [calcRoomType, setCalcRoomType] = useState("living");
  const [calcSqFt, setCalcSqFt] = useState("");

  const calculateLumens = () => {
    const sqFt = parseFloat(calcSqFt) || 0;
    const guide = roomLumenGuide[calcRoomType];
    if (!guide || sqFt === 0) return null;
    
    const lumensPerSqFt = (guide.minLumens + guide.maxLumens) / 2 / 100;
    const totalLumens = Math.round(sqFt * lumensPerSqFt);
    const minTotal = Math.round(sqFt * (guide.minLumens / 100));
    const maxTotal = Math.round(sqFt * (guide.maxLumens / 100));
    
    return { totalLumens, minTotal, maxTotal, description: guide.description };
  };

  const getTotalLumens = (fixtures: LightFixture[]) => {
    return fixtures.reduce((sum, f) => {
      const multiplier = f.location.match(/\((\d+)\)/);
      const count = multiplier ? parseInt(multiplier[1]) : 1;
      return sum + (f.lumens * count);
    }, 0);
  };

  const getFixturesByType = (fixtures: LightFixture[], type: string) => {
    return fixtures.filter(f => f.type === type);
  };

  const lumensResult = calculateLumens();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Lighting Plans",
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowCalculator(true)}
            >
              <Calculator size={22} color="#EC4899" strokeWidth={1.5} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Lighting Layers Guide */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Lighting Layers</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Good lighting design uses multiple layers
        </Text>
        
        <View style={styles.layersGrid}>
          {lightingLayers.map((layer) => (
            <TouchableOpacity
              key={layer.id}
              style={[styles.layerCard, { backgroundColor: theme.surface }]}
              onPress={() => setShowLayerInfo(layer.id)}
            >
              <View style={[styles.layerIcon, { backgroundColor: `${layer.color}20` }]}>
                <layer.icon size={22} color={layer.color} strokeWidth={1.5} />
              </View>
              <Text style={[styles.layerName, { color: theme.text }]}>{layer.name}</Text>
              <Info size={14} color={theme.textTertiary} strokeWidth={1.5} />
            </TouchableOpacity>
          ))}
        </View>

        {/* My Lighting Plans */}
        <View style={styles.plansHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Plans</Text>
          <TouchableOpacity style={styles.addPlanButton}>
            <Plus size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.addPlanText}>New Plan</Text>
          </TouchableOpacity>
        </View>

        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedPlan(plan)}
          >
            <View style={styles.planHeader}>
              <View style={[styles.planTypeIcon, { backgroundColor: "#FDF2F8" }]}>
                {plan.roomType === "living" && <Home size={20} color="#EC4899" strokeWidth={1.5} />}
                {plan.roomType === "bedroom" && <Bed size={20} color="#EC4899" strokeWidth={1.5} />}
                {plan.roomType === "kitchen" && <UtensilsCrossed size={20} color="#EC4899" strokeWidth={1.5} />}
                {plan.roomType === "bathroom" && <Bath size={20} color="#EC4899" strokeWidth={1.5} />}
                {plan.roomType === "office" && <Briefcase size={20} color="#EC4899" strokeWidth={1.5} />}
              </View>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { color: theme.text }]}>{plan.roomName}</Text>
                <Text style={[styles.planMeta, { color: theme.textSecondary }]}>
                  {plan.sqFt} sq ft • {plan.fixtures.length} fixtures
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textTertiary} strokeWidth={1.5} />
            </View>
            
            <View style={styles.planStats}>
              <View style={styles.planStat}>
                <Lightbulb size={14} color="#272D53" strokeWidth={1.5} />
                <Text style={[styles.planStatValue, { color: theme.text }]}>
                  {getTotalLumens(plan.fixtures).toLocaleString()}
                </Text>
                <Text style={[styles.planStatLabel, { color: theme.textSecondary }]}>lumens</Text>
              </View>
              <View style={styles.planStatDivider} />
              <View style={styles.layerIndicators}>
                {lightingLayers.map((layer) => {
                  const hasLayer = getFixturesByType(plan.fixtures, layer.id).length > 0;
                  return (
                    <View
                      key={layer.id}
                      style={[
                        styles.layerDot,
                        { backgroundColor: hasLayer ? layer.color : theme.borderLight },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {plans.length === 0 && (
          <View style={styles.emptyState}>
            <Lightbulb size={48} color={theme.textTertiary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Lighting Plans</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Create your first lighting plan
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Layer Info Modal */}
      <Modal
        visible={!!showLayerInfo}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLayerInfo(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLayerInfo(null)}
        >
          <View style={[styles.layerInfoModal, { backgroundColor: theme.surface }]}>
            {showLayerInfo && (
              <>
                {lightingLayers.filter(l => l.id === showLayerInfo).map((layer) => (
                  <View key={layer.id}>
                    <View style={styles.layerInfoHeader}>
                      <View style={[styles.layerInfoIcon, { backgroundColor: `${layer.color}20` }]}>
                        <layer.icon size={28} color={layer.color} strokeWidth={1.5} />
                      </View>
                      <Text style={[styles.layerInfoTitle, { color: theme.text }]}>{layer.name} Lighting</Text>
                    </View>
                    <Text style={[styles.layerInfoDesc, { color: theme.textSecondary }]}>
                      {layer.description}
                    </Text>
                    <Text style={[styles.examplesTitle, { color: theme.text }]}>Examples:</Text>
                    {layer.examples.map((example, index) => (
                      <View key={index} style={styles.exampleItem}>
                        <View style={[styles.exampleDot, { backgroundColor: layer.color }]} />
                        <Text style={[styles.exampleText, { color: theme.textSecondary }]}>{example}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Plan Detail Modal */}
      <Modal
        visible={!!selectedPlan}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPlan(null)}
      >
        {selectedPlan && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedPlan(null)}>
                <X size={24} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedPlan.roomName}</Text>
              <TouchableOpacity>
                <Edit3 size={22} color="#EC4899" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={[styles.planSummary, { backgroundColor: theme.surface }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: "#EC4899" }]}>{selectedPlan.sqFt}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>sq ft</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.borderLight }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: "#272D53" }]}>
                    {getTotalLumens(selectedPlan.fixtures).toLocaleString()}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>lumens</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.borderLight }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: "#3B82F6" }]}>{selectedPlan.fixtures.length}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>fixtures</Text>
                </View>
              </View>

              {lightingLayers.map((layer) => {
                const layerFixtures = getFixturesByType(selectedPlan.fixtures, layer.id);
                if (layerFixtures.length === 0) return null;
                
                return (
                  <View key={layer.id} style={styles.fixtureSection}>
                    <View style={styles.fixtureSectionHeader}>
                      <View style={[styles.layerBadge, { backgroundColor: `${layer.color}20` }]}>
                        <layer.icon size={16} color={layer.color} strokeWidth={1.5} />
                        <Text style={[styles.layerBadgeText, { color: layer.color }]}>{layer.name}</Text>
                      </View>
                    </View>
                    
                    {layerFixtures.map((fixture) => (
                      <View
                        key={fixture.id}
                        style={[styles.fixtureCard, { backgroundColor: theme.surface }]}
                      >
                        <View style={styles.fixtureMain}>
                          <Text style={[styles.fixtureName, { color: theme.text }]}>{fixture.name}</Text>
                          <Text style={[styles.fixtureLocation, { color: theme.textSecondary }]}>
                            {fixture.location}
                          </Text>
                        </View>
                        <View style={styles.fixtureSpecs}>
                          <View style={styles.specItem}>
                            <Text style={[styles.specValue, { color: theme.text }]}>{fixture.lumens}</Text>
                            <Text style={[styles.specLabel, { color: theme.textTertiary }]}>lm</Text>
                          </View>
                          <View style={styles.specItem}>
                            <Text style={[styles.specValue, { color: theme.text }]}>{fixture.wattage}W</Text>
                          </View>
                          <View style={[styles.controlBadge, { backgroundColor: theme.surfaceSecondary }]}>
                            <Text style={[styles.controlText, { color: theme.textSecondary }]}>
                              {fixture.controlType}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}

              <TouchableOpacity style={styles.addFixtureButton}>
                <Plus size={18} color="#EC4899" strokeWidth={2} />
                <Text style={styles.addFixtureText}>Add Fixture</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Lumen Calculator Modal */}
      <Modal
        visible={showCalculator}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCalculator(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowCalculator(false)}>
              <X size={24} color={theme.text} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Lumen Calculator</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.calcLabel, { color: theme.text }]}>Room Type</Text>
            <View style={styles.roomTypeGrid}>
              {Object.entries(roomLumenGuide).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.roomTypeOption,
                    { backgroundColor: calcRoomType === key ? "#EC4899" : theme.surface },
                  ]}
                  onPress={() => setCalcRoomType(key)}
                >
                  {key === "living" && <Home size={20} color={calcRoomType === key ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />}
                  {key === "bedroom" && <Bed size={20} color={calcRoomType === key ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />}
                  {key === "kitchen" && <UtensilsCrossed size={20} color={calcRoomType === key ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />}
                  {key === "bathroom" && <Bath size={20} color={calcRoomType === key ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />}
                  {key === "office" && <Briefcase size={20} color={calcRoomType === key ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />}
                  {key === "dining" && <UtensilsCrossed size={20} color={calcRoomType === key ? "#FFFFFF" : theme.textSecondary} strokeWidth={1.5} />}
                  <Text style={[
                    styles.roomTypeText,
                    { color: calcRoomType === key ? "#FFFFFF" : theme.text },
                  ]}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.calcLabel, { color: theme.text }]}>Room Size</Text>
            <View style={[styles.calcInput, { backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.calcInputText, { color: theme.text }]}
                value={calcSqFt}
                onChangeText={setCalcSqFt}
                placeholder="Enter square feet"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.calcInputUnit, { color: theme.textSecondary }]}>sq ft</Text>
            </View>

            {lumensResult && (
              <View style={[styles.calcResult, { backgroundColor: "#FDF2F8" }]}>
                <Text style={styles.calcResultLabel}>Recommended Lumens</Text>
                <Text style={styles.calcResultValue}>{lumensResult.totalLumens.toLocaleString()}</Text>
                <Text style={styles.calcResultRange}>
                  Range: {lumensResult.minTotal.toLocaleString()} - {lumensResult.maxTotal.toLocaleString()} lumens
                </Text>
                <Text style={styles.calcResultTip}>{lumensResult.description}</Text>
              </View>
            )}

            <View style={[styles.guideCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.guideTitle, { color: theme.text }]}>Quick Reference</Text>
              <View style={styles.guideRow}>
                <Sun size={16} color="#272D53" strokeWidth={1.5} />
                <Text style={[styles.guideText, { color: theme.textSecondary }]}>
                  Ambient: 10-20 lumens per sq ft
                </Text>
              </View>
              <View style={styles.guideRow}>
                <LampDesk size={16} color="#3B82F6" strokeWidth={1.5} />
                <Text style={[styles.guideText, { color: theme.textSecondary }]}>
                  Task: 50-75 lumens per sq ft (task area)
                </Text>
              </View>
              <View style={styles.guideRow}>
                <Sparkles size={16} color="#8B5CF6" strokeWidth={1.5} />
                <Text style={[styles.guideText, { color: theme.textSecondary }]}>
                  Accent: 3x ambient for highlighting
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  layersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  layerCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  layerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  layerName: {
    fontSize: 14,
    fontWeight: "600" as const,
    flex: 1,
  },
  plansHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  addPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EC4899",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addPlanText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  planCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  planTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  planInfo: {
    flex: 1,
    marginLeft: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  planMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  planStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  planStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  planStatValue: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  planStatLabel: {
    fontSize: 12,
  },
  planStatDivider: {
    flex: 1,
  },
  layerIndicators: {
    flexDirection: "row",
    gap: 6,
  },
  layerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  layerInfoModal: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
  },
  layerInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  layerInfoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  layerInfoTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  layerInfoDesc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 10,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  exampleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  exampleText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  planSummary: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800" as const,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  fixtureSection: {
    marginBottom: 24,
  },
  fixtureSectionHeader: {
    marginBottom: 12,
  },
  layerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  layerBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  fixtureCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  fixtureMain: {
    marginBottom: 10,
  },
  fixtureName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  fixtureLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  fixtureSpecs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  specLabel: {
    fontSize: 11,
  },
  controlBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: "auto",
  },
  controlText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  addFixtureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#EC4899",
    borderStyle: "dashed",
  },
  addFixtureText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  calcLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  roomTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  roomTypeOption: {
    width: "31%",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  roomTypeText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  calcInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  calcInputText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600" as const,
  },
  calcInputUnit: {
    fontSize: 14,
  },
  calcResult: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  calcResultLabel: {
    fontSize: 14,
    color: "#9D174D",
    marginBottom: 8,
  },
  calcResultValue: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#EC4899",
    marginBottom: 8,
  },
  calcResultRange: {
    fontSize: 13,
    color: "#BE185D",
    marginBottom: 12,
  },
  calcResultTip: {
    fontSize: 13,
    color: "#9D174D",
    textAlign: "center",
    lineHeight: 20,
  },
  guideCard: {
    borderRadius: 16,
    padding: 16,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 14,
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  guideText: {
    fontSize: 13,
    flex: 1,
  },
});
