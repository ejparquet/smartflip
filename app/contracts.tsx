import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import BackButton from "@/components/BackButton";

interface Contract {
  id: string;
  title: string;
  vendor: string;
  property: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "expired" | "completed";
}

const mockContracts: Contract[] = [
  {
    id: "1",
    title: "General Construction Agreement",
    vendor: "Smith & Sons Construction",
    property: "123 Oak Street",
    amount: 85000,
    startDate: "Jan 15, 2026",
    endDate: "Jun 30, 2026",
    status: "active",
  },
  {
    id: "2",
    title: "Electrical Wiring Contract",
    vendor: "PowerLine Electric",
    property: "456 Maple Ave",
    amount: 12500,
    startDate: "Feb 1, 2026",
    endDate: "Mar 15, 2026",
    status: "active",
  },
  {
    id: "3",
    title: "Interior Painting Agreement",
    vendor: "ColorPro Painters",
    property: "123 Oak Street",
    amount: 8200,
    startDate: "Mar 1, 2026",
    endDate: "Mar 20, 2026",
    status: "pending",
  },
  {
    id: "4",
    title: "Plumbing Services Contract",
    vendor: "AquaFix Plumbing",
    property: "789 Pine Blvd",
    amount: 15000,
    startDate: "Dec 1, 2025",
    endDate: "Jan 31, 2026",
    status: "completed",
  },
  {
    id: "5",
    title: "Landscaping Maintenance",
    vendor: "GreenScape LLC",
    property: "456 Maple Ave",
    amount: 4500,
    startDate: "Sep 1, 2025",
    endDate: "Nov 30, 2025",
    status: "expired",
  },
];

const statusConfig = {
  active: { label: "Active", color: "#10B981", bg: "#ECFDF5" },
  pending: { label: "Pending", color: "#272D53", bg: "#E8E9EE" },
  expired: { label: "Expired", color: "#EF4444", bg: "#FEF2F2" },
  completed: { label: "Completed", color: "#3B82F6", bg: "#EFF6FF" },
};

const filters = ["All", "Active Properties", "Upcoming"];

export default function ContractsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filtered = mockContracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (selectedFilter === "Active Properties") {
      matchesFilter = c.status === "active";
    } else if (selectedFilter === "Upcoming") {
      matchesFilter = c.status === "pending";
    }
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Contracts</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <Search size={18} color={theme.textTertiary} strokeWidth={1.5} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search contracts..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Contracts</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
          <TouchableOpacity
            style={[styles.addFilterBtn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={() => router.push("/add-contract" as any)}
          >
            <Plus size={18} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedFilter === f && { backgroundColor: theme.navy, borderColor: theme.navy },
              ]}
              onPress={() => setSelectedFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.textSecondary },
                  selectedFilter === f && { color: "#FFFFFF" },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>

        <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
          {filtered.length} contract{filtered.length !== 1 ? "s" : ""}
        </Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filtered.map((contract) => {
            const cfg = statusConfig[contract.status];
            return (
              <TouchableOpacity
                key={contract.id}
                style={[styles.card, { backgroundColor: theme.surface }]}
                activeOpacity={0.7}
                onPress={() => router.push(`/contract/${contract.id}` as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: "#EEF2FF" }]}>
                    <FileText size={20} color="#4F46E5" strokeWidth={1.5} />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{contract.title}</Text>
                <Text style={[styles.cardVendor, { color: theme.textSecondary }]}>{contract.vendor}</Text>
                <Text style={[styles.cardProperty, { color: theme.textTertiary }]}>{contract.property}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <DollarSign size={14} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.metaText, { color: theme.text }]}>
                      ${contract.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={theme.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                      {contract.startDate} - {contract.endDate}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  addFilterBtn: {
    width: 40,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  countLabel: {
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 12,
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  cardVendor: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardProperty: {
    fontSize: 13,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
});
