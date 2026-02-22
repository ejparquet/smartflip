export type UserRole = "homeowner" | "professional";

export type ProfessionalType =
  | "contractor"
  | "painter"
  | "plumber"
  | "electrician"
  | "realtor"
  | "landscaper"
  | "interior_designer"
  | "pool_company"
  | "dumpster_service"
  | "roofer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Professional extends User {
  role: "professional";
  professionalType: ProfessionalType;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  bio: string;
  specialties: string[];
  serviceArea: string;
  portfolioImages: string[];
  isVerified: boolean;
  hourlyRate?: number;
  completedProjects: number;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
}

export interface Review {
  id: string;
  professionalId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  projectName?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  status: "planning" | "in_progress" | "on_hold" | "completed";
  purchasePrice: number;
  estimatedARV: number;
  renovationBudget: number;
  actualSpent: number;
  progressPercentage: number;
  estimatedProfit: number;
  startDate: string;
  estimatedEndDate?: string;
  completedDate?: string;
  coverImage?: string;
  images: ProjectImage[];
  team: TeamMember[];
  contracts: Contract[];
  permits: Permit[];
  inspections: Inspection[];
  createdAt: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  timeline?: string;
  description?: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  caption?: string;
  category: "before" | "during" | "after";
  uploadedAt: string;
}

export interface TeamMember {
  id: string;
  projectId: string;
  professionalId: string;
  professional: Professional;
  role: string;
  status: "invited" | "accepted" | "declined";
  addedAt: string;
}

export interface Contract {
  id: string;
  projectId: string;
  title: string;
  professionalId?: string;
  professionalName?: string;
  amount: number;
  status: "draft" | "sent" | "signed" | "completed";
  startDate?: string;
  endDate?: string;
  fileUrl?: string;
  createdAt: string;
}

export interface Permit {
  id: string;
  projectId: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "expired";
  applicationDate?: string;
  approvalDate?: string;
  expirationDate?: string;
  permitNumber?: string;
  notes?: string;
}

export interface Inspection {
  id: string;
  projectId: string;
  type: string;
  status: "scheduled" | "passed" | "failed" | "pending";
  scheduledDate?: string;
  completedDate?: string;
  inspector?: string;
  notes?: string;
  items: InspectionItem[];
}

export interface InspectionItem {
  id: string;
  name: string;
  isChecked: boolean;
  notes?: string;
}

export interface Template {
  id: string;
  type: "contract" | "permit" | "inspection";
  title: string;
  description: string;
  category: string;
  content?: string;
  items?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "project" | "team" | "contract" | "review" | "system";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isEncrypted: boolean;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file" | "document";
  url: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  type: "direct" | "team";
  name: string;
  avatar?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  receiptUrl?: string;
}

export type ExpenseCategory =
  | "materials"
  | "labor"
  | "permits"
  | "equipment"
  | "utilities"
  | "insurance"
  | "marketing"
  | "other";

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  openHours: string;
  category: StoreCategory;
  image: string;
  latitude: number;
  longitude: number;
  inventory?: MaterialInventory[];
}

export type StoreCategory =
  | "hardware"
  | "lumber"
  | "electrical"
  | "plumbing"
  | "paint"
  | "flooring"
  | "appliances"
  | "nursery"
  | "garden_center"
  | "hardscape"
  | "irrigation"
  | "mulch"
  | "equipment";

export interface MaterialInventory {
  id: string;
  name: string;
  inStock: boolean;
  quantity: number;
  price: number;
  aisle?: string;
}

export type MarketplaceCategory =
  | "tile"
  | "wood"
  | "cabinets"
  | "fixtures"
  | "appliances"
  | "flooring"
  | "paint"
  | "lighting"
  | "hardware"
  | "plumbing"
  | "other";

export type ListingCondition = "new" | "like_new" | "good" | "fair";

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerPhone?: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  condition: ListingCondition;
  price: number;
  quantity: number;
  unit: string;
  images: string[];
  location: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  isSold: boolean;
  originalProject?: string;
}

