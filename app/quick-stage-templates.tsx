import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Sparkles,
  Clock,
  DollarSign,
  Check,
  ChevronRight,
  X,
  Home,
  Building2,
  Warehouse,
  Star,
  ShoppingCart,
  Copy,
} from "lucide-react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

interface TemplateItem {
  name: string;
  description: string;
  estimatedCost: string;
}

interface StagingTemplate {
  id: string;
  name: string;
  propertyType: string;
  icon: any;
  color: string;
  image: string;
  timeToStage: string;
  budgetRange: string;
  description: string;
  bestFor: string[];
  items: {
    category: string;
    items: TemplateItem[];
  }[];
  tips: string[];
  roi: string;
}

const stagingTemplates: StagingTemplate[] = [
  {
    id: "1",
    name: "Quick Flip Essential",
    propertyType: "Single Family",
    icon: Home,
    color: "#272D53",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600",
    timeToStage: "2-3 days",
    budgetRange: "$1,500 - $3,000",
    description: "Fast, budget-friendly staging for a quick turnaround flip. Focus on high-impact, low-cost improvements.",
    bestFor: ["Entry-level homes", "First-time buyers", "Quick 30-day flips"],
    roi: "150-200%",
    items: [
      {
        category: "Living Room",
        items: [
          { name: "Neutral slip covers", description: "Cover dated furniture", estimatedCost: "$150" },
          { name: "Throw pillows (4-6)", description: "Add color and texture", estimatedCost: "$80" },
          { name: "Area rug (8x10)", description: "Define space", estimatedCost: "$200" },
          { name: "Simple artwork (2-3)", description: "Framed prints", estimatedCost: "$100" },
        ],
      },
      {
        category: "Kitchen",
        items: [
          { name: "New cabinet hardware", description: "Brushed nickel/matte black", estimatedCost: "$120" },
          { name: "Fresh dish towels", description: "Coordinating colors", estimatedCost: "$30" },
          { name: "Fruit bowl display", description: "Fake or real", estimatedCost: "$25" },
        ],
      },
      {
        category: "Bedroom",
        items: [
          { name: "White bedding set", description: "Hotel-style look", estimatedCost: "$150" },
          { name: "Accent pillows (4)", description: "Coordinating colors", estimatedCost: "$60" },
          { name: "Bedside lamps (2)", description: "Matching pair", estimatedCost: "$80" },
        ],
      },
      {
        category: "Bathroom",
        items: [
          { name: "White towel set", description: "Fluffy, hotel-quality", estimatedCost: "$60" },
          { name: "Shower curtain", description: "Clean, simple design", estimatedCost: "$40" },
          { name: "Soap dispensers", description: "Matching set", estimatedCost: "$30" },
        ],
      },
    ],
    tips: [
      "Focus on decluttering first - it's free and makes the biggest impact",
      "Use mirrors to make spaces feel larger",
      "Keep color palette neutral with one accent color",
      "Natural light is your best friend - clean windows",
    ],
  },
  {
    id: "2",
    name: "Mid-Range Modern",
    propertyType: "Single Family / Condo",
    icon: Building2,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600",
    timeToStage: "4-5 days",
    budgetRange: "$4,000 - $8,000",
    description: "Contemporary staging for mid-market properties. Appeals to young professionals and growing families.",
    bestFor: ["Move-up buyers", "Young professionals", "Urban properties"],
    roi: "200-250%",
    items: [
      {
        category: "Living Room",
        items: [
          { name: "Rental sofa sectional", description: "Modern L-shape", estimatedCost: "$800" },
          { name: "Coffee table", description: "Clean lines, wood/metal", estimatedCost: "$300" },
          { name: "Accent chairs (2)", description: "Mid-century style", estimatedCost: "$400" },
          { name: "Large artwork", description: "Statement piece", estimatedCost: "$200" },
          { name: "Floor lamp", description: "Arc or tripod style", estimatedCost: "$150" },
        ],
      },
      {
        category: "Kitchen",
        items: [
          { name: "Bar stools (3)", description: "Counter height", estimatedCost: "$300" },
          { name: "Pendant lights", description: "Update existing", estimatedCost: "$200" },
          { name: "New faucet", description: "Modern pull-down", estimatedCost: "$180" },
          { name: "Staging accessories", description: "Cookbooks, plants", estimatedCost: "$100" },
        ],
      },
      {
        category: "Bedroom",
        items: [
          { name: "Platform bed frame", description: "Upholstered headboard", estimatedCost: "$500" },
          { name: "Premium bedding", description: "Layered look", estimatedCost: "$300" },
          { name: "Nightstands (2)", description: "Matching pair", estimatedCost: "$250" },
          { name: "Dresser/mirror", description: "Coordinating style", estimatedCost: "$400" },
        ],
      },
      {
        category: "Dining",
        items: [
          { name: "Dining table", description: "Seats 6", estimatedCost: "$450" },
          { name: "Dining chairs (6)", description: "Upholstered", estimatedCost: "$400" },
          { name: "Chandelier/pendant", description: "Statement lighting", estimatedCost: "$250" },
        ],
      },
    ],
    tips: [
      "Rent furniture to keep costs down while maintaining quality look",
      "Layer lighting: ambient, task, and accent",
      "Add greenery in every room - fake plants work great",
      "Stage lifestyle moments (reading nook, coffee station)",
    ],
  },
  {
    id: "3",
    name: "Luxury Showcase",
    propertyType: "High-End / Estate",
    icon: Star,
    color: "#EC4899",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    timeToStage: "7-10 days",
    budgetRange: "$15,000 - $30,000+",
    description: "Premium staging for luxury properties. Creates an aspirational lifestyle that buyers want to own.",
    bestFor: ["Luxury homes", "Executive buyers", "Properties over $1M"],
    roi: "300%+",
    items: [
      {
        category: "Living Room",
        items: [
          { name: "Designer sofa", description: "Premium rental", estimatedCost: "$2,500" },
          { name: "Statement art pieces", description: "Curated collection", estimatedCost: "$1,500" },
          { name: "Custom window treatments", description: "Drapes + sheers", estimatedCost: "$2,000" },
          { name: "Designer accent chairs", description: "Pair", estimatedCost: "$1,200" },
          { name: "Luxury accessories", description: "Books, objects", estimatedCost: "$800" },
        ],
      },
      {
        category: "Kitchen",
        items: [
          { name: "Premium bar stools", description: "Designer rental", estimatedCost: "$600" },
          { name: "High-end appliances display", description: "Staged items", estimatedCost: "$500" },
          { name: "Luxury countertop items", description: "Mixer, espresso", estimatedCost: "$400" },
        ],
      },
      {
        category: "Master Suite",
        items: [
          { name: "King bed ensemble", description: "Designer bedding", estimatedCost: "$1,500" },
          { name: "Seating area", description: "Chaise or chairs", estimatedCost: "$1,200" },
          { name: "Luxury linens", description: "Premium thread count", estimatedCost: "$600" },
          { name: "Art and accessories", description: "Curated pieces", estimatedCost: "$800" },
        ],
      },
      {
        category: "Outdoor",
        items: [
          { name: "Patio furniture set", description: "Premium outdoor", estimatedCost: "$3,000" },
          { name: "Fire pit/heater", description: "Outdoor ambiance", estimatedCost: "$800" },
          { name: "Outdoor lighting", description: "String lights, lanterns", estimatedCost: "$500" },
          { name: "Landscaping refresh", description: "Plants, mulch", estimatedCost: "$1,500" },
        ],
      },
    ],
    tips: [
      "Every detail matters - high-end buyers notice quality",
      "Create lifestyle vignettes: wine bar, reading nook, spa bathroom",
      "Use real flowers and high-end scents",
      "Professional photography is essential",
    ],
  },
  {
    id: "4",
    name: "Vacant Property Revival",
    propertyType: "Any",
    icon: Warehouse,
    color: "#10B981",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600",
    timeToStage: "3-4 days",
    budgetRange: "$3,000 - $6,000",
    description: "Transform an empty property into an inviting home. Essential for vacant flips that need to show scale and function.",
    bestFor: ["Vacant properties", "Bank-owned homes", "New construction"],
    roi: "200-300%",
    items: [
      {
        category: "Living Room",
        items: [
          { name: "Sofa rental", description: "3-month minimum", estimatedCost: "$600" },
          { name: "Console/TV stand", description: "Show media space", estimatedCost: "$200" },
          { name: "Area rug", description: "Define room size", estimatedCost: "$300" },
          { name: "End tables (2)", description: "With lamps", estimatedCost: "$200" },
        ],
      },
      {
        category: "Dining Area",
        items: [
          { name: "Dining set rental", description: "Table + 4-6 chairs", estimatedCost: "$400" },
          { name: "Centerpiece", description: "Simple arrangement", estimatedCost: "$50" },
          { name: "Placemats/runner", description: "Set the scene", estimatedCost: "$40" },
        ],
      },
      {
        category: "Bedrooms",
        items: [
          { name: "Bed frames (2-3)", description: "Simple designs", estimatedCost: "$600" },
          { name: "Bedding sets", description: "Coordinated looks", estimatedCost: "$400" },
          { name: "Nightstands", description: "Basic models", estimatedCost: "$200" },
        ],
      },
      {
        category: "Accessories",
        items: [
          { name: "Mirrors", description: "Large format, 2-3", estimatedCost: "$250" },
          { name: "Plants/greenery", description: "Throughout home", estimatedCost: "$200" },
          { name: "Artwork package", description: "Framed prints", estimatedCost: "$300" },
          { name: "Bathroom accessories", description: "Towels, mats, etc.", estimatedCost: "$150" },
        ],
      },
    ],
    tips: [
      "Empty rooms look smaller - furniture helps buyers understand scale",
      "Use light colors to brighten dark vacant spaces",
      "Consider virtual staging for photos as a budget alternative",
      "Don't forget hallways and transitions",
    ],
  },
];

