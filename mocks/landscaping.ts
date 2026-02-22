import { Store } from "@/types";

export interface LandscapeStore extends Store {
  storeType: "nursery" | "garden_center" | "hardscape" | "irrigation" | "equipment_rental" | "mulch_stone";
  specialties: string[];
  proDiscount?: number;
  deliveryAvailable: boolean;
  bulkPricing: boolean;
}

export interface FlipProjectInvitation {
  id: string;
  projectName: string;
  projectAddress: string;
  projectImage: string;
  clientName: string;
  clientAvatar: string;
  clientType: "investor" | "homeowner" | "contractor" | "realtor";
  scope: string[];
  estimatedBudget: string;
  timeline: string;
  startDate: string;
  status: "pending" | "accepted" | "declined" | "expired";
  sentAt: string;
  expiresAt: string;
  notes?: string;
  propertyType: "single_family" | "multi_family" | "commercial" | "condo";
  projectPhase: "pre_construction" | "during_rehab" | "finishing" | "staging";
}

export interface LandscapeProject {
  id: string;
  name: string;
  address: string;
  image: string;
  client: {
    name: string;
    avatar: string;
    type: string;
  };
  status: "invited" | "bidding" | "awarded" | "in_progress" | "completed";
  scope: string[];
  budget: string;
  startDate: string;
  endDate?: string;
  progress: number;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
  }[];
  materials: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    ordered: boolean;
    supplier?: string;
  }[];
}

