import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Search,
  Plus,
  Sparkles,
  Palette,
  X,
  ChevronRight,
  Clock,
  DollarSign,
  Info,
  CheckCircle,
  Star,
  Layers,
  Brush,
  Droplets,
  Sun,
  Grid3X3,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type FinishCategory = "faux" | "texture" | "metallic" | "decorative" | "protective" | "stain";

interface SpecialtyFinish {
  id: string;
  name: string;
  category: FinishCategory;
  description: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  timePerSqFt: string;
  priceRange: string;
  image: string;
  tools: string[];
  techniques: string[];
  bestFor: string[];
  tips: string[];
}

const mockSpecialtyFinishes: SpecialtyFinish[] = [
  {
    id: "sf1",
    name: "Venetian Plaster",
    category: "faux",
    description: "A polished plaster finish that creates a luxurious, marble-like appearance with depth and movement.",
    difficultyLevel: "expert",
    timePerSqFt: "15-20 min",
    priceRange: "$8-15/sq ft",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    tools: ["Venetian plaster trowel", "Sanding sponge", "Burnishing tool", "Sealer"],
    techniques: ["Skim coat application", "Cross-hatch troweling", "Burnishing", "Wax finishing"],
    bestFor: ["Accent walls", "Fireplaces", "Entryways", "High-end renovations"],
    tips: ["Work in small sections", "Keep edges wet", "Allow proper drying between coats", "Polish when surface is warm"],
  },
  {
    id: "sf2",
    name: "Color Washing",
    category: "faux",
    description: "A soft, translucent finish that adds depth and subtle color variation to walls.",
    difficultyLevel: "intermediate",
    timePerSqFt: "5-8 min",
    priceRange: "$3-6/sq ft",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400",
    tools: ["Sea sponge", "Glaze medium", "Chip brush", "Lint-free rags"],
    techniques: ["Base coat application", "Glaze mixing", "Sponge dabbing", "Softening"],
    bestFor: ["Living rooms", "Bedrooms", "Dining rooms", "Mediterranean style homes"],
    tips: ["Use complementary colors", "Work with a partner", "Keep a wet edge", "Vary pressure for natural look"],
  },
  {
    id: "sf3",
    name: "Metallic Accent",
    category: "metallic",
    description: "Shimmering metallic finish that catches light and creates elegant focal points.",
    difficultyLevel: "intermediate",
    timePerSqFt: "8-12 min",
    priceRange: "$5-10/sq ft",
    image: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=400",
    tools: ["Metallic paint", "Foam roller", "Specialty brush", "Clear coat"],
    techniques: ["Base coat prep", "Directional rolling", "Layering", "Clear coat sealing"],
    bestFor: ["Accent walls", "Ceilings", "Furniture", "Modern interiors"],
    tips: ["Apply in consistent direction", "Use multiple thin coats", "Work quickly", "Seal for durability"],
  },
  {
    id: "sf4",
    name: "Sponge Painting",
    category: "texture",
    description: "Creates soft, mottled texture using natural sea sponges for an organic, layered look.",
    difficultyLevel: "beginner",
    timePerSqFt: "3-5 min",
    priceRange: "$2-4/sq ft",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    tools: ["Natural sea sponges", "Paint trays", "Drop cloths", "Painter's tape"],
    techniques: ["Base coat", "Sponge loading", "Dabbing motion", "Blending edges"],
    bestFor: ["Bathrooms", "Kitchens", "Children's rooms", "Budget makeovers"],
    tips: ["Dampen sponge first", "Rotate sponge often", "Step back frequently", "Use 2-3 colors for depth"],
  },
  {
    id: "sf5",
    name: "Rag Rolling",
    category: "texture",
    description: "A technique using rolled rags to create soft, fabric-like patterns on walls.",
    difficultyLevel: "intermediate",
    timePerSqFt: "4-6 min",
    priceRange: "$3-5/sq ft",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    tools: ["Lint-free rags", "Glaze medium", "Roller", "Paint tray"],
    techniques: ["Base coat application", "Glaze application", "Rag rolling", "Edge blending"],
    bestFor: ["Formal rooms", "Master bedrooms", "Traditional homes", "Hallways"],
    tips: ["Use same type of rag throughout", "Re-bunch rag frequently", "Work in vertical strips", "Maintain wet edge"],
  },
  {
    id: "sf6",
    name: "Strié (Dragging)",
    category: "faux",
    description: "A sophisticated finish with fine vertical lines that mimics fabric or linen texture.",
    difficultyLevel: "advanced",
    timePerSqFt: "6-10 min",
    priceRange: "$4-8/sq ft",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400",
    tools: ["Strié brush", "Glaze", "Level", "Painter's tape"],
    techniques: ["Precise base coat", "Glaze application", "Straight dragging", "Line continuity"],
    bestFor: ["Formal living rooms", "Dining rooms", "Offices", "Traditional interiors"],
    tips: ["Keep brush clean", "Work floor to ceiling", "Use plumb line", "Two-person technique works best"],
  },
  {
    id: "sf7",
    name: "Copper Patina",
    category: "metallic",
    description: "Recreates the aged look of oxidized copper with blue-green verdigris accents.",
    difficultyLevel: "advanced",
    timePerSqFt: "12-18 min",
    priceRange: "$8-14/sq ft",
    image: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=400",
    tools: ["Copper base coat", "Patina solution", "Spray bottle", "Sealant"],
    techniques: ["Copper base application", "Patina spraying", "Aging acceleration", "Sealing"],
    bestFor: ["Accent pieces", "Range hoods", "Fireplace surrounds", "Industrial style"],
    tips: ["Build layers gradually", "Patina develops over time", "Seal to stop oxidation", "Each finish is unique"],
  },
  {
    id: "sf8",
    name: "Limewash",
    category: "decorative",
    description: "An ancient technique creating a chalky, breathable finish with natural depth.",
    difficultyLevel: "intermediate",
    timePerSqFt: "5-8 min",
    priceRange: "$4-7/sq ft",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    tools: ["Masonry brush", "Limewash paint", "Spray bottle", "Protective gear"],
    techniques: ["Surface dampening", "Cross-hatch brushing", "Building layers", "Natural curing"],
    bestFor: ["Brick walls", "Fireplaces", "Exterior walls", "European style homes"],
    tips: ["Dampen surface first", "Apply multiple thin coats", "Let cure naturally", "Expect variation"],
  },
  {
    id: "sf9",
    name: "Concrete Effect",
    category: "texture",
    description: "Modern industrial finish that mimics the look of poured concrete.",
    difficultyLevel: "advanced",
    timePerSqFt: "10-15 min",
    priceRange: "$6-12/sq ft",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    tools: ["Specialty concrete paint", "Trowel", "Texture additive", "Sealer"],
    techniques: ["Base preparation", "Texture application", "Troweling", "Sealing"],
    bestFor: ["Modern interiors", "Lofts", "Commercial spaces", "Feature walls"],
    tips: ["Practice technique first", "Work in sections", "Vary texture naturally", "Multiple sealant coats"],
  },
  {
    id: "sf10",
    name: "Wood Graining",
    category: "faux",
    description: "Technique to create realistic wood grain patterns on any surface.",
    difficultyLevel: "expert",
    timePerSqFt: "15-25 min",
    priceRange: "$10-18/sq ft",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    tools: ["Graining tool", "Rocker", "Glaze", "Detail brushes"],
    techniques: ["Base coat matching", "Grain pattern creation", "Knot simulation", "Protective finishing"],
    bestFor: ["Doors", "Cabinets", "Trim", "Furniture restoration"],
    tips: ["Study real wood samples", "Practice on boards", "Vary grain direction", "Use reference photos"],
  },
  {
    id: "sf11",
    name: "Deck Staining",
    category: "stain",
    description: "Professional deck staining with proper preparation and application for lasting results.",
    difficultyLevel: "intermediate",
    timePerSqFt: "2-4 min",
    priceRange: "$2-5/sq ft",
    image: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=400",
    tools: ["Pressure washer", "Stain applicator", "Brush", "Roller"],
    techniques: ["Power washing", "Brightening", "Stain application", "Back-brushing"],
    bestFor: ["Wood decks", "Fences", "Pergolas", "Outdoor structures"],
    tips: ["Clean thoroughly first", "Check moisture content", "Apply when shaded", "Maintain wet edge"],
  },
  {
    id: "sf12",
    name: "Epoxy Floor Coating",
    category: "protective",
    description: "Durable, glossy floor coating perfect for garages and workshops.",
    difficultyLevel: "advanced",
    timePerSqFt: "3-5 min",
    priceRange: "$3-8/sq ft",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    tools: ["Floor grinder", "Epoxy kit", "Squeegee", "Spike shoes"],
    techniques: ["Surface grinding", "Crack repair", "Epoxy mixing", "Even spreading"],
    bestFor: ["Garages", "Workshops", "Basements", "Commercial floors"],
    tips: ["Temperature critical", "Mix accurately", "Work quickly", "Apply in sections"],
  },
];

