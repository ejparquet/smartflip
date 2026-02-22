import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack } from "expo-router";
import {
  Clock,
  Thermometer,
  Droplets,
  Paintbrush,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Info,
  Wind,
  Sun,
  CloudRain,
  Timer,
  RotateCcw,
  Layers,
} from "lucide-react-native";
import Colors from "@/constants/colors";

interface PaintType {
  id: string;
  name: string;
  baseTouchDry: number;
  baseRecoat: number;
  baseCure: number;
  description: string;
  icon: string;
}

const paintTypes: PaintType[] = [
  {
    id: "latex-flat",
    name: "Latex - Flat/Matte",
    baseTouchDry: 30,
    baseRecoat: 120,
    baseCure: 1440,
    description: "Water-based, quick drying",
    icon: "💧",
  },
  {
    id: "latex-satin",
    name: "Latex - Satin/Eggshell",
    baseTouchDry: 30,
    baseRecoat: 180,
    baseCure: 1440,
    description: "Water-based, medium sheen",
    icon: "✨",
  },
  {
    id: "latex-semi",
    name: "Latex - Semi-Gloss",
    baseTouchDry: 60,
    baseRecoat: 240,
    baseCure: 2160,
    description: "Water-based, higher sheen",
    icon: "🌟",
  },
  {
    id: "oil-based",
    name: "Oil-Based / Alkyd",
    baseTouchDry: 360,
    baseRecoat: 1440,
    baseCure: 10080,
    description: "Solvent-based, durable finish",
    icon: "🛢️",
  },
  {
    id: "primer-latex",
    name: "Primer - Latex",
    baseTouchDry: 30,
    baseRecoat: 60,
    baseCure: 1440,
    description: "Water-based primer",
    icon: "🎨",
  },
  {
    id: "primer-oil",
    name: "Primer - Oil-Based",
    baseTouchDry: 60,
    baseRecoat: 1440,
    baseCure: 4320,
    description: "Solvent-based primer",
    icon: "🔶",
  },
  {
    id: "chalk",
    name: "Chalk Paint",
    baseTouchDry: 15,
    baseRecoat: 60,
    baseCure: 2880,
    description: "Matte, vintage finish",
    icon: "🖌️",
  },
  {
    id: "spray",
    name: "Spray Paint",
    baseTouchDry: 10,
    baseRecoat: 60,
    baseCure: 1440,
    description: "Quick-drying aerosol",
    icon: "💨",
  },
  {
    id: "epoxy",
    name: "Epoxy Paint",
    baseTouchDry: 240,
    baseRecoat: 480,
    baseCure: 10080,
    description: "Two-part, heavy-duty",
    icon: "🔒",
  },
  {
    id: "stain",
    name: "Wood Stain",
    baseTouchDry: 60,
    baseRecoat: 240,
    baseCure: 4320,
    description: "Penetrating wood finish",
    icon: "🪵",
  },
];

const temperaturePresets = [
  { id: "cold", label: "Cold", temp: 50, icon: CloudRain, color: "#3B82F6" },
  { id: "cool", label: "Cool", temp: 60, icon: Wind, color: "#06B6D4" },
  { id: "ideal", label: "Ideal", temp: 72, icon: Sun, color: "#10B981" },
  { id: "warm", label: "Warm", temp: 80, icon: Sun, color: "#272D53" },
  { id: "hot", label: "Hot", temp: 90, icon: Thermometer, color: "#EF4444" },
];

const humidityPresets = [
  { id: "low", label: "Low", humidity: 30, description: "Desert/Dry" },
  { id: "moderate", label: "Moderate", humidity: 50, description: "Comfortable" },
  { id: "high", label: "High", humidity: 70, description: "Humid" },
  { id: "very-high", label: "Very High", humidity: 85, description: "Tropical" },
];