export const mockLandscapeStores: LandscapeStore[] = [
  {
    id: "ls-1",
    name: "Green Acres Nursery",
    address: "4521 Oak Hill Dr, Austin, TX 78749",
    phone: "(512) 892-4567",
    distance: "2.1 mi",
    rating: 4.8,
    isOpen: true,
    openHours: "7:00 AM - 6:00 PM",
    category: "nursery",
    storeType: "nursery",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    latitude: 30.2345,
    longitude: -97.8456,
    specialties: ["Native Plants", "Shade Trees", "Perennials", "Organic"],
    proDiscount: 15,
    deliveryAvailable: true,
    bulkPricing: true,
    inventory: [
      { id: "plant-1", name: "Live Oak 15 gal", inStock: true, quantity: 45, price: 189.99, aisle: "Trees" },
      { id: "plant-2", name: "Mexican Feathergrass 1 gal", inStock: true, quantity: 200, price: 12.99, aisle: "Grasses" },
      { id: "plant-3", name: "Texas Sage 5 gal", inStock: true, quantity: 80, price: 34.99, aisle: "Shrubs" },
      { id: "plant-4", name: "Lantana 1 gal", inStock: true, quantity: 150, price: 8.99, aisle: "Perennials" },
      { id: "plant-5", name: "Red Yucca 3 gal", inStock: true, quantity: 65, price: 24.99, aisle: "Natives" },
    ],
  },
  {
    id: "ls-2",
    name: "Stone & Soil Depot",
    address: "7890 Research Blvd, Austin, TX 78759",
    phone: "(512) 345-6789",
    distance: "3.4 mi",
    rating: 4.6,
    isOpen: true,
    openHours: "6:00 AM - 5:00 PM",
    category: "hardscape",
    storeType: "hardscape",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    latitude: 30.3897,
    longitude: -97.7456,
    specialties: ["Flagstone", "Pavers", "Decomposed Granite", "Boulders"],
    proDiscount: 20,
    deliveryAvailable: true,
    bulkPricing: true,
    inventory: [
      { id: "stone-1", name: "Texas Limestone Flagstone /ton", inStock: true, quantity: 50, price: 450.00, aisle: "Yard" },
      { id: "stone-2", name: "Decomposed Granite /yard", inStock: true, quantity: 100, price: 65.00, aisle: "Yard" },
      { id: "stone-3", name: "River Rock 1-3\" /yard", inStock: true, quantity: 80, price: 85.00, aisle: "Yard" },
      { id: "stone-4", name: "Concrete Pavers 12x12", inStock: true, quantity: 2000, price: 3.49, aisle: "Pavers" },
      { id: "stone-5", name: "Landscape Boulders ea", inStock: true, quantity: 35, price: 150.00, aisle: "Yard" },
    ],
  },
  {
    id: "ls-3",
    name: "Austin Irrigation Supply",
    address: "2345 S Congress Ave, Austin, TX 78704",
    phone: "(512) 567-8901",
    distance: "1.8 mi",
    rating: 4.7,
    isOpen: true,
    openHours: "7:00 AM - 5:00 PM",
    category: "irrigation",
    storeType: "irrigation",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",
    latitude: 30.2456,
    longitude: -97.7567,
    specialties: ["Drip Systems", "Sprinklers", "Smart Controllers", "Commercial"],
    proDiscount: 18,
    deliveryAvailable: true,
    bulkPricing: true,
    inventory: [
      { id: "irr-1", name: "Hunter PGP Rotor", inStock: true, quantity: 300, price: 24.99, aisle: "Rotors" },
      { id: "irr-2", name: "Rain Bird ESP-TM2 Controller", inStock: true, quantity: 25, price: 189.99, aisle: "Controllers" },
      { id: "irr-3", name: "1\" PVC Pipe 20ft", inStock: true, quantity: 500, price: 12.99, aisle: "Pipe" },
      { id: "irr-4", name: "Drip Tubing 1/2\" 500ft", inStock: true, quantity: 80, price: 89.99, aisle: "Drip" },
      { id: "irr-5", name: "Pop-up Spray Head", inStock: true, quantity: 450, price: 8.99, aisle: "Sprays" },
    ],
  },
  {
    id: "ls-4",
    name: "Mulch Masters",
    address: "5678 E Riverside Dr, Austin, TX 78741",
    phone: "(512) 234-5678",
    distance: "4.2 mi",
    rating: 4.5,
    isOpen: true,
    openHours: "6:00 AM - 4:00 PM",
    category: "mulch",
    storeType: "mulch_stone",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    latitude: 30.2234,
    longitude: -97.7234,
    specialties: ["Hardwood Mulch", "Cedar Mulch", "Compost", "Topsoil"],
    proDiscount: 25,
    deliveryAvailable: true,
    bulkPricing: true,
    inventory: [
      { id: "mulch-1", name: "Hardwood Mulch /yard", inStock: true, quantity: 200, price: 38.00, aisle: "Yard" },
      { id: "mulch-2", name: "Cedar Mulch /yard", inStock: true, quantity: 150, price: 45.00, aisle: "Yard" },
      { id: "mulch-3", name: "Premium Compost /yard", inStock: true, quantity: 100, price: 55.00, aisle: "Yard" },
      { id: "mulch-4", name: "Native Topsoil /yard", inStock: true, quantity: 300, price: 32.00, aisle: "Yard" },
      { id: "mulch-5", name: "Playground Mulch /yard", inStock: true, quantity: 80, price: 42.00, aisle: "Yard" },
    ],
  },
  {
    id: "ls-5",
    name: "Hill Country Garden Center",
    address: "8901 N Lamar Blvd, Austin, TX 78753",
    phone: "(512) 678-9012",
    distance: "5.6 mi",
    rating: 4.9,
    isOpen: true,
    openHours: "8:00 AM - 7:00 PM",
    category: "garden_center",
    storeType: "garden_center",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",
    latitude: 30.3678,
    longitude: -97.7123,
    specialties: ["Design Consultation", "Custom Orders", "Installation", "Maintenance Plans"],
    proDiscount: 12,
    deliveryAvailable: true,
    bulkPricing: true,
    inventory: [
      { id: "gc-1", name: "Crape Myrtle 15 gal", inStock: true, quantity: 40, price: 149.99, aisle: "Trees" },
      { id: "gc-2", name: "Knockout Rose 3 gal", inStock: true, quantity: 100, price: 29.99, aisle: "Roses" },
      { id: "gc-3", name: "Sod St. Augustine /pallet", inStock: true, quantity: 25, price: 285.00, aisle: "Sod" },
      { id: "gc-4", name: "Bermuda Seed 25lb", inStock: true, quantity: 60, price: 89.99, aisle: "Seed" },
      { id: "gc-5", name: "Organic Fertilizer 40lb", inStock: true, quantity: 200, price: 24.99, aisle: "Fertilizer" },
    ],
  },
  {
    id: "ls-6",
    name: "Pro Equipment Rentals",
    address: "3456 Burnet Rd, Austin, TX 78756",
    phone: "(512) 789-0123",
    distance: "2.9 mi",
    rating: 4.4,
    isOpen: true,
    openHours: "6:00 AM - 6:00 PM",
    category: "equipment",
    storeType: "equipment_rental",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    latitude: 30.3234,
    longitude: -97.7345,
    specialties: ["Skid Steers", "Trenchers", "Stump Grinders", "Aerators"],
    deliveryAvailable: true,
    bulkPricing: false,
    inventory: [
      { id: "eq-1", name: "Skid Steer /day", inStock: true, quantity: 5, price: 275.00, aisle: "Heavy" },
      { id: "eq-2", name: "Trencher 24\" /day", inStock: true, quantity: 8, price: 185.00, aisle: "Trenching" },
      { id: "eq-3", name: "Stump Grinder /day", inStock: true, quantity: 4, price: 225.00, aisle: "Tree" },
      { id: "eq-4", name: "Lawn Aerator /day", inStock: true, quantity: 10, price: 85.00, aisle: "Lawn" },
      { id: "eq-5", name: "Sod Cutter /day", inStock: true, quantity: 6, price: 95.00, aisle: "Lawn" },
    ],
  },
];

