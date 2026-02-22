import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  X,
  Ruler,
  Square,
  Move,
  Save,
  Home,
  Maximize2,
  Grid3X3,
  Edit3,
  Eye,
} from "lucide-react-native";
import { Alert } from "react-native";
import Colors from "@/constants/colors";

interface Room {
  id: string;
  name: string;
  width: number;
  length: number;
  height: number;
  shape: "rectangular" | "l_shaped" | "custom";
  sqft: number;
  notes?: string;
}

const mockRooms: Room[] = [
  { id: "1", name: "Living Room", width: 22, length: 18, height: 10, shape: "rectangular", sqft: 396 },
  { id: "2", name: "Primary Bedroom", width: 16, length: 14, height: 9, shape: "rectangular", sqft: 224 },
  { id: "3", name: "Kitchen", width: 14, length: 12, height: 9, shape: "rectangular", sqft: 168 },
  { id: "4", name: "Dining Room", width: 12, length: 14, height: 9, shape: "rectangular", sqft: 168 },
  { id: "5", name: "Home Office", width: 10, length: 12, height: 9, shape: "rectangular", sqft: 120 },
];

export default function RoomPlannerScreen() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<{
    name: string;
    width: string;
    length: string;
    height: string;
    shape: "rectangular" | "l_shaped" | "custom";
  }>({
    name: "",
    width: "",
    length: "",
    height: "9",
    shape: "rectangular",
  });

  const totalSqft = rooms.reduce((sum, room) => sum + room.sqft, 0);

  const calculateSqft = (width: number, length: number) => width * length;

  const handleAddRoom = () => {
    const width = parseFloat(newRoom.width) || 0;
    const length = parseFloat(newRoom.length) || 0;
    const height = parseFloat(newRoom.height) || 9;

    if (newRoom.name && width > 0 && length > 0) {
      const room: Room = {
        id: Date.now().toString(),
        name: newRoom.name,
        width,
        length,
        height,
        shape: newRoom.shape,
        sqft: calculateSqft(width, length),
      };
      setRooms([...rooms, room]);
      setNewRoom({ name: "", width: "", length: "", height: "9", shape: "rectangular" });
      setShowAddModal(false);
    }
  };

  const handleDeleteRoom = (id: string) => {
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setRooms(rooms.filter((r) => r.id !== id));
            setSelectedRoom(null);
          },
        },
      ]
    );
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setNewRoom({
      name: room.name,
      width: room.width.toString(),
      length: room.length.toString(),
      height: room.height.toString(),
      shape: room.shape,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingRoom) return;
    const width = parseFloat(newRoom.width) || 0;
    const length = parseFloat(newRoom.length) || 0;
    const height = parseFloat(newRoom.height) || 9;

    if (newRoom.name && width > 0 && length > 0) {
      setRooms(rooms.map(r => 
        r.id === editingRoom.id 
          ? { ...r, name: newRoom.name, width, length, height, shape: newRoom.shape, sqft: calculateSqft(width, length) }
          : r
      ));
      setShowEditModal(false);
      setEditingRoom(null);
      setNewRoom({ name: "", width: "", length: "", height: "9", shape: "rectangular" });
    }
  };

  const handleViewFloorPlan = (room: Room) => {
    setSelectedRoom(room);
    setShowFloorPlanModal(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Room Planner",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Home size={20} color="#EC4899" />
            <Text style={styles.summaryValue}>{rooms.length}</Text>
            <Text style={styles.summaryLabel}>Rooms</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Maximize2 size={20} color="#EC4899" />
            <Text style={styles.summaryValue}>{totalSqft.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Sq Ft</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.roomsHeader}>
          <Text style={styles.sectionTitle}>Room Measurements</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={18} color={Colors.white} />
            <Text style={styles.addButtonText}>Add Room</Text>
          </TouchableOpacity>
        </View>

        {rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={styles.roomCard}
            onPress={() => setSelectedRoom(room)}
          >
            <View style={styles.roomHeader}>
              <View style={styles.roomIcon}>
                <Square size={20} color="#EC4899" />
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomShape}>
                  {room.shape.replace("_", "-").charAt(0).toUpperCase() +
                    room.shape.slice(1).replace("_", " ")}
                </Text>
              </View>
              <View style={styles.roomSqft}>
                <Text style={styles.sqftValue}>{room.sqft}</Text>
                <Text style={styles.sqftLabel}>sq ft</Text>
              </View>
            </View>

            <View style={styles.dimensionsRow}>
              <View style={styles.dimension}>
                <Ruler size={14} color={Colors.textSecondary} />
                <Text style={styles.dimensionText}>
                  {room.width}&apos; W × {room.length}&apos; L × {room.height}&apos; H
                </Text>
              </View>
            </View>

            <View style={styles.roomActions}>
              <TouchableOpacity 
                style={styles.roomAction}
                onPress={() => handleEditRoom(room)}
              >
                <Edit3 size={16} color={Colors.textSecondary} />
                <Text style={styles.roomActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.roomAction}
                onPress={() => handleViewFloorPlan(room)}
              >
                <Grid3X3 size={16} color={Colors.textSecondary} />
                <Text style={styles.roomActionText}>Floor Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.roomAction}
                onPress={() => handleDeleteRoom(room.id)}
              >
                <X size={16} color={Colors.error} />
                <Text style={[styles.roomActionText, { color: Colors.error }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {rooms.length === 0 && (
          <View style={styles.emptyState}>
            <Square size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Rooms Added</Text>
            <Text style={styles.emptyText}>
              Add rooms with measurements to start planning
            </Text>
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Measurement Tips</Text>
          <View style={styles.tipRow}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Measure at floor level for most accurate dimensions
            </Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Note any architectural features (alcoves, bay windows)
            </Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Document door swing direction and window locations
            </Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>
              Include ceiling height variations if applicable
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowAddModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Room</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Room Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Living Room"
                placeholderTextColor={Colors.textTertiary}
                value={newRoom.name}
                onChangeText={(text) => setNewRoom({ ...newRoom, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Room Shape</Text>
              <View style={styles.shapeOptions}>
                {(["rectangular", "l_shaped", "custom"] as const).map((shape) => (
                  <TouchableOpacity
                    key={shape}
                    style={[
                      styles.shapeOption,
                      newRoom.shape === shape && styles.shapeOptionActive,
                    ]}
                    onPress={() => setNewRoom({ ...newRoom, shape })}
                  >
                    <Text
                      style={[
                        styles.shapeOptionText,
                        newRoom.shape === shape && styles.shapeOptionTextActive,
                      ]}
                    >
                      {shape === "l_shaped"
                        ? "L-Shaped"
                        : shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dimensions (feet)</Text>
              <View style={styles.dimensionInputs}>
                <View style={styles.dimensionInput}>
                  <Text style={styles.dimensionInputLabel}>Width</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={newRoom.width}
                    onChangeText={(text) => setNewRoom({ ...newRoom, width: text })}
                  />
                </View>
                <Text style={styles.dimensionX}>×</Text>
                <View style={styles.dimensionInput}>
                  <Text style={styles.dimensionInputLabel}>Length</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={newRoom.length}
                    onChangeText={(text) => setNewRoom({ ...newRoom, length: text })}
                  />
                </View>
                <Text style={styles.dimensionX}>×</Text>
                <View style={styles.dimensionInput}>
                  <Text style={styles.dimensionInputLabel}>Height</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="9"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={newRoom.height}
                    onChangeText={(text) => setNewRoom({ ...newRoom, height: text })}
                  />
                </View>
              </View>
            </View>

            {newRoom.width && newRoom.length && (
              <View style={styles.calculatedSqft}>
                <Text style={styles.calculatedLabel}>Calculated Area</Text>
                <Text style={styles.calculatedValue}>
                  {calculateSqft(
                    parseFloat(newRoom.width) || 0,
                    parseFloat(newRoom.length) || 0
                  )}{" "}
                  sq ft
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.formFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddRoom}>
              <Save size={18} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save Room</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => {
                setShowEditModal(false);
                setEditingRoom(null);
                setNewRoom({ name: "", width: "", length: "", height: "9", shape: "rectangular" });
              }}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Room</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Room Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Living Room"
                placeholderTextColor={Colors.textTertiary}
                value={newRoom.name}
                onChangeText={(text) => setNewRoom({ ...newRoom, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Room Shape</Text>
              <View style={styles.shapeOptions}>
                {(["rectangular", "l_shaped", "custom"] as const).map((shape) => (
                  <TouchableOpacity
                    key={shape}
                    style={[
                      styles.shapeOption,
                      newRoom.shape === shape && styles.shapeOptionActive,
                    ]}
                    onPress={() => setNewRoom({ ...newRoom, shape })}
                  >
                    <Text
                      style={[
                        styles.shapeOptionText,
                        newRoom.shape === shape && styles.shapeOptionTextActive,
                      ]}
                    >
                      {shape === "l_shaped"
                        ? "L-Shaped"
                        : shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dimensions (feet)</Text>
              <View style={styles.dimensionInputs}>
                <View style={styles.dimensionInput}>
                  <Text style={styles.dimensionInputLabel}>Width</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={newRoom.width}
                    onChangeText={(text) => setNewRoom({ ...newRoom, width: text })}
                  />
                </View>
                <Text style={styles.dimensionX}>×</Text>
                <View style={styles.dimensionInput}>
                  <Text style={styles.dimensionInputLabel}>Length</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={newRoom.length}
                    onChangeText={(text) => setNewRoom({ ...newRoom, length: text })}
                  />
                </View>
                <Text style={styles.dimensionX}>×</Text>
                <View style={styles.dimensionInput}>
                  <Text style={styles.dimensionInputLabel}>Height</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="9"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    value={newRoom.height}
                    onChangeText={(text) => setNewRoom({ ...newRoom, height: text })}
                  />
                </View>
              </View>
            </View>

            {newRoom.width && newRoom.length && (
              <View style={styles.calculatedSqft}>
                <Text style={styles.calculatedLabel}>Calculated Area</Text>
                <Text style={styles.calculatedValue}>
                  {calculateSqft(
                    parseFloat(newRoom.width) || 0,
                    parseFloat(newRoom.length) || 0
                  )}{" "}
                  sq ft
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.formFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowEditModal(false);
                setEditingRoom(null);
                setNewRoom({ name: "", width: "", length: "", height: "9", shape: "rectangular" });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Save size={18} color={Colors.white} />
              <Text style={styles.saveButtonText}>Update Room</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showFloorPlanModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFloorPlanModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowFloorPlanModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Floor Plan</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedRoom && (
            <View style={styles.floorPlanContent}>
              <Text style={styles.floorPlanRoomName}>{selectedRoom.name}</Text>
              
              <View style={styles.floorPlanGrid}>
                <View style={[
                  styles.floorPlanRoom,
                  {
                    width: Math.min(280, selectedRoom.width * 12),
                    height: Math.min(200, selectedRoom.length * 10),
                  }
                ]}>
                  <View style={styles.floorPlanDimensionTop}>
                    <Text style={styles.floorPlanDimensionText}>{selectedRoom.width}'</Text>
                  </View>
                  <View style={styles.floorPlanDimensionSide}>
                    <Text style={styles.floorPlanDimensionText}>{selectedRoom.length}'</Text>
                  </View>
                  <Text style={styles.floorPlanAreaText}>{selectedRoom.sqft} sq ft</Text>
                </View>
              </View>

              <View style={styles.floorPlanDetails}>
                <View style={styles.floorPlanDetailRow}>
                  <Text style={styles.floorPlanDetailLabel}>Width</Text>
                  <Text style={styles.floorPlanDetailValue}>{selectedRoom.width} ft</Text>
                </View>
                <View style={styles.floorPlanDetailRow}>
                  <Text style={styles.floorPlanDetailLabel}>Length</Text>
                  <Text style={styles.floorPlanDetailValue}>{selectedRoom.length} ft</Text>
                </View>
                <View style={styles.floorPlanDetailRow}>
                  <Text style={styles.floorPlanDetailLabel}>Ceiling Height</Text>
                  <Text style={styles.floorPlanDetailValue}>{selectedRoom.height} ft</Text>
                </View>
                <View style={styles.floorPlanDetailRow}>
                  <Text style={styles.floorPlanDetailLabel}>Total Area</Text>
                  <Text style={[styles.floorPlanDetailValue, { color: "#EC4899", fontWeight: "700" as const }]}>{selectedRoom.sqft} sq ft</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editFloorPlanBtn}
                onPress={() => {
                  setShowFloorPlanModal(false);
                  handleEditRoom(selectedRoom);
                }}
              >
                <Edit3 size={18} color="#EC4899" />
                <Text style={styles.editFloorPlanBtnText}>Edit Room Dimensions</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.borderLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roomsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EC4899",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  roomCard: {
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
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  roomIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  roomShape: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roomSqft: {
    alignItems: "flex-end",
  },
  sqftValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#EC4899",
  },
  sqftLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dimensionsRow: {
    marginBottom: 14,
  },
  dimension: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dimensionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  roomActions: {
    flexDirection: "row",
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  roomAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roomActionText: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  tipsCard: {
    backgroundColor: "#FCE7F3",
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#EC4899",
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EC4899",
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#9D174D",
    lineHeight: 20,
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
  formContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  shapeOptions: {
    flexDirection: "row",
    gap: 10,
  },
  shapeOption: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
  },
  shapeOptionActive: {
    backgroundColor: "#FCE7F3",
    borderColor: "#EC4899",
  },
  shapeOptionText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  shapeOptionTextActive: {
    color: "#EC4899",
  },
  dimensionInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dimensionInput: {
    flex: 1,
  },
  dimensionInputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  dimensionX: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 20,
  },
  calculatedSqft: {
    backgroundColor: "#FCE7F3",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  calculatedLabel: {
    fontSize: 13,
    color: "#9D174D",
  },
  calculatedValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#EC4899",
    marginTop: 4,
  },
  formFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EC4899",
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  floorPlanContent: {
    flex: 1,
    padding: 20,
    alignItems: "center" as const,
  },
  floorPlanRoomName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 24,
  },
  floorPlanGrid: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  floorPlanRoom: {
    backgroundColor: "#FCE7F3",
    borderWidth: 3,
    borderColor: "#EC4899",
    borderRadius: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    position: "relative" as const,
  },
  floorPlanDimensionTop: {
    position: "absolute" as const,
    top: -24,
    left: 0,
    right: 0,
    alignItems: "center" as const,
  },
  floorPlanDimensionSide: {
    position: "absolute" as const,
    right: -40,
    top: 0,
    bottom: 0,
    justifyContent: "center" as const,
  },
  floorPlanDimensionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
  floorPlanAreaText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#EC4899",
  },
  floorPlanDetails: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  floorPlanDetailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  floorPlanDetailLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  floorPlanDetailValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  editFloorPlanBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#FCE7F3",
    borderRadius: 12,
  },
  editFloorPlanBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EC4899",
  },
});