export interface SoldProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  purchasePrice?: number;
  salePrice: number;
  soldDate: string;
  daysOnMarket: number;
  propertyType: "single_family" | "condo" | "townhouse" | "multi_family";
  image?: string;
}

export interface RealtorAvailability {
  hours: string;
  days: string;
  virtual: boolean;
  inPerson: boolean;
}

export interface RatingBreakdown {
  professionalism: number;
  negotiation: number;
  communication: number;
  marketKnowledge: number;
}

export type AgentTag = "new" | "mentor" | "top_producer";

export interface Realtor {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseState?: string;
  licenseVerifiedDate?: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  bio: string;
  specialties: string[];
  propertyTypes?: string[];
  serviceAreas: string[];
  serviceZipCodes?: string[];
  languages?: string[];
  availability?: RealtorAvailability;
  responseTime?: string;
  soldProperties: SoldProperty[];
  totalSalesVolume: number;
  averageDaysOnMarket: number;
  firmId?: string;
  firmName?: string;
  isVerified: boolean;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
  ratingBreakdown?: RatingBreakdown;
  badges?: string[];
  preferredInvestors?: string[];
  agentTag?: AgentTag;
}

export interface FirmBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FirmAgent {
  id: string;
  name: string;
  avatar: string;
  tag?: AgentTag;
  salesVolume: number;
  rating: number;
}

export interface RealEstateFirm {
  id: string;
  name: string;
  logo: string;
  coverImage?: string;
  address: string;
  phone: string;
  website?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  agentCount: number;
  description: string;
  mission?: string;
  specialties: string[];
  isHiring: boolean;
  latitude: number;
  longitude: number;
  distance?: string;
  commissionSplit?: string;
  fees?: string;
  transactionFee?: string;
  capAmount?: string;
  trainingProgram?: string;
  leadsProvided?: boolean;
  techStack?: string[];
  officeLocations?: string[];
  foundedYear?: number;
  awards?: string[];
  announcements?: FirmAnnouncement[];
  benefits?: FirmBenefit[];
  featuredAgents?: FirmAgent[];
  teamSize?: {
    total: number;
    newAgents: number;
    mentors: number;
    topProducers: number;
  };
  recentDeals?: {
    address: string;
    price: number;
    date: string;
    agentName: string;
  }[];
}

export interface FirmAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "training" | "meeting" | "referral" | "general";
}

export interface RealtorReview {
  id: string;
  realtorId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerType: "buyer" | "seller" | "investor";
  rating: number;
  professionalism: number;
  negotiation: number;
  communication: number;
  marketKnowledge: number;
  comment: string;
  propertyAddress?: string;
  transactionDate?: string;
  createdAt: string;
}

export interface RealtorProject {
  id: string;
  realtorId: string;
  investorId: string;
  investorName: string;
  investorAvatar?: string;
  propertyAddress: string;
  propertyImage?: string;
  status: "scouting" | "under_contract" | "rehab" | "listing_soon" | "active_listing" | "sold";
  role: "listing_agent" | "buyers_agent" | "dual_agent";
  estimatedListDate?: string;
  listPrice?: number;
  tasks: RealtorTask[];
  documents: ProjectDocument[];
  notes: ProjectNote[];
  createdAt: string;
  updatedAt: string;
}

