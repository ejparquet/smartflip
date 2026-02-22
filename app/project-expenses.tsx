import React, { useState, useCallback } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  Receipt,
  DollarSign,
  Plus,
  ChevronDown,
  Check,
  Calendar,
  Trash2,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Wrench,
  Shield,
  Zap,
  Droplets,
  Truck,
  HardHat,
  MoreHorizontal,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useProjects } from "@/contexts/ProjectContext";
import { useTheme } from "@/contexts/ThemeContext";

interface ExpenseEntry {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
}

const expenseCategories = [
  { id: "materials", label: "Materials", icon: ShoppingBag, color: "#4F46E5", bg: "#EEF2FF" },
  { id: "labor", label: "Labor", icon: HardHat, color: "#D97706", bg: "#E8E9EE" },
  { id: "permits", label: "Permits", icon: Shield, color: "#059669", bg: "#D1FAE5" },
  { id: "equipment", label: "Equipment", icon: Wrench, color: "#DC2626", bg: "#FEE2E2" },
  { id: "electrical", label: "Electrical", icon: Zap, color: "#7C3AED", bg: "#EDE9FE" },
  { id: "plumbing", label: "Plumbing", icon: Droplets, color: "#0891B2", bg: "#CFFAFE" },
  { id: "delivery", label: "Delivery", icon: Truck, color: "#EA580C", bg: "#FFF7ED" },
  { id: "other", label: "Other", icon: MoreHorizontal, color: "#6B7280", bg: "#F3F4F6" },
];