const categoryInfo: Record<FinishCategory, { label: string; color: string; icon: React.ComponentType<any> }> = {
  faux: { label: "Faux Finishes", color: "#8B5CF6", icon: Brush },
  texture: { label: "Texture Effects", color: "#272D53", icon: Layers },
  metallic: { label: "Metallic Finishes", color: "#272D53", icon: Sparkles },
  decorative: { label: "Decorative", color: "#EC4899", icon: Palette },
  protective: { label: "Protective Coatings", color: "#10B981", icon: CheckCircle },
  stain: { label: "Stains & Sealers", color: "#6366F1", icon: Droplets },
};

export default function PainterSpecialtyScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FinishCategory | "all">("all");
  const [selectedFinish, setSelectedFinish] = useState<SpecialtyFinish | null>(null);

  const filteredFinishes = mockSpecialtyFinishes.filter(finish => {
    const matchesSearch = finish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          finish.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || finish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (level: SpecialtyFinish["difficultyLevel"]) => {
    switch (level) {
      case "beginner": return Colors.success;
      case "intermediate": return "#272D53";
      case "advanced": return "#272D53";
      case "expert": return Colors.error;
    }
  };

  const getDifficultyStars = (level: SpecialtyFinish["difficultyLevel"]) => {
    switch (level) {
      case "beginner": return 1;
      case "intermediate": return 2;
      case "advanced": return 3;
      case "expert": return 4;
    }
  };

  const renderFinishCard = (finish: SpecialtyFinish) => {
    const CategoryIcon = categoryInfo[finish.category].icon;
    
    return (
      <TouchableOpacity 
        key={finish.id} 
        style={styles.finishCard}
        onPress={() => setSelectedFinish(finish)}
      >
        <Image source={{ uri: finish.image }} style={styles.finishImage} contentFit="cover" />
        <View style={styles.finishContent}>
          <View style={styles.finishHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryInfo[finish.category].color}15` }]}>
              <CategoryIcon size={12} color={categoryInfo[finish.category].color} />
              <Text style={[styles.categoryBadgeText, { color: categoryInfo[finish.category].color }]}>
                {categoryInfo[finish.category].label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.finishName}>{finish.name}</Text>
          <Text style={styles.finishDescription} numberOfLines={2}>{finish.description}</Text>
          
          <View style={styles.finishMeta}>
            <View style={styles.difficultyRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  color={i < getDifficultyStars(finish.difficultyLevel) ? getDifficultyColor(finish.difficultyLevel) : Colors.borderLight}
                  fill={i < getDifficultyStars(finish.difficultyLevel) ? getDifficultyColor(finish.difficultyLevel) : "transparent"}
                />
              ))}
              <Text style={styles.difficultyText}>{finish.difficultyLevel}</Text>
            </View>
            <View style={styles.priceRow}>
              <DollarSign size={12} color={Colors.textSecondary} />
              <Text style={styles.priceText}>{finish.priceRange}</Text>
            </View>
          </View>
          
          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <ChevronRight size={16} color="#272D53" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Specialty Finishes",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search finishes..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === "all" && styles.categoryChipActive]}
            onPress={() => setSelectedCategory("all")}
          >
            <Grid3X3 size={14} color={selectedCategory === "all" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.categoryChipText, selectedCategory === "all" && styles.categoryChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {Object.entries(categoryInfo).map(([key, info]) => {
            const IconComponent = info.icon;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryChip, 
                  selectedCategory === key && styles.categoryChipActive,
                  selectedCategory === key && { backgroundColor: info.color }
                ]}
                onPress={() => setSelectedCategory(key as FinishCategory)}
              >
                <IconComponent size={14} color={selectedCategory === key ? Colors.white : info.color} />
                <Text style={[styles.categoryChipText, selectedCategory === key && styles.categoryChipTextActive]}>
                  {info.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsCount}>
          {filteredFinishes.length} Specialty Finish{filteredFinishes.length !== 1 ? "es" : ""}
        </Text>

        {filteredFinishes.map(finish => renderFinishCard(finish))}

        {filteredFinishes.length === 0 && (
          <View style={styles.emptyState}>
            <Sparkles size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Finishes Found</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedFinish}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedFinish(null)}
      >
        {selectedFinish && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedFinish(null)} style={styles.modalClose}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedFinish.name}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedFinish.image }} style={styles.modalImage} contentFit="cover" />

              <View style={styles.modalBadgeRow}>
                <View style={[styles.modalCategoryBadge, { backgroundColor: `${categoryInfo[selectedFinish.category].color}15` }]}>
                  <Text style={[styles.modalCategoryText, { color: categoryInfo[selectedFinish.category].color }]}>
                    {categoryInfo[selectedFinish.category].label}
                  </Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(selectedFinish.difficultyLevel)}15` }]}>
                  <Text style={[styles.difficultyBadgeText, { color: getDifficultyColor(selectedFinish.difficultyLevel) }]}>
                    {selectedFinish.difficultyLevel.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.modalDescription}>{selectedFinish.description}</Text>

              <View style={styles.modalStatsRow}>
                <View style={styles.modalStat}>
                  <Clock size={18} color="#272D53" />
                  <Text style={styles.modalStatLabel}>Time</Text>
                  <Text style={styles.modalStatValue}>{selectedFinish.timePerSqFt}</Text>
                </View>
                <View style={styles.modalStat}>
                  <DollarSign size={18} color="#10B981" />
                  <Text style={styles.modalStatLabel}>Price Range</Text>
                  <Text style={styles.modalStatValue}>{selectedFinish.priceRange}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Tools Required</Text>
                <View style={styles.toolsGrid}>
                  {selectedFinish.tools.map((tool, index) => (
                    <View key={index} style={styles.toolItem}>
                      <CheckCircle size={14} color={Colors.success} />
                      <Text style={styles.toolText}>{tool}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Techniques</Text>
                <View style={styles.techniquesContainer}>
                  {selectedFinish.techniques.map((technique, index) => (
                    <View key={index} style={styles.techniqueItem}>
                      <View style={styles.techniqueNumber}>
                        <Text style={styles.techniqueNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.techniqueText}>{technique}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Best Applications</Text>
                <View style={styles.applicationsGrid}>
                  {selectedFinish.bestFor.map((application, index) => (
                    <View key={index} style={styles.applicationChip}>
                      <Text style={styles.applicationText}>{application}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.tipsSection}>
                <View style={styles.tipsSectionHeader}>
                  <Info size={20} color="#272D53" />
                  <Text style={styles.tipsSectionTitle}>Pro Tips</Text>
                </View>
                {selectedFinish.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.addToProjectBtn}>
                <Plus size={18} color={Colors.white} />
                <Text style={styles.addToProjectText}>Add to Project</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
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
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  categoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#272D53",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  finishCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  finishImage: {
    width: "100%",
    height: 160,
  },
  finishContent: {
    padding: 16,
  },
  finishHeader: {
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  finishName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  finishDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  finishMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    textTransform: "capitalize" as const,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#272D53",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 220,
  },
  modalBadgeRow: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    paddingBottom: 12,
  },
  modalCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalCategoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  modalDescription: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalStatsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  modalStat: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 4,
  },
  modalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  toolsGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  toolItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  toolText: {
    fontSize: 14,
    color: Colors.text,
  },
  techniquesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  techniqueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  techniqueNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
  },
  techniqueNumberText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  techniqueText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  applicationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  applicationChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  applicationText: {
    fontSize: 13,
    color: Colors.text,
  },
  tipsSection: {
    marginHorizontal: 20,
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E9EE",
  },
  tipsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#9A3412",
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: "#272D53",
    marginRight: 8,
    fontWeight: "700" as const,
  },
  tipText: {
    fontSize: 14,
    color: "#9A3412",
    flex: 1,
    lineHeight: 20,
  },
  addToProjectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#272D53",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
  },
  addToProjectText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
