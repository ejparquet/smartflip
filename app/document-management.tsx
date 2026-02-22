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
import {
  ArrowLeft,
  Search,
  Plus,
  FileText,
  File,
  Image as ImageIcon,
  Download,
  Share2,
  Trash2,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Grid,
  List,
  Eye,
  Upload,
  Shield,
  Home,
  Briefcase,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type DocumentType = "permit" | "contract" | "blueprint" | "invoice" | "insurance" | "license" | "photo" | "other";
type DocumentStatus = "active" | "pending" | "expired" | "archived";
type ViewMode = "grid" | "list";

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  project?: string;
  fileSize: string;
  uploadedDate: string;
  expiryDate?: string;
  uploadedBy: string;
  tags: string[];
  thumbnail?: string;
}

interface Folder {
  id: string;
  name: string;
  documentCount: number;
  icon: typeof FileText;
  color: string;
}

const mockFolders: Folder[] = [
  { id: "f1", name: "Permits", documentCount: 12, icon: Shield, color: "#272D53" },
  { id: "f2", name: "Contracts", documentCount: 8, icon: FileText, color: "#3B82F6" },
  { id: "f3", name: "Blueprints", documentCount: 15, icon: Grid, color: "#8B5CF6" },
  { id: "f4", name: "Insurance", documentCount: 4, icon: Shield, color: "#10B981" },
  { id: "f5", name: "Invoices", documentCount: 24, icon: FileText, color: "#EC4899" },
  { id: "f6", name: "Photos", documentCount: 156, icon: ImageIcon, color: "#06B6D4" },
];

const mockDocuments: Document[] = [
  {
    id: "d1",
    name: "Building Permit - Kitchen Renovation",
    type: "permit",
    status: "active",
    project: "Kitchen Renovation",
    fileSize: "2.4 MB",
    uploadedDate: "2026-01-15",
    expiryDate: "2026-07-15",
    uploadedBy: "Mike Rodriguez",
    tags: ["permit", "kitchen", "active"],
  },
  {
    id: "d2",
    name: "Client Contract - Adams Family",
    type: "contract",
    status: "active",
    project: "Kitchen Renovation",
    fileSize: "1.8 MB",
    uploadedDate: "2026-01-10",
    uploadedBy: "Mike Rodriguez",
    tags: ["contract", "signed"],
  },
  {
    id: "d3",
    name: "Kitchen Floor Plan v2",
    type: "blueprint",
    status: "active",
    project: "Kitchen Renovation",
    fileSize: "8.5 MB",
    uploadedDate: "2026-01-12",
    uploadedBy: "Sarah Chen",
    tags: ["blueprint", "floor plan", "revised"],
  },
  {
    id: "d4",
    name: "Electrical Permit",
    type: "permit",
    status: "pending",
    project: "Kitchen Renovation",
    fileSize: "1.2 MB",
    uploadedDate: "2026-01-20",
    uploadedBy: "Mike Rodriguez",
    tags: ["permit", "electrical", "pending"],
  },
  {
    id: "d5",
    name: "Liability Insurance Certificate",
    type: "insurance",
    status: "active",
    fileSize: "856 KB",
    uploadedDate: "2025-06-01",
    expiryDate: "2026-06-01",
    uploadedBy: "Admin",
    tags: ["insurance", "liability"],
  },
  {
    id: "d6",
    name: "Contractor License",
    type: "license",
    status: "active",
    fileSize: "1.1 MB",
    uploadedDate: "2024-03-15",
    expiryDate: "2026-03-15",
    uploadedBy: "Admin",
    tags: ["license", "contractor"],
  },
  {
    id: "d7",
    name: "Plumbing Permit - Bathroom",
    type: "permit",
    status: "expired",
    project: "Bathroom Remodel",
    fileSize: "1.5 MB",
    uploadedDate: "2025-08-10",
    expiryDate: "2026-01-10",
    uploadedBy: "Mike Rodriguez",
    tags: ["permit", "plumbing", "expired"],
  },
  {
    id: "d8",
    name: "Subcontractor Agreement - Electric Pro",
    type: "contract",
    status: "active",
    fileSize: "2.1 MB",
    uploadedDate: "2026-01-05",
    uploadedBy: "Mike Rodriguez",
    tags: ["contract", "subcontractor"],
  },
];

