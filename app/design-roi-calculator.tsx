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
  DollarSign,
  TrendingUp,
  Home,
  Paintbrush,
  Sofa,
  Lightbulb,
  Bath,
  ChefHat,
  Bed,
  TreePine,
  Plus,
  Minus,
  Info,
  PieChart,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface DesignItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  cost: number;
  valueIncrease: number;
  roi: number;
  selected: boolean;
}

const defaultDesignItems: DesignItem[] = [
  { id: "1", name: "Interior Paint (Neutral)", category: "Paint", icon: Paintbrush, cost: 2500, valueIncrease: 7500, roi: 200, selected: true },
  { id: "2", name: "Kitchen Cabinet Refresh", category: "Kitchen", icon: ChefHat, cost: 5000, valueIncrease: 12000, roi: 140, selected: true },
  { id: "3", name: "Bathroom Vanity Update", category: "Bathroom", icon: Bath, cost: 1500, valueIncrease: 4000, roi: 167, selected: false },
  { id: "4", name: "Modern Light Fixtures", category: "Lighting", icon: Lightbulb, cost: 1200, valueIncrease: 3500, roi: 192, selected: true },
  { id: "5", name: "New Hardware (Knobs/Pulls)", category: "Kitchen", icon: ChefHat, cost: 400, valueIncrease: 1500, roi: 275, selected: true },
  { id: "6", name: "Staging Furniture Rental", category: "Staging", icon: Sofa, cost: 2000, valueIncrease: 8000, roi: 300, selected: false },
  { id: "7", name: "Bedroom Carpet Replacement", category: "Bedroom", icon: Bed, cost: 3000, valueIncrease: 6000, roi: 100, selected: false },
  { id: "8", name: "Curb Appeal Landscaping", category: "Exterior", icon: TreePine, cost: 1800, valueIncrease: 5500, roi: 206, selected: false },
  { id: "9", name: "Accent Wall Feature", category: "Paint", icon: Paintbrush, cost: 800, valueIncrease: 2500, roi: 212, selected: false },
  { id: "10", name: "Kitchen Backsplash", category: "Kitchen", icon: ChefHat, cost: 1500, valueIncrease: 4500, roi: 200, selected: false },
];

const categoryColors: Record<string, string> = {
  Paint: "#EC4899",
  Kitchen: "#272D53",
  Bathroom: "#3B82F6",
  Lighting: "#272D53",
  Staging: "#8B5CF6",
  Bedroom: "#6366F1",
  Exterior: "#10B981",
};

