import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Camera,
  Grid,
  List,
  Calendar,
  MapPin,
  Clock,
  Tag,
  Share2,
  Download,
  Trash2,
  Plus,
  Filter,
  ChevronRight,
  FolderOpen,
  CheckCircle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PHOTO_SIZE = (SCREEN_WIDTH - 52) / 3;

type ViewMode = "grid" | "timeline";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  project: string;
  location: string;
  category: string;
  takenBy: string;
  takenDate: string;
  tags: string[];
  isBeforePhoto?: boolean;
  linkedPhotoId?: string;
}

interface PhotoAlbum {
  id: string;
  name: string;
  project: string;
  coverPhoto: string;
  photoCount: number;
  lastUpdated: string;
}

const mockPhotos: Photo[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600",
    caption: "Backyard before excavation",
    project: "Martinez Infinity Pool",
    location: "456 Hilltop Dr, Austin, TX",
    category: "Before",
    takenBy: "Carlos Rodriguez",
    takenDate: "2026-01-15",
    tags: ["before", "excavation", "site-prep"],
    isBeforePhoto: true,
    linkedPhotoId: "p2",
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600",
    caption: "Excavation complete - pool shell ready",
    project: "Martinez Infinity Pool",
    location: "456 Hilltop Dr, Austin, TX",
    category: "Progress",
    takenBy: "Carlos Rodriguez",
    takenDate: "2026-01-20",
    tags: ["progress", "excavation", "shell"],
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600",
    caption: "Steel rebar grid installed",
    project: "Martinez Infinity Pool",
    location: "456 Hilltop Dr, Austin, TX",
    category: "Progress",
    takenBy: "James Wilson",
    takenDate: "2026-01-25",
    tags: ["progress", "rebar", "steel", "structure"],
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
    caption: "Site before pool construction",
    project: "Thompson Family Pool & Spa",
    location: "789 Oak Ridge, Round Rock, TX",
    category: "Before",
    takenBy: "Mike Rodriguez",
    takenDate: "2026-01-18",
    tags: ["before", "backyard", "site-survey"],
    isBeforePhoto: true,
  },
  {
    id: "p5",
    url: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600",
    caption: "Pool plumbing lines installed",
    project: "Thompson Family Pool & Spa",
    location: "789 Oak Ridge, Round Rock, TX",
    category: "Progress",
    takenBy: "David Chen",
    takenDate: "2026-01-24",
    tags: ["progress", "plumbing", "pipes", "returns"],
  },
  {
    id: "p6",
    url: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600",
    caption: "Gunite application in progress",
    project: "Martinez Infinity Pool",
    location: "456 Hilltop Dr, Austin, TX",
    category: "Progress",
    takenBy: "Carlos Rodriguez",
    takenDate: "2026-01-22",
    tags: ["progress", "gunite", "shotcrete", "shell"],
  },
  {
    id: "p7",
    url: "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600",
    caption: "Pool equipment pad ready",
    project: "Martinez Infinity Pool",
    location: "456 Hilltop Dr, Austin, TX",
    category: "Progress",
    takenBy: "James Wilson",
    takenDate: "2026-01-26",
    tags: ["progress", "equipment", "pump", "filter"],
  },
  {
    id: "p8",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600",
    caption: "Pool tile & coping materials delivered",
    project: "Thompson Family Pool & Spa",
    location: "789 Oak Ridge, Round Rock, TX",
    category: "Materials",
    takenBy: "Roberto Garcia",
    takenDate: "2026-01-23",
    tags: ["materials", "tile", "coping", "waterline"],
  },
  {
    id: "p9",
    url: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600",
    caption: "Variable speed pump installed",
    project: "Martinez Infinity Pool",
    location: "456 Hilltop Dr, Austin, TX",
    category: "Materials",
    takenBy: "David Chen",
    takenDate: "2026-01-27",
    tags: ["materials", "pump", "pentair", "equipment"],
  },
  {
    id: "p10",
    url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600",
    caption: "Pebble finish complete",
    project: "Davis Resort Pool",
    location: "321 Lakeview Blvd, Lakeway, TX",
    category: "After",
    takenBy: "Carlos Rodriguez",
    takenDate: "2026-01-28",
    tags: ["after", "finish", "pebble-tec", "completed"],
  },
];

