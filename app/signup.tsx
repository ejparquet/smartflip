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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, CreditCard, Check, MapPin, Navigation } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { ProfessionalType } from "@/types";

type UserTitle = "Home Owner/Investor" | "Realtor" | "Contractor" | "Plumber" | "Electrician" | "Landscape" | "Interior Designer" | "Dumper Loads" | "Pool Builder" | "Painter";

const titleToProfessionalType: Record<UserTitle, ProfessionalType | null> = {
  "Home Owner/Investor": null,
  "Realtor": "realtor",
  "Contractor": "contractor",
  "Plumber": "plumber",
  "Electrician": "electrician",
  "Landscape": "landscaper",
  "Interior Designer": "interior_designer",
  "Dumper Loads": "dumpster_service",
  "Pool Builder": "pool_company",
  "Painter": "painter",
};

const titles: UserTitle[] = ["Home Owner/Investor", "Realtor", "Contractor", "Plumber", "Electrician", "Landscape", "Interior Designer", "Dumper Loads", "Pool Builder", "Painter"];

type PlanType = "monthly" | "yearly";

export default function SignUpScreen() {
  const router = useRouter();
  const { selectRole } = useAuth();
  const { location, isLocationEnabled, requestLocation, setManualLocation } = useLocation();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<UserTitle>("Home Owner/Investor");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const isProfessional = selectedTitle !== "Home Owner/Investor";

  const { completeRegistration } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDone = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    const role = selectedTitle === "Home Owner/Investor" ? "homeowner" : "professional";
    selectRole(role);

    setIsSubmitting(true);
    try {
      await completeRegistration({
        name: fullName,
        email,
        password,
        role,
        professionalType: role === "professional" ? (titleToProfessionalType[selectedTitle] || "contractor") : undefined,
      });
      
      if (role === "professional") {
        router.replace("/(pro-tabs)/dashboard");
      } else {
        router.replace("/add-property");
      }
    } catch {
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Tell us how to{"\n"}address you</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.card}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.textTertiary}
                  value={fullName}
                  onChangeText={setFullName}
                />
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="Company Name"
                  placeholderTextColor={Colors.textTertiary}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Title</Text>
              <View style={styles.card}>
                {titles.map((title, index) => (
                  <React.Fragment key={title}>
                    <TouchableOpacity
                      style={styles.titleOption}
                      onPress={() => setSelectedTitle(title)}
                    >
                      <Text style={styles.titleText}>{title}</Text>
                      <View style={[
                        styles.radioOuter,
                        selectedTitle === title && styles.radioOuterSelected
                      ]}>
                        {selectedTitle === title && (
                          <Check size={16} color={Colors.success} />
                        )}
                      </View>
                    </TouchableOpacity>
                    {index < titles.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {isProfessional && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Location</Text>
                <Text style={styles.sectionSubtitle}>Let clients find you based on your location</Text>
                
                {isLocationEnabled && location ? (
                  <View style={styles.locationCard}>
                    <View style={styles.locationCardHeader}>
                      <Navigation size={16} color={Colors.success} />
                      <Text style={styles.locationCardTitle}>Location Set</Text>
                    </View>
                    <Text style={styles.locationCardText}>{location.displayName}</Text>
                    <TouchableOpacity 
                      style={styles.changeLocationBtn}
                      onPress={() => requestLocation()}
                    >
                      <Text style={styles.changeLocationText}>Update Location</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.useLocationBtn}
                      onPress={requestLocation}
                    >
                      <Navigation size={18} color={Colors.white} />
                      <Text style={styles.useLocationText}>Use Current Location</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.orDivider}>
                      <View style={styles.orLine} />
                      <Text style={styles.orText}>OR</Text>
                      <View style={styles.orLine} />
                    </View>
                    
                    <View style={styles.card}>
                      <TextInput
                        style={styles.input}
                        placeholder="Zip Code"
                        placeholderTextColor={Colors.textTertiary}
                        value={zipCode}
                        onChangeText={setZipCode}
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                      <View style={styles.divider} />
                      <TextInput
                        style={styles.input}
                        placeholder="City"
                        placeholderTextColor={Colors.textTertiary}
                        value={city}
                        onChangeText={setCity}
                      />
                      <View style={styles.divider} />
                      <TextInput
                        style={styles.input}
                        placeholder="State (e.g., TX, CA)"
                        placeholderTextColor={Colors.textTertiary}
                        value={state}
                        onChangeText={setState}
                        maxLength={2}
                        autoCapitalize="characters"
                      />
                    </View>
                    {zipCode.length === 5 && city && state && (
                      <TouchableOpacity 
                        style={styles.saveLocationBtn}
                        onPress={() => setManualLocation(zipCode, city, state)}
                      >
                        <MapPin size={16} color={Colors.white} />
                        <Text style={styles.saveLocationText}>Save Location</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Setup</Text>
              
              <TouchableOpacity
                style={[styles.planOption, selectedPlan === "monthly" && styles.planOptionSelected]}
                onPress={() => setSelectedPlan("monthly")}
              >
                <View style={styles.planIcon}>
                  <CreditCard size={20} color={Colors.primary} />
                </View>
                <Text style={styles.planTitle}>Monthly Plan</Text>
                <Text style={styles.planPrice}>$9.99/month</Text>
                <View style={[
                  styles.radioOuter,
                  selectedPlan === "monthly" && styles.radioOuterSelected
                ]}>
                  {selectedPlan === "monthly" && (
                    <Check size={16} color={Colors.success} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planOption, selectedPlan === "yearly" && styles.planOptionSelected]}
                onPress={() => setSelectedPlan("yearly")}
              >
                <View style={styles.planIcon}>
                  <CreditCard size={20} color={Colors.primary} />
                </View>
                <Text style={styles.planTitle}>Yearly Plan</Text>
                <Text style={styles.planPrice}>$99.99/year</Text>
                <View style={[
                  styles.radioOuter,
                  selectedPlan === "yearly" && styles.radioOuterSelected
                ]}>
                  {selectedPlan === "yearly" && (
                    <Check size={16} color={Colors.success} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Credit Card</Text>
              
              <View style={styles.cardInputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.cardInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={Colors.textTertiary}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Expiration Month</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="MM"
                    placeholderTextColor={Colors.textTertiary}
                    value={expiryMonth}
                    onChangeText={setExpiryMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Expiration Year</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="YYYY"
                    placeholderTextColor={Colors.textTertiary}
                    value={expiryYear}
                    onChangeText={setExpiryYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="123"
                    placeholderTextColor={Colors.textTertiary}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.cardInput}
                    placeholder="John Smith"
                    placeholderTextColor={Colors.textTertiary}
                    value={cardholderName}
                    onChangeText={setCardholderName}
                  />
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.cancelCardButton} onPress={handleCancel}>
                  <X size={16} color={Colors.white} />
                  <Text style={styles.cancelCardText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addCardButton}>
                  <CreditCard size={16} color={Colors.primary} />
                  <Text style={styles.addCardText}>Add Card</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pagination}>
              {[0, 1, 2, 3, 4].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === 4 && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.doneButton, isSubmitting && styles.doneButtonLoading]}
              onPress={handleDone}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <Text style={styles.doneButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 36,
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
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 16,
  },
  titleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleText: {
    fontSize: 16,
    color: Colors.text,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.success,
    backgroundColor: "rgba(72, 187, 120, 0.1)",
  },
  planOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  planOptionSelected: {
    borderWidth: 1,
    borderColor: Colors.success,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  planPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 12,
  },
  cardInputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  cardInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  cancelCardText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  paginationDotActive: {
    width: 45,
    backgroundColor: Colors.primary,
  },
  doneButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  doneButtonLoading: {
    opacity: 0.7,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  useLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  useLocationText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  locationCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 16,
  },
  locationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  locationCardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  locationCardText: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
  },
  changeLocationBtn: {
    alignSelf: "flex-start",
  },
  changeLocationText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  saveLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  saveLocationText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
