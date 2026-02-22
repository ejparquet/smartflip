import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { DollarSign, MapPin, Calendar, X, Truck, Plus, Trash2, ChevronDown, Users, Check } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "@/components/Button";
import BackButton from "@/components/BackButton";
import { useProjects } from "@/contexts/ProjectContext";
import { mockProfessionals, professionalTypes } from "@/mocks/professionals";
import { Professional } from "@/types";

type DebrisType = "demolition" | "construction" | "yard_waste" | "mixed" | "concrete" | "appliances" | "hazardous";

interface DumperLoad {
  id: string;
  date: string;
  debrisType: DebrisType;
  volume: string;
  weight?: string;
  haulerName: string;
  haulerPhone?: string;
  dumpSite: string;
  costPerLoad: number;
  dumpFee?: number;
  totalCost: number;
  truckSize?: string;
  notes?: string;
}

const debrisTypeConfig: Record<DebrisType, { label: string; color: string }> = {
  demolition: { label: "Demolition", color: "#EF4444" },
  construction: { label: "Construction", color: "#272D53" },
  yard_waste: { label: "Yard Waste", color: "#22C55E" },
  mixed: { label: "Mixed", color: "#8B5CF6" },
  concrete: { label: "Concrete/Masonry", color: "#6B7280" },
  appliances: { label: "Appliances", color: "#3B82F6" },
  hazardous: { label: "Hazardous", color: "#DC2626" },
};

const truckSizes = [
  "10 Yard Dumpster",
  "15 Yard Dumpster",
  "20 Yard Dumpster",
  "30 Yard Dumpster",
  "40 Yard Dumpster",
  "Dump Truck - Small",
  "Dump Truck - Standard",
  "Dump Truck - Large",
  "Roll-Off Container",
  "Trailer Load",
];