export const mockFlipInvitations: FlipProjectInvitation[] = [
  {
    id: "inv-1",
    projectName: "Riverside Flip Landscaping",
    projectAddress: "2847 Riverside Dr, Austin, TX 78704",
    projectImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    clientName: "Marcus Chen",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    clientType: "investor",
    scope: ["Full Yard Design", "Irrigation System", "Sod Installation", "Tree Planting"],
    estimatedBudget: "$18,000 - $25,000",
    timeline: "3-4 weeks",
    startDate: "Feb 15, 2026",
    status: "pending",
    sentAt: "2 hours ago",
    expiresAt: "Jan 30, 2026",
    notes: "Looking for a complete landscape transformation to increase curb appeal before listing. Native, low-maintenance plants preferred.",
    propertyType: "single_family",
    projectPhase: "finishing",
  },
  {
    id: "inv-2",
    projectName: "Oak Hill Rehab Exterior",
    projectAddress: "1456 Oak Hill Circle, Austin, TX 78749",
    projectImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
    clientName: "Sarah Williams",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    clientType: "investor",
    scope: ["Front Yard Renovation", "Hardscape Patio", "Outdoor Lighting"],
    estimatedBudget: "$12,000 - $16,000",
    timeline: "2-3 weeks",
    startDate: "Feb 20, 2026",
    status: "pending",
    sentAt: "1 day ago",
    expiresAt: "Feb 5, 2026",
    notes: "Focus on creating an inviting front entrance. Budget flexible for quality work.",
    propertyType: "single_family",
    projectPhase: "finishing",
  },
  {
    id: "inv-3",
    projectName: "Downtown Condo Rooftop",
    projectAddress: "1200 Congress Ave #PH, Austin, TX 78701",
    projectImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    clientName: "Jennifer Torres",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    clientType: "homeowner",
    scope: ["Container Garden Design", "Drip Irrigation", "Privacy Screening"],
    estimatedBudget: "$8,000 - $12,000",
    timeline: "1-2 weeks",
    startDate: "Mar 1, 2026",
    status: "pending",
    sentAt: "3 days ago",
    expiresAt: "Feb 10, 2026",
    propertyType: "condo",
    projectPhase: "finishing",
  },
  {
    id: "inv-4",
    projectName: "Mueller Flip Full Landscape",
    projectAddress: "4521 Mueller Blvd, Austin, TX 78723",
    projectImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    clientName: "David Park",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    clientType: "investor",
    scope: ["Complete Landscape Package", "Xeriscaping", "Fence Installation", "Sprinkler System"],
    estimatedBudget: "$28,000 - $35,000",
    timeline: "4-5 weeks",
    startDate: "Feb 10, 2026",
    status: "accepted",
    sentAt: "1 week ago",
    expiresAt: "Jan 25, 2026",
    notes: "High-end flip targeting $650K+ sale price. Premium materials approved.",
    propertyType: "single_family",
    projectPhase: "during_rehab",
  },
  {
    id: "inv-5",
    projectName: "Tarrytown Estate Grounds",
    projectAddress: "2100 Windsor Rd, Austin, TX 78703",
    projectImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    clientName: "Robert Mitchell",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    clientType: "realtor",
    scope: ["Estate Landscaping", "Pool Surround", "Outdoor Kitchen Area", "Mature Tree Installation"],
    estimatedBudget: "$75,000 - $95,000",
    timeline: "8-10 weeks",
    startDate: "Mar 15, 2026",
    status: "pending",
    sentAt: "5 hours ago",
    expiresAt: "Feb 15, 2026",
    notes: "Luxury property listing preparation. Client wants to maximize outdoor living appeal.",
    propertyType: "single_family",
    projectPhase: "staging",
  },
];

