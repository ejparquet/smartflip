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
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Search,
  Filter,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Calendar,
  Building2,
  TrendingUp,
  Eye,
  Edit3,
  Trash2,
  X,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Professional } from "@/types";

type BidStatus = "draft" | "submitted" | "under_review" | "accepted" | "rejected" | "expired";
type TabType = "my-bids" | "opportunities" | "templates";

interface Bid {
  id: string;
  projectName: string;
  projectImage: string;
  clientName: string;
  clientAvatar: string;
  address: string;
  amount: number;
  laborCost: number;
  materialCost: number;
  profit: number;
  status: BidStatus;
  submittedDate?: string;
  responseDate?: string;
  expiresDate?: string;
  notes?: string;
  projectType: string;
  timeline: string;
}

interface BidOpportunity {
  id: string;
  projectName: string;
  projectImage: string;
  clientName: string;
  clientAvatar: string;
  address: string;
  projectType: string;
  estimatedBudget: string;
  timeline: string;
  description: string;
  requirements: string[];
  postedDate: string;
  bidsReceived: number;
  isUrgent?: boolean;
}

interface BidTemplate {
  id: string;
  name: string;
  projectType: string;
  baseAmount: number;
  laborPercent: number;
  materialPercent: number;
  profitPercent: number;
  lastUsed: string;
}

const mockBids: Bid[] = [
  {
    id: "b1",
    projectName: "Kitchen Renovation",
    projectImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    clientName: "Jennifer Adams",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    address: "456 Maple St, Austin, TX",
    amount: 45000,
    laborCost: 18000,
    materialCost: 22000,
    profit: 5000,
    status: "accepted",
    submittedDate: "2026-01-20",
    responseDate: "2026-01-24",
    projectType: "Kitchen Remodel",
    timeline: "6 weeks",
    notes: "Client approved! Start date Feb 3rd.",
  },
  {
    id: "b2",
    projectName: "Bathroom Remodel",
    projectImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
    clientName: "Robert Chen",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    address: "789 Oak Dr, Round Rock, TX",
    amount: 12500,
    laborCost: 5500,
    materialCost: 5500,
    profit: 1500,
    status: "under_review",
    submittedDate: "2026-01-25",
    expiresDate: "2026-02-08",
    projectType: "Bathroom Remodel",
    timeline: "2 weeks",
  },
  {
    id: "b3",
    projectName: "Deck Addition",
    projectImage: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=400",
    clientName: "Sarah Williams",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    address: "123 Pine Ave, Cedar Park, TX",
    amount: 9200,
    laborCost: 4200,
    materialCost: 3800,
    profit: 1200,
    status: "submitted",
    submittedDate: "2026-01-26",
    expiresDate: "2026-02-09",
    projectType: "Outdoor Living",
    timeline: "3 weeks",
  },
  {
    id: "b4",
    projectName: "Basement Finishing",
    projectImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    clientName: "Michael Torres",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    address: "567 Elm Blvd, Pflugerville, TX",
    amount: 32000,
    laborCost: 14000,
    materialCost: 14000,
    profit: 4000,
    status: "rejected",
    submittedDate: "2026-01-15",
    responseDate: "2026-01-22",
    projectType: "Basement",
    timeline: "5 weeks",
    notes: "Client went with lower bid.",
  },
  {
    id: "b5",
    projectName: "Garage Conversion",
    projectImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    clientName: "Emily Johnson",
    clientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    address: "890 Birch Ln, Austin, TX",
    amount: 28000,
    laborCost: 12000,
    materialCost: 12500,
    profit: 3500,
    status: "draft",
    projectType: "Conversion",
    timeline: "4 weeks",
  },
];

