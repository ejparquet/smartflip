import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Camera, ChevronDown, Calendar, Home, ChevronLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { PropertyStatus } from "@/types";

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addProperty } = useProperties();

  const [propertyAddress, setPropertyAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [estimatedARV, setEstimatedARV] = useState("");
  const [propertyStatus, setPropertyStatus] = useState<PropertyStatus>("signed");
  const [propertyStartDate, setPropertyStartDate] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [showPropertyStatusDropdown, setShowPropertyStatusDropdown] = useState(false);

  const propertyStatuses: { value: PropertyStatus; label: string }[] = [
    { value: "signed", label: "Signed" },
    { value: "pending", label: "Pending" },
    { value: "closed", label: "Closed" },
  ];

  const handleCreateProperty = async () => {
    if (!propertyAddress || !purchasePrice) {
      Alert.alert("Error", "Please fill in property address and purchase price");
      return;
    }

    try {
      await addProperty({
        ownerId: user?.id || "user-1",
        address: propertyAddress,
        purchasePrice: parseInt(purchasePrice.replace(/[^0-9]/g, "")) || 0,
        estimatedARV: parseInt(estimatedARV.replace(/[^0-9]/g, "")) || 0,
        status: propertyStatus,
        startDate: propertyStartDate || new Date().toISOString().split("T")[0],
        coverImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        images: [],
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        squareFeet: squareFeet ? parseInt(squareFeet.replace(/[^0-9]/g, "")) : undefined,
        projectIds: [],
      });

      Alert.alert("Success", "Property added successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (user?.role === "professional") {
              router.replace("/(pro-tabs)/dashboard" as any);
            } else {
              router.replace("/(tabs)/home" as any);
            }
          },
        },
      ]);
    } catch (error) {
      console.log("Error creating property:", error);
      Alert.alert("Error", "Failed to create property. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const getStatusLabel = (status: PropertyStatus): string => {
    const found = propertyStatuses.find((s) => s.value === status);
    return found ? found.label : "Select Status";
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.headerTitle}>Add Property</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Add a new property</Text>
            <Text style={styles.subtitle}>
              You can add projects to this property later from the property details page.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property Information</Text>
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabelBold}>Property Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full property address"
                    placeholderTextColor={Colors.textTertiary}
                    value={propertyAddress}
                    onChangeText={setPropertyAddress}
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={styles.halfInputGroup}>
                    <Text style={styles.inputLabel}>Purchase Price *</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="$450,000"
                      placeholderTextColor={Colors.textTertiary}
                      value={purchasePrice}
                      onChangeText={setPurchasePrice}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.halfInputGroup}>
                    <Text style={styles.inputLabel}>Estimated ARV</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="$650,000"
                      placeholderTextColor={Colors.textTertiary}
                      value={estimatedARV}
                      onChangeText={setEstimatedARV}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowPropertyStatusDropdown(!showPropertyStatusDropdown)}
                  >
                    <Text style={styles.dropdownText}>{getStatusLabel(propertyStatus)}</Text>
                    <ChevronDown size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  {showPropertyStatusDropdown && (
                    <View style={styles.dropdownList}>
                      {propertyStatuses.map((status) => (
                        <TouchableOpacity
                          key={status.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setPropertyStatus(status.value);
                            setShowPropertyStatusDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{status.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <View style={styles.dateInput}>
                    <TextInput
                      style={styles.dateInputText}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={Colors.textTertiary}
                      value={propertyStartDate}
                      onChangeText={setPropertyStartDate}
                    />
                    <Calendar size={20} color={Colors.textSecondary} />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={styles.thirdInputGroup}>
                    <Text style={styles.inputLabel}>Bedrooms</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="4"
                      placeholderTextColor={Colors.textTertiary}
                      value={bedrooms}
                      onChangeText={setBedrooms}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.thirdInputGroup}>
                    <Text style={styles.inputLabel}>Bathrooms</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="3"
                      placeholderTextColor={Colors.textTertiary}
                      value={bathrooms}
                      onChangeText={setBathrooms}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.thirdInputGroup}>
                    <Text style={styles.inputLabel}>Sq Ft</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="2,800"
                      placeholderTextColor={Colors.textTertiary}
                      value={squareFeet}
                      onChangeText={setSquareFeet}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Add Photo</Text>
                  <TouchableOpacity style={styles.photoButton}>
                    <Camera size={28} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <X size={16} color={Colors.white} />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.createButton} onPress={handleCreateProperty}>
                    <Home size={16} color={Colors.primary} />
                    <Text style={styles.createButtonText}>Add Property</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputLabelBold: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.text,
  },
  inputSmall: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInputGroup: {
    flex: 1,
  },
  thirdInputGroup: {
    flex: 1,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.text,
  },
  dropdownList: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  photoButton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  createButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
});