export default function DryingTimeCalculatorScreen() {
  const [selectedPaint, setSelectedPaint] = useState<PaintType>(paintTypes[0]);
  const [showPaintPicker, setShowPaintPicker] = useState(false);
  const [temperature, setTemperature] = useState("72");
  const [humidity, setHumidity] = useState("50");
  const [selectedTempPreset, setSelectedTempPreset] = useState("ideal");
  const [selectedHumidityPreset, setSelectedHumidityPreset] = useState("moderate");
  const [coatNumber, setCoatNumber] = useState(1);

  const calculations = useMemo(() => {
    const temp = parseFloat(temperature) || 72;
    const humid = parseFloat(humidity) || 50;

    let tempFactor = 1;
    if (temp < 50) {
      tempFactor = 2.5;
    } else if (temp < 60) {
      tempFactor = 1.8;
    } else if (temp < 70) {
      tempFactor = 1.2;
    } else if (temp <= 80) {
      tempFactor = 1;
    } else if (temp <= 90) {
      tempFactor = 0.85;
    } else {
      tempFactor = 0.7;
    }

    let humidityFactor = 1;
    if (humid < 30) {
      humidityFactor = 0.8;
    } else if (humid < 50) {
      humidityFactor = 0.9;
    } else if (humid <= 60) {
      humidityFactor = 1;
    } else if (humid <= 75) {
      humidityFactor = 1.3;
    } else if (humid <= 85) {
      humidityFactor = 1.6;
    } else {
      humidityFactor = 2;
    }

    const adjustedTouchDry = Math.round(selectedPaint.baseTouchDry * tempFactor * humidityFactor);
    const adjustedRecoat = Math.round(selectedPaint.baseRecoat * tempFactor * humidityFactor);
    const adjustedCure = Math.round(selectedPaint.baseCure * tempFactor * humidityFactor);

    const formatTime = (minutes: number): string => {
      if (minutes < 60) {
        return `${minutes} min`;
      } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
      } else {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        return hours > 0 ? `${days}d ${hours}h` : `${days} days`;
      }
    };

    let warnings: string[] = [];
    let recommendations: string[] = [];

    if (temp < 50) {
      warnings.push("Temperature too low - paint may not cure properly");
      recommendations.push("Wait for warmer conditions or use space heater");
    } else if (temp < 60) {
      warnings.push("Below optimal temperature range");
      recommendations.push("Allow extra drying time between coats");
    }

    if (temp > 90) {
      warnings.push("High temperature may cause paint to dry too fast");
      recommendations.push("Work in sections, keep a wet edge");
    }

    if (humid > 85) {
      warnings.push("Humidity too high for optimal drying");
      recommendations.push("Use dehumidifier or wait for better conditions");
    } else if (humid > 70) {
      warnings.push("High humidity will extend drying time");
      recommendations.push("Ensure good ventilation");
    }

    if (humid < 30) {
      recommendations.push("Very dry - paint may dry too quickly on brush");
    }

    const isOptimal = temp >= 65 && temp <= 85 && humid >= 40 && humid <= 60;

    return {
      touchDry: formatTime(adjustedTouchDry),
      touchDryMinutes: adjustedTouchDry,
      recoat: formatTime(adjustedRecoat),
      recoatMinutes: adjustedRecoat,
      cure: formatTime(adjustedCure),
      cureMinutes: adjustedCure,
      warnings,
      recommendations,
      isOptimal,
      tempFactor,
      humidityFactor,
    };
  }, [selectedPaint, temperature, humidity]);

  const selectTempPreset = (preset: typeof temperaturePresets[0]) => {
    setSelectedTempPreset(preset.id);
    setTemperature(preset.temp.toString());
  };

  const selectHumidityPreset = (preset: typeof humidityPresets[0]) => {
    setSelectedHumidityPreset(preset.id);
    setHumidity(preset.humidity.toString());
  };

  const resetCalculator = () => {
    setSelectedPaint(paintTypes[0]);
    setTemperature("72");
    setHumidity("50");
    setSelectedTempPreset("ideal");
    setSelectedHumidityPreset("moderate");
    setCoatNumber(1);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Drying Time Calculator",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerTitleStyle: { color: Colors.text, fontWeight: "700" },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconContainer}>
            <Clock size={32} color="#8B5CF6" />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Drying Time Calculator</Text>
            <Text style={styles.heroSubtitle}>
              Calculate optimal recoat times based on conditions
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Paintbrush size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Paint Type</Text>
          </View>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPaintPicker(!showPaintPicker)}
          >
            <View style={styles.pickerContent}>
              <View style={styles.paintIconContainer}>
                <Text style={styles.paintEmoji}>{selectedPaint.icon}</Text>
              </View>
              <View style={styles.pickerTextContent}>
                <Text style={styles.pickerValue}>{selectedPaint.name}</Text>
                <Text style={styles.pickerDescription}>{selectedPaint.description}</Text>
              </View>
            </View>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showPaintPicker && (
            <View style={styles.optionsList}>
              {paintTypes.map((paint) => (
                <TouchableOpacity
                  key={paint.id}
                  style={[
                    styles.optionItem,
                    selectedPaint.id === paint.id && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedPaint(paint);
                    setShowPaintPicker(false);
                  }}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionRow}>
                      <Text style={styles.optionEmoji}>{paint.icon}</Text>
                      <View style={styles.optionTextContent}>
                        <Text style={styles.optionName}>{paint.name}</Text>
                        <Text style={styles.optionDesc}>{paint.description}</Text>
                      </View>
                    </View>
                    <Text style={styles.optionTiming}>
                      Recoat: ~{paint.baseRecoat < 60 ? `${paint.baseRecoat}min` : `${Math.round(paint.baseRecoat / 60)}h`}
                    </Text>
                  </View>
                  {selectedPaint.id === paint.id && (
                    <CheckCircle size={20} color="#8B5CF6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Thermometer size={20} color="#EF4444" />
            <Text style={styles.sectionTitle}>Temperature</Text>
          </View>

          <View style={styles.tempPresetsRow}>
            {temperaturePresets.map((preset) => {
              const IconComponent = preset.icon;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.tempPresetButton,
                    selectedTempPreset === preset.id && { 
                      backgroundColor: `${preset.color}20`,
                      borderColor: preset.color,
                    },
                  ]}
                  onPress={() => selectTempPreset(preset)}
                >
                  <IconComponent 
                    size={18} 
                    color={selectedTempPreset === preset.id ? preset.color : Colors.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.tempPresetLabel,
                      selectedTempPreset === preset.id && { color: preset.color },
                    ]}
                  >
                    {preset.label}
                  </Text>
                  <Text
                    style={[
                      styles.tempPresetValue,
                      selectedTempPreset === preset.id && { color: preset.color },
                    ]}
                  >
                    {preset.temp}°F
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customInputRow}>
            <Text style={styles.customInputLabel}>Custom Temperature:</Text>
            <View style={styles.tempInputContainer}>
              <TextInput
                style={styles.tempInput}
                value={temperature}
                onChangeText={(text) => {
                  setTemperature(text);
                  setSelectedTempPreset("");
                }}
                keyboardType="decimal-pad"
                placeholder="72"
                placeholderTextColor={Colors.textTertiary}
              />
              <Text style={styles.tempUnit}>°F</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Droplets size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Humidity</Text>
          </View>

          <View style={styles.humidityPresetsGrid}>
            {humidityPresets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.humidityPresetButton,
                  selectedHumidityPreset === preset.id && styles.humidityPresetButtonSelected,
                ]}
                onPress={() => selectHumidityPreset(preset)}
              >
                <Droplets 
                  size={16} 
                  color={selectedHumidityPreset === preset.id ? "#0EA5E9" : Colors.textTertiary}
                  fill={selectedHumidityPreset === preset.id ? "#0EA5E920" : "transparent"}
                />
                <Text
                  style={[
                    styles.humidityPresetLabel,
                    selectedHumidityPreset === preset.id && styles.humidityPresetLabelSelected,
                  ]}
                >
                  {preset.label}
                </Text>
                <Text
                  style={[
                    styles.humidityPresetValue,
                    selectedHumidityPreset === preset.id && styles.humidityPresetValueSelected,
                  ]}
                >
                  {preset.humidity}%
                </Text>
                <Text style={styles.humidityPresetDesc}>{preset.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customInputRow}>
            <Text style={styles.customInputLabel}>Custom Humidity:</Text>
            <View style={styles.tempInputContainer}>
              <TextInput
                style={styles.tempInput}
                value={humidity}
                onChangeText={(text) => {
                  setHumidity(text);
                  setSelectedHumidityPreset("");
                }}
                keyboardType="decimal-pad"
                placeholder="50"
                placeholderTextColor={Colors.textTertiary}
              />
              <Text style={styles.tempUnit}>%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Layers size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Current Coat</Text>
          </View>

          <View style={styles.coatSelector}>
            {[1, 2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.coatButton,
                  coatNumber === num && styles.coatButtonSelected,
                ]}
                onPress={() => setCoatNumber(num)}
              >
                <Text
                  style={[
                    styles.coatButtonText,
                    coatNumber === num && styles.coatButtonTextSelected,
                  ]}
                >
                  Coat {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.resultsSection}>
          <View style={styles.sectionHeader}>
            <Timer size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Drying Times</Text>
            {calculations.isOptimal && (
              <View style={styles.optimalBadge}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.optimalText}>Optimal</Text>
              </View>
            )}
          </View>

          <View style={styles.resultsGrid}>
            <View style={[styles.resultCard, styles.resultCardTouchDry]}>
              <View style={styles.resultIconContainer}>
                <Clock size={24} color="#272D53" />
              </View>
              <Text style={styles.resultLabel}>Touch Dry</Text>
              <Text style={styles.resultValue}>{calculations.touchDry}</Text>
              <Text style={styles.resultHint}>Surface dry to touch</Text>
            </View>

            <View style={[styles.resultCard, styles.resultCardRecoat]}>
              <View style={styles.resultIconContainerPrimary}>
                <Layers size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.resultLabelPrimary}>Recoat Time</Text>
              <Text style={styles.resultValuePrimary}>{calculations.recoat}</Text>
              <Text style={styles.resultHintPrimary}>Safe to apply coat {coatNumber + 1}</Text>
            </View>

            <View style={[styles.resultCard, styles.resultCardCure]}>
              <View style={styles.resultIconContainer}>
                <CheckCircle size={24} color="#10B981" />
              </View>
              <Text style={styles.resultLabel}>Full Cure</Text>
              <Text style={styles.resultValue}>{calculations.cure}</Text>
              <Text style={styles.resultHint}>Complete hardening</Text>
            </View>
          </View>

          {calculations.warnings.length > 0 && (
            <View style={styles.warningsCard}>
              <View style={styles.warningsHeader}>
                <AlertTriangle size={18} color="#272D53" />
                <Text style={styles.warningsTitle}>Warnings</Text>
              </View>
              {calculations.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Text style={styles.warningBullet}>⚠️</Text>
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          {calculations.recommendations.length > 0 && (
            <View style={styles.recommendationsCard}>
              <View style={styles.recommendationsHeader}>
                <Info size={18} color="#0EA5E9" />
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
              </View>
              {calculations.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>💡</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.factorsCard}>
            <Text style={styles.factorsTitle}>Adjustment Factors</Text>
            <View style={styles.factorRow}>
              <View style={styles.factorItem}>
                <Thermometer size={16} color={Colors.textSecondary} />
                <Text style={styles.factorLabel}>Temperature</Text>
                <Text style={[
                  styles.factorValue,
                  calculations.tempFactor > 1 ? styles.factorSlow : styles.factorFast
                ]}>
                  {calculations.tempFactor > 1 ? `+${Math.round((calculations.tempFactor - 1) * 100)}%` : `-${Math.round((1 - calculations.tempFactor) * 100)}%`}
                </Text>
              </View>
              <View style={styles.factorDivider} />
              <View style={styles.factorItem}>
                <Droplets size={16} color={Colors.textSecondary} />
                <Text style={styles.factorLabel}>Humidity</Text>
                <Text style={[
                  styles.factorValue,
                  calculations.humidityFactor > 1 ? styles.factorSlow : styles.factorFast
                ]}>
                  {calculations.humidityFactor > 1 ? `+${Math.round((calculations.humidityFactor - 1) * 100)}%` : `-${Math.round((1 - calculations.humidityFactor) * 100)}%`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Pro Tips</Text>
          </View>

          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🌡️</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Ideal Conditions</Text>
                <Text style={styles.tipText}>65-85°F with 40-60% humidity for best results</Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🌬️</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Ventilation</Text>
                <Text style={styles.tipText}>Good airflow speeds drying without causing dust</Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🧪</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Test Before Recoating</Text>
                <Text style={styles.tipText}>Lightly touch an inconspicuous area - should not be tacky</Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>⏰</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>When in Doubt</Text>
                <Text style={styles.tipText}>Wait longer - recoating too early causes peeling</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
          <RotateCcw size={18} color={Colors.textSecondary} />
          <Text style={styles.resetButtonText}>Reset Calculator</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF615",
    margin: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#8B5CF630",
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#8B5CF620",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  optimalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B98115",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optimalText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paintIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  paintEmoji: {
    fontSize: 22,
  },
  pickerTextContent: {
    flex: 1,
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  pickerDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  optionsList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 350,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionItemSelected: {
    backgroundColor: "#8B5CF610",
  },
  optionContent: {
    flex: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionTextContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  optionTiming: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8B5CF6",
    marginTop: 6,
    marginLeft: 32,
  },
  tempPresetsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tempPresetButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  tempPresetLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tempPresetValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  customInputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tempInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  tempInput: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    paddingVertical: 8,
    minWidth: 50,
    textAlign: "right",
  },
  tempUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  humidityPresetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  humidityPresetButton: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  humidityPresetButtonSelected: {
    backgroundColor: "#0EA5E910",
    borderColor: "#0EA5E9",
  },
  humidityPresetLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  humidityPresetLabelSelected: {
    color: "#0EA5E9",
  },
  humidityPresetValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  humidityPresetValueSelected: {
    color: "#0EA5E9",
  },
  humidityPresetDesc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  coatSelector: {
    flexDirection: "row",
    gap: 10,
  },
  coatButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coatButtonSelected: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  coatButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  coatButtonTextSelected: {
    color: Colors.white,
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resultsGrid: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardTouchDry: {
    borderLeftWidth: 4,
    borderLeftColor: "#272D53",
  },
  resultCardRecoat: {
    backgroundColor: "#8B5CF6",
    borderLeftWidth: 0,
  },
  resultCardCure: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  resultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  resultIconContainerPrimary: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  resultLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
    flex: 1,
  },
  resultLabelPrimary: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
    flex: 1,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    position: "absolute",
    right: 18,
    top: 12,
  },
  resultValuePrimary: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.white,
    position: "absolute",
    right: 18,
    top: 12,
  },
  resultHint: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  resultHintPrimary: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  warningsCard: {
    backgroundColor: "#272D5310",
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#272D5330",
  },
  warningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  warningsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#272D53",
  },
  warningItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  warningBullet: {
    fontSize: 14,
  },
  warningText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  recommendationsCard: {
    backgroundColor: "#0EA5E910",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#0EA5E930",
  },
  recommendationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recommendationsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  recommendationItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  recommendationBullet: {
    fontSize: 14,
  },
  recommendationText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  factorsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  factorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  factorItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  factorDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  factorLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  factorValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  factorSlow: {
    color: "#EF4444",
  },
  factorFast: {
    color: "#10B981",
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  tipItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 14,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});