const mockOpportunities: BidOpportunity[] = [
  {
    id: "o1",
    projectName: "Master Suite Addition",
    projectImage: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400",
    clientName: "David Martinez",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    address: "234 Sunset Dr, Lakeway, TX",
    projectType: "Home Addition",
    estimatedBudget: "$75,000 - $95,000",
    timeline: "10-12 weeks",
    description: "Looking to add a master suite with walk-in closet and en-suite bathroom. Approximately 400 sq ft addition.",
    requirements: ["Licensed GC", "Addition experience", "Insurance required"],
    postedDate: "2 days ago",
    bidsReceived: 4,
    isUrgent: true,
  },
  {
    id: "o2",
    projectName: "Whole House Remodel",
    projectImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    clientName: "Lisa Thompson",
    clientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    address: "567 Heritage Ct, Westlake, TX",
    projectType: "Full Renovation",
    estimatedBudget: "$150,000 - $200,000",
    timeline: "16-20 weeks",
    description: "Complete renovation of 2,800 sq ft home. Kitchen, bathrooms, flooring, paint, and some structural work.",
    requirements: ["10+ years experience", "Project management", "References"],
    postedDate: "1 week ago",
    bidsReceived: 8,
  },
  {
    id: "o3",
    projectName: "Commercial Office Build-Out",
    projectImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    clientName: "Tech Solutions Inc.",
    clientAvatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
    address: "100 Tech Park Dr, Austin, TX",
    projectType: "Commercial TI",
    estimatedBudget: "$85,000 - $110,000",
    timeline: "8 weeks",
    description: "Office build-out for tech startup. 3,500 sq ft space needing conference rooms, open workspace, and break room.",
    requirements: ["Commercial experience", "Licensed", "Bonded"],
    postedDate: "3 days ago",
    bidsReceived: 6,
  },
];

const mockTemplates: BidTemplate[] = [
  {
    id: "t1",
    name: "Kitchen Remodel Standard",
    projectType: "Kitchen",
    baseAmount: 35000,
    laborPercent: 40,
    materialPercent: 48,
    profitPercent: 12,
    lastUsed: "2026-01-20",
  },
  {
    id: "t2",
    name: "Bathroom Basic",
    projectType: "Bathroom",
    baseAmount: 12000,
    laborPercent: 45,
    materialPercent: 42,
    profitPercent: 13,
    lastUsed: "2026-01-18",
  },
  {
    id: "t3",
    name: "Deck/Outdoor",
    projectType: "Outdoor",
    baseAmount: 8000,
    laborPercent: 50,
    materialPercent: 38,
    profitPercent: 12,
    lastUsed: "2026-01-15",
  },
];