export default function ProjectExpensesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProjectById } = useProjects();
  const { theme } = useTheme();
  const project = getProjectById(projectId || "");

  const [expenses, setExpenses] = useState<ExpenseEntry[]>([
    { id: "e1", category: "materials", description: "Lumber & framing materials", amount: 8500, date: "2026-02-10", vendor: "Home Depot" },
    { id: "e2", category: "labor", description: "Demolition crew - Week 1", amount: 4200, date: "2026-02-03", vendor: "ABC Labor" },
    { id: "e3", category: "permits", description: "Building permit fee", amount: 1250, date: "2026-01-15", vendor: "City of Boston" },
    { id: "e4", category: "materials", description: "Drywall & insulation", amount: 3200, date: "2026-02-08", vendor: "Lowe's" },
    { id: "e5", category: "electrical", description: "Electrical panel upgrade", amount: 2800, date: "2026-02-06", vendor: "Sparky Electric" },
    { id: "e6", category: "plumbing", description: "Bathroom rough-in materials", amount: 1800, date: "2026-02-04", vendor: "Ferguson" },
    { id: "e7", category: "equipment", description: "Dumpster rental - Month 1", amount: 650, date: "2026-01-20", vendor: "WM" },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = project?.renovationBudget ?? 0;
  const remaining = budget - totalExpenses;
  const budgetPercent = budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0;

  const getCategoryConfig = (catId: string) =>
    expenseCategories.find((c) => c.id === catId) ?? expenseCategories[expenseCategories.length - 1];

  const handleAddExpense = useCallback(() => {
    if (!selectedCategory || !description.trim() || !amount) {
      Alert.alert("Missing Info", "Please fill in category, description, and amount.");
      return;
    }
    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    const newExpense: ExpenseEntry = {
      id: `e-${Date.now()}`,
      category: selectedCategory,
      description: description.trim(),
      amount: parsedAmount,
      date: new Date().toISOString().split("T")[0],
      vendor: vendor.trim() || undefined,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setSelectedCategory("");
    setDescription("");
    setAmount("");
    setVendor("");
    setShowAddForm(false);
    console.log("Expense added:", newExpense);
  }, [selectedCategory, description, amount, vendor]);

  const handleDeleteExpense = useCallback((id: string) => {
    Alert.alert("Delete Expense", "Are you sure you want to remove this expense?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setExpenses((prev) => prev.filter((e) => e.id !== id)),
      },
    ]);
  }, []);

  const categoryBreakdown = expenseCategories
    .map((cat) => ({
      ...cat,
      total: expenses.filter((e) => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter((e) => e.category === cat.id).length,
    }))
    .filter((cat) => cat.total > 0)
    .sort((a, b) => b.total - a.total);

  if (!project) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.headerRow}>
            <BackButton />
            <Text style={styles.headerTitle}>Project Not Found</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.headerRow}>
          <BackButton />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Project Expenses</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addHeaderBtn, { backgroundColor: theme.surface }]}
            onPress={() => setShowAddForm(!showAddForm)}
            activeOpacity={0.7}
          >
            <Plus size={20} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: "#FEE2E2" }]}>
                <Wallet size={18} color="#DC2626" />
              </View>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalExpenses)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: "#D1FAE5" }]}>
                <TrendingUp size={18} color="#059669" />
              </View>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={[styles.summaryValue, remaining < 0 && { color: "#DC2626" }]}>
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>
          <View style={styles.budgetBarContainer}>
            <View style={styles.budgetBarTrack}>
              <View
                style={[
                  styles.budgetBarFill,
                  { width: `${Math.min(budgetPercent, 100)}%` },
                  budgetPercent > 90 && { backgroundColor: "#DC2626" },
                  budgetPercent > 75 && budgetPercent <= 90 && { backgroundColor: "#D97706" },
                ]}
              />
            </View>
            <Text style={styles.budgetBarLabel}>
              {budgetPercent}% of {formatCurrency(budget)} budget used
            </Text>
          </View>
        </View>

        {categoryBreakdown.length > 0 && (
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Breakdown by Category</Text>
            <View style={styles.breakdownGrid}>
              {categoryBreakdown.map((cat) => {
                const IconComp = cat.icon;
                return (
                  <View key={cat.id} style={styles.breakdownItem}>
                    <View style={[styles.breakdownIcon, { backgroundColor: cat.bg }]}>
                      <IconComp size={16} color={cat.color} />
                    </View>
                    <View style={styles.breakdownInfo}>
                      <Text style={styles.breakdownLabel}>{cat.label}</Text>
                      <Text style={styles.breakdownCount}>{cat.count} items</Text>
                    </View>
                    <Text style={styles.breakdownAmount}>{formatCurrency(cat.total)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {showAddForm && (
          <View style={styles.addFormCard}>
            <Text style={styles.addFormTitle}>New Expense</Text>

            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              {selectedCategory ? (
                <View style={styles.selectedCategoryRow}>
                  {React.createElement(getCategoryConfig(selectedCategory).icon, {
                    size: 16,
                    color: getCategoryConfig(selectedCategory).color,
                  })}
                  <Text style={styles.selectedCategoryText}>
                    {getCategoryConfig(selectedCategory).label}
                  </Text>
                </View>
              ) : (
                <Text style={styles.categorySelectorPlaceholder}>Select category</Text>
              )}
              <ChevronDown size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={styles.categoryPickerList}>
                {expenseCategories.map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryPickerItem,
                        selectedCategory === cat.id && { backgroundColor: cat.bg },
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <IconComp size={16} color={cat.color} />
                      <Text style={styles.categoryPickerText}>{cat.label}</Text>
                      {selectedCategory === cat.id && <Check size={16} color={cat.color} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What was this expense for?"
              placeholderTextColor={Colors.textTertiary}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <DollarSign size={18} color={Colors.primary} />
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <Text style={styles.inputLabel}>Vendor (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Store or supplier name"
              placeholderTextColor={Colors.textTertiary}
              value={vendor}
              onChangeText={setVendor}
            />

            <View style={styles.addFormActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!selectedCategory || !description.trim() || !amount) && styles.saveBtnDisabled,
                ]}
                onPress={handleAddExpense}
                disabled={!selectedCategory || !description.trim() || !amount}
              >
                <Receipt size={16} color="#FFF" />
                <Text style={styles.saveBtnText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.expensesListSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>All Expenses</Text>
            <Text style={styles.expenseCount}>{expenses.length} items</Text>
          </View>

          {expenses.map((expense) => {
            const catConfig = getCategoryConfig(expense.category);
            const IconComp = catConfig.icon;
            return (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseCard}
                onLongPress={() => handleDeleteExpense(expense.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.expenseIcon, { backgroundColor: catConfig.bg }]}>
                  <IconComp size={18} color={catConfig.color} />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription} numberOfLines={1}>
                    {expense.description}
                  </Text>
                  <View style={styles.expenseMetaRow}>
                    <Text style={styles.expenseMeta}>{catConfig.label}</Text>
                    {expense.vendor && (
                      <>
                        <View style={styles.expenseDot} />
                        <Text style={styles.expenseMeta}>{expense.vendor}</Text>
                      </>
                    )}
                  </View>
                  <View style={styles.expenseDateRow}>
                    <Calendar size={10} color={Colors.textTertiary} />
                    <Text style={styles.expenseDateText}>{formatDate(expense.date)}</Text>
                  </View>
                </View>
                <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: Platform.OS === "ios" ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  budgetBarContainer: {
    marginTop: 4,
  },
  budgetBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceSecondary,
    overflow: "hidden",
  },
  budgetBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  budgetBarLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: 8,
  },
  breakdownSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  breakdownGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  breakdownCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  addFormCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addFormTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedCategoryText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  categorySelectorPlaceholder: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  categoryPickerList: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },
  categoryPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryPickerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  textInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    paddingVertical: 14,
  },
  addFormActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  expensesListSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  expenseCount: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
    marginBottom: 3,
  },
  expenseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  expenseMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  expenseDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
  },
  expenseDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expenseDateText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
});