const mockAlbums: PhotoAlbum[] = [
  {
    id: "a1",
    name: "Martinez Infinity Pool",
    project: "Martinez Infinity Pool",
    coverPhoto: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=400",
    photoCount: 67,
    lastUpdated: "2026-01-28",
  },
  {
    id: "a2",
    name: "Thompson Family Pool & Spa",
    project: "Thompson Family Pool & Spa",
    coverPhoto: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400",
    photoCount: 42,
    lastUpdated: "2026-01-26",
  },
  {
    id: "a3",
    name: "Davis Resort Pool",
    project: "Davis Resort Pool",
    coverPhoto: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400",
    photoCount: 89,
    lastUpdated: "2026-01-28",
  },
  {
    id: "a4",
    name: "Equipment & Materials",
    project: "All Projects",
    coverPhoto: "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=400",
    photoCount: 34,
    lastUpdated: "2026-01-27",
  },
];

const categories = ["All", "Before", "Progress", "After", "Materials", "Equipment", "Issues"];

export default function PhotoDocumentationScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showAlbums, setShowAlbums] = useState(true);

  const filteredPhotos = selectedCategory === "All" 
    ? mockPhotos 
    : mockPhotos.filter(p => p.category === selectedCategory);

  const groupPhotosByDate = () => {
    const grouped: { [key: string]: Photo[] } = {};
    filteredPhotos.forEach(photo => {
      const date = photo.takenDate;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(photo);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const renderAlbumCard = (album: PhotoAlbum) => (
    <TouchableOpacity 
      key={album.id} 
      style={styles.albumCard}
      onPress={() => setShowAlbums(false)}
    >
      <Image source={{ uri: album.coverPhoto }} style={styles.albumCover} contentFit="cover" />
      <View style={styles.albumOverlay}>
        <Text style={styles.albumName}>{album.name}</Text>
        <Text style={styles.albumCount}>{album.photoCount} photos</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGridView = () => (
    <View style={styles.photoGrid}>
      {filteredPhotos.map(photo => (
        <TouchableOpacity 
          key={photo.id} 
          style={styles.photoGridItem}
          onPress={() => setSelectedPhoto(photo)}
        >
          <Image source={{ uri: photo.url }} style={styles.photoGridImage} contentFit="cover" />
          {photo.isBeforePhoto && (
            <View style={styles.beforeBadge}>
              <Text style={styles.beforeBadgeText}>Before</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTimelineView = () => (
    <View style={styles.timeline}>
      {groupPhotosByDate().map(([date, photos]) => (
        <View key={date} style={styles.timelineDay}>
          <View style={styles.timelineDateRow}>
            <View style={styles.timelineDot} />
            <Text style={styles.timelineDate}>
              {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </Text>
          </View>
          <View style={styles.timelinePhotos}>
            {photos.map(photo => (
              <TouchableOpacity 
                key={photo.id} 
                style={styles.timelinePhoto}
                onPress={() => setSelectedPhoto(photo)}
              >
                <Image source={{ uri: photo.url }} style={styles.timelineImage} contentFit="cover" />
                <View style={styles.timelinePhotoInfo}>
                  <Text style={styles.timelineCaption} numberOfLines={1}>
                    {photo.caption || "No caption"}
                  </Text>
                  <View style={styles.timelineMeta}>
                    <MapPin size={12} color={Colors.textTertiary} />
                    <Text style={styles.timelineMetaText}>{photo.project}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderPhotoDetail = () => {
    if (!selectedPhoto) return null;
    
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
            <ArrowLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.detailAction}>
              <Share2 size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailAction}>
              <Download size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailAction}>
              <Trash2 size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.detailScroll}>
          <Image source={{ uri: selectedPhoto.url }} style={styles.detailImage} contentFit="contain" />
          
          <View style={styles.detailInfo}>
            {selectedPhoto.caption && (
              <Text style={styles.detailCaption}>{selectedPhoto.caption}</Text>
            )}

            <View style={styles.detailMeta}>
              <View style={styles.detailMetaItem}>
                <MapPin size={16} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.detailMetaLabel}>Project</Text>
                  <Text style={styles.detailMetaValue}>{selectedPhoto.project}</Text>
                </View>
              </View>
              <View style={styles.detailMetaItem}>
                <Calendar size={16} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.detailMetaLabel}>Date</Text>
                  <Text style={styles.detailMetaValue}>
                    {new Date(selectedPhoto.takenDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.detailMetaItem}>
                <Camera size={16} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.detailMetaLabel}>Taken By</Text>
                  <Text style={styles.detailMetaValue}>{selectedPhoto.takenBy}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailTags}>
              <Tag size={14} color={Colors.textSecondary} />
              {selectedPhoto.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {selectedPhoto.isBeforePhoto && selectedPhoto.linkedPhotoId && (
              <TouchableOpacity style={styles.compareBtn}>
                <CheckCircle size={18} color={Colors.white} />
                <Text style={styles.compareBtnText}>View Before/After Comparison</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (selectedPhoto) {
    return renderPhotoDetail();
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Pool Photo Docs",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color={Colors.white} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Camera size={18} color="#272D53" />
            <Text style={styles.statValue}>{mockPhotos.length}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <FolderOpen size={18} color="#3B82F6" />
            <Text style={styles.statValue}>{mockAlbums.length}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={18} color="#8B5CF6" />
            <Text style={styles.statValue}>Today</Text>
            <Text style={styles.statLabel}>Last Upload</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity 
              style={[styles.viewToggle, viewMode === "grid" && styles.viewToggleActive]}
              onPress={() => setViewMode("grid")}
            >
              <Grid size={18} color={viewMode === "grid" ? Colors.white : Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewToggle, viewMode === "timeline" && styles.viewToggleActive]}
              onPress={() => setViewMode("timeline")}
            >
              <List size={18} color={viewMode === "timeline" ? Colors.white : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showAlbums && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Project Albums</Text>
              <TouchableOpacity onPress={() => setShowAlbums(false)}>
                <Text style={styles.seeAllText}>See All Photos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumsScroll}>
              {mockAlbums.map(album => renderAlbumCard(album))}
            </ScrollView>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {showAlbums ? "Recent Photos" : "All Photos"}
          </Text>
          {!showAlbums && (
            <TouchableOpacity onPress={() => setShowAlbums(true)}>
              <Text style={styles.seeAllText}>View Albums</Text>
            </TouchableOpacity>
          )}
        </View>

        {viewMode === "grid" ? renderGridView() : renderTimelineView()}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Plus size={24} color={Colors.white} />
      </TouchableOpacity>
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
  cameraButton: {
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
  statValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryScroll: {
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#272D53",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 4,
    marginLeft: 12,
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggleActive: {
    backgroundColor: "#272D53",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  albumsScroll: {
    marginBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  albumCard: {
    width: 160,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 12,
  },
  albumCover: {
    width: "100%",
    height: "100%",
  },
  albumOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  albumName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  albumCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  photoGridItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 10,
    overflow: "hidden",
  },
  photoGridImage: {
    width: "100%",
    height: "100%",
  },
  beforeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#272D53",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  beforeBadgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  timeline: {
    gap: 20,
  },
  timelineDay: {},
  timelineDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#272D53",
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  timelinePhotos: {
    gap: 10,
    marginLeft: 22,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: Colors.borderLight,
  },
  timelinePhoto: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  timelineImage: {
    width: 80,
    height: 80,
  },
  timelinePhotoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  timelineCaption: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  timelineMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timelineMetaText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
  },
  detailActions: {
    flexDirection: "row",
    gap: 16,
  },
  detailAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailScroll: {
    flex: 1,
  },
  detailImage: {
    width: "100%",
    height: 300,
  },
  detailInfo: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  detailCaption: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  detailMeta: {
    gap: 14,
    marginBottom: 16,
  },
  detailMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailMetaLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  detailMetaValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  detailTags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#272D53",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 40,
  },
  compareBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
