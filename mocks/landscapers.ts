import { Review } from "@/types";

export interface LandscapeCompany {
  id: string;
  name: string;
  logo: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  employeeCount: number;
  description: string;
  specialties: string[];
  isHiring: boolean;
  hourlyRate: string;
  projectTypes: string[];
  equipment: string[];
  serviceAreas: string[];
  certifications: string[];
  insuranceCoverage: string;
  yearsInBusiness: number;
}

export interface LandscapeProject {
  id: string;
  projectName: string;
  clientName: string;
  clientAvatar: string;
  location: string;
  projectType: string;
  timeline: string;
  budget: string;
  timestamp: string;
  isNew: boolean;
  description: string;
}

export interface LandscapeJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  payRate: string;
  jobType: string;
  description: string;
  requirements: string[];
  postedDate: string;
  isUrgent: boolean;
}

export const mockLandscapeCompanies: LandscapeCompany[] = [
  {
    id: "lc1",
    name: "Green Vista Landscaping",
    logo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    address: "4521 Garden Way, Austin, TX 78701",
    phone: "(512) 555-0123",
    rating: 4.8,
    reviewCount: 156,
    employeeCount: 25,
    description: "Full-service landscaping company specializing in residential and commercial properties.",
    specialties: ["Lawn Care", "Irrigation Systems", "Hardscaping", "Tree Services"],
    isHiring: true,
    hourlyRate: "$18-28/hr",
    projectTypes: ["Residential", "Commercial", "HOA"],
    equipment: ["Riding Mowers", "Excavators", "Skid Steers"],
    serviceAreas: ["Austin", "Round Rock", "Cedar Park", "Georgetown"],
    certifications: ["Licensed Irrigator", "Pesticide Applicator", "ISA Certified Arborist"],
    insuranceCoverage: "$2M General Liability",
    yearsInBusiness: 15,
  },
  {
    id: "lc2",
    name: "Austin Elite Landscapes",
    logo: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400",
    address: "890 Oak Creek Dr, Austin, TX 78745",
    phone: "(512) 555-0456",
    rating: 4.9,
    reviewCount: 203,
    employeeCount: 40,
    description: "Premium landscaping services for high-end residential properties and estates.",
    specialties: ["Custom Design", "Pool Landscaping", "Outdoor Living", "Lighting"],
    isHiring: true,
    hourlyRate: "$22-35/hr",
    projectTypes: ["Luxury Residential", "Estates", "Custom Homes"],
    equipment: ["Full Fleet", "Design Software", "3D Rendering"],
    serviceAreas: ["Austin", "Westlake", "Lakeway", "Dripping Springs"],
    certifications: ["NALP Certified", "Master Gardener", "Landscape Architect"],
    insuranceCoverage: "$5M General Liability",
    yearsInBusiness: 22,
  },
  {
    id: "lc3",
    name: "Texas Native Landscapes",
    logo: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",
    address: "2100 Eco Blvd, Austin, TX 78702",
    phone: "(512) 555-0789",
    rating: 4.7,
    reviewCount: 89,
    employeeCount: 12,
    description: "Specializing in native Texas plants and sustainable landscaping solutions.",
    specialties: ["Native Plants", "Xeriscaping", "Rain Gardens", "Erosion Control"],
    isHiring: false,
    hourlyRate: "$20-30/hr",
    projectTypes: ["Eco-Friendly", "Water Conservation", "Native Restoration"],
    equipment: ["Sustainable Equipment", "Electric Mowers"],
    serviceAreas: ["Austin", "San Marcos", "New Braunfels"],
    certifications: ["Texas Native Plant Specialist", "Sustainable Landscaper"],
    insuranceCoverage: "$1M General Liability",
    yearsInBusiness: 8,
  },
  {
    id: "lc4",
    name: "Premier Property Services",
    logo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    address: "567 Commerce Park, Round Rock, TX 78664",
    phone: "(512) 555-1234",
    rating: 4.6,
    reviewCount: 312,
    employeeCount: 65,
    description: "Commercial landscape maintenance and installation for properties of all sizes.",
    specialties: ["Commercial Maintenance", "HOA Services", "Snow Removal", "Seasonal Color"],
    isHiring: true,
    hourlyRate: "$16-24/hr",
    projectTypes: ["Commercial", "Industrial", "Multi-Family", "HOA"],
    equipment: ["Large Fleet", "Commercial Mowers", "Trucks"],
    serviceAreas: ["Greater Austin Area", "San Antonio", "Houston"],
    certifications: ["Commercial Landscaper License", "Safety Certified"],
    insuranceCoverage: "$3M General Liability",
    yearsInBusiness: 18,
  },
];