export interface RealtorTask {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: "contract" | "disclosure" | "inspection" | "marketing" | "other";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface RealtorAnalytics {
  totalLeads: number;
  conversions: number;
  closings: number;
  totalVolume: number;
  averageDaysToClose: number;
  leadsBySource: LeadSource[];
  monthlyGoal: number;
  monthlyProgress: number;
  rankings: RealtorRanking[];
}

export interface LeadSource {
  source: "app" | "firm" | "personal" | "repeat";
  count: number;
  percentage: number;
}

export interface RealtorRanking {
  id: string;
  title: string;
  description: string;
  earnedAt?: string;
  icon: string;
}

export interface MarketInsight {
  area: string;
  medianPrice: number;
  priceChange: number;
  daysOnMarket: number;
  inventory: number;
  inventoryChange: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: "introduction" | "follow_up" | "appointment" | "closing";
  content: string;
  variables: string[];
}

export interface ScheduledEvent {
  id: string;
  title: string;
  type: "showing" | "listing_appointment" | "strategy_call" | "open_house" | "closing";
  date: string;
  time: string;
  duration: number;
  location?: string;
  attendees: string[];
  notes?: string;
  propertyId?: string;
}

export interface FirmApplication {
  id: string;
  firmId: string;
  applicantId: string;
  applicantName: string;
  status: "pending" | "under_review" | "interview" | "accepted" | "rejected";
  coverLetter?: string;
  resumeUrl?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface MarketingAsset {
  id: string;
  propertyId: string;
  type: "social_post" | "flyer" | "email" | "landing_page";
  title: string;
  content: string;
  images: string[];
  createdAt: string;
}

export interface OpenHouseChecklist {
  id: string;
  propertyId: string;
  items: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: "pre_event" | "during" | "post_event";
  isCompleted: boolean;
  notes?: string;
}

export interface DisclosureItem {
  id: string;
  title: string;
  description: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
}

export interface IssueReport {
  id: string;
  reporterId: string;
  reportedId: string;
  type: "dispute" | "complaint" | "feedback";
  subject: string;
  description: string;
  status: "open" | "under_review" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

export type ServiceCallPriority = "emergency" | "urgent" | "routine" | "scheduled";
export type ServiceCallStatus = "pending" | "dispatched" | "en_route" | "in_progress" | "completed" | "cancelled";
export type ServiceCallType = "repair" | "installation" | "maintenance" | "inspection" | "emergency";

export interface ServiceCall {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type: ServiceCallType;
  priority: ServiceCallPriority;
  status: ServiceCallStatus;
  description: string;
  issueDetails?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dispatchedAt?: string;
}

export type ProjectInvitationType = "flip" | "remodel" | "renovation" | "new_construction";

export interface ProjectInvitation {
  id: string;
  projectName: string;
  projectAddress: string;
  projectImage?: string;
  projectType: ProjectInvitationType;
  inviterId: string;
  inviterName: string;
  inviterAvatar?: string;
  inviterPhone?: string;
  role: string;
  budget?: number;
  estimatedDuration?: string;
  description: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  expiresAt?: string;
  latitude?: number;
  longitude?: number;
}

export type LicenseStatus = "active" | "expired" | "pending" | "suspended";
export type CertificationType = "plumber_license" | "backflow" | "medical_gas" | "water_heater" | "continuing_education" | "osha" | "epa" | "electrician_license" | "journeyman_electrician" | "master_electrician" | "low_voltage" | "fire_alarm" | "other";

export interface License {
  id: string;
  type: CertificationType;
  name: string;
  licenseNumber: string;
  issuingAuthority: string;
  state?: string;
  issueDate: string;
  expirationDate: string;
  status: LicenseStatus;
  documentUrl?: string;
  notes?: string;
  renewalReminder?: boolean;
  ceCreditsRequired?: number;
  ceCreditsCompleted?: number;
}

export interface ContinuingEducation {
  id: string;
  licenseId: string;
  courseName: string;
  provider: string;
  completionDate: string;
  credits: number;
  certificateUrl?: string;
  category: string;
}

export type PropertyStatus = "signed" | "pending" | "closed";

export interface Property {
  id: string;
  ownerId: string;
  address: string;
  purchasePrice: number;
  estimatedARV: number;
  status: PropertyStatus;
  startDate: string;
  coverImage?: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  projectIds: string[];
  createdAt: string;
}
