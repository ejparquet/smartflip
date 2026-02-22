import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Share,
  Platform,
} from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  FileText,
  Send,
  Calculator,
  Droplets,
  Wrench,
  ThermometerSun,
  Gauge,
  PipetteIcon,
  ShowerHead,
  Waves,
  CircleDot,
  Check,

  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  X,
  Copy,
  Edit3,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

interface PlumbingService {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  laborHours: number;
  icon: any;
}

interface QuoteLineItem {
  id: string;
  serviceId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  laborHours: number;
  isCustom: boolean;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const plumbingServices: PlumbingService[] = [
  {
    id: "1",
    name: "Drain Cleaning",
    category: "Drain Services",
    description: "Clear clogged drains using professional equipment",
    basePrice: 150,
    laborHours: 1,
    icon: Droplets,
  },
  {
    id: "2",
    name: "Toilet Repair",
    category: "Fixtures",
    description: "Repair running, leaking, or clogged toilets",
    basePrice: 175,
    laborHours: 1,
    icon: CircleDot,
  },
  {
    id: "3",
    name: "Toilet Installation",
    category: "Fixtures",
    description: "Remove old and install new toilet",
    basePrice: 350,
    laborHours: 2,
    icon: CircleDot,
  },
  {
    id: "4",
    name: "Faucet Repair",
    category: "Fixtures",
    description: "Fix dripping or malfunctioning faucets",
    basePrice: 125,
    laborHours: 0.75,
    icon: Droplets,
  },
  {
    id: "5",
    name: "Faucet Installation",
    category: "Fixtures",
    description: "Install new kitchen or bathroom faucet",
    basePrice: 200,
    laborHours: 1.5,
    icon: Droplets,
  },
  {
    id: "6",
    name: "Water Heater Repair",
    category: "Water Heater",
    description: "Diagnose and repair water heater issues",
    basePrice: 250,
    laborHours: 2,
    icon: ThermometerSun,
  },
  {
    id: "7",
    name: "Water Heater Installation",
    category: "Water Heater",
    description: "Replace or install new water heater (unit not included)",
    basePrice: 650,
    laborHours: 4,
    icon: ThermometerSun,
  },
  {
    id: "8",
    name: "Tankless Water Heater Install",
    category: "Water Heater",
    description: "Install tankless water heater system (unit not included)",
    basePrice: 1200,
    laborHours: 6,
    icon: ThermometerSun,
  },
  {
    id: "9",
    name: "Garbage Disposal Install",
    category: "Kitchen",
    description: "Install new garbage disposal unit",
    basePrice: 275,
    laborHours: 1.5,
    icon: Waves,
  },
  {
    id: "10",
    name: "Dishwasher Installation",
    category: "Kitchen",
    description: "Connect and install dishwasher plumbing",
    basePrice: 200,
    laborHours: 1.5,
    icon: Waves,
  },
  {
    id: "11",
    name: "Pipe Leak Repair",
    category: "Pipes",
    description: "Locate and repair leaking pipes",
    basePrice: 200,
    laborHours: 1.5,
    icon: PipetteIcon,
  },
  {
    id: "12",
    name: "Pipe Replacement (per ft)",
    category: "Pipes",
    description: "Replace damaged or old pipes",
    basePrice: 75,
    laborHours: 0.5,
    icon: PipetteIcon,
  },
  {
    id: "13",
    name: "Sewer Line Inspection",
    category: "Sewer",
    description: "Camera inspection of sewer line",
    basePrice: 350,
    laborHours: 1.5,
    icon: Gauge,
  },
  {
    id: "14",
    name: "Sewer Line Cleaning",
    category: "Sewer",
    description: "Professional sewer line cleaning",
    basePrice: 450,
    laborHours: 2,
    icon: Gauge,
  },
  {
    id: "15",
    name: "Shower Valve Repair",
    category: "Bathroom",
    description: "Repair or replace shower valve",
    basePrice: 225,
    laborHours: 1.5,
    icon: ShowerHead,
  },
  {
    id: "16",
    name: "Shower Head Installation",
    category: "Bathroom",
    description: "Install new shower head or hand shower",
    basePrice: 100,
    laborHours: 0.5,
    icon: ShowerHead,
  },
  {
    id: "17",
    name: "Sump Pump Install",
    category: "Pumps",
    description: "Install sump pump system (pump not included)",
    basePrice: 500,
    laborHours: 3,
    icon: Waves,
  },
  {
    id: "18",
    name: "Water Pressure Regulator",
    category: "General",
    description: "Install or replace pressure regulator",
    basePrice: 350,
    laborHours: 2,
    icon: Gauge,
  },
  {
    id: "19",
    name: "Main Water Shut-Off Valve",
    category: "General",
    description: "Replace main water shut-off valve",
    basePrice: 400,
    laborHours: 2.5,
    icon: Wrench,
  },
  {
    id: "20",
    name: "Emergency Service Call",
    category: "Emergency",
    description: "After-hours emergency service (additional fee)",
    basePrice: 150,
    laborHours: 0,
    icon: Wrench,
  },
];

const poolServices: PlumbingService[] = [
  {
    id: "p1",
    name: "Pool Design Consultation",
    category: "Design",
    description: "Initial design consultation and 3D rendering",
    basePrice: 500,
    laborHours: 4,
    icon: Waves,
  },
  {
    id: "p2",
    name: "Pool Excavation",
    category: "Construction",
    description: "Complete excavation for pool shell",
    basePrice: 8500,
    laborHours: 16,
    icon: Waves,
  },
  {
    id: "p3",
    name: "Steel/Rebar Installation",
    category: "Construction",
    description: "Rebar framework and steel installation",
    basePrice: 6500,
    laborHours: 24,
    icon: Wrench,
  },
  {
    id: "p4",
    name: "Gunite/Shotcrete Shell",
    category: "Construction",
    description: "Gunite or shotcrete pool shell application",
    basePrice: 12000,
    laborHours: 16,
    icon: Waves,
  },
  {
    id: "p5",
    name: "Pool Plumbing Package",
    category: "Plumbing",
    description: "Complete pool plumbing with main drains, skimmers, returns",
    basePrice: 4500,
    laborHours: 16,
    icon: Droplets,
  },
  {
    id: "p6",
    name: "Pool Electrical Package",
    category: "Electrical",
    description: "Electrical bonding, pump wiring, light installation",
    basePrice: 3500,
    laborHours: 12,
    icon: Gauge,
  },
  {
    id: "p7",
    name: "Tile & Coping Installation",
    category: "Finishing",
    description: "Waterline tile and coping stone installation",
    basePrice: 5500,
    laborHours: 24,
    icon: Waves,
  },
  {
    id: "p8",
    name: "Pool Plaster/Pebble Finish",
    category: "Finishing",
    description: "Interior pool finish - plaster or pebble",
    basePrice: 8000,
    laborHours: 16,
    icon: Waves,
  },
  {
    id: "p9",
    name: "Pool Decking (per sq ft)",
    category: "Decking",
    description: "Concrete, travertine, or paver pool deck",
    basePrice: 18,
    laborHours: 0.1,
    icon: Waves,
  },
  {
    id: "p10",
    name: "Pool Pump Installation",
    category: "Equipment",
    description: "Variable speed pump installation (pump not included)",
    basePrice: 650,
    laborHours: 4,
    icon: Gauge,
  },
  {
    id: "p11",
    name: "Pool Filter Installation",
    category: "Equipment",
    description: "Sand, cartridge, or DE filter installation",
    basePrice: 450,
    laborHours: 3,
    icon: Gauge,
  },
  {
    id: "p12",
    name: "Pool Heater Installation",
    category: "Equipment",
    description: "Gas or heat pump heater installation",
    basePrice: 1200,
    laborHours: 6,
    icon: ThermometerSun,
  },
  {
    id: "p13",
    name: "Salt Chlorinator System",
    category: "Equipment",
    description: "Saltwater chlorination system installation",
    basePrice: 1800,
    laborHours: 4,
    icon: Waves,
  },
  {
    id: "p14",
    name: "Pool Automation System",
    category: "Equipment",
    description: "Smart pool control system installation",
    basePrice: 2500,
    laborHours: 8,
    icon: Gauge,
  },
  {
    id: "p15",
    name: "LED Pool Lighting",
    category: "Lighting",
    description: "Color LED pool light installation (per light)",
    basePrice: 850,
    laborHours: 3,
    icon: Waves,
  },
  {
    id: "p16",
    name: "Spa/Hot Tub Addition",
    category: "Features",
    description: "Attached spa with jets and heating",
    basePrice: 18000,
    laborHours: 40,
    icon: Waves,
  },
  {
    id: "p17",
    name: "Waterfall Feature",
    category: "Features",
    description: "Natural rock or sheer descent waterfall",
    basePrice: 4500,
    laborHours: 16,
    icon: Waves,
  },
  {
    id: "p18",
    name: "Pool Cover Installation",
    category: "Accessories",
    description: "Automatic or manual pool cover system",
    basePrice: 8500,
    laborHours: 8,
    icon: Waves,
  },
  {
    id: "p19",
    name: "Pool Fence (per linear ft)",
    category: "Safety",
    description: "Code-compliant pool safety fence",
    basePrice: 85,
    laborHours: 0.25,
    icon: Waves,
  },
  {
    id: "p20",
    name: "Pool Startup & Chemical Balance",
    category: "Service",
    description: "Initial fill, chemical balance, and equipment startup",
    basePrice: 350,
    laborHours: 4,
    icon: Droplets,
  },
];

const getServicesForRole = (role: string | null): PlumbingService[] => {
  if (role === "pool") return poolServices;
  return plumbingServices;
};

const getCategoriesForRole = (role: string | null): string[] => {
  const services = getServicesForRole(role);
  return [...new Set(services.map((s) => s.category))];
};



export default function EstimateGeneratorScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [laborRate, setLaborRate] = useState("85");
  const [taxRate, setTaxRate] = useState("8.25");
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [customItem, setCustomItem] = useState({
    name: "",
    description: "",
    price: "",
    hours: "",
    quantity: "1",
  });
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteValidDays, setQuoteValidDays] = useState("30");

  const currentServices = useMemo(() => getServicesForRole(role || null), [role]);
  const currentCategories = useMemo(() => getCategoriesForRole(role || null), [role]);
  const isPoolRole = role === "pool";

  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return currentServices;
    return currentServices.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, currentServices]);

  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const totalLaborHours = lineItems.reduce(
      (sum, item) => sum + item.laborHours * item.quantity,
      0
    );
    const laborCost = totalLaborHours * parseFloat(laborRate || "0");
    const materialsCost = subtotal;
    const taxableAmount = materialsCost;
    const tax = taxableAmount * (parseFloat(taxRate || "0") / 100);
    const total = materialsCost + laborCost + tax;

    return {
      subtotal,
      totalLaborHours,
      laborCost,
      materialsCost,
      tax,
      total,
    };
  }, [lineItems, laborRate, taxRate]);

  const handleAddService = useCallback((service: PlumbingService) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItem: QuoteLineItem = {
      id: Date.now().toString(),
      serviceId: service.id,
      name: service.name,
      description: service.description,
      quantity: 1,
      unitPrice: service.basePrice,
      laborHours: service.laborHours,
      isCustom: false,
    };
    setLineItems((prev) => [...prev, newItem]);
    setShowServicePicker(false);
  }, []);

  const handleAddCustomItem = useCallback(() => {
    if (!customItem.name || !customItem.price) {
      Alert.alert("Missing Info", "Please enter item name and price");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItem: QuoteLineItem = {
      id: Date.now().toString(),
      name: customItem.name,
      description: customItem.description,
      quantity: parseInt(customItem.quantity) || 1,
      unitPrice: parseFloat(customItem.price) || 0,
      laborHours: parseFloat(customItem.hours) || 0,
      isCustom: true,
    };
    setLineItems((prev) => [...prev, newItem]);
    setCustomItem({ name: "", description: "", price: "", hours: "", quantity: "1" });
    setShowCustomItem(false);
  }, [customItem]);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const generateQuoteText = useCallback(() => {
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const validUntil = new Date(
      Date.now() + parseInt(quoteValidDays) * 86400000
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let text = `PLUMBING ESTIMATE\n`;
    text += `${"=".repeat(40)}\n\n`;
    text += `Date: ${date}\n`;
    text += `Valid Until: ${validUntil}\n\n`;

    if (customerInfo.name) {
      text += `CUSTOMER:\n`;
      text += `${customerInfo.name}\n`;
      if (customerInfo.address) text += `${customerInfo.address}\n`;
      if (customerInfo.phone) text += `Phone: ${customerInfo.phone}\n`;
      if (customerInfo.email) text += `Email: ${customerInfo.email}\n`;
      text += `\n`;
    }

    text += `SERVICES:\n`;
    text += `${"-".repeat(40)}\n`;
    lineItems.forEach((item) => {
      text += `${item.name} x${item.quantity}\n`;
      text += `  $${item.unitPrice.toFixed(2)} each = $${(
        item.unitPrice * item.quantity
      ).toFixed(2)}\n`;
      if (item.laborHours > 0) {
        text += `  Labor: ${(item.laborHours * item.quantity).toFixed(1)} hrs\n`;
      }
    });
    text += `${"-".repeat(40)}\n\n`;

    text += `SUMMARY:\n`;
    text += `Materials: $${calculations.materialsCost.toFixed(2)}\n`;
    text += `Labor (${calculations.totalLaborHours.toFixed(1)} hrs @ $${laborRate}/hr): $${calculations.laborCost.toFixed(2)}\n`;
    text += `Tax (${taxRate}%): $${calculations.tax.toFixed(2)}\n`;
    text += `${"=".repeat(40)}\n`;
    text += `TOTAL: $${calculations.total.toFixed(2)}\n\n`;

    if (quoteNotes) {
      text += `NOTES:\n${quoteNotes}\n\n`;
    }

    text += `This estimate is valid for ${quoteValidDays} days.\n`;
    text += `Thank you for your business!`;

    return text;
  }, [lineItems, customerInfo, calculations, quoteNotes, quoteValidDays, laborRate, taxRate]);

  const handleShare = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const quoteText = generateQuoteText();
    try {
      await Share.share({
        message: quoteText,
        title: "Plumbing Estimate",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  }, [generateQuoteText]);

  const handleCopyQuote = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const quoteText = generateQuoteText();
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(quoteText);
        Alert.alert("Copied!", "Estimate copied to clipboard");
      } catch {
        Alert.alert("Error", "Failed to copy to clipboard");
      }
    } else {
      Alert.alert("Quote Generated", "Use the share button to send this estimate");
    }
  }, [generateQuoteText]);

  const renderLineItem = (item: QuoteLineItem) => (
    <View key={item.id} style={styles.lineItem}>
      <View style={styles.lineItemHeader}>
        <View style={styles.lineItemInfo}>
          <Text style={styles.lineItemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.lineItemDesc} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <View style={styles.lineItemFooter}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, -1)}
          >
            <Minus size={14} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, 1)}
          >
            <Plus size={14} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.lineItemPricing}>
          <Text style={styles.unitPrice}>${item.unitPrice.toFixed(2)} ea</Text>
          <Text style={styles.lineTotal}>
            ${(item.unitPrice * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>

      {item.laborHours > 0 && (
        <View style={styles.laborRow}>
          <Clock size={12} color={Colors.textTertiary} />
          <Text style={styles.laborText}>
            {(item.laborHours * item.quantity).toFixed(1)} hrs labor
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Estimate Generator",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowPreview(true)}
              style={styles.previewButton}
              disabled={lineItems.length === 0}
            >
              <FileText
                size={22}
                color={lineItems.length === 0 ? Colors.textTertiary : Colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerCard}>
            <View style={styles.inputRow}>
              <User size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.customerInput}
                placeholder="Customer Name"
                placeholderTextColor={Colors.textTertiary}
                value={customerInfo.name}
                onChangeText={(text) =>
                  setCustomerInfo((prev) => ({ ...prev, name: text }))
                }
              />
            </View>
            <View style={styles.inputRow}>
              <Phone size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.customerInput}
                placeholder="Phone Number"
                placeholderTextColor={Colors.textTertiary}
                value={customerInfo.phone}
                onChangeText={(text) =>
                  setCustomerInfo((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputRow}>
              <Mail size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.customerInput}
                placeholder="Email Address"
                placeholderTextColor={Colors.textTertiary}
                value={customerInfo.email}
                onChangeText={(text) =>
                  setCustomerInfo((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputRow}>
              <MapPin size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.customerInput}
                placeholder="Service Address"
                placeholderTextColor={Colors.textTertiary}
                value={customerInfo.address}
                onChangeText={(text) =>
                  setCustomerInfo((prev) => ({ ...prev, address: text }))
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Line Items</Text>
            <View style={styles.addButtons}>
              <TouchableOpacity
                style={styles.addServiceButton}
                onPress={() => setShowServicePicker(true)}
              >
                <Plus size={16} color="#FFF" />
                <Text style={styles.addButtonText}>Service</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => setShowCustomItem(true)}
              >
                <Edit3 size={16} color={Colors.primary} />
                <Text style={styles.addCustomText}>Custom</Text>
              </TouchableOpacity>
            </View>
          </View>

          {lineItems.length === 0 ? (
            <View style={styles.emptyItems}>
              <Calculator size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Items Added</Text>
              <Text style={styles.emptyText}>
                Add plumbing services to generate an estimate
              </Text>
            </View>
          ) : (
            <View style={styles.lineItemsList}>
              {lineItems.map(renderLineItem)}
            </View>
          )}
        </View>

        <View style={styles.ratesSection}>
          <Text style={styles.sectionTitle}>Rates & Settings</Text>
          <View style={styles.ratesCard}>
            <View style={styles.rateRowVertical}>
              <View style={styles.rateLabelRow}>
                <DollarSign size={16} color={Colors.textSecondary} />
                <Text style={styles.rateLabelText}>Labor Rate (per hour)</Text>
              </View>
              <View style={styles.rateInputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.rateInput}
                  value={laborRate}
                  onChangeText={setLaborRate}
                  keyboardType="decimal-pad"
                  placeholder="85"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>
            <View style={styles.rateRowVertical}>
              <View style={styles.rateLabelRow}>
                <Percent size={16} color={Colors.textSecondary} />
                <Text style={styles.rateLabelText}>Tax Rate</Text>
              </View>
              <View style={styles.rateInputWrapper}>
                <TextInput
                  style={styles.rateInput}
                  value={taxRate}
                  onChangeText={setTaxRate}
                  keyboardType="decimal-pad"
                  placeholder="8.25"
                  placeholderTextColor={Colors.textTertiary}
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>
            <View style={styles.rateRowVertical}>
              <View style={styles.rateLabelRow}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.rateLabelText}>Quote Valid (days)</Text>
              </View>
              <TextInput
                style={styles.daysInput}
                value={quoteValidDays}
                onChangeText={setQuoteValidDays}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>
        </View>

        {lineItems.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Estimate Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Materials/Services</Text>
                <Text style={styles.summaryValue}>
                  ${calculations.materialsCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Labor ({calculations.totalLaborHours.toFixed(1)} hrs)
                </Text>
                <Text style={styles.summaryValue}>
                  ${calculations.laborCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
                <Text style={styles.summaryValue}>
                  ${calculations.tax.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Estimate</Text>
                <Text style={styles.totalValue}>
                  ${calculations.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any additional notes, terms, or conditions..."
            placeholderTextColor={Colors.textTertiary}
            value={quoteNotes}
            onChangeText={setQuoteNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {lineItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomTotal}>
            <Text style={styles.bottomTotalLabel}>Total</Text>
            <Text style={styles.bottomTotalValue}>
              ${calculations.total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyQuote}>
              <Copy size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Send size={18} color="#FFF" />
              <Text style={styles.shareButtonText}>Send Estimate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={showServicePicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowServicePicker(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{isPoolRole ? "Add Pool Service" : "Add Service"}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === "all" && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory("all")}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === "all" && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {currentCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.servicesList}>
            {filteredServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceItem}
                  onPress={() => handleAddService(service)}
                >
                  <View style={styles.serviceIconWrapper}>
                    <ServiceIcon size={22} color="#3B82F6" />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDesc} numberOfLines={1}>
                      {service.description}
                    </Text>
                    <View style={styles.serviceMeta}>
                      <Text style={styles.servicePrice}>
                        ${service.basePrice.toFixed(0)}
                      </Text>
                      {service.laborHours > 0 && (
                        <Text style={styles.serviceLaborHrs}>
                          • {service.laborHours} hr{service.laborHours !== 1 ? "s" : ""} labor
                        </Text>
                      )}
                    </View>
                  </View>
                  <Plus size={20} color={Colors.primary} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showCustomItem} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCustomItem(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Custom Item</Text>
            <TouchableOpacity onPress={handleAddCustomItem}>
              <Check size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.customItemForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Item Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Custom pipe fitting"
                placeholderTextColor={Colors.textTertiary}
                value={customItem.name}
                onChangeText={(text) =>
                  setCustomItem((prev) => ({ ...prev, name: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Brief description of the item or service"
                placeholderTextColor={Colors.textTertiary}
                value={customItem.description}
                onChangeText={(text) =>
                  setCustomItem((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Unit Price *</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.pricePrefix}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textTertiary}
                    value={customItem.price}
                    onChangeText={(text) =>
                      setCustomItem((prev) => ({ ...prev, price: text }))
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="1"
                  placeholderTextColor={Colors.textTertiary}
                  value={customItem.quantity}
                  onChangeText={(text) =>
                    setCustomItem((prev) => ({ ...prev, quantity: text }))
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Labor Hours</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                value={customItem.hours}
                onChangeText={(text) =>
                  setCustomItem((prev) => ({ ...prev, hours: text }))
                }
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showPreview} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Estimate Preview</Text>
            <TouchableOpacity onPress={handleShare}>
              <Send size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <View style={styles.previewLogo}>
                <Droplets size={32} color="#3B82F6" />
              </View>
              <Text style={styles.previewTitle}>PLUMBING ESTIMATE</Text>
              <Text style={styles.previewDate}>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            {customerInfo.name && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Customer</Text>
                <View style={styles.previewCustomerCard}>
                  <Text style={styles.previewCustomerName}>{customerInfo.name}</Text>
                  {customerInfo.address && (
                    <Text style={styles.previewCustomerInfo}>{customerInfo.address}</Text>
                  )}
                  {customerInfo.phone && (
                    <Text style={styles.previewCustomerInfo}>{customerInfo.phone}</Text>
                  )}
                  {customerInfo.email && (
                    <Text style={styles.previewCustomerInfo}>{customerInfo.email}</Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Services</Text>
              {lineItems.map((item) => (
                <View key={item.id} style={styles.previewLineItem}>
                  <View style={styles.previewLineInfo}>
                    <Text style={styles.previewLineName}>{item.name}</Text>
                    <Text style={styles.previewLineDesc}>
                      Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.previewLineTotal}>
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.previewSummary}>
              <View style={styles.previewSummaryRow}>
                <Text style={styles.previewSummaryLabel}>Materials/Services</Text>
                <Text style={styles.previewSummaryValue}>
                  ${calculations.materialsCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.previewSummaryRow}>
                <Text style={styles.previewSummaryLabel}>
                  Labor ({calculations.totalLaborHours.toFixed(1)} hrs @ ${laborRate}/hr)
                </Text>
                <Text style={styles.previewSummaryValue}>
                  ${calculations.laborCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.previewSummaryRow}>
                <Text style={styles.previewSummaryLabel}>Tax ({taxRate}%)</Text>
                <Text style={styles.previewSummaryValue}>
                  ${calculations.tax.toFixed(2)}
                </Text>
              </View>
              <View style={styles.previewTotalRow}>
                <Text style={styles.previewTotalLabel}>Total</Text>
                <Text style={styles.previewTotalValue}>
                  ${calculations.total.toFixed(2)}
                </Text>
              </View>
            </View>

            {quoteNotes && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Notes</Text>
                <Text style={styles.previewNotes}>{quoteNotes}</Text>
              </View>
            )}

            <View style={styles.previewFooter}>
              <Text style={styles.previewValidText}>
                This estimate is valid for {quoteValidDays} days
              </Text>
              <Text style={styles.previewThankYou}>Thank you for your business!</Text>
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
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  previewButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  customerSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  customerInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  servicesSection: {
    padding: 16,
    paddingTop: 0,
  },
  addButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addCustomText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  emptyItems: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  lineItemsList: {
    gap: 10,
  },
  lineItem: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  lineItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  lineItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  lineItemName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  lineItemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: 6,
  },
  lineItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
  },
  quantityButton: {
    padding: 10,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    minWidth: 30,
    textAlign: "center" as const,
  },
  lineItemPricing: {
    alignItems: "flex-end",
  },
  unitPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lineTotal: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  laborRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  laborText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  ratesSection: {
    padding: 16,
    paddingTop: 0,
  },
  ratesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  rateRowVertical: {
    gap: 8,
  },
  rateLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    flexWrap: "wrap" as const,
  },
  rateLabelText: {
    fontSize: 14,
    color: Colors.text,
    flexShrink: 1,
  },
  rateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignSelf: "flex-start" as const,
    minWidth: 80,
  },
  currencySymbol: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  percentSymbol: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  rateInput: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    paddingVertical: 8,
    minWidth: 50,
    textAlign: "right" as const,
  },
  daysInput: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 60,
    textAlign: "center" as const,
    alignSelf: "flex-start" as const,
  },
  summarySection: {
    padding: 16,
    paddingTop: 0,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#22C55E",
  },
  notesSection: {
    padding: 16,
    paddingTop: 0,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  bottomTotal: {},
  bottomTotalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomTotalValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  bottomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#22C55E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  categoryScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#3B82F6",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: "#FFF",
  },
  servicesList: {
    flex: 1,
    padding: 16,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  serviceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  serviceDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  serviceMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#22C55E",
  },
  serviceLaborHrs: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 6,
  },
  customItemForm: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  formTextArea: {
    minHeight: 80,
  },
  formRow: {
    flexDirection: "row",
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pricePrefix: {
    fontSize: 16,
    color: Colors.textSecondary,
    paddingLeft: 14,
  },
  priceInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  previewLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: 1,
  },
  previewDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  previewCustomerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  previewCustomerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  previewCustomerInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  previewLineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  previewLineInfo: {
    flex: 1,
  },
  previewLineName: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  previewLineDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  previewLineTotal: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  previewSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  previewSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  previewSummaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  previewSummaryValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  previewTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  previewTotalLabel: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  previewTotalValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#22C55E",
  },
  previewNotes: {
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    lineHeight: 20,
  },
  previewFooter: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  previewValidText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  previewThankYou: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 8,
  },
});