export default function BidsScreen() {
  const { user } = useAuth();
  const professional = user as Professional | null;
  const [activeTab, setActiveTab] = useState<TabType>("my-bids");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<BidStatus | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<BidOpportunity | null>(null);

  const getStatusColor = (status: BidStatus) => {
    switch (status) {
      case "draft": return Colors.textSecondary;
      case "submitted": return "#3B82F6";
      case "under_review": return "#272D53";
      case "accepted": return Colors.success;
      case "rejected": return Colors.error;
      case "expired": return Colors.textTertiary;
    }
  };

  const getStatusLabel = (status: BidStatus) => {
    switch (status) {
      case "draft": return "Draft";
      case "submitted": return "Submitted";
      case "under_review": return "Under Review";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
      case "expired": return "Expired";
    }
  };

  const getStatusIcon = (status: BidStatus) => {
    switch (status) {
      case "draft": return Edit3;
      case "submitted": return Send;
      case "under_review": return Eye;
      case "accepted": return CheckCircle;
      case "rejected": return XCircle;
      case "expired": return AlertCircle;
    }
  };

  const filteredBids = mockBids.filter(bid => {
    const matchesSearch = bid.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bid.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || bid.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalBids: mockBids.length,
    pending: mockBids.filter(b => ["submitted", "under_review"].includes(b.status)).length,
    accepted: mockBids.filter(b => b.status === "accepted").length,
    winRate: Math.round((mockBids.filter(b => b.status === "accepted").length / mockBids.filter(b => ["accepted", "rejected"].includes(b.status)).length) * 100) || 0,
    totalValue: mockBids.filter(b => b.status === "accepted").reduce((sum, b) => sum + b.amount, 0),
  };

  const renderBidCard = (bid: Bid) => {
    const StatusIcon = getStatusIcon(bid.status);
    return (
      <TouchableOpacity key={bid.id} style={styles.bidCard}>
        <View style={styles.bidHeader}>
          <Image source={{ uri: bid.projectImage }} style={styles.bidImage} contentFit="cover" />
          <View style={styles.bidInfo}>
            <Text style={styles.bidProjectName}>{bid.projectName}</Text>
            <View style={styles.bidClientRow}>
              <Image source={{ uri: bid.clientAvatar }} style={styles.bidClientAvatar} />
              <Text style={styles.bidClientName}>{bid.clientName}</Text>
            </View>
            <View style={styles.bidLocationRow}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text style={styles.bidLocationText} numberOfLines={1}>{bid.address}</Text>
            </View>
          </View>
          <View style={[styles.bidStatusBadge, { backgroundColor: `${getStatusColor(bid.status)}15` }]}>
            <StatusIcon size={12} color={getStatusColor(bid.status)} />
            <Text style={[styles.bidStatusText, { color: getStatusColor(bid.status) }]}>
              {getStatusLabel(bid.status)}
            </Text>
          </View>
        </View>

        <View style={styles.bidAmountSection}>
          <View style={styles.bidAmountMain}>
            <Text style={styles.bidAmountLabel}>Total Bid</Text>
            <Text style={styles.bidAmountValue}>${bid.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.bidAmountBreakdown}>
            <View style={styles.bidAmountItem}>
              <Text style={styles.bidAmountItemLabel}>Labor</Text>
              <Text style={styles.bidAmountItemValue}>${bid.laborCost.toLocaleString()}</Text>
            </View>
            <View style={styles.bidAmountItem}>
              <Text style={styles.bidAmountItemLabel}>Materials</Text>
              <Text style={styles.bidAmountItemValue}>${bid.materialCost.toLocaleString()}</Text>
            </View>
            <View style={styles.bidAmountItem}>
              <Text style={styles.bidAmountItemLabel}>Profit</Text>
              <Text style={[styles.bidAmountItemValue, { color: Colors.success }]}>
                ${bid.profit.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bidMeta}>
          <View style={styles.bidMetaItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.bidMetaText}>{bid.timeline}</Text>
          </View>
          <View style={styles.bidMetaItem}>
            <FileText size={14} color={Colors.textSecondary} />
            <Text style={styles.bidMetaText}>{bid.projectType}</Text>
          </View>
        </View>

        {bid.notes && (
          <View style={styles.bidNotesContainer}>
            <Text style={styles.bidNotesText}>{bid.notes}</Text>
          </View>
        )}

        <View style={styles.bidFooter}>
          {bid.submittedDate && (
            <Text style={styles.bidDateText}>
              Submitted {new Date(bid.submittedDate).toLocaleDateString()}
            </Text>
          )}
          <View style={styles.bidActions}>
            {bid.status === "draft" && (
              <>
                <TouchableOpacity style={styles.bidActionBtn}>
                  <Edit3 size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bidActionBtn}>
                  <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bidSubmitBtn]}>
                  <Send size={14} color={Colors.white} />
                  <Text style={styles.bidSubmitText}>Submit</Text>
                </TouchableOpacity>
              </>
            )}
            {bid.status !== "draft" && (
              <TouchableOpacity style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOpportunityCard = (opportunity: BidOpportunity) => (
    <TouchableOpacity 
      key={opportunity.id} 
      style={styles.opportunityCard}
      onPress={() => setSelectedOpportunity(opportunity)}
    >
      <Image source={{ uri: opportunity.projectImage }} style={styles.opportunityImage} contentFit="cover" />
      {opportunity.isUrgent && (
        <View style={styles.urgentBadge}>
          <AlertCircle size={12} color={Colors.white} />
          <Text style={styles.urgentText}>Urgent</Text>
        </View>
      )}
      <View style={styles.opportunityContent}>
        <View style={styles.opportunityHeader}>
          <Text style={styles.opportunityName}>{opportunity.projectName}</Text>
          <View style={styles.opportunityBidsCount}>
            <FileText size={12} color={Colors.textSecondary} />
            <Text style={styles.opportunityBidsText}>{opportunity.bidsReceived} bids</Text>
          </View>
        </View>
        <View style={styles.opportunityClientRow}>
          <Image source={{ uri: opportunity.clientAvatar }} style={styles.opportunityClientAvatar} />
          <Text style={styles.opportunityClientName}>{opportunity.clientName}</Text>
        </View>
        <View style={styles.opportunityLocation}>
          <MapPin size={12} color={Colors.textSecondary} />
          <Text style={styles.opportunityLocationText}>{opportunity.address}</Text>
        </View>
        <Text style={styles.opportunityDescription} numberOfLines={2}>
          {opportunity.description}
        </Text>
        <View style={styles.opportunityStats}>
          <View style={styles.opportunityStat}>
            <DollarSign size={14} color={Colors.success} />
            <Text style={styles.opportunityStatText}>{opportunity.estimatedBudget}</Text>
          </View>
          <View style={styles.opportunityStat}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.opportunityStatText}>{opportunity.timeline}</Text>
          </View>
        </View>
        <View style={styles.opportunityFooter}>
          <Text style={styles.opportunityPosted}>Posted {opportunity.postedDate}</Text>
          <TouchableOpacity style={styles.createBidBtn}>
            <Plus size={14} color={Colors.white} />
            <Text style={styles.createBidText}>Create Bid</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateCard = (template: BidTemplate) => (
    <TouchableOpacity key={template.id} style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateIcon}>
          <FileText size={20} color="#272D53" />
        </View>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateType}>{template.projectType}</Text>
        </View>
        <TouchableOpacity style={styles.templateEditBtn}>
          <Edit3 size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.templateStats}>
        <View style={styles.templateStat}>
          <Text style={styles.templateStatLabel}>Base</Text>
          <Text style={styles.templateStatValue}>${template.baseAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.templateStatDivider} />
        <View style={styles.templateStat}>
          <Text style={styles.templateStatLabel}>Labor</Text>
          <Text style={styles.templateStatValue}>{template.laborPercent}%</Text>
        </View>
        <View style={styles.templateStatDivider} />
        <View style={styles.templateStat}>
          <Text style={styles.templateStatLabel}>Material</Text>
          <Text style={styles.templateStatValue}>{template.materialPercent}%</Text>
        </View>
        <View style={styles.templateStatDivider} />
        <View style={styles.templateStat}>
          <Text style={styles.templateStatLabel}>Profit</Text>
          <Text style={[styles.templateStatValue, { color: Colors.success }]}>{template.profitPercent}%</Text>
        </View>
      </View>
      <View style={styles.templateFooter}>
        <Text style={styles.templateLastUsed}>
          Last used {new Date(template.lastUsed).toLocaleDateString()}
        </Text>
        <TouchableOpacity style={styles.useTemplateBtn}>
          <Text style={styles.useTemplateText}>Use Template</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderMyBids = () => (
    <>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <FileText size={20} color="#272D53" />
          <Text style={styles.statValue}>{stats.totalBids}</Text>
          <Text style={styles.statLabel}>Total Bids</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color="#3B82F6" />
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={20} color={Colors.success} />
          <Text style={styles.statValue}>{stats.winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={20} color={Colors.success} />
          <Text style={styles.statValue}>${(stats.totalValue / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Won Value</Text>
        </View>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bids..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          {(["all", "draft", "submitted", "under_review", "accepted", "rejected"] as const).map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                {status === "all" ? "All" : getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredBids.map(bid => renderBidCard(bid))}

      {filteredBids.length === 0 && (
        <View style={styles.emptyState}>
          <FileText size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyStateTitle}>No Bids Found</Text>
          <Text style={styles.emptyStateSubtitle}>
            {searchQuery ? "Try adjusting your search" : "Create your first bid from opportunities"}
          </Text>
        </View>
      )}
    </>
  );

  const renderOpportunities = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Projects</Text>
        <Text style={styles.sectionSubtitle}>{mockOpportunities.length} projects seeking bids</Text>
      </View>
      {mockOpportunities.map(opportunity => renderOpportunityCard(opportunity))}
    </>
  );

  const renderTemplates = () => (
    <>
      <View style={styles.templatesHeader}>
        <View>
          <Text style={styles.sectionTitle}>Bid Templates</Text>
          <Text style={styles.sectionSubtitle}>Quickly create bids with saved templates</Text>
        </View>
        <TouchableOpacity style={styles.addTemplateBtn}>
          <Plus size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
      {mockTemplates.map(template => renderTemplateCard(template))}
    </>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bid Management</Text>
            <Text style={styles.subtitle}>Track and submit project bids</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {([
            { key: "my-bids", label: "My Bids", icon: FileText },
            { key: "opportunities", label: "Opportunities", icon: Building2 },
            { key: "templates", label: "Templates", icon: FileText },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon size={16} color={activeTab === tab.key ? Colors.white : Colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "my-bids" && renderMyBids()}
        {activeTab === "opportunities" && renderOpportunities()}
        {activeTab === "templates" && renderTemplates()}
      </ScrollView>

      <Modal
        visible={selectedOpportunity !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedOpportunity(null)}
      >
        {selectedOpportunity && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Bid</Text>
              <TouchableOpacity onPress={() => setSelectedOpportunity(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Image 
                source={{ uri: selectedOpportunity.projectImage }} 
                style={styles.modalImage} 
                contentFit="cover" 
              />
              <Text style={styles.modalProjectName}>{selectedOpportunity.projectName}</Text>
              <Text style={styles.modalDescription}>{selectedOpportunity.description}</Text>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Your Bid</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Total Amount</Text>
                  <View style={styles.amountInput}>
                    <DollarSign size={18} color={Colors.textSecondary} />
                    <TextInput 
                      style={styles.amountInputField}
                      placeholder="0.00"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textTertiary}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Timeline</Text>
                  <TextInput 
                    style={styles.textInput}
                    placeholder="e.g., 6 weeks"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput 
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Add any notes or conditions..."
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBidBtn}>
                <Send size={18} color={Colors.white} />
                <Text style={styles.submitBidText}>Submit Bid</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#272D53",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  filterChips: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  bidCard: {
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
  bidHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  bidImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
  },
  bidInfo: {
    flex: 1,
  },
  bidProjectName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  bidClientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  bidClientAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  bidClientName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bidLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  bidLocationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  bidStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bidStatusText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  bidAmountSection: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  bidAmountMain: {
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bidAmountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bidAmountValue: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  bidAmountBreakdown: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bidAmountItem: {
    alignItems: "center",
  },
  bidAmountItemLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  bidAmountItemValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 2,
  },
  bidMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  bidMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bidMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bidNotesContainer: {
    backgroundColor: "#E8E9EE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bidNotesText: {
    fontSize: 13,
    color: "#B45309",
  },
  bidFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bidDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bidActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bidActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  bidSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#272D53",
  },
  bidSubmitText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  opportunityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  opportunityImage: {
    width: "100%",
    height: 120,
  },
  urgentBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  opportunityContent: {
    padding: 16,
  },
  opportunityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  opportunityName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  opportunityBidsCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  opportunityBidsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  opportunityClientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  opportunityClientAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  opportunityClientName: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  opportunityLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  opportunityLocationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  opportunityDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  opportunityStats: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 14,
  },
  opportunityStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  opportunityStatText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  opportunityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  opportunityPosted: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  createBidBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#272D53",
  },
  createBidText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  templatesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addTemplateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
  },
  templateCard: {
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
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E8E9EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  templateType: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  templateEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  templateStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  templateStat: {
    alignItems: "center",
  },
  templateStatLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  templateStatValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  templateStatDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  templateFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  templateLastUsed: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  useTemplateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  useTemplateText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalProjectName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  amountInputField: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    paddingVertical: 14,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top" as const,
  },
  submitBidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#272D53",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 40,
  },
  submitBidText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
