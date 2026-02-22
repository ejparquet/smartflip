import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MapPin, Navigation, X, ChevronDown, Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocation } from "@/contexts/LocationContext";

const DISTANCE_OPTIONS = [10, 25, 50, 100, 200];

export default function LocationBanner() {
  const {
    location,
    isLoading,
    isLocationEnabled,
    requestLocation,
    setManualLocation,
    maxDistanceMiles,
    setMaxDistance,
  } = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const handleUseCurrentLocation = async () => {
    setIsRequesting(true);
    await requestLocation();
    setIsRequesting(false);
    setShowModal(false);
  };

  const handleSetManualLocation = async () => {
    if (zipCode.length === 5) {
      await setManualLocation(zipCode, city, state);
      setShowModal(false);
      setZipCode("");
      setCity("");
      setState("");
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isLocationEnabled) {
    return (
      <>
        <TouchableOpacity
          style={styles.setupBanner}
          onPress={() => setShowModal(true)}
          activeOpacity={0.9}
        >
          <View style={styles.setupBannerContent}>
            <View style={styles.setupIconContainer}>
              <MapPin size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.setupTextContainer}>
              <Text style={styles.setupTitle}>Set Your Location</Text>
              <Text style={styles.setupSubtitle}>
                See materials & stores near you
              </Text>
            </View>
          </View>
          <View style={styles.setupAction}>
            <Text style={styles.setupActionText}>Set Up</Text>
          </View>
        </TouchableOpacity>

        <LocationModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          zipCode={zipCode}
          setZipCode={setZipCode}
          city={city}
          setCity={setCity}
          state={state}
          setState={setState}
          isRequesting={isRequesting}
          onUseCurrentLocation={handleUseCurrentLocation}
          onSetManualLocation={handleSetManualLocation}
        />
      </>
    );
  }

  return (
    <>
      <View style={styles.locationBar}>
        <TouchableOpacity
          style={styles.locationInfo}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          <MapPin size={16} color={Colors.navy} strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location?.displayName || "Current Location"}
          </Text>
          <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.distanceButton}
          onPress={() => setShowDistanceModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.distanceText}>{maxDistanceMiles} mi</Text>
          <ChevronDown size={14} color={Colors.navy} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <LocationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        zipCode={zipCode}
        setZipCode={setZipCode}
        city={city}
        setCity={setCity}
        state={state}
        setState={setState}
        isRequesting={isRequesting}
        onUseCurrentLocation={handleUseCurrentLocation}
        onSetManualLocation={handleSetManualLocation}
        currentLocation={location?.displayName}
      />

      <Modal
        visible={showDistanceModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDistanceModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDistanceModal(false)}
        >
          <View style={styles.distanceModalContent}>
            <Text style={styles.distanceModalTitle}>Search Radius</Text>
            {DISTANCE_OPTIONS.map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceOption,
                  maxDistanceMiles === distance && styles.distanceOptionActive,
                ]}
                onPress={() => {
                  setMaxDistance(distance);
                  setShowDistanceModal(false);
                }}
              >
                <Text
                  style={[
                    styles.distanceOptionText,
                    maxDistanceMiles === distance && styles.distanceOptionTextActive,
                  ]}
                >
                  {distance} miles
                </Text>
                {maxDistanceMiles === distance && (
                  <Check size={18} color={Colors.navy} strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  zipCode: string;
  setZipCode: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  isRequesting: boolean;
  onUseCurrentLocation: () => void;
  onSetManualLocation: () => void;
  currentLocation?: string;
}

function LocationModal({
  visible,
  onClose,
  zipCode,
  setZipCode,
  city,
  setCity,
  state,
  setState,
  isRequesting,
  onUseCurrentLocation,
  onSetManualLocation,
  currentLocation,
}: LocationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Set Location</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          {currentLocation && (
            <View style={styles.currentLocationCard}>
              <MapPin size={18} color={Colors.navy} strokeWidth={2} />
              <Text style={styles.currentLocationText}>{currentLocation}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.gpsButton}
            onPress={onUseCurrentLocation}
            disabled={isRequesting}
            activeOpacity={0.8}
          >
            {isRequesting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Navigation size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.gpsButtonText}>Use Current Location</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter manually</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Zip Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter zip code"
              placeholderTextColor="#9CA3AF"
              value={zipCode}
              onChangeText={(text) => setZipCode(text.replace(/[^0-9]/g, "").slice(0, 5))}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.inputLabel}>City (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="TX"
                placeholderTextColor="#9CA3AF"
                value={state}
                onChangeText={(text) => setState(text.toUpperCase().slice(0, 2))}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              zipCode.length !== 5 && styles.saveButtonDisabled,
            ]}
            onPress={onSetManualLocation}
            disabled={zipCode.length !== 5}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Location</Text>
          </TouchableOpacity>

          <Text style={styles.privacyNote}>
            Your location is only used to show nearby items and stores. It&apos;s stored locally on your device.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  setupBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.navy,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  setupBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  setupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  setupTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  setupTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  setupSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  setupAction: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setupActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1F2937",
    flex: 1,
  },
  distanceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  distanceModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  distanceModalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  distanceOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  distanceOptionActive: {
    backgroundColor: "#EEF2FF",
  },
  distanceOptionText: {
    fontSize: 15,
    color: "#4B5563",
  },
  distanceOptionTextActive: {
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  currentLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EEF2FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.navy,
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.navy,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: "#9CA3AF",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  inputRow: {
    flexDirection: "row",
  },
  saveButton: {
    backgroundColor: Colors.navy,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  privacyNote: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});