export default function AddProjectScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addProject } = useProjects();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [estimatedARV, setEstimatedARV] = useState("");
  const [renovationBudget, setRenovationBudget] = useState("");
  const [startDate, setStartDate] = useState("");

  const [dumperLoads, setDumperLoads] = useState<DumperLoad[]>([]);
  const [showAddLoadModal, setShowAddLoadModal] = useState(false);
  const [showDebrisTypePicker, setShowDebrisTypePicker] = useState(false);
  const [showTruckSizePicker, setShowTruckSizePicker] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Professional[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [newLoad, setNewLoad] = useState({
    date: "",
    debrisType: "mixed" as DebrisType,
    volume: "",
    weight: "",
    haulerName: "",
    haulerPhone: "",
    dumpSite: "",
    costPerLoad: "",
    dumpFee: "",
    truckSize: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Please enter the property address");
      return;
    }
    if (!purchasePrice) {
      Alert.alert("Error", "Please enter the purchase price");
      return;
    }

    setLoading(true);
    try {
      const purchase = parseFloat(purchasePrice.replace(/,/g, "")) || 0;
      const arv = parseFloat(estimatedARV.replace(/,/g, "")) || 0;
      const budget = parseFloat(renovationBudget.replace(/,/g, "")) || 0;
      const estimatedProfit = arv - purchase - budget;

      await addProject({
        ownerId: "user-1",
        name: name.trim(),
        address: address.trim(),
        status: "planning",
        purchasePrice: purchase,
        estimatedARV: arv,
        renovationBudget: budget,
        actualSpent: 0,
        progressPercentage: 0,
        estimatedProfit: Math.max(0, estimatedProfit),
        startDate: startDate || new Date().toISOString().split("T")[0],
        images: [],
        team: selectedTeamMembers.map((pro) => ({
          id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: "",
          professionalId: pro.id,
          professional: pro,
          role: pro.professionalType,
          status: "invited" as const,
          addedAt: new Date().toISOString(),
        })),
        contracts: [],
        permits: [],
        inspections: [],
      });

      Alert.alert("Success", "Project created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAddLoad = () => {
    if (!newLoad.haulerName || !newLoad.costPerLoad) {
      Alert.alert("Error", "Please fill in hauler name and cost");
      return;
    }

    const costPerLoad = parseFloat(newLoad.costPerLoad) || 0;
    const dumpFee = parseFloat(newLoad.dumpFee) || 0;

    const load: DumperLoad = {
      id: Date.now().toString(),
      date: newLoad.date || new Date().toISOString().split("T")[0],
      debrisType: newLoad.debrisType,
      volume: newLoad.volume || "Not specified",
      weight: newLoad.weight || undefined,
      haulerName: newLoad.haulerName,
      haulerPhone: newLoad.haulerPhone || undefined,
      dumpSite: newLoad.dumpSite || "Not specified",
      costPerLoad,
      dumpFee: dumpFee || undefined,
      totalCost: costPerLoad + dumpFee,
      truckSize: newLoad.truckSize || undefined,
      notes: newLoad.notes || undefined,
    };

    setDumperLoads([...dumperLoads, load]);
    setNewLoad({
      date: "",
      debrisType: "mixed",
      volume: "",
      weight: "",
      haulerName: "",
      haulerPhone: "",
      dumpSite: "",
      costPerLoad: "",
      dumpFee: "",
      truckSize: "",
      notes: "",
    });
    setShowAddLoadModal(false);
  };

  const removeLoad = (id: string) => {
    setDumperLoads(dumperLoads.filter((l) => l.id !== id));
  };

  const totalLoadsCost = dumperLoads.reduce((sum, l) => sum + l.totalCost, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.customHeader, { backgroundColor: theme.background }]}>
          <BackButton color={theme.navy} backgroundColor={theme.surfaceSecondary} />
          <Text style={[styles.customHeaderTitle, { color: theme.text }]}>Add Project</Text>
          <View style={{ width: 40 }} />
        </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Project Details</Text>
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabelBold, { color: theme.text }]}>Project Name *</Text>
                <TextInput
                  style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  placeholder="e.g., Oak Valley Flip"
                  placeholderTextColor={theme.textTertiary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={[styles.inputLabelBold, { color: theme.text }]}>Property Address *</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: theme.surfaceSecondary }]}>
                  <MapPin size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={[styles.inputInner, { color: theme.text }]}
                    placeholder="Enter the property address"
                    placeholderTextColor={theme.textTertiary}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Financials</Text>
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabelBold, { color: theme.text }]}>Purchase Price *</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: theme.surfaceSecondary }]}>
                  <DollarSign size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={[styles.inputInner, { color: theme.text }]}
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary}
                    value={purchasePrice}
                    onChangeText={(text) => setPurchasePrice(formatCurrencyInput(text))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Estimated ARV</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: theme.surfaceSecondary }]}>
                  <DollarSign size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={[styles.inputInner, { color: theme.text }]}
                    placeholder="After Repair Value"
                    placeholderTextColor={theme.textTertiary}
                    value={estimatedARV}
                    onChangeText={(text) => setEstimatedARV(formatCurrencyInput(text))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Renovation Budget</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: theme.surfaceSecondary }]}>
                  <DollarSign size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={[styles.inputInner, { color: theme.text }]}
                    placeholder="Estimated renovation cost"
                    placeholderTextColor={theme.textTertiary}
                    value={renovationBudget}
                    onChangeText={(text) => setRenovationBudget(formatCurrencyInput(text))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Start Date</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: theme.surfaceSecondary }]}>
                  <Calendar size={18} color={theme.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={[styles.inputInner, { color: theme.text }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.textTertiary}
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
              </View>
            </View>
          </View>

          {purchasePrice && estimatedARV && renovationBudget ? ( 
            <View style={[styles.profitPreview, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.profitLabel, { color: theme.textSecondary }]}>Estimated Profit</Text>
              <Text style={[styles.profitValue, { color: theme.success }]}>
                ${Math.max(
                  0,
                  parseFloat(estimatedARV.replace(/,/g, "")) -
                    parseFloat(purchasePrice.replace(/,/g, "")) -
                    parseFloat(renovationBudget.replace(/,/g, ""))
                ).toLocaleString()}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Dumper Loads</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Schedule debris removal for this project (optional)</Text>

            {dumperLoads.length > 0 && (
              <View style={styles.loadsContainer}>
                {dumperLoads.map((load) => {
                  const debrisConfig = debrisTypeConfig[load.debrisType];
                  return (
                    <View key={load.id} style={[styles.loadCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <View style={styles.loadCardHeader}>
                        <View style={styles.loadCardLeft}>
                          <View style={[styles.debrisBadge, { backgroundColor: `${debrisConfig.color}15` }]}>
                            <Text style={[styles.debrisText, { color: debrisConfig.color }]}>{debrisConfig.label}</Text>
                          </View>
                          <Text style={[styles.loadDate, { color: theme.textSecondary }]}>{load.date}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeLoad(load.id)} style={styles.removeLoadBtn}>
                          <Trash2 size={16} color="#EF4444" strokeWidth={1.5} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.loadCardDetails}>
                        <View style={styles.loadDetailRow}>
                          <Truck size={14} color={theme.textSecondary} strokeWidth={1.5} />
                          <Text style={[styles.loadDetailText, { color: theme.text }]}>{load.haulerName}</Text>
                        </View>
                        {load.truckSize && (
                          <Text style={[styles.loadTruckSize, { color: theme.textSecondary }]}>{load.truckSize}</Text>
                        )}
                      </View>
                      <View style={[styles.loadCardFooter, { borderTopColor: theme.borderLight }]}>
                        <Text style={[styles.loadVolume, { color: theme.textSecondary }]}>{load.volume}</Text>
                        <Text style={[styles.loadCost, { color: theme.text }]}>${load.totalCost.toFixed(2)}</Text>
                      </View>
                    </View>
                  );
                })}
                <View style={styles.loadsSummary}>
                  <Text style={styles.loadsSummaryLabel}>{dumperLoads.length} load{dumperLoads.length !== 1 ? "s" : ""} scheduled</Text>
                  <Text style={styles.loadsSummaryValue}>Total: ${totalLoadsCost.toLocaleString()}</Text>
                </View>
              </View>
            )}

            <View style={styles.dumperLoadActions}>
              <TouchableOpacity style={[styles.addLoadButton, { borderColor: theme.navy, backgroundColor: theme.surfaceSecondary }]} onPress={() => setShowAddLoadModal(true)}>
                <Plus size={20} color={theme.navy} strokeWidth={2} />
                <Text style={[styles.addLoadButtonText, { color: theme.navy }]}>Add Dumper Load</Text>
              </TouchableOpacity>
              {dumperLoads.length === 0 && (
                <TouchableOpacity style={[styles.addLaterButton, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.addLaterButtonText, { color: theme.textSecondary }]}>Add Later</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Team Members</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Add professionals to your project team</Text>

            {selectedTeamMembers.length > 0 && (
              <View style={styles.selectedTeamContainer}>
                {selectedTeamMembers.map((member) => {
                  const proType = professionalTypes.find((t) => t.type === member.professionalType);
                  return (
                    <View key={member.id} style={[styles.teamMemberCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <View style={styles.teamMemberInfo}>
                        <View style={[styles.teamMemberAvatar, { backgroundColor: theme.navy }]}>
                          <Text style={styles.teamMemberInitial}>{member.name.charAt(0)}</Text>
                        </View>
                        <View style={styles.teamMemberDetails}>
                          <Text style={[styles.teamMemberName, { color: theme.text }]}>{member.name}</Text>
                          <Text style={[styles.teamMemberRole, { color: theme.textSecondary }]}>{proType?.label || member.professionalType}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => setSelectedTeamMembers(selectedTeamMembers.filter((m) => m.id !== member.id))}
                        style={styles.removeTeamBtn}
                      >
                        <X size={16} color="#EF4444" strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity style={[styles.addLoadButton, { borderColor: theme.navy, backgroundColor: theme.surfaceSecondary }]} onPress={() => setShowTeamModal(true)}>
              <Users size={20} color={theme.navy} strokeWidth={2} />
              <Text style={[styles.addLoadButtonText, { color: theme.navy }]}>
                {selectedTeamMembers.length > 0 ? "Add More Team Members" : "Add Team Members"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={[styles.bottomActions, { backgroundColor: theme.surface, borderTopColor: theme.borderLight }]}>
          <Button
            title="Create Project"
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showAddLoadModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddLoadModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowAddLoadModal(false)}>
              <X size={24} color={theme.textSecondary} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Dumper Load</Text>
            <TouchableOpacity onPress={handleAddLoad}>
              <Text style={[styles.modalSaveText, { color: theme.navy }]}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Date</Text>
                <TextInput
                  style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textTertiary}
                  value={newLoad.date}
                  onChangeText={(text) => setNewLoad({ ...newLoad, date: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Debris Type *</Text>
                <TouchableOpacity
                  style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => setShowDebrisTypePicker(!showDebrisTypePicker)}
                >
                  <Text style={[styles.dropdownText, { color: theme.text }]}>{debrisTypeConfig[newLoad.debrisType].label}</Text>
                  <ChevronDown size={18} color={theme.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
                {showDebrisTypePicker && (
                  <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {(Object.keys(debrisTypeConfig) as DebrisType[]).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.dropdownItem, { borderBottomColor: theme.borderLight }]}
                        onPress={() => {
                          setNewLoad({ ...newLoad, debrisType: type });
                          setShowDebrisTypePicker(false);
                        }}
                      >
                        <View style={styles.debrisOptionRow}>
                          <View style={[styles.debrisDot, { backgroundColor: debrisTypeConfig[type].color }]} />
                          <Text style={[styles.optionLabel, { color: theme.text }]}>{debrisTypeConfig[type].label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Truck/Container Size</Text>
                <TouchableOpacity
                  style={[styles.cardDropdown, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => setShowTruckSizePicker(!showTruckSizePicker)}
                >
                  <Text style={[styles.dropdownText, { color: newLoad.truckSize ? theme.text : theme.textTertiary }]}>
                    {newLoad.truckSize || "Select size"}
                  </Text>
                  <ChevronDown size={18} color={theme.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
                {showTruckSizePicker && (
                  <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {truckSizes.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[styles.dropdownItem, { borderBottomColor: theme.borderLight }]}
                        onPress={() => {
                          setNewLoad({ ...newLoad, truckSize: size });
                          setShowTruckSizePicker(false);
                        }}
                      >
                        <Text style={[styles.optionLabel, { color: theme.text }]}>{size}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Volume</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g., 20 cu yds"
                    placeholderTextColor={theme.textTertiary}
                    value={newLoad.volume}
                    onChangeText={(text) => setNewLoad({ ...newLoad, volume: text })}
                  />
                </View>
                <View style={styles.halfInputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Weight</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="e.g., 4.5 tons"
                    placeholderTextColor={theme.textTertiary}
                    value={newLoad.weight}
                    onChangeText={(text) => setNewLoad({ ...newLoad, weight: text })}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, marginTop: 16 }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabelBold, { color: theme.text }]}>Hauler Name *</Text>
                <TextInput
                  style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  placeholder="e.g., ABC Hauling"
                  placeholderTextColor={theme.textTertiary}
                  value={newLoad.haulerName}
                  onChangeText={(text) => setNewLoad({ ...newLoad, haulerName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Hauler Phone</Text>
                <TextInput
                  style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="phone-pad"
                  value={newLoad.haulerPhone}
                  onChangeText={(text) => setNewLoad({ ...newLoad, haulerPhone: text })}
                />
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Dump Site</Text>
                <TextInput
                  style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  placeholder="e.g., City Landfill"
                  placeholderTextColor={theme.textTertiary}
                  value={newLoad.dumpSite}
                  onChangeText={(text) => setNewLoad({ ...newLoad, dumpSite: text })}
                />
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, marginTop: 16 }]}>
              <View style={styles.rowInputs}>
                <View style={styles.halfInputGroup}>
                  <Text style={[styles.inputLabelBold, { color: theme.text }]}>Hauling Cost *</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="$0.00"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="decimal-pad"
                    value={newLoad.costPerLoad}
                    onChangeText={(text) => setNewLoad({ ...newLoad, costPerLoad: text })}
                  />
                </View>
                <View style={styles.halfInputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Dump Fee</Text>
                  <TextInput
                    style={[styles.cardInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                    placeholder="$0.00"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="decimal-pad"
                    value={newLoad.dumpFee}
                    onChangeText={(text) => setNewLoad({ ...newLoad, dumpFee: text })}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Notes</Text>
                <TextInput
                  style={[styles.cardInput, styles.multilineInput, { backgroundColor: theme.surfaceSecondary, color: theme.text }]}
                  placeholder="Additional details..."
                  placeholderTextColor={theme.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={newLoad.notes}
                  onChangeText={(text) => setNewLoad({ ...newLoad, notes: text })}
                />
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showTeamModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTeamModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowTeamModal(false)}>
              <X size={24} color={theme.textSecondary} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Team Members</Text>
            <TouchableOpacity onPress={() => setShowTeamModal(false)}>
              <Text style={[styles.modalSaveText, { color: theme.navy }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.teamModalSubtitle, { color: theme.textSecondary }]}>
              Select multiple professionals to add to your project
            </Text>
            {mockProfessionals.map((professional) => {
              const isSelected = selectedTeamMembers.some((m) => m.id === professional.id);
              const proType = professionalTypes.find((t) => t.type === professional.professionalType);
              return (
                <TouchableOpacity
                  key={professional.id}
                  style={[
                    styles.teamSelectItem,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isSelected && { borderColor: theme.navy, backgroundColor: `${theme.navy}10` },
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedTeamMembers(selectedTeamMembers.filter((m) => m.id !== professional.id));
                    } else {
                      setSelectedTeamMembers([...selectedTeamMembers, professional]);
                    }
                  }}
                >
                  <View style={styles.teamSelectLeft}>
                    <View style={[
                      styles.teamSelectAvatar,
                      { backgroundColor: theme.surfaceSecondary },
                      isSelected && { backgroundColor: theme.navy },
                    ]}>
                      <Text style={[
                        styles.teamSelectInitial,
                        { color: theme.textSecondary },
                        isSelected && { color: "#FFFFFF" },
                      ]}>
                        {professional.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.teamSelectInfo}>
                      <Text style={[styles.teamSelectName, { color: theme.text }]}>{professional.name}</Text>
                      <Text style={[styles.teamSelectRole, { color: theme.textSecondary }]}>{proType?.label || professional.professionalType}</Text>
                      <View style={styles.teamSelectMeta}>
                        <Text style={styles.teamSelectRating}>★ {professional.rating}</Text>
                        <Text style={[styles.teamSelectExp, { color: theme.textTertiary }]}>{professional.yearsExperience} yrs exp</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[
                    styles.teamSelectCheckbox,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: theme.navy, borderColor: theme.navy },
                  ]}>
                    {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>

          {selectedTeamMembers.length > 0 && (
            <View style={[styles.teamModalFooter, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
              <Text style={[styles.teamModalFooterText, { color: theme.navy }]}>
                {selectedTeamMembers.length} member{selectedTeamMembers.length !== 1 ? "s" : ""} selected
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginTop: -4,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  inputLabelBold: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  cardInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top" as const,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
  },
  cardDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownList: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  debrisOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  debrisDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInputGroup: {
    flex: 1,
  },
  profitPreview: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  profitLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 32,
    fontWeight: "800" as const,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  loadsContainer: {
    marginBottom: 12,
  },
  loadCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  loadCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  loadCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  debrisBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  debrisText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  loadDate: {
    fontSize: 13,
  },
  removeLoadBtn: {
    padding: 6,
  },
  loadCardDetails: {
    marginBottom: 10,
  },
  loadDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadDetailText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  loadTruckSize: {
    fontSize: 13,
    marginTop: 4,
    marginLeft: 22,
  },
  loadCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  loadVolume: {
    fontSize: 13,
  },
  loadCost: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  loadsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  loadsSummaryLabel: {
    fontSize: 14,
    color: "#166534",
  },
  loadsSummaryValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#166534",
  },
  dumperLoadActions: {
    flexDirection: "row" as const,
    gap: 12,
  },
  addLoadButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed" as const,
  },
  addLaterButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  addLaterButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  addLoadButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalContent: {
    padding: 16,
  },
  selectedTeamContainer: {
    marginBottom: 12,
  },
  teamMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  teamMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  teamMemberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  teamMemberInitial: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  teamMemberDetails: {
    gap: 2,
  },
  teamMemberName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  teamMemberRole: {
    fontSize: 13,
  },
  removeTeamBtn: {
    padding: 8,
  },
  teamModalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  teamSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  teamSelectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  teamSelectAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  teamSelectInitial: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  teamSelectInfo: {
    flex: 1,
    gap: 2,
  },
  teamSelectName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  teamSelectRole: {
    fontSize: 13,
  },
  teamSelectMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  teamSelectRating: {
    fontSize: 12,
    color: "#272D53",
    fontWeight: "600" as const,
  },
  teamSelectExp: {
    fontSize: 12,
  },
  teamSelectCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  teamModalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  teamModalFooterText: {
    fontSize: 15,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
});