export const mockLandscapeProjects: LandscapeProject[] = [
  {
    id: "lp1",
    projectName: "Backyard Renovation",
    clientName: "Jennifer Martinez - Homeowner",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    location: "1234 Sunset Dr, Austin, TX",
    projectType: "Full Landscape Design",
    timeline: "Start in 2 weeks",
    budget: "$15,000 - $20,000",
    timestamp: "2026-01-26T10:00:00Z",
    isNew: true,
    description: "Complete backyard transformation including patio, flower beds, and irrigation system.",
  },
  {
    id: "lp2",
    projectName: "Commercial Lawn Maintenance",
    clientName: "David Chen - Property Manager",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    location: "567 Business Park Ave, Round Rock, TX",
    projectType: "Weekly Maintenance",
    timeline: "Ongoing contract",
    budget: "$2,500/month",
    timestamp: "2026-01-26T08:30:00Z",
    isNew: true,
    description: "Weekly lawn maintenance for 5-acre commercial property including mowing, edging, and seasonal cleanup.",
  },
  {
    id: "lp3",
    projectName: "Pool Area Landscaping",
    clientName: "Robert Wilson - Flip Investor",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    location: "890 Lakefront Blvd, Lakeway, TX",
    projectType: "Pool Landscaping",
    timeline: "Start next week",
    budget: "$8,000 - $12,000",
    timestamp: "2026-01-25T14:00:00Z",
    isNew: false,
    description: "Landscape design around new pool installation for flip property.",
  },
  {
    id: "lp4",
    projectName: "Irrigation System Repair",
    clientName: "Amanda Foster - HOA Board",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    location: "Oak Hills Community, Cedar Park, TX",
    projectType: "Irrigation Repair",
    timeline: "ASAP",
    budget: "$3,500",
    timestamp: "2026-01-25T09:00:00Z",
    isNew: false,
    description: "Emergency repair of community irrigation system affecting common areas.",
  },
];

export const mockLandscapeJobs: LandscapeJob[] = [
  {
    id: "lj1",
    title: "Senior Landscape Designer",
    company: "Austin Elite Landscapes",
    companyLogo: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400",
    location: "Austin, TX",
    payRate: "$55,000 - $75,000/year",
    jobType: "Full-time",
    description: "Create stunning landscape designs for luxury residential properties.",
    requirements: ["5+ years experience", "AutoCAD proficiency", "Portfolio required"],
    postedDate: "2026-01-24",
    isUrgent: false,
  },
  {
    id: "lj2",
    title: "Irrigation Technician",
    company: "Green Vista Landscaping",
    companyLogo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    location: "Austin, TX",
    payRate: "$22 - $28/hour",
    jobType: "Full-time",
    description: "Install and repair irrigation systems for residential and commercial clients.",
    requirements: ["Licensed Irrigator preferred", "2+ years experience", "Valid driver's license"],
    postedDate: "2026-01-25",
    isUrgent: true,
  },
  {
    id: "lj3",
    title: "Crew Leader",
    company: "Premier Property Services",
    companyLogo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    location: "Round Rock, TX",
    payRate: "$20 - $26/hour",
    jobType: "Full-time",
    description: "Lead a team of landscapers for commercial maintenance routes.",
    requirements: ["Leadership experience", "Bilingual preferred", "Equipment operation"],
    postedDate: "2026-01-23",
    isUrgent: false,
  },
  {
    id: "lj4",
    title: "Hardscape Installer",
    company: "Green Vista Landscaping",
    companyLogo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    location: "Austin, TX",
    payRate: "$18 - $25/hour",
    jobType: "Full-time",
    description: "Install pavers, retaining walls, and outdoor structures.",
    requirements: ["Hardscape experience", "Physical fitness", "Attention to detail"],
    postedDate: "2026-01-26",
    isUrgent: true,
  },
];

