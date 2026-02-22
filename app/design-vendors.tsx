import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  Clock,
  Percent,
  ChevronRight,
  Plus,
  Building2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { mockDesignVendors, DesignVendor } from "@/mocks/interior-designers";

const categories = [
  "All",
  "Furniture",
  "Lighting",
  "Textiles",
  "Art",
  "Flooring",
  "Wallcovering",
  "Accessories",
  "Kitchen & Bath",
  "Outdoor",
];

export default function DesignVendorsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVendor, setSelectedVendor] = useState<DesignVendor | null>(null);

  const filteredVendors = mockDesignVendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      vendor.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Vendor Directory",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilters}
        contentContainerStyle={styles.categoryFiltersContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCount}>
          {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
        </Text>

        {filteredVendors.map((vendor) => (
          <TouchableOpacity
            key={vendor.id}
            style={styles.vendorCard}
            onPress={() => setSelectedVendor(vendor)}
          >
            <View style={styles.vendorHeader}>
              <View style={styles.vendorLogo}>
                {vendor.logo ? (
                  <Image
                    source={{ uri: vendor.logo }}
                    style={styles.logoImage}
                    contentFit="cover"
                  />
                ) : (
                  <Building2 size={24} color={Colors.textSecondary} />
                )}
              </View>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                <Text style={styles.vendorCategory}>
                  {vendor.category.charAt(0).toUpperCase() +
                    vendor.category.slice(1).replace("_", " & ")}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#272D53" fill="#272D53" />
                <Text style={styles.ratingText}>{vendor.rating}</Text>
              </View>
            </View>

            <View style={styles.vendorMeta}>
              <View style={styles.metaItem}>
                <Percent size={14} color="#10B981" />
                <Text style={styles.metaText}>
                  {vendor.tradeDiscount}% Trade Discount
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{vendor.leadTime}</Text>
              </View>
            </View>

            {vendor.minOrder && (
              <Text style={styles.minOrder}>
                Min. Order: ${vendor.minOrder.toLocaleString()}
              </Text>
            )}

            <View style={styles.cardFooter}>
              <Text style={styles.viewDetails}>View Details</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}

        {filteredVendors.length === 0 && (
          <View style={styles.emptyState}>
            <Building2 size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Vendors Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedVendor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedVendor(null)}
      >
        {selectedVendor && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedVendor(null)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Vendor Details</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalVendorHeader}>
                <View style={styles.modalLogo}>
                  {selectedVendor.logo ? (
                    <Image
                      source={{ uri: selectedVendor.logo }}
                      style={styles.modalLogoImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Building2 size={36} color={Colors.textSecondary} />
                  )}
                </View>
                <View style={styles.modalVendorInfo}>
                  <Text style={styles.modalVendorName}>{selectedVendor.name}</Text>
                  <Text style={styles.modalVendorCategory}>
                    {selectedVendor.category.charAt(0).toUpperCase() +
                      selectedVendor.category.slice(1).replace("_", " & ")}
                  </Text>
                  <View style={styles.modalRating}>
                    <Star size={16} color="#272D53" fill="#272D53" />
                    <Text style={styles.modalRatingText}>
                      {selectedVendor.rating} Rating
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.highlightCards}>
                <View style={styles.highlightCard}>
                  <Percent size={20} color="#10B981" />
                  <Text style={styles.highlightValue}>
                    {selectedVendor.tradeDiscount}%
                  </Text>
                  <Text style={styles.highlightLabel}>Trade Discount</Text>
                </View>
                <View style={styles.highlightCard}>
                  <Clock size={20} color="#3B82F6" />
                  <Text style={styles.highlightValue}>{selectedVendor.leadTime}</Text>
                  <Text style={styles.highlightLabel}>Lead Time</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>

                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleCall(selectedVendor.phone)}
                >
                  <View style={styles.contactIcon}>
                    <Phone size={18} color="#EC4899" />
                  </View>
                  <Text style={styles.contactText}>{selectedVendor.phone}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleEmail(selectedVendor.email)}
                >
                  <View style={styles.contactIcon}>
                    <Mail size={18} color="#EC4899" />
                  </View>
                  <Text style={styles.contactText}>{selectedVendor.email}</Text>
                </TouchableOpacity>

                {selectedVendor.website && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handleWebsite(selectedVendor.website!)}
                  >
                    <View style={styles.contactIcon}>
                      <Globe size={18} color="#EC4899" />
                    </View>
                    <Text style={styles.contactText}>{selectedVendor.website}</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.contactRow}>
                  <View style={styles.contactIcon}>
                    <MapPin size={18} color="#EC4899" />
                  </View>
                  <Text style={styles.contactText}>{selectedVendor.address}</Text>
                </View>

                {selectedVendor.contactName && (
                  <View style={styles.contactNote}>
                    <Text style={styles.contactNoteText}>
                      Contact: {selectedVendor.contactName}
                    </Text>
                  </View>
                )}
              </View>

              {selectedVendor.minOrder && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Requirements</Text>
                  <View style={styles.requirementRow}>
                    <Text style={styles.requirementLabel}>Minimum Order</Text>
                    <Text style={styles.requirementValue}>
                      ${selectedVendor.minOrder.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {selectedVendor.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>{selectedVendor.notes}</Text>
                  </View>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleCall(selectedVendor.phone)}
                >
                  <Phone size={18} color={Colors.white} />
                  <Text style={styles.primaryButtonText}>Call Vendor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleEmail(selectedVendor.email)}
                >
                  <Mail size={18} color="#EC4899" />
                  <Text style={styles.secondaryButtonText}>Send Email</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
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
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: "#EC4899",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryFilters: {
    maxHeight: 44,
    marginBottom: 8,
  },
  categoryFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#EC4899",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 8,
  },
  vendorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  vendorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  vendorLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  vendorCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#272D53",
  },
  vendorMeta: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  minOrder: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
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
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalVendorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  modalLogo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalLogoImage: {
    width: "100%",
    height: "100%",
  },
  modalVendorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  modalVendorName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalVendorCategory: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  modalRatingText: {
    fontSize: 14,
    color: "#272D53",
    fontWeight: "500" as const,
  },
  highlightCards: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  highlightValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 8,
  },
  highlightLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  contactNote: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  contactNoteText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  requirementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  requirementLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  requirementValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  notesBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCE7F3",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
});
