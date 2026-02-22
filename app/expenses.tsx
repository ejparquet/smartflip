import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Package,
  Users,
  FileCheck,
  Wrench,
  Zap,
  Shield,
  Megaphone,
  MoreHorizontal,
  X,
  DollarSign,
  Calendar,
  Store,
  Trash2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { Expense, ExpenseCategory } from "@/types";
import { mockExpenses, expenseCategories, getExpensesByCategory } from "@/mocks/stores";

const getCategoryIcon = (category: string, size: number, color: string) => {
  switch (category) {
    case "materials": return <Package size={size} color={color} strokeWidth={1.5} />;
    case "labor": return <Users size={size} color={color} strokeWidth={1.5} />;
    case "permits": return <FileCheck size={size} color={color} strokeWidth={1.5} />;
    case "equipment": return <Wrench size={size} color={color} strokeWidth={1.5} />;
    case "utilities": return <Zap size={size} color={color} strokeWidth={1.5} />;
    case "insurance": return <Shield size={size} color={color} strokeWidth={1.5} />;
    case "marketing": return <Megaphone size={size} color={color} strokeWidth={1.5} />;
    default: return <MoreHorizontal size={size} color={color} strokeWidth={1.5} />;
  }
};

export default function ExpensesScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>("materials");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    vendor: "",
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const breakdown = getExpensesByCategory("proj-1");

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      projectId: "proj-1",
      category: selectedCategory,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString().split("T")[0],
      vendor: newExpense.vendor || undefined,
    };

    setExpenses([expense, ...expenses]);
    setShowAddModal(false);
    setNewExpense({ description: "", amount: "", vendor: "" });
    setSelectedCategory("materials");
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setExpenses(expenses.filter((e) => e.id !== id)),
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    return expenseCategories.find((c) => c.id === category)?.color || "#6B7280";
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Expense Tracker",
          headerTitleStyle: { fontWeight: "600", color: Colors.navy },
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={styles.addHeaderButton}
            >
              <Plus size={22} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>
            ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryMetaText}>{expenses.length} transactions</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breakdown by Category</Text>
          <View style={styles.breakdownContainer}>
            {expenseCategories.map((category) => {
              const amount = breakdown[category.id] || 0;
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              
              if (amount === 0) return null;
              
              return (
                <View key={category.id} style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                      {getCategoryIcon(category.id, 18, category.color)}
                    </View>
                    <View>
                      <Text style={styles.breakdownLabel}>{category.label}</Text>
                      <Text style={styles.breakdownPercentage}>{percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                  <Text style={styles.breakdownAmount}>
                    ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Budget Progress</Text>
            <Text style={styles.budgetText}>$65,000 budget</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((totalExpenses / 65000) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {((totalExpenses / 65000) * 100).toFixed(1)}% used
            </Text>
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {expenses.map((expense) => (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseCard}
              onLongPress={() => handleDeleteExpense(expense.id)}
            >
              <View style={[styles.expenseIcon, { backgroundColor: `${getCategoryColor(expense.category)}15` }]}>
                {getCategoryIcon(expense.category, 20, getCategoryColor(expense.category))}
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
                <Text style={styles.expenseVendor}>{expense.vendor || "No vendor"}</Text>
                <Text style={styles.expenseDate}>{expense.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                -${expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={handleAddExpense}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Category Selection */}
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {expenseCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && {
                      backgroundColor: category.color,
                      borderColor: category.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id as ExpenseCategory)}
                >
                  {getCategoryIcon(
                    category.id,
                    16,
                    selectedCategory === category.id ? "#FFFFFF" : category.color
                  )}
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && { color: "#FFFFFF" },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Amount Input */}
            <Text style={styles.inputLabel}>Amount *</Text>
            <View style={styles.amountInputWrapper}>
              <DollarSign size={20} color="#6B7280" strokeWidth={1.5} />
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
              />
            </View>

            {/* Description Input */}
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Lumber for framing"
              placeholderTextColor="#9CA3AF"
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
            />

            {/* Vendor Input */}
            <Text style={styles.inputLabel}>Vendor (optional)</Text>
            <View style={styles.vendorInputWrapper}>
              <Store size={20} color="#6B7280" strokeWidth={1.5} />
              <TextInput
                style={styles.vendorInput}
                placeholder="e.g., Home Depot"
                placeholderTextColor="#9CA3AF"
                value={newExpense.vendor}
                onChangeText={(text) => setNewExpense({ ...newExpense, vendor: text })}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  addHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.navy,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  summaryMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryMetaText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  breakdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  breakdownPercentage: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetText: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressBarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.navy,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  expenseVendor: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#EF4444",
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
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#4B5563",
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  vendorInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  vendorInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1F2937",
  },
});
