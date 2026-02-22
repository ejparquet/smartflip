import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  Camera,
  X,
  ChevronDown,
  Grid3x3,
  TreeDeciduous,
  DoorClosed,
  Bath,
  Refrigerator,
  Square,
  Paintbrush,
  Lightbulb,
  Wrench,
  Package,
  MapPin,
  DollarSign,
  Check,
  Droplets,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { MarketplaceCategory, ListingCondition } from "@/types";
import { marketplaceCategories } from "@/mocks/marketplace";

const categoryIcons: Record<MarketplaceCategory, React.ElementType> = {
  tile: Grid3x3,
  wood: TreeDeciduous,
  cabinets: DoorClosed,
  fixtures: Bath,
  appliances: Refrigerator,
  flooring: Square,
  paint: Paintbrush,
  lighting: Lightbulb,
  hardware: Wrench,
  plumbing: Droplets,
  other: Package,
};

const conditionOptions: { id: ListingCondition; label: string; description: string }[] = [
  { id: "new", label: "New", description: "Never used, still in packaging" },
  { id: "like_new", label: "Like New", description: "Used briefly, excellent condition" },
  { id: "good", label: "Good", description: "Normal wear, fully functional" },
  { id: "fair", label: "Fair", description: "Shows wear, still usable" },
];

export default function AddListingScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MarketplaceCategory | null>(null);
  const [condition, setCondition] = useState<ListingCondition | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [originalProject, setOriginalProject] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter a title for your listing");
      return;
    }
    if (!category) {
      Alert.alert("Missing Information", "Please select a category");
      return;
    }
    if (!condition) {
      Alert.alert("Missing Information", "Please select the condition");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert("Missing Information", "Please enter a valid price");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Missing Information", "Please enter your location");
      return;
    }

    Alert.alert(
      "Listing Created!",
      "Your listing has been posted to the marketplace.",
      [
        {
          text: "View Marketplace",
          onPress: () => router.replace("/marketplace" as any),
        },
      ]
    );
  };

  const selectedCategory = marketplaceCategories.find((c) => c.id === category);
  const selectedCondition = conditionOptions.find((c) => c.id === condition);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Post Listing",
          headerStyle: { backgroundColor: Colors.navy },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <TouchableOpacity style={styles.headerPostButton} onPress={handleSubmit}>
              <Text style={styles.headerPostText}>Post</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Photo Upload Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <Text style={styles.sectionSubtitle}>Add up to 5 photos of your item</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoContainer}
              >
                <TouchableOpacity style={styles.addPhotoButton}>
                  <Camera size={28} color={Colors.navy} strokeWidth={1.5} />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.photoPlaceholder}>
                    <Camera size={20} color="#D1D5DB" strokeWidth={1.5} />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Italian Marble Tile - 50 sq ft"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category Picker */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Category *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                {category ? (
                  <View style={styles.pickerSelected}>
                    {React.createElement(categoryIcons[category], {
                      size: 20,
                      color: Colors.navy,
                      strokeWidth: 1.5,
                    })}
                    <Text style={styles.pickerSelectedText}>{selectedCategory?.label}</Text>
                  </View>
                ) : (
                  <Text style={styles.pickerPlaceholder}>Select category</Text>
                )}
                <ChevronDown size={20} color="#9CA3AF" strokeWidth={1.5} />
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={styles.pickerOptions}>
                  {marketplaceCategories.map((cat) => {
                    const IconComponent = categoryIcons[cat.id];
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.pickerOption,
                          category === cat.id && styles.pickerOptionSelected,
                        ]}
                        onPress={() => {
                          setCategory(cat.id);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <IconComponent
                          size={18}
                          color={category === cat.id ? Colors.navy : "#6B7280"}
                          strokeWidth={1.5}
                        />
                        <Text
                          style={[
                            styles.pickerOptionText,
                            category === cat.id && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                        {category === cat.id && (
                          <Check size={18} color={Colors.navy} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Condition Picker */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Condition *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowConditionPicker(!showConditionPicker)}
              >
                {condition ? (
                  <Text style={styles.pickerSelectedText}>{selectedCondition?.label}</Text>
                ) : (
                  <Text style={styles.pickerPlaceholder}>Select condition</Text>
                )}
                <ChevronDown size={20} color="#9CA3AF" strokeWidth={1.5} />
              </TouchableOpacity>
              {showConditionPicker && (
                <View style={styles.pickerOptions}>
                  {conditionOptions.map((cond) => (
                    <TouchableOpacity
                      key={cond.id}
                      style={[
                        styles.pickerOption,
                        condition === cond.id && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setCondition(cond.id);
                        setShowConditionPicker(false);
                      }}
                    >
                      <View style={styles.conditionOptionContent}>
                        <Text
                          style={[
                            styles.pickerOptionText,
                            condition === cond.id && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {cond.label}
                        </Text>
                        <Text style={styles.conditionDescription}>{cond.description}</Text>
                      </View>
                      {condition === cond.id && (
                        <Check size={18} color={Colors.navy} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Price */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Price *</Text>
              <View style={styles.priceInputContainer}>
                <DollarSign size={20} color="#9CA3AF" strokeWidth={1.5} />
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            {/* Quantity & Unit */}
            <View style={styles.rowSection}>
              <View style={[styles.section, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 50"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              <View style={[styles.section, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., sq ft, pieces"
                  placeholderTextColor="#9CA3AF"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Location *</Text>
              <View style={styles.locationInputContainer}>
                <MapPin size={20} color="#9CA3AF" strokeWidth={1.5} />
                <TextInput
                  style={styles.locationInput}
                  placeholder="City, State"
                  placeholderTextColor="#9CA3AF"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your item - include brand, dimensions, original purchase price, reason for selling..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Original Project */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Original Project (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Kitchen Renovation at 123 Main St"
                placeholderTextColor="#9CA3AF"
                value={originalProject}
                onChangeText={setOriginalProject}
              />
              <Text style={styles.inputHelper}>
                Helps buyers understand where the materials came from
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Post Listing</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerPostButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    marginRight: 4,
  },
  headerPostText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  photoContainer: {
    gap: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.navy,
    borderStyle: "dashed",
    gap: 6,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.navy,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  pickerSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pickerSelectedText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerOptionSelected: {
    backgroundColor: "#F0F9FF",
  },
  pickerOptionText: {
    flex: 1,
    fontSize: 15,
    color: "#4B5563",
  },
  pickerOptionTextSelected: {
    color: Colors.navy,
    fontWeight: "500" as const,
  },
  conditionOptionContent: {
    flex: 1,
  },
  conditionDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 8,
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  rowSection: {
    flexDirection: "row",
    gap: 12,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  inputHelper: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  submitButton: {
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
