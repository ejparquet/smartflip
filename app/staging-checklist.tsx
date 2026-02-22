import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import {
  CheckCircle2,
  Circle,
  Plus,
  ChevronDown,
  ChevronUp,
  Home,
  Sofa,
  Bed,
  Bath,
  ChefHat,
  Utensils,
  TreePine,
  Trash2,
  Sparkles,
  X,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

interface ChecklistCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  items: ChecklistItem[];
  expanded: boolean;
}

const initialCategories: ChecklistCategory[] = [
  {
    id: "entrance",
    name: "Entrance & Curb Appeal",
    icon: Home,
    color: "#10B981",
    expanded: true,
    items: [
      { id: "e1", text: "Power wash driveway and walkways", completed: false, priority: "high" },
      { id: "e2", text: "Clean or replace front door hardware", completed: false, priority: "high" },
      { id: "e3", text: "Add potted plants or flowers", completed: false, priority: "medium" },
      { id: "e4", text: "Install new house numbers", completed: false, priority: "low" },
      { id: "e5", text: "Place welcome mat", completed: false, priority: "medium" },
      { id: "e6", text: "Clean light fixtures", completed: false, priority: "medium" },
    ],
  },
  {
    id: "livingroom",
    name: "Living Room",
    icon: Sofa,
    color: "#8B5CF6",
    expanded: false,
    items: [
      { id: "l1", text: "Remove all personal photos", completed: false, priority: "high" },
      { id: "l2", text: "Declutter surfaces (max 3 items per surface)", completed: false, priority: "high" },
      { id: "l3", text: "Arrange furniture for conversation flow", completed: false, priority: "high" },
      { id: "l4", text: "Add throw pillows in neutral colors", completed: false, priority: "medium" },
      { id: "l5", text: "Place fresh flowers or greenery", completed: false, priority: "medium" },
      { id: "l6", text: "Open curtains/blinds for natural light", completed: false, priority: "high" },
      { id: "l7", text: "Add a cozy throw blanket", completed: false, priority: "low" },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: ChefHat,
    color: "#272D53",
    expanded: false,
    items: [
      { id: "k1", text: "Clear all countertops completely", completed: false, priority: "high" },
      { id: "k2", text: "Remove magnets and papers from fridge", completed: false, priority: "high" },
      { id: "k3", text: "Add bowl of fresh fruit", completed: false, priority: "medium" },
      { id: "k4", text: "Display matching canisters or cookbooks", completed: false, priority: "low" },
      { id: "k5", text: "Clean and polish appliances", completed: false, priority: "high" },
      { id: "k6", text: "Add new dish towels", completed: false, priority: "low" },
      { id: "k7", text: "Organize visible pantry items", completed: false, priority: "medium" },
    ],
  },
  {
    id: "dining",
    name: "Dining Room",
    icon: Utensils,
    color: "#EC4899",
    expanded: false,
    items: [
      { id: "d1", text: "Set table with simple place settings", completed: false, priority: "high" },
      { id: "d2", text: "Add centerpiece (flowers/candles)", completed: false, priority: "medium" },
      { id: "d3", text: "Remove extra chairs (show room size)", completed: false, priority: "medium" },
      { id: "d4", text: "Ensure adequate lighting", completed: false, priority: "medium" },
    ],
  },
  {
    id: "bedroom",
    name: "Master Bedroom",
    icon: Bed,
    color: "#6366F1",
    expanded: false,
    items: [
      { id: "b1", text: "Make bed with hotel-style bedding", completed: false, priority: "high" },
      { id: "b2", text: "Add decorative pillows", completed: false, priority: "medium" },
      { id: "b3", text: "Clear nightstands (lamp + 1 item)", completed: false, priority: "high" },
      { id: "b4", text: "Remove all personal items", completed: false, priority: "high" },
      { id: "b5", text: "Add fresh flowers on dresser", completed: false, priority: "low" },
      { id: "b6", text: "Clean closet (organize, half-empty)", completed: false, priority: "high" },
    ],
  },
  {
    id: "bathroom",
    name: "Bathrooms",
    icon: Bath,
    color: "#3B82F6",
    expanded: false,
    items: [
      { id: "bt1", text: "Remove all personal toiletries", completed: false, priority: "high" },
      { id: "bt2", text: "Add white fluffy towels", completed: false, priority: "high" },
      { id: "bt3", text: "Display spa items (candles, soap)", completed: false, priority: "medium" },
      { id: "bt4", text: "Add small plant or greenery", completed: false, priority: "low" },
      { id: "bt5", text: "Clean grout and caulking", completed: false, priority: "high" },
      { id: "bt6", text: "Replace toilet seat if needed", completed: false, priority: "medium" },
    ],
  },
  {
    id: "outdoor",
    name: "Outdoor Spaces",
    icon: TreePine,
    color: "#059669",
    expanded: false,
    items: [
      { id: "o1", text: "Clean patio furniture", completed: false, priority: "medium" },
      { id: "o2", text: "Add outdoor cushions", completed: false, priority: "low" },
      { id: "o3", text: "Trim bushes and mow lawn", completed: false, priority: "high" },
      { id: "o4", text: "Add string lights or lanterns", completed: false, priority: "low" },
      { id: "o5", text: "Stage outdoor dining area", completed: false, priority: "medium" },
    ],
  },
];

const priorityColors = {
  high: { bg: "#FEE2E2", text: "#DC2626" },
  medium: { bg: "#E8E9EE", text: "#D97706" },
  low: { bg: "#DBEAFE", text: "#2563EB" },
};

export default function StagingChecklist() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<ChecklistCategory[]>(initialCategories);
  const [newItemText, setNewItemText] = useState("");
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  const dynamicStyles = useMemo(
    () => ({
      container: { backgroundColor: theme.background },
      card: { backgroundColor: theme.surface },
      text: { color: theme.text },
      textSecondary: { color: theme.textSecondary },
      border: { borderColor: theme.border },
      input: { backgroundColor: theme.surfaceSecondary, color: theme.text },
    }),
    [theme]
  );

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.completed).length,
    0
  );
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggleCategory = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : cat
      )
    );
  };

  const addItem = (categoryId: string) => {
    if (!newItemText.trim()) return;

    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: [
                ...cat.items,
                {
                  id: Date.now().toString(),
                  text: newItemText.trim(),
                  completed: false,
                  priority: "medium" as const,
                },
              ],
            }
          : cat
      )
    );
    setNewItemText("");
    setAddingToCategory(null);
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCategories(
            categories.map((cat) =>
              cat.id === categoryId
                ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
                : cat
            )
          );
        },
      },
    ]);
  };

  const resetChecklist = () => {
    Alert.alert("Reset Checklist", "This will uncheck all items. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        onPress: () => {
          setCategories(
            categories.map((cat) => ({
              ...cat,
              items: cat.items.map((item) => ({ ...item, completed: false })),
            }))
          );
        },
      },
    ]);
  };

  const getCategoryProgress = (category: ChecklistCategory) => {
    const total = category.items.length;
    const completed = category.items.filter((i) => i.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: "Staging Checklist",
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerTintColor: theme.text,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, dynamicStyles.text]}>Staging Checklist</Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.textSecondary]}>
            Prepare your property for a quick sale
          </Text>
        </View>

        <View style={[styles.progressCard, dynamicStyles.card]}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressTitle, dynamicStyles.text]}>Overall Progress</Text>
              <Text style={[styles.progressStats, dynamicStyles.textSecondary]}>
                {completedItems} of {totalItems} tasks completed
              </Text>
            </View>
            <View style={[styles.progressPercent, { backgroundColor: "#8B5CF615" }]}>
              <Text style={[styles.progressPercentText, { color: "#8B5CF6" }]}>
                {progressPercent}%
              </Text>
            </View>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.borderLight }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: progressPercent === 100 ? "#10B981" : "#8B5CF6",
                },
              ]}
            />
          </View>
          {progressPercent === 100 && (
            <View style={styles.completedBanner}>
              <Sparkles size={18} color="#10B981" strokeWidth={2} />
              <Text style={[styles.completedText, { color: "#10B981" }]}>
                Ready for showings!
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: theme.surfaceSecondary }]}
          onPress={resetChecklist}
        >
          <Text style={[styles.resetButtonText, dynamicStyles.textSecondary]}>Reset All</Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <View key={category.id} style={[styles.categoryCard, dynamicStyles.card]}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                <category.icon size={22} color={category.color} strokeWidth={1.5} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, dynamicStyles.text]}>{category.name}</Text>
                <View style={styles.categoryProgress}>
                  <View
                    style={[styles.categoryProgressBar, { backgroundColor: theme.borderLight }]}
                  >
                    <View
                      style={[
                        styles.categoryProgressFill,
                        {
                          width: `${getCategoryProgress(category)}%`,
                          backgroundColor: category.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.categoryProgressText, dynamicStyles.textSecondary]}>
                    {category.items.filter((i) => i.completed).length}/{category.items.length}
                  </Text>
                </View>
              </View>
              {category.expanded ? (
                <ChevronUp size={22} color={theme.textSecondary} strokeWidth={1.5} />
              ) : (
                <ChevronDown size={22} color={theme.textSecondary} strokeWidth={1.5} />
              )}
            </TouchableOpacity>

            {category.expanded && (
              <View style={styles.categoryItems}>
                {category.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <TouchableOpacity
                      style={styles.itemCheckbox}
                      onPress={() => toggleItem(category.id, item.id)}
                    >
                      {item.completed ? (
                        <CheckCircle2 size={24} color={category.color} strokeWidth={2} />
                      ) : (
                        <Circle size={24} color={theme.textTertiary} strokeWidth={1.5} />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.itemText,
                        dynamicStyles.text,
                        item.completed && styles.itemTextCompleted,
                      ]}
                    >
                      {item.text}
                    </Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: priorityColors[item.priority].bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: priorityColors[item.priority].text },
                        ]}
                      >
                        {item.priority}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteItem(category.id, item.id)}
                    >
                      <Trash2 size={16} color={theme.textTertiary} strokeWidth={1.5} />
                    </TouchableOpacity>
                  </View>
                ))}

                {addingToCategory === category.id ? (
                  <View style={styles.addItemForm}>
                    <TextInput
                      style={[styles.addItemInput, dynamicStyles.input, dynamicStyles.border]}
                      value={newItemText}
                      onChangeText={setNewItemText}
                      placeholder="Enter new task..."
                      placeholderTextColor={theme.textTertiary}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={[styles.addItemSubmit, { backgroundColor: category.color }]}
                      onPress={() => addItem(category.id)}
                    >
                      <Plus size={18} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addItemCancel}
                      onPress={() => {
                        setAddingToCategory(null);
                        setNewItemText("");
                      }}
                    >
                      <X size={18} color={theme.textSecondary} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={() => setAddingToCategory(category.id)}
                  >
                    <Plus size={18} color={category.color} strokeWidth={2} />
                    <Text style={[styles.addItemButtonText, { color: category.color }]}>
                      Add Task
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  progressCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  progressStats: {
    fontSize: 13,
  },
  progressPercent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  progressPercentText: {
    fontSize: 18,
    fontWeight: "800" as const,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
  },
  completedText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  resetButton: {
    alignSelf: "flex-end",
    marginRight: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 6,
  },
  categoryProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  categoryProgressText: {
    fontSize: 12,
    fontWeight: "500" as const,
    width: 36,
  },
  categoryItems: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  itemCheckbox: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  itemTextCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.1)",
  },
  addItemButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  addItemForm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  addItemSubmit: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addItemCancel: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
