import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Search,
  Plus,
  Camera,
  X,
  ChevronRight,
  Calendar,
  MapPin,
  Palette,
  Share2,
  Heart,
  Star,
  Filter,
  Grid3X3,
  Home,
  Building2,
  Trees,
  Paintbrush,
  Eye,
  Clock,
  DollarSign,
  Sparkles,
  CheckCircle,
  ImageIcon,
  Trash2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ProjectCategory = "interior" | "exterior" | "commercial" | "specialty" | "residential";

interface PaintColor {
  name: string;
  hex: string;
  brand: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  category: ProjectCategory;
  beforeImage: string;
  afterImage: string;
  clientName: string;
  location: string;
  completedDate: string;
  description: string;
  colors: PaintColor[];
  roomType: string;
  duration: string;
  cost: string;
  rating: number;
  likes: number;
  featured: boolean;
  tags: string[];
}

const mockProjects: PortfolioProject[] = [
  {
    id: "p1",
    title: "Modern Living Room Transformation",
    category: "interior",
    beforeImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600",
    afterImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
    clientName: "Johnson Family",
    location: "Austin, TX",
    completedDate: "2024-01-15",
    description: "Complete living room makeover with a modern minimalist aesthetic. Transformed dark, dated walls into a bright, contemporary space.",
    colors: [
      { name: "Cloud White", hex: "#F5F5F0", brand: "Benjamin Moore" },
      { name: "Hale Navy", hex: "#3C4A5E", brand: "Benjamin Moore" },
    ],
    roomType: "Living Room",
    duration: "3 days",
    cost: "$2,400",
    rating: 5,
    likes: 47,
    featured: true,
    tags: ["minimalist", "modern", "accent wall"],
  },
  {
    id: "p2",
    title: "Victorian Home Exterior",
    category: "exterior",
    beforeImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
    afterImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
    clientName: "Martinez Residence",
    location: "San Francisco, CA",
    completedDate: "2024-01-08",
    description: "Historic Victorian home restored to its original glory with period-appropriate colors and meticulous trim work.",
    colors: [
      { name: "Slate Blue", hex: "#6B7B8C", brand: "Sherwin Williams" },
      { name: "Cream", hex: "#FFFDD0", brand: "Sherwin Williams" },
      { name: "Burgundy", hex: "#800020", brand: "Sherwin Williams" },
    ],
    roomType: "Full Exterior",
    duration: "2 weeks",
    cost: "$12,500",
    rating: 5,
    likes: 89,
    featured: true,
    tags: ["victorian", "historic", "restoration"],
  },
  {
    id: "p3",
    title: "Boutique Coffee Shop",
    category: "commercial",
    beforeImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
    afterImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
    clientName: "Bean & Brew Café",
    location: "Portland, OR",
    completedDate: "2023-12-20",
    description: "Industrial-chic transformation for a local coffee shop. Created a warm, inviting atmosphere with exposed brick accent.",
    colors: [
      { name: "Tricorn Black", hex: "#2C2C2C", brand: "Sherwin Williams" },
      { name: "Accessible Beige", hex: "#D1C4B5", brand: "Sherwin Williams" },
    ],
    roomType: "Commercial Interior",
    duration: "1 week",
    cost: "$4,800",
    rating: 5,
    likes: 63,
    featured: false,
    tags: ["industrial", "commercial", "café"],
  },
  {
    id: "p4",
    title: "Venetian Plaster Accent Wall",
    category: "specialty",
    beforeImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600",
    afterImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    clientName: "Thompson Estate",
    location: "Miami, FL",
    completedDate: "2024-01-22",
    description: "Luxurious Venetian plaster finish creating a stunning focal point in the master bedroom.",
    colors: [
      { name: "Warm Taupe", hex: "#B8A99A", brand: "Venetian Plaster Co" },
    ],
    roomType: "Master Bedroom",
    duration: "4 days",
    cost: "$3,200",
    rating: 5,
    likes: 112,
    featured: true,
    tags: ["venetian", "luxury", "texture"],
  },
  {
    id: "p5",
    title: "Nursery Room Design",
    category: "residential",
    beforeImage: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600",
    afterImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",
    clientName: "Williams Family",
    location: "Denver, CO",
    completedDate: "2024-01-10",
    description: "Whimsical nursery with hand-painted murals and soft, calming colors perfect for a newborn.",
    colors: [
      { name: "Soft Mint", hex: "#98D7C2", brand: "Benjamin Moore" },
      { name: "Gentle Pink", hex: "#F8D7DA", brand: "Benjamin Moore" },
    ],
    roomType: "Nursery",
    duration: "5 days",
    cost: "$2,800",
    rating: 5,
    likes: 78,
    featured: false,
    tags: ["nursery", "mural", "whimsical"],
  },
  {
    id: "p6",
    title: "Kitchen Cabinet Refresh",
    category: "interior",
    beforeImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
    afterImage: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600",
    clientName: "Chen Residence",
    location: "Seattle, WA",
    completedDate: "2023-12-15",
    description: "Complete cabinet transformation from dated oak to modern white with contrasting island.",
    colors: [
      { name: "Simply White", hex: "#F7F4EF", brand: "Benjamin Moore" },
      { name: "Charcoal", hex: "#36454F", brand: "Benjamin Moore" },
    ],
    roomType: "Kitchen",
    duration: "6 days",
    cost: "$5,200",
    rating: 4,
    likes: 56,
    featured: false,
    tags: ["cabinets", "kitchen", "two-tone"],
  },
];