export default function DocumentManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | "all">("all");

  const getTypeIcon = (type: DocumentType) => {
    switch (type) {
      case "permit": return Shield;
      case "contract": return FileText;
      case "blueprint": return Grid;
      case "invoice": return FileText;
      case "insurance": return Shield;
      case "license": return FileText;
      case "photo": return ImageIcon;
      default: return File;
    }
  };

  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case "permit": return "#272D53";
      case "contract": return "#3B82F6";
      case "blueprint": return "#8B5CF6";
      case "invoice": return "#EC4899";
      case "insurance": return "#10B981";
      case "license": return "#06B6D4";
      case "photo": return "#6366F1";
      default: return Colors.textSecondary;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "active": return Colors.success;
      case "pending": return "#272D53";
      case "expired": return Colors.error;
      case "archived": return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case "active": return "Active";
      case "pending": return "Pending";
      case "expired": return "Expired";
      case "archived": return "Archived";
    }
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockDocuments.length,
    active: mockDocuments.filter(d => d.status === "active").length,
    pending: mockDocuments.filter(d => d.status === "pending").length,
    expiringSoon: mockDocuments.filter(d => {
      if (!d.expiryDate) return false;
      const daysUntilExpiry = Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length,
  };

  const renderFolderCard = (folder: Folder) => {
    const FolderIcon = folder.icon;
    return (
      <TouchableOpacity 
        key={folder.id} 
        style={styles.folderCard}
        onPress={() => setSelectedFolder(folder.id)}
      >
        <View style={[styles.folderIcon, { backgroundColor: `${folder.color}20` }]}>
          <FolderIcon size={24} color={folder.color} />
        </View>
        <Text style={styles.folderName}>{folder.name}</Text>
        <Text style={styles.folderCount}>{folder.documentCount} files</Text>
      </TouchableOpacity>
    );
  };

  const renderDocumentCard = (doc: Document) => {
    const TypeIcon = getTypeIcon(doc.type);
    
    return (
      <TouchableOpacity key={doc.id} style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={[styles.documentIcon, { backgroundColor: `${getTypeColor(doc.type)}20` }]}>
            <TypeIcon size={20} color={getTypeColor(doc.type)} />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
            <View style={styles.documentMeta}>
              <Text style={styles.documentSize}>{doc.fileSize}</Text>
              <Text style={styles.documentDate}>
                • {new Date(doc.uploadedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(doc.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>
              {getStatusLabel(doc.status)}
            </Text>
          </View>
        </View>

        {doc.project && (
          <View style={styles.projectRow}>
            <Home size={12} color={Colors.textSecondary} />
            <Text style={styles.projectText}>{doc.project}</Text>
          </View>
        )}

        {doc.expiryDate && (
          <View style={[
            styles.expiryRow,
            doc.status === "expired" && styles.expiryRowExpired
          ]}>
            <Clock size={12} color={doc.status === "expired" ? Colors.error : Colors.textSecondary} />
            <Text style={[
              styles.expiryText,
              doc.status === "expired" && styles.expiryTextExpired
            ]}>
              {doc.status === "expired" ? "Expired: " : "Expires: "}
              {new Date(doc.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.tagsList}>
          {doc.tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.documentActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Eye size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <Trash2 size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Documents",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={20} color={Colors.white} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <FileText size={18} color="#272D53" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={18} color={Colors.success} />
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={18} color="#272D53" />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <AlertCircle size={18} color={Colors.error} />
            <Text style={[styles.statValue, { color: Colors.error }]}>{stats.expiringSoon}</Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.viewToggle, viewMode === "grid" && styles.viewToggleActive]}
          onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        >
          {viewMode === "grid" ? (
            <List size={20} color={viewMode === "grid" ? Colors.white : Colors.textSecondary} />
          ) : (
            <Grid size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>



      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Folders</Text>
        <View style={styles.foldersGrid}>
          {mockFolders.map(folder => renderFolderCard(folder))}
        </View>

        <Text style={styles.sectionTitle}>Recent Documents</Text>
        {filteredDocuments.map(doc => renderDocumentCard(doc))}

        {filteredDocuments.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Documents Found</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your search or filters</Text>
          </View>
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
  uploadButton: {
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
  viewToggle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
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
    paddingTop: 12,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  foldersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  folderCard: {
    width: "31%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  folderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  folderName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center" as const,
  },
  folderCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  documentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  documentSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  documentDate: {
    fontSize: 12,
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
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  projectText: {
    fontSize: 13,
    color: Colors.primary,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceSecondary,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  expiryRowExpired: {
    backgroundColor: "#FEE2E2",
  },
  expiryText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expiryTextExpired: {
    color: Colors.error,
    fontWeight: "500" as const,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  documentActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    marginLeft: "auto",
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
});