export default function DesignROICalculator() {
  const { theme } = useTheme();
  const [designItems, setDesignItems] = useState<DesignItem[]>(defaultDesignItems);
  const [purchasePrice, setPurchasePrice] = useState("250000");
  const [customItemName, setCustomItemName] = useState("");
  const [customItemCost, setCustomItemCost] = useState("");
  const [customItemValue, setCustomItemValue] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);

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

  const selectedItems = designItems.filter((item) => item.selected);
  const totalCost = selectedItems.reduce((sum, item) => sum + item.cost, 0);
  const totalValueIncrease = selectedItems.reduce((sum, item) => sum + item.valueIncrease, 0);
  const overallROI = totalCost > 0 ? Math.round(((totalValueIncrease - totalCost) / totalCost) * 100) : 0;
  const estimatedSalePrice = parseInt(purchasePrice || "0") + totalValueIncrease;
  const netProfit = totalValueIncrease - totalCost;

  const toggleItem = (id: string) => {
    setDesignItems(
      designItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateItemCost = (id: string, newCost: string) => {
    const cost = parseInt(newCost) || 0;
    setDesignItems(
      designItems.map((item) =>
        item.id === id
          ? {
              ...item,
              cost,
              roi: cost > 0 ? Math.round(((item.valueIncrease - cost) / cost) * 100) : 0,
            }
          : item
      )
    );
  };

  const addCustomItem = () => {
    if (!customItemName || !customItemCost || !customItemValue) return;
    
    const cost = parseInt(customItemCost) || 0;
    const value = parseInt(customItemValue) || 0;
    const roi = cost > 0 ? Math.round(((value - cost) / cost) * 100) : 0;

    const newItem: DesignItem = {
      id: Date.now().toString(),
      name: customItemName,
      category: "Custom",
      icon: Home,
      cost,
      valueIncrease: value,
      roi,
      selected: true,
    };

    setDesignItems([...designItems, newItem]);
    setCustomItemName("");
    setCustomItemCost("");
    setCustomItemValue("");
    setShowAddCustom(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedItems = [...designItems].sort((a, b) => b.roi - a.roi);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Stack.Screen
        options={{
          title: "Design ROI Calculator",
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerTintColor: theme.text,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, dynamicStyles.text]}>Design ROI Calculator</Text>
          <Text style={[styles.headerSubtitle, dynamicStyles.textSecondary]}>
            Calculate return on investment for your design choices
          </Text>
        </View>

        <View style={[styles.purchasePriceCard, dynamicStyles.card]}>
          <View style={styles.purchasePriceHeader}>
            <Home size={20} color="#10B981" strokeWidth={1.5} />
            <Text style={[styles.purchasePriceLabel, dynamicStyles.text]}>Purchase Price</Text>
          </View>
          <View style={[styles.purchasePriceInput, dynamicStyles.input]}>
            <Text style={[styles.currencyPrefix, dynamicStyles.textSecondary]}>$</Text>
            <TextInput
              style={[styles.priceInput, dynamicStyles.text]}
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="numeric"
              placeholder="250,000"
              placeholderTextColor={theme.textTertiary}
            />
          </View>
        </View>

        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: "#10B98115" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: "#10B981" }]}>
              <TrendingUp size={18} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={[styles.summaryValue, { color: "#10B981" }]}>{overallROI}%</Text>
            <Text style={[styles.summaryLabel, dynamicStyles.textSecondary]}>Overall ROI</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#272D5315" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: "#272D53" }]}>
              <DollarSign size={18} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={[styles.summaryValue, { color: "#272D53" }]}>{formatCurrency(totalCost)}</Text>
            <Text style={[styles.summaryLabel, dynamicStyles.textSecondary]}>Total Investment</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#8B5CF615" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: "#8B5CF6" }]}>
              <PieChart size={18} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={[styles.summaryValue, { color: "#8B5CF6" }]}>{formatCurrency(netProfit)}</Text>
            <Text style={[styles.summaryLabel, dynamicStyles.textSecondary]}>Net Profit</Text>
          </View>
        </View>

        <View style={[styles.projectionCard, dynamicStyles.card]}>
          <Text style={[styles.projectionTitle, dynamicStyles.text]}>Sale Projection</Text>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, dynamicStyles.textSecondary]}>Purchase Price</Text>
            <Text style={[styles.projectionValue, dynamicStyles.text]}>
              {formatCurrency(parseInt(purchasePrice || "0"))}
            </Text>
          </View>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, dynamicStyles.textSecondary]}>Design Investment</Text>
            <Text style={[styles.projectionValue, dynamicStyles.text]}>
              + {formatCurrency(totalCost)}
            </Text>
          </View>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, dynamicStyles.textSecondary]}>Value Increase</Text>
            <Text style={[styles.projectionValue, { color: "#10B981" }]}>
              + {formatCurrency(totalValueIncrease)}
            </Text>
          </View>
          <View style={[styles.projectionDivider, dynamicStyles.border]} />
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionTotalLabel, dynamicStyles.text]}>Estimated Sale Price</Text>
            <Text style={[styles.projectionTotalValue, { color: "#10B981" }]}>
              {formatCurrency(estimatedSalePrice)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Design Upgrades</Text>
            <Text style={[styles.sectionSubtitle, dynamicStyles.textSecondary]}>
              Sorted by ROI (highest first)
            </Text>
          </View>

          {sortedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                dynamicStyles.card,
                item.selected && styles.itemCardSelected,
                item.selected && { borderColor: categoryColors[item.category] || "#10B981" },
              ]}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.itemHeader}>
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: `${categoryColors[item.category] || "#10B981"}15` },
                  ]}
                >
                  <item.icon
                    size={20}
                    color={categoryColors[item.category] || "#10B981"}
                    strokeWidth={1.5}
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, dynamicStyles.text]}>{item.name}</Text>
                  <View style={styles.itemMeta}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: `${categoryColors[item.category] || "#10B981"}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: categoryColors[item.category] || "#10B981" },
                        ]}
                      >
                        {item.category}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.roiBadge,
                    {
                      backgroundColor: item.roi >= 150 ? "#D1FAE5" : item.roi >= 100 ? "#E8E9EE" : "#FEE2E2",
                    },
                  ]}
                >
                  <TrendingUp
                    size={12}
                    color={item.roi >= 150 ? "#059669" : item.roi >= 100 ? "#D97706" : "#DC2626"}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.roiText,
                      {
                        color: item.roi >= 150 ? "#059669" : item.roi >= 100 ? "#D97706" : "#DC2626",
                      },
                    ]}
                  >
                    {item.roi}%
                  </Text>
                </View>
              </View>

              <View style={styles.itemValues}>
                <View style={styles.valueColumn}>
                  <Text style={[styles.valueLabel, dynamicStyles.textSecondary]}>Cost</Text>
                  <View style={[styles.costInput, dynamicStyles.input]}>
                    <Text style={[styles.costPrefix, dynamicStyles.textSecondary]}>$</Text>
                    <TextInput
                      style={[styles.costInputField, dynamicStyles.text]}
                      value={item.cost.toString()}
                      onChangeText={(text) => updateItemCost(item.id, text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.valueColumn}>
                  <Text style={[styles.valueLabel, dynamicStyles.textSecondary]}>Value Added</Text>
                  <Text style={[styles.valueAddedText, { color: "#10B981" }]}>
                    +{formatCurrency(item.valueIncrease)}
                  </Text>
                </View>
              </View>

              <View style={styles.selectIndicator}>
                <View
                  style={[
                    styles.checkbox,
                    item.selected && { backgroundColor: categoryColors[item.category] || "#10B981" },
                    !item.selected && dynamicStyles.border,
                  ]}
                >
                  {item.selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.selectText, dynamicStyles.textSecondary]}>
                  {item.selected ? "Included in calculation" : "Tap to include"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.addCustomButton, dynamicStyles.card]}
            onPress={() => setShowAddCustom(!showAddCustom)}
          >
            {showAddCustom ? (
              <Minus size={20} color="#10B981" strokeWidth={2} />
            ) : (
              <Plus size={20} color="#10B981" strokeWidth={2} />
            )}
            <Text style={[styles.addCustomText, { color: "#10B981" }]}>
              {showAddCustom ? "Cancel" : "Add Custom Item"}
            </Text>
          </TouchableOpacity>

          {showAddCustom && (
            <View style={[styles.customItemForm, dynamicStyles.card]}>
              <View style={styles.formRow}>
                <Text style={[styles.formLabel, dynamicStyles.textSecondary]}>Item Name</Text>
                <TextInput
                  style={[styles.formInput, dynamicStyles.input, dynamicStyles.border]}
                  value={customItemName}
                  onChangeText={setCustomItemName}
                  placeholder="e.g., Crown Molding"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
              <View style={styles.formRowDouble}>
                <View style={styles.formColumn}>
                  <Text style={[styles.formLabel, dynamicStyles.textSecondary]}>Cost ($)</Text>
                  <TextInput
                    style={[styles.formInput, dynamicStyles.input, dynamicStyles.border]}
                    value={customItemCost}
                    onChangeText={setCustomItemCost}
                    placeholder="1500"
                    keyboardType="numeric"
                    placeholderTextColor={theme.textTertiary}
                  />
                </View>
                <View style={styles.formColumn}>
                  <Text style={[styles.formLabel, dynamicStyles.textSecondary]}>Value Added ($)</Text>
                  <TextInput
                    style={[styles.formInput, dynamicStyles.input, dynamicStyles.border]}
                    value={customItemValue}
                    onChangeText={setCustomItemValue}
                    placeholder="4000"
                    keyboardType="numeric"
                    placeholderTextColor={theme.textTertiary}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.addItemButton, { backgroundColor: "#10B981" }]}
                onPress={addCustomItem}
              >
                <Text style={styles.addItemButtonText}>Add to Calculator</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.tipCard, { backgroundColor: "#3B82F615" }]}>
          <Info size={20} color="#3B82F6" strokeWidth={1.5} />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: "#3B82F6" }]}>Pro Tip</Text>
            <Text style={[styles.tipText, dynamicStyles.textSecondary]}>
              Focus on high-ROI improvements like paint, fixtures, and hardware for the best return on your flip investment.
            </Text>
          </View>
        </View>

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
  purchasePriceCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
  },
  purchasePriceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  purchasePriceLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  purchasePriceInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700" as const,
  },
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
    textAlign: "center",
  },
  projectionCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  projectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 14,
  },
  projectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  projectionLabel: {
    fontSize: 14,
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  projectionDivider: {
    height: 1,
    marginVertical: 10,
    borderTopWidth: 1,
  },
  projectionTotalLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  projectionTotalValue: {
    fontSize: 20,
    fontWeight: "800" as const,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  itemCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  itemCardSelected: {
    borderWidth: 2,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  roiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roiText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  itemValues: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  valueColumn: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  costInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  costPrefix: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  costInputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    marginLeft: 4,
  },
  valueAddedText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  selectIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700" as const,
  },
  selectText: {
    fontSize: 13,
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  addCustomText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  customItemForm: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  formRow: {
    marginBottom: 14,
  },
  formRowDouble: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formColumn: {
    flex: 1,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  addItemButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addItemButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  tipCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
