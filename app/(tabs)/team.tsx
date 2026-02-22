import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Bell,
  Plus,
  Phone,
  MessageCircle,
  Star,
  MapPin,
  HardHat,
  Paintbrush,
  Droplets,
  Zap,
  Home,
  TreeDeciduous,
  Filter,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";
import { mockProfessionals, professionalTypes } from "@/mocks/professionals";
import { ProfessionalType } from "@/types";

const filterOptions = [
  { type: "all", label: "All" },
  { type: "contractor", label: "Contractors", icon: HardHat },
  { type: "painter", label: "Painters", icon: Paintbrush },
  { type: "plumber", label: "Plumbers", icon: Droplets },
  { type: "electrician", label: "Electricians", icon: Zap },
  { type: "realtor", label: "Realtors", icon: Home },
  { type: "landscaper", label: "Landscapers", icon: TreeDeciduous },
];

export default function ContactsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    safeArea: { backgroundColor: theme.surface },
    headerTitle: { color: theme.text },
    logoIcon: { backgroundColor: theme.primary },
    searchBox: { backgroundColor: theme.surfaceSecondary },
    searchInput: { color: theme.text },
    filterChip: { backgroundColor: theme.surface, borderColor: theme.border },
    filterChipActive: { backgroundColor: theme.navy, borderColor: theme.navy },
    filterChipText: { color: theme.textSecondary },
    filterChipTextActive: { color: theme.white },
    addContactButton: { backgroundColor: theme.primary },
    sectionTitle: { color: theme.text },
    contactCard: { backgroundColor: theme.surface },
    contactName: { color: theme.text },
    contactRole: { color: theme.primary },
    locationText: { color: theme.textSecondary },
    ratingText: { color: theme.text },
    actionButton: { backgroundColor: theme.surfaceSecondary },
    messageButton: { backgroundColor: theme.primary },
    emptyStateTitle: { color: theme.text },
    emptyStateText: { color: theme.textSecondary },
  }), [theme]);

  const filteredContacts = useMemo(() => {
    return mockProfessionals.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = selectedFilter === "all" || contact.professionalType === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  const handleCall = (phone: string) => {
    Alert.alert("Call", `Calling ${phone}`);
  };

  const handleMessage = (contactId: string) => {
    router.push(`/chat/${contactId}` as any);
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, dynamicStyles.safeArea]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, dynamicStyles.logoIcon]}>
              <View style={styles.logoInner}>
                <View style={[styles.logoArrow, { borderBottomColor: theme.white }]} />
                <View style={[styles.logoHouse, { backgroundColor: theme.white }]} />
              </View>
            </View>
          </View>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Contacts</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={22} color={theme.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, dynamicStyles.searchBox]}>
            <Search size={18} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, dynamicStyles.searchInput]}
              placeholder="Search contacts..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.type}
              style={[
                styles.filterChip,
                dynamicStyles.filterChip,
                selectedFilter === filter.type && dynamicStyles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.type)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  dynamicStyles.filterChipText,
                  selectedFilter === filter.type && dynamicStyles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.addContactButton, dynamicStyles.addContactButton]}
          onPress={() => router.push("/add-team-member" as any)}
        >
          <Plus size={20} color={theme.white} />
          <Text style={[styles.addContactButtonText, { color: theme.white }]}>Add New Contact</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          {selectedFilter === "all" ? "All Contacts" : filterOptions.find(f => f.type === selectedFilter)?.label}
          {" "}({filteredContacts.length})
        </Text>

        {filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, dynamicStyles.emptyStateTitle]}>No contacts found</Text>
            <Text style={[styles.emptyStateText, dynamicStyles.emptyStateText]}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          filteredContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[styles.contactCard, dynamicStyles.contactCard]}
              onPress={() => router.push(`/professional/${contact.id}` as any)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: contact.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" }}
                style={styles.contactAvatar}
                contentFit="cover"
              />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, dynamicStyles.contactName]}>{contact.name}</Text>
                <View style={styles.roleRow}>
                  <HardHat size={12} color={theme.primary} />
                  <Text style={[styles.contactRole, dynamicStyles.contactRole]}>
                    {professionalTypes.find(t => t.type === contact.professionalType)?.label}
                  </Text>
                </View>
                {contact.city && contact.state && (
                  <View style={styles.locationRow}>
                    <MapPin size={10} color={theme.textSecondary} />
                    <Text style={[styles.locationText, dynamicStyles.locationText]}>
                      {contact.city}, {contact.state}
                    </Text>
                  </View>
                )}
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      color={theme.gold}
                      fill={star <= Math.floor(contact.rating) ? theme.gold : "transparent"}
                    />
                  ))}
                  <Text style={[styles.ratingText, dynamicStyles.ratingText]}>{contact.rating.toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.actionButton, dynamicStyles.actionButton]}
                  onPress={() => contact.phone && handleCall(contact.phone)}
                >
                  <Phone size={16} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, dynamicStyles.messageButton]}
                  onPress={() => handleMessage(contact.id)}
                >
                  <MessageCircle size={16} color={theme.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: Colors.white,
    position: "absolute",
    top: 0,
  },
  logoHouse: {
    width: 14,
    height: 9,
    backgroundColor: Colors.white,
    position: "absolute",
    bottom: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addContactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addContactButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 14,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 13,
    color: Colors.primary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text,
    marginLeft: 4,
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    backgroundColor: Colors.primary,
  },
});