export const mockLandscapeProjects: LandscapeProject[] = [
  {
    id: "lp-1",
    name: "Mueller Flip Full Landscape",
    address: "4521 Mueller Blvd, Austin, TX 78723",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    client: {
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      type: "Investor",
    },
    status: "in_progress",
    scope: ["Complete Landscape Package", "Xeriscaping", "Fence Installation", "Sprinkler System"],
    budget: "$32,000",
    startDate: "Feb 10, 2026",
    endDate: "Mar 15, 2026",
    progress: 35,
    tasks: [
      { id: "t1", title: "Site survey & design approval", completed: true },
      { id: "t2", title: "Demo existing landscape", completed: true },
      { id: "t3", title: "Install irrigation main lines", completed: true, dueDate: "Feb 15" },
      { id: "t4", title: "Grade and prep soil", completed: false, dueDate: "Feb 18" },
      { id: "t5", title: "Install fence posts", completed: false, dueDate: "Feb 20" },
      { id: "t6", title: "Lay decomposed granite paths", completed: false, dueDate: "Feb 25" },
      { id: "t7", title: "Plant trees and shrubs", completed: false, dueDate: "Mar 1" },
      { id: "t8", title: "Install drip zones", completed: false, dueDate: "Mar 5" },
      { id: "t9", title: "Mulch and final grading", completed: false, dueDate: "Mar 10" },
      { id: "t10", title: "Final walkthrough", completed: false, dueDate: "Mar 15" },
    ],
    materials: [
      { id: "m1", name: "Texas Sage 5 gal", quantity: 24, unit: "plants", ordered: true, supplier: "Green Acres Nursery" },
      { id: "m2", name: "Live Oak 15 gal", quantity: 3, unit: "trees", ordered: true, supplier: "Green Acres Nursery" },
      { id: "m3", name: "Decomposed Granite", quantity: 12, unit: "yards", ordered: true, supplier: "Stone & Soil Depot" },
      { id: "m4", name: "Cedar Fence Panels 6ft", quantity: 45, unit: "panels", ordered: false },
      { id: "m5", name: "Hunter PGP Rotors", quantity: 18, unit: "units", ordered: true, supplier: "Austin Irrigation Supply" },
      { id: "m6", name: "Hardwood Mulch", quantity: 8, unit: "yards", ordered: false },
    ],
  },
  {
    id: "lp-2",
    name: "South Austin Backyard Oasis",
    address: "3456 S 1st St, Austin, TX 78704",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    client: {
      name: "Emily Johnson",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
      type: "Homeowner",
    },
    status: "in_progress",
    scope: ["Patio Installation", "Fire Pit Area", "Native Garden Beds"],
    budget: "$14,500",
    startDate: "Jan 25, 2026",
    endDate: "Feb 20, 2026",
    progress: 65,
    tasks: [
      { id: "t1", title: "Design consultation", completed: true },
      { id: "t2", title: "Excavate patio area", completed: true },
      { id: "t3", title: "Install paver base", completed: true },
      { id: "t4", title: "Lay flagstone pavers", completed: true, dueDate: "Feb 5" },
      { id: "t5", title: "Build fire pit", completed: false, dueDate: "Feb 10" },
      { id: "t6", title: "Install garden bed edging", completed: false, dueDate: "Feb 12" },
      { id: "t7", title: "Plant native perennials", completed: false, dueDate: "Feb 15" },
      { id: "t8", title: "Add mulch and finishing", completed: false, dueDate: "Feb 18" },
    ],
    materials: [
      { id: "m1", name: "Texas Limestone Flagstone", quantity: 2, unit: "tons", ordered: true, supplier: "Stone & Soil Depot" },
      { id: "m2", name: "Fire Pit Kit", quantity: 1, unit: "kit", ordered: true },
      { id: "m3", name: "Mexican Feathergrass", quantity: 36, unit: "plants", ordered: true, supplier: "Green Acres Nursery" },
      { id: "m4", name: "Paver Base", quantity: 4, unit: "yards", ordered: true },
    ],
  },
];

export const storeTypeLabels: Record<string, string> = {
  nursery: "Nursery",
  garden_center: "Garden Center",
  hardscape: "Stone & Hardscape",
  irrigation: "Irrigation Supply",
  equipment_rental: "Equipment Rental",
  mulch_stone: "Mulch & Soil",
};

export const storeTypeColors: Record<string, string> = {
  nursery: "#22C55E",
  garden_center: "#10B981",
  hardscape: "#78716C",
  irrigation: "#3B82F6",
  equipment_rental: "#272D53",
  mulch_stone: "#92400E",
};