export const mockLandscaperReviews: Review[] = [
  {
    id: "lr1",
    professionalId: "pro-1",
    reviewerId: "user-1",
    reviewerName: "Jennifer Martinez",
    rating: 5,
    comment: "Absolutely transformed our backyard! The attention to detail was incredible, and they finished on time and under budget. The new patio and flower beds are stunning.",
    projectName: "Backyard Renovation",
    createdAt: "January 20, 2026",
  },
  {
    id: "lr2",
    professionalId: "pro-1",
    reviewerId: "user-2",
    reviewerName: "David Chen",
    rating: 5,
    comment: "Best commercial lawn service we've ever had. Always on time, crews are professional, and the property looks immaculate. Highly recommend for any property manager.",
    projectName: "Commercial Maintenance",
    createdAt: "January 15, 2026",
  },
  {
    id: "lr3",
    professionalId: "pro-1",
    reviewerId: "user-3",
    reviewerName: "Robert Wilson",
    rating: 4,
    comment: "Great work on our flip property landscaping. The pool area looks amazing and really adds value. Minor delay due to weather but communicated well throughout.",
    projectName: "Pool Landscaping",
    createdAt: "January 10, 2026",
  },
  {
    id: "lr4",
    professionalId: "pro-1",
    reviewerId: "user-4",
    reviewerName: "Sarah Thompson",
    rating: 5,
    comment: "The irrigation system repair was done quickly and efficiently. They also identified some other issues and fixed them at no extra charge. True professionals!",
    projectName: "Irrigation Repair",
    createdAt: "January 5, 2026",
  },
  {
    id: "lr5",
    professionalId: "pro-1",
    reviewerId: "user-5",
    reviewerName: "Michael Brown",
    rating: 5,
    comment: "Excellent xeriscape design for our drought-prone area. They really know native Texas plants and created a beautiful, low-maintenance yard.",
    projectName: "Xeriscape Installation",
    createdAt: "December 28, 2025",
  },
];

export const landscaperRatingBreakdown = [
  { label: "Quality of Work", value: 4.9 },
  { label: "Timeliness", value: 4.7 },
  { label: "Communication", value: 4.8 },
  { label: "Value for Money", value: 4.6 },
];

export const landscaperFaqItems = [
  { 
    question: "How do project leads work?", 
    answer: "Project leads are matched to your service area, specialties, and availability. You receive notifications for new opportunities and can accept or decline based on your schedule." 
  },
  { 
    question: "How are quotes calculated?", 
    answer: "You set your own rates for different services. The platform provides pricing guidance based on market rates in your area. Quotes should include labor, materials, and equipment costs." 
  },
  { 
    question: "What insurance do I need?", 
    answer: "General liability insurance is required (minimum $1M recommended). Workers' compensation is required if you have employees. Equipment insurance is also recommended." 
  },
  { 
    question: "How do payments work?", 
    answer: "Clients pay through the platform. You receive payment within 3-5 business days after job completion. A small platform fee (5-8%) is deducted from each transaction." 
  },
];

export const landscaperAnalyticsStats = [
  { label: "Total Projects", value: "47", change: 15.2, color: "#4299E1" },
  { label: "Repeat Clients", value: "18", change: 22.5, color: "#48BB78" },
  { label: "Revenue", value: "$42.5K", change: 18.3, color: "#272D53" },
  { label: "Avg Rating", value: "4.8", change: 2.1, color: "#9F7AEA" },
];

export const landscaperDealSources = [
  { source: "App Leads", count: 22, percentage: 47, color: "#4299E1" },
  { source: "Referrals", count: 12, percentage: 26, color: "#48BB78" },
  { source: "Repeat Clients", count: 8, percentage: 17, color: "#272D53" },
  { source: "Direct Contact", count: 5, percentage: 10, color: "#9F7AEA" },
];

export const landscaperGoals = [
  { title: "Monthly Projects", current: 8, target: 12, unit: "jobs" },
  { title: "Monthly Revenue", current: 12.5, target: 18, unit: "K" },
  { title: "New Clients", current: 4, target: 8, unit: "clients" },
];

export const landscaperBadges = [
  {
    id: "1",
    title: "Top Rated",
    description: "Maintained 4.8+ rating for 6 months",
    icon: "Trophy",
    earned: true,
    color: "#FFD700",
  },
  {
    id: "2",
    title: "Quick Responder",
    description: "Average response time under 2 hours",
    icon: "Zap",
    earned: true,
    color: "#4299E1",
  },
  {
    id: "3",
    title: "Master Landscaper",
    description: "50+ projects completed",
    icon: "Award",
    earned: false,
    color: "#48BB78",
  },
  {
    id: "4",
    title: "Client Favorite",
    description: "10+ 5-star reviews",
    icon: "Star",
    earned: true,
    color: "#9F7AEA",
  },
];