const categoryInfo: Record<ProjectCategory, { label: string; color: string; icon: React.ComponentType<any> }> = {
  interior: { label: "Interior", color: "#8B5CF6", icon: Home },
  exterior: { label: "Exterior", color: "#10B981", icon: Trees },
  commercial: { label: "Commercial", color: "#3B82F6", icon: Building2 },
  specialty: { label: "Specialty", color: "#272D53", icon: Sparkles },
  residential: { label: "Residential", color: "#EC4899", icon: Home },
};

export default function PainterPortfolioScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">("all");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [projects, setProjects] = useState<PortfolioProject[]>(mockProjects);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());

  const sliderPosition = useRef(new Animated.Value(SCREEN_WIDTH / 2 - 40)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPosition = Math.max(20, Math.min(SCREEN_WIDTH - 60, gestureState.moveX - 20));
        sliderPosition.setValue(newPosition);
      },
    })
  ).current;

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProjects = filteredProjects.filter(p => p.featured);

  const toggleLike = (projectId: string) => {
    setLikedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
        setProjects(projects.map(p => 
          p.id === projectId ? { ...p, likes: p.likes - 1 } : p
        ));
      } else {
        newSet.add(projectId);
        setProjects(projects.map(p => 
          p.id === projectId ? { ...p, likes: p.likes + 1 } : p
        ));
      }
      return newSet;
    });
  };

  const shareProject = (project: PortfolioProject) => {
    Alert.alert(
      "Share Project",
      `Share "${project.title}" to your marketing channels?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Copy Link", onPress: () => Alert.alert("Link Copied!", "Project link copied to clipboard") },
        { text: "Share", onPress: () => Alert.alert("Shared!", "Project shared successfully") },
      ]
    );
  };

  const renderProjectCard = (project: PortfolioProject) => {
    const CategoryIcon = categoryInfo[project.category].icon;
    const isLiked = likedProjects.has(project.id);

    return (
      <TouchableOpacity 
        key={project.id} 
        style={styles.projectCard}
        onPress={() => setSelectedProject(project)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: project.afterImage }} style={styles.projectImage} contentFit="cover" />
          <View style={styles.imageOverlay}>
            <View style={styles.beforeBadge}>
              <ImageIcon size={12} color={Colors.white} />
              <Text style={styles.beforeBadgeText}>Before & After</Text>
            </View>
            {project.featured && (
              <View style={styles.featuredBadge}>
                <Star size={12} color="#272D53" fill="#272D53" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionBtn, isLiked && styles.quickActionBtnActive]}
              onPress={() => toggleLike(project.id)}
            >
              <Heart size={18} color={isLiked ? "#EF4444" : Colors.white} fill={isLiked ? "#EF4444" : "transparent"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => shareProject(project)}>
              <Share2 size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.projectContent}>
          <View style={styles.projectHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryInfo[project.category].color}15` }]}>
              <CategoryIcon size={12} color={categoryInfo[project.category].color} />
              <Text style={[styles.categoryBadgeText, { color: categoryInfo[project.category].color }]}>
                {categoryInfo[project.category].label}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} color="#272D53" fill={i < project.rating ? "#272D53" : "transparent"} />
              ))}
            </View>
          </View>

          <Text style={styles.projectTitle}>{project.title}</Text>
          
          <View style={styles.projectMeta}>
            <View style={styles.metaItem}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{project.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{new Date(project.completedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Text>
            </View>
          </View>

          <View style={styles.colorsPreview}>
            {project.colors.slice(0, 4).map((color, index) => (
              <View 
                key={index} 
                style={[styles.colorDot, { backgroundColor: color.hex, borderColor: color.hex === "#FFFFFF" || color.hex === "#F5F5F0" || color.hex === "#F7F4EF" || color.hex === "#FFFDD0" ? Colors.border : color.hex }]} 
              />
            ))}
            {project.colors.length > 4 && (
              <Text style={styles.moreColors}>+{project.colors.length - 4}</Text>
            )}
          </View>

          <View style={styles.projectFooter}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Heart size={14} color={Colors.textSecondary} />
                <Text style={styles.statText}>{project.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={14} color={Colors.textSecondary} />
                <Text style={styles.statText}>{project.duration}</Text>
              </View>
            </View>
            <View style={styles.viewDetails}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ChevronRight size={16} color="#272D53" />
            </View>
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
          headerTitle: "Before & After Gallery",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
              <Plus size={24} color="#272D53" />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsBar}>
          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>{projects.length}</Text>
            <Text style={styles.statCardLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>{featuredProjects.length}</Text>
            <Text style={styles.statCardLabel}>Featured</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>{projects.reduce((sum, p) => sum + p.likes, 0)}</Text>
            <Text style={styles.statCardLabel}>Total Likes</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects, clients..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={showFilters ? Colors.white : "#272D53"} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === "all" && styles.categoryChipActive]}
            onPress={() => setSelectedCategory("all")}
          >
            <Grid3X3 size={14} color={selectedCategory === "all" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.categoryChipText, selectedCategory === "all" && styles.categoryChipTextActive]}>
              All Projects
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
                onPress={() => setSelectedCategory(key as ProjectCategory)}
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
          {filteredProjects.length} Project{filteredProjects.length !== 1 ? "s" : ""} in Portfolio
        </Text>

        {filteredProjects.map(project => renderProjectCard(project))}

        {filteredProjects.length === 0 && (
          <View style={styles.emptyState}>
            <Camera size={56} color={Colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Projects Found</Text>
            <Text style={styles.emptyStateSubtitle}>Add your first before & after project to showcase your work</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => setShowAddModal(true)}>
              <Plus size={18} color={Colors.white} />
              <Text style={styles.emptyStateButtonText}>Add Project</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedProject}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedProject(null)} style={styles.modalClose}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>Project Details</Text>
              <TouchableOpacity onPress={() => shareProject(selectedProject)} style={styles.modalShare}>
                <Share2 size={20} color="#272D53" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.comparisonContainer}>
                <Text style={styles.comparisonTitle}>Before & After Comparison</Text>
                <Text style={styles.comparisonHint}>Drag the slider to compare</Text>
                
                <View style={styles.comparisonImageWrapper}>
                  <Image source={{ uri: selectedProject.afterImage }} style={styles.comparisonImage} contentFit="cover" />
                  <Animated.View 
                    style={[
                      styles.beforeImageWrapper, 
                      { 
                        width: sliderPosition.interpolate({
                          inputRange: [0, SCREEN_WIDTH - 40],
                          outputRange: [0, SCREEN_WIDTH - 40],
                        })
                      }
                    ]}
                  >
                    <Image source={{ uri: selectedProject.beforeImage }} style={styles.comparisonImage} contentFit="cover" />
                  </Animated.View>
                  <Animated.View 
                    style={[styles.sliderHandle, { left: sliderPosition }]}
                    {...panResponder.panHandlers}
                  >
                    <View style={styles.sliderLine} />
                    <View style={styles.sliderKnob}>
                      <ChevronRight size={14} color={Colors.white} style={{ transform: [{ rotate: "180deg" }] }} />
                      <ChevronRight size={14} color={Colors.white} />
                    </View>
                  </Animated.View>
                  <View style={styles.comparisonLabels}>
                    <View style={styles.comparisonLabel}>
                      <Text style={styles.comparisonLabelText}>BEFORE</Text>
                    </View>
                    <View style={[styles.comparisonLabel, styles.comparisonLabelRight]}>
                      <Text style={styles.comparisonLabelText}>AFTER</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.modalDetails}>
                <View style={[styles.modalCategoryBadge, { backgroundColor: `${categoryInfo[selectedProject.category].color}15` }]}>
                  <Text style={[styles.modalCategoryText, { color: categoryInfo[selectedProject.category].color }]}>
                    {categoryInfo[selectedProject.category].label}
                  </Text>
                </View>

                <Text style={styles.modalProjectTitle}>{selectedProject.title}</Text>
                
                <View style={styles.clientInfo}>
                  <Text style={styles.clientLabel}>Client</Text>
                  <Text style={styles.clientName}>{selectedProject.clientName}</Text>
                </View>

                <Text style={styles.modalDescription}>{selectedProject.description}</Text>

                <View style={styles.modalStatsGrid}>
                  <View style={styles.modalStatCard}>
                    <MapPin size={20} color="#272D53" />
                    <Text style={styles.modalStatLabel}>Location</Text>
                    <Text style={styles.modalStatValue}>{selectedProject.location}</Text>
                  </View>
                  <View style={styles.modalStatCard}>
                    <Calendar size={20} color="#272D53" />
                    <Text style={styles.modalStatLabel}>Completed</Text>
                    <Text style={styles.modalStatValue}>{new Date(selectedProject.completedDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.modalStatCard}>
                    <Clock size={20} color="#272D53" />
                    <Text style={styles.modalStatLabel}>Duration</Text>
                    <Text style={styles.modalStatValue}>{selectedProject.duration}</Text>
                  </View>
                  <View style={styles.modalStatCard}>
                    <DollarSign size={20} color="#272D53" />
                    <Text style={styles.modalStatLabel}>Project Cost</Text>
                    <Text style={styles.modalStatValue}>{selectedProject.cost}</Text>
                  </View>
                </View>

                <View style={styles.colorsSection}>
                  <View style={styles.colorsSectionHeader}>
                    <Palette size={20} color="#272D53" />
                    <Text style={styles.colorsSectionTitle}>Colors Used</Text>
                  </View>
                  {selectedProject.colors.map((color, index) => (
                    <View key={index} style={styles.colorItem}>
                      <View style={[styles.colorSwatch, { backgroundColor: color.hex }]} />
                      <View style={styles.colorInfo}>
                        <Text style={styles.colorName}>{color.name}</Text>
                        <Text style={styles.colorBrand}>{color.brand}</Text>
                      </View>
                      <Text style={styles.colorHex}>{color.hex}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.tagsSection}>
                  <Text style={styles.tagsSectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedProject.tags.map((tag, index) => (
                      <View key={index} style={styles.tagChip}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.engagementRow}>
                  <TouchableOpacity 
                    style={[styles.engagementButton, likedProjects.has(selectedProject.id) && styles.engagementButtonActive]}
                    onPress={() => toggleLike(selectedProject.id)}
                  >
                    <Heart 
                      size={20} 
                      color={likedProjects.has(selectedProject.id) ? "#EF4444" : Colors.text} 
                      fill={likedProjects.has(selectedProject.id) ? "#EF4444" : "transparent"} 
                    />
                    <Text style={styles.engagementText}>{selectedProject.likes} Likes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareButton} onPress={() => shareProject(selectedProject)}>
                    <Share2 size={20} color={Colors.white} />
                    <Text style={styles.shareButtonText}>Share for Marketing</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Project</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.addModalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.uploadSection}>
              <TouchableOpacity style={styles.uploadCard}>
                <Camera size={32} color="#272D53" />
                <Text style={styles.uploadTitle}>Before Photo</Text>
                <Text style={styles.uploadHint}>Tap to upload</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadCard}>
                <Camera size={32} color="#10B981" />
                <Text style={styles.uploadTitle}>After Photo</Text>
                <Text style={styles.uploadHint}>Tap to upload</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Project Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Modern Kitchen Transformation"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Client Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Smith Family"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Location</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Austin, TX"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryOptions}>
                {Object.entries(categoryInfo).map(([key, info]) => (
                  <TouchableOpacity key={key} style={styles.categoryOption}>
                    <View style={[styles.categoryOptionIcon, { backgroundColor: `${info.color}15` }]}>
                      <info.icon size={18} color={info.color} />
                    </View>
                    <Text style={styles.categoryOptionText}>{info.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Describe the transformation..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={styles.formLabel}>Duration</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 3 days"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={styles.formLabel}>Cost</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., $2,500"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addColorsButton}>
              <Palette size={18} color="#272D53" />
              <Text style={styles.addColorsText}>Add Paint Colors</Text>
              <ChevronRight size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton}>
              <CheckCircle size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Save to Portfolio</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
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
  addButton: {
    marginRight: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#272D5310",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#272D53",
  },
  statCardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#272D5330",
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#272D5315",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#272D5330",
  },
  filterButtonActive: {
    backgroundColor: "#272D53",
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
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: "relative",
  },
  projectImage: {
    width: "100%",
    height: 200,
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  beforeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  beforeBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  quickActions: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  quickActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionBtnActive: {
    backgroundColor: "rgba(239,68,68,0.8)",
  },
  projectContent: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  colorsPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  moreColors: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#272D53",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
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
  modalShare: {
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
  comparisonContainer: {
    padding: 20,
    backgroundColor: Colors.surface,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  comparisonHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  comparisonImageWrapper: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  comparisonImage: {
    width: SCREEN_WIDTH - 40,
    height: 250,
  },
  beforeImageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 250,
    overflow: "hidden",
  },
  sliderHandle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderLine: {
    position: "absolute",
    width: 3,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sliderKnob: {
    flexDirection: "row",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  comparisonLabels: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  comparisonLabel: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  comparisonLabelRight: {
    backgroundColor: "rgba(245,158,11,0.9)",
  },
  comparisonLabelText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  modalDetails: {
    padding: 20,
  },
  modalCategoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalCategoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  modalProjectTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  clientLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  modalDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  modalStatCard: {
    width: "48%" as any,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  modalStatValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 4,
    textAlign: "center",
  },
  colorsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  colorsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  colorsSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  colorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  colorBrand: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  colorHex: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textTertiary,
    fontFamily: "monospace",
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    backgroundColor: "#272D5315",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#272D53",
  },
  engagementRow: {
    flexDirection: "row",
    gap: 12,
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  engagementButtonActive: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  engagementText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#272D53",
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  addModalContent: {
    flex: 1,
    padding: 20,
  },
  uploadSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  uploadCard: {
    flex: 1,
    height: 140,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 10,
  },
  uploadHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTextArea: {
    height: 100,
    paddingTop: 14,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryOptionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  addColorsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addColorsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
    marginLeft: 12,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#272D53",
    paddingVertical: 18,
    borderRadius: 14,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
