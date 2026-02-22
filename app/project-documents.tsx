import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  FileText,
  FolderOpen,
  Search,
  Plus,
  File,
  Image as ImageIcon,
  ClipboardList,
  Shield,
  Download,
  MoreVertical,
  Calendar,
  Filter,
  Upload,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useProjects } from "@/contexts/ProjectContext";

type DocCategory = "all" | "contracts" | "permits" | "inspections" | "photos" | "other";

interface ProjectDocument {
  id: string;
  name: string;
  category: DocCategory;
  dateAdded: string;
  fileSize: string;
  addedBy: string;
  icon: "file" | "image" | "clipboard" | "shield" | "text";
}

const categoryConfig: Record<DocCategory, { label: string; color: string; bg: string }> = {
  all: { label: "All", color: Colors.primary, bg: `${Colors.primary}15` },
  contracts: { label: "Contracts", color: "#4F46E5", bg: "#EEF2FF" },
  permits: { label: "Permits", color: "#D97706", bg: "#E8E9EE" },
  inspections: { label: "Inspections", color: "#059669", bg: "#D1FAE5" },
  photos: { label: "Photos", color: "#DC2626", bg: "#FEE2E2" },
  other: { label: "Other", color: "#6B7280", bg: "#F3F4F6" },
};

export default function ProjectDocumentsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProjectById } = useProjects();
  const project = getProjectById(projectId || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>("all");

  const [documents, setDocuments] = useState<ProjectDocument[]>([
    {
      id: "d1",
      name: "General Contractor Agreement",
      category: "contracts",
      dateAdded: "2026-01-15",
      fileSize: "2.4 MB",
      addedBy: "You",
      icon: "text",
    },
    {
      id: "d2",
      name: "Subcontractor Agreement - Electrical",
      category: "contracts",
      dateAdded: "2026-01-18",
      fileSize: "1.8 MB",
      addedBy: "You",
      icon: "text",
    },
    {
      id: "d3",
      name: "Building Permit - BP-2026-0451",
      category: "permits",
      dateAdded: "2026-01-10",
      fileSize: "856 KB",
      addedBy: "City of Boston",
      icon: "shield",
    },
    {
      id: "d4",
      name: "Electrical Permit - EP-2026-0234",
      category: "permits",
      dateAdded: "2026-01-12",
      fileSize: "742 KB",
      addedBy: "City of Boston",
      icon: "shield",
    },
    {
      id: "d5",
      name: "Plumbing Permit - PP-2026-0189",
      category: "permits",
      dateAdded: "2026-01-14",
      fileSize: "698 KB",
      addedBy: "City of Boston",
      icon: "shield",
    },
    {
      id: "d6",
      name: "Framing Inspection Report",
      category: "inspections",
      dateAdded: "2026-02-01",
      fileSize: "1.2 MB",
      addedBy: "Inspector Johnson",
      icon: "clipboard",
    },
    {
      id: "d7",
      name: "Electrical Rough-In Inspection",
      category: "inspections",
      dateAdded: "2026-02-08",
      fileSize: "980 KB",
      addedBy: "Inspector Davis",
      icon: "clipboard",
    },
    {
      id: "d8",
      name: "Before Photos - Kitchen",
      category: "photos",
      dateAdded: "2026-01-05",
      fileSize: "12.4 MB",
      addedBy: "You",
      icon: "image",
    },
    {
      id: "d9",
      name: "Progress Photos - Week 4",
      category: "photos",
      dateAdded: "2026-02-05",
      fileSize: "8.6 MB",
      addedBy: "You",
      icon: "image",
    },
    {
      id: "d10",
      name: "Material Specifications Sheet",
      category: "other",
      dateAdded: "2026-01-20",
      fileSize: "3.1 MB",
      addedBy: "Supplier",
      icon: "file",
    },
    {
      id: "d11",
      name: "HOA Approval Letter",
      category: "other",
      dateAdded: "2026-01-08",
      fileSize: "425 KB",
      addedBy: "HOA Board",
      icon: "text",
    },
  ]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getIconComponent = (icon: string, color: string) => {
    switch (icon) {
      case "image":
        return <ImageIcon size={20} color={color} />;
      case "clipboard":
        return <ClipboardList size={20} color={color} />;
      case "shield":
        return <Shield size={20} color={color} />;
      case "text":
        return <FileText size={20} color={color} />;
      default:
        return <File size={20} color={color} />;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.addedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDocumentPress = useCallback((doc: ProjectDocument) => {
    Alert.alert(doc.name, `Size: ${doc.fileSize}\nAdded by: ${doc.addedBy}\nDate: ${formatDate(doc.dateAdded)}`, [
      { text: "Close" },
    ]);
    console.log("Document pressed:", doc.id, doc.name);
  }, []);

  const handleUpload = useCallback(() => {
    Alert.alert("Upload Document", "Select a document type to upload.", [
      { text: "Contract", onPress: () => console.log("Upload contract") },
      { text: "Permit", onPress: () => console.log("Upload permit") },
      { text: "Photo", onPress: () => console.log("Upload photo") },
      { text: "Other", onPress: () => console.log("Upload other") },
      { text: "Cancel", style: "cancel" },
    ]);
  }, []);

  const categoryCounts: Record<DocCategory, number> = {
    all: documents.length,
    contracts: documents.filter((d) => d.category === "contracts").length,
    permits: documents.filter((d) => d.category === "permits").length,
    inspections: documents.filter((d) => d.category === "inspections").length,
    photos: documents.filter((d) => d.category === "photos").length,
    other: documents.filter((d) => d.category === "other").length,
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.headerRow}>
            <BackButton />
            <Text style={styles.headerTitle}>Project Not Found</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.headerRow}>
          <BackButton />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Documents</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} activeOpacity={0.7}>
            <Upload size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {(Object.keys(categoryConfig) as DocCategory[]).map((cat) => {
          const config = categoryConfig[cat];
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                isActive && { backgroundColor: config.color },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && { color: "#FFF" },
                  !isActive && { color: Colors.textSecondary },
                ]}
              >
                {config.label}
              </Text>
              <View
                style={[
                  styles.categoryChipCount,
                  isActive && { backgroundColor: "rgba(255,255,255,0.25)" },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipCountText,
                    isActive && { color: "#FFF" },
                  ]}
                >
                  {categoryCounts[cat]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.documentsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.documentsListContent}
      >
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <FolderOpen size={48} color={Colors.border} />
            <Text style={styles.emptyTitle}>No Documents Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try a different search term" : "Upload documents to get started"}
            </Text>
          </View>
        ) : (
          filteredDocuments.map((doc) => {
            const catConfig = categoryConfig[doc.category];
            return (
              <TouchableOpacity
                key={doc.id}
                style={styles.docCard}
                onPress={() => handleDocumentPress(doc)}
                activeOpacity={0.7}
              >
                <View style={[styles.docIconCircle, { backgroundColor: catConfig.bg }]}>
                  {getIconComponent(doc.icon, catConfig.color)}
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <View style={styles.docMeta}>
                    <Text style={styles.docMetaText}>{doc.fileSize}</Text>
                    <View style={styles.docMetaDot} />
                    <Text style={styles.docMetaText}>{doc.addedBy}</Text>
                  </View>
                  <View style={styles.docDateRow}>
                    <Calendar size={10} color={Colors.textTertiary} />
                    <Text style={styles.docDateText}>{formatDate(doc.dateAdded)}</Text>
                  </View>
                </View>
                <View style={[styles.docCategoryBadge, { backgroundColor: catConfig.bg }]}>
                  <Text style={[styles.docCategoryText, { color: catConfig.color }]}>
                    {catConfig.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.surface,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  uploadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  searchWrapper: {
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
  categoryScroll: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    maxHeight: 56,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  categoryChipCount: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  categoryChipCountText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  documentsList: {
    flex: 1,
  },
  documentsListContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  docIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  docMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  docMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  docMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
  },
  docDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  docDateText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  docCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  docCategoryText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
});