export default function QuickStageTemplates() {
  const { theme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<StagingTemplate | null>(null);

  const dynamicStyles = useMemo(
    () => ({
      container: { backgroundColor: theme.background },
      card: { backgroundColor: theme.surface },
      text: { color: theme.text },
      textSecondary: { color: theme.textSecondary },
      border: { borderColor: theme.border },
    }),
    [theme]
  );

  const calculateTotalCost = (template: StagingTemplate) => {
    let total = 0;
    template.items.forEach((category) => {
      category.items.forEach((item) => {
        const cost = parseInt(item.estimatedCost.replace(/[$,]/g, "")) || 0;
        total += cost;
      });
    });
    return total;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
          <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
          <Text style={[styles.headerRowTitle, { color: theme.text }]}>Stage Templates</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, dynamicStyles.text]}>Quick Stage Templates</Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.textSecondary]}>
            Pre-built staging plans for faster flips
          </Text>
        </View>

        {stagingTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[styles.templateCard, dynamicStyles.card]}
            onPress={() => setSelectedTemplate(template)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: template.image }}
              style={styles.templateImage}
              contentFit="cover"
            />
            <View style={styles.templateOverlay}>
              <View style={[styles.templateBadge, { backgroundColor: template.color }]}>
                <template.icon size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.templateBadgeText}>{template.propertyType}</Text>
              </View>
            </View>
            <View style={styles.templateContent}>
              <Text style={[styles.templateName, dynamicStyles.text]}>{template.name}</Text>
              <Text style={[styles.templateDescription, dynamicStyles.textSecondary]} numberOfLines={2}>
                {template.description}
              </Text>
              <View style={styles.templateMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color={theme.textTertiary} strokeWidth={1.5} />
                  <Text style={[styles.metaText, dynamicStyles.textSecondary]}>
                    {template.timeToStage}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <DollarSign size={14} color={theme.textTertiary} strokeWidth={1.5} />
                  <Text style={[styles.metaText, dynamicStyles.textSecondary]}>
                    {template.budgetRange}
                  </Text>
                </View>
                <View style={[styles.roiBadge, { backgroundColor: "#D1FAE5" }]}>
                  <Text style={[styles.roiText, { color: "#059669" }]}>ROI: {template.roi}</Text>
                </View>
              </View>
            </View>
            <View style={styles.templateArrow}>
              <ChevronRight size={22} color={theme.textTertiary} strokeWidth={1.5} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={!!selectedTemplate} animationType="slide" presentationStyle="pageSheet">
        {selectedTemplate && (
          <View style={[styles.modalContainer, dynamicStyles.container]}>
            <View style={[styles.modalHeader, dynamicStyles.card]}>
              <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                <X size={26} color={theme.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, dynamicStyles.text]}>{selectedTemplate.name}</Text>
              <View style={{ width: 26 }} />
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedTemplate.image }}
                style={styles.modalImage}
                contentFit="cover"
              />

              <View style={styles.modalContent}>
                <View style={styles.modalStats}>
                  <View style={[styles.modalStatCard, { backgroundColor: `${selectedTemplate.color}15` }]}>
                    <Clock size={20} color={selectedTemplate.color} strokeWidth={1.5} />
                    <Text style={[styles.modalStatValue, { color: selectedTemplate.color }]}>
                      {selectedTemplate.timeToStage}
                    </Text>
                    <Text style={[styles.modalStatLabel, dynamicStyles.textSecondary]}>
                      Time to Stage
                    </Text>
                  </View>
                  <View style={[styles.modalStatCard, { backgroundColor: "#10B98115" }]}>
                    <DollarSign size={20} color="#10B981" strokeWidth={1.5} />
                    <Text style={[styles.modalStatValue, { color: "#10B981" }]}>
                      ${calculateTotalCost(selectedTemplate).toLocaleString()}
                    </Text>
                    <Text style={[styles.modalStatLabel, dynamicStyles.textSecondary]}>
                      Est. Total
                    </Text>
                  </View>
                  <View style={[styles.modalStatCard, { backgroundColor: "#8B5CF615" }]}>
                    <Sparkles size={20} color="#8B5CF6" strokeWidth={1.5} />
                    <Text style={[styles.modalStatValue, { color: "#8B5CF6" }]}>
                      {selectedTemplate.roi}
                    </Text>
                    <Text style={[styles.modalStatLabel, dynamicStyles.textSecondary]}>
                      Expected ROI
                    </Text>
                  </View>
                </View>

                <View style={[styles.bestForSection, dynamicStyles.card]}>
                  <Text style={[styles.sectionTitle, dynamicStyles.text]}>Best For</Text>
                  <View style={styles.bestForTags}>
                    {selectedTemplate.bestFor.map((item, index) => (
                      <View
                        key={index}
                        style={[styles.bestForTag, { backgroundColor: `${selectedTemplate.color}15` }]}
                      >
                        <Check size={12} color={selectedTemplate.color} strokeWidth={2} />
                        <Text style={[styles.bestForTagText, { color: selectedTemplate.color }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {selectedTemplate.items.map((category, catIndex) => (
                  <View key={catIndex} style={[styles.categorySection, dynamicStyles.card]}>
                    <Text style={[styles.categoryTitle, dynamicStyles.text]}>
                      {category.category}
                    </Text>
                    {category.items.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={[styles.itemName, dynamicStyles.text]}>{item.name}</Text>
                          <Text style={[styles.itemDescription, dynamicStyles.textSecondary]}>
                            {item.description}
                          </Text>
                        </View>
                        <Text style={[styles.itemCost, { color: selectedTemplate.color }]}>
                          {item.estimatedCost}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}

                <View style={[styles.tipsSection, dynamicStyles.card]}>
                  <Text style={[styles.sectionTitle, dynamicStyles.text]}>Pro Tips</Text>
                  {selectedTemplate.tips.map((tip, index) => (
                    <View key={index} style={styles.tipRow}>
                      <Sparkles size={14} color="#272D53" strokeWidth={2} />
                      <Text style={[styles.tipText, dynamicStyles.textSecondary]}>{tip}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: theme.surfaceSecondary }]}
                  >
                    <Copy size={18} color={theme.text} strokeWidth={1.5} />
                    <Text style={[styles.copyButtonText, dynamicStyles.text]}>Copy to Checklist</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.shopButton, { backgroundColor: selectedTemplate.color }]}
                  >
                    <ShoppingCart size={18} color="#FFFFFF" strokeWidth={1.5} />
                    <Text style={styles.shopButtonText}>Shop Items</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
  },
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRowTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  templateCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  templateImage: {
    width: "100%",
    height: 160,
  },
  templateOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  templateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  templateBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  templateContent: {
    padding: 16,
  },
  templateName: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
  },
  roiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: "auto",
  },
  roiText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  templateArrow: {
    position: "absolute",
    right: 16,
    top: 176,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 220,
  },
  modalContent: {
    padding: 20,
  },
  modalStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  modalStatCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginTop: 8,
    marginBottom: 2,
  },
  modalStatLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  bestForSection: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  bestForTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bestForTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bestForTagText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  categorySection: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
  },
  itemCost: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  tipsSection: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  shopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
