import { ProjectInvitation } from "@/types";

export interface DesignProject {
  id: string;
  clientName: string;
  clientAvatar?: string;
  clientPhone?: string;
  projectName: string;
  projectType: "full_home" | "room_redesign" | "consultation" | "staging" | "commercial";
  address: string;
  status: "inquiry" | "proposal" | "in_progress" | "revision" | "completed";
  budget: number;
  estimatedBudget?: number;
  startDate?: string;
  estimatedEndDate?: string;
  completedDate?: string;
  rooms: DesignRoom[];
  style: DesignStyle;
  notes?: string;
  images: DesignImage[];
  createdAt: string;
}

export interface DesignRoom {
  id: string;
  name: string;
  dimensions?: { width: number; length: number; height: number };
  status: "planning" | "sourcing" | "installation" | "completed";
  items: DesignItem[];
}

export interface DesignItem {
  id: string;
  name: string;
  category: "furniture" | "lighting" | "decor" | "textile" | "art" | "flooring" | "wall_treatment";
  vendor?: string;
  price: number;
  quantity: number;
  status: "proposed" | "approved" | "ordered" | "delivered" | "installed";
  imageUrl?: string;
  notes?: string;
}

export interface DesignImage {
  id: string;
  url: string;
  type: "inspiration" | "before" | "progress" | "after" | "mood_board";
  caption?: string;
  roomId?: string;
  uploadedAt: string;
}

export type DesignStyle = 
  | "modern"
  | "traditional"
  | "transitional"
  | "minimalist"
  | "bohemian"
  | "industrial"
  | "scandinavian"
  | "mid_century"
  | "coastal"
  | "farmhouse"
  | "contemporary"
  | "eclectic";

export interface MoodBoard {
  id: string;
  projectId?: string;
  name: string;
  style: DesignStyle;
  colorPalette: string[];
  images: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  dimensions: { width: number; depth: number; height: number };
  materials: string[];
  colors: string[];
  style: DesignStyle[];
  imageUrl: string;
  vendorId: string;
  vendorName: string;
  leadTime: string;
  inStock: boolean;
}

export interface DesignVendor {
  id: string;
  name: string;
  category: "furniture" | "lighting" | "textiles" | "art" | "flooring" | "wallcovering" | "accessories" | "kitchen_bath" | "outdoor";
  contactName?: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  tradeDiscount: number;
  minOrder?: number;
  leadTime: string;
  rating: number;
  notes?: string;
  logo?: string;
}

export interface DesignStore {
  id: string;
  name: string;
  category: "furniture" | "decor" | "lighting" | "textiles" | "art" | "flooring" | "kitchen_bath" | "outdoor";
  address: string;
  phone: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  openHours: string;
  tradeProgram: boolean;
  tradeDiscount?: number;
  image: string;
  latitude: number;
  longitude: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: PaletteColor[];
  style: DesignStyle;
  room?: string;
  createdAt: string;
}

export interface PaletteColor {
  id: string;
  hex: string;
  name: string;
  type: "primary" | "secondary" | "accent" | "neutral";
  paintBrand?: string;
  paintCode?: string;
}

export interface DesignEstimate {
  id: string;
  projectId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  projectType: string;
  rooms: EstimateRoom[];
  designFee: number;
  furnitureBudget: number;
  laborCosts: number;
  contingency: number;
  totalEstimate: number;
  validUntil: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  notes?: string;
  createdAt: string;
}

export interface EstimateRoom {
  id: string;
  name: string;
  designFee: number;
  itemsBudget: number;
  notes?: string;
}

export const mockDesignProjects: DesignProject[] = [
  {
    id: "dp-1",
    clientName: "Sarah Mitchell",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    clientPhone: "(512) 555-0123",
    projectName: "Westlake Modern Refresh",
    projectType: "full_home",
    address: "4521 Westlake Dr, Austin, TX 78746",
    status: "in_progress",
    budget: 85000,
    startDate: "2026-01-10",
    estimatedEndDate: "2026-04-15",
    style: "modern",
    rooms: [
      {
        id: "r-1",
        name: "Living Room",
        dimensions: { width: 22, length: 18, height: 10 },
        status: "sourcing",
        items: [
          { id: "i-1", name: "Sectional Sofa", category: "furniture", vendor: "RH", price: 8500, quantity: 1, status: "approved" },
          { id: "i-2", name: "Coffee Table", category: "furniture", vendor: "West Elm", price: 1200, quantity: 1, status: "ordered" },
          { id: "i-3", name: "Pendant Light", category: "lighting", vendor: "Rejuvenation", price: 2400, quantity: 2, status: "proposed" },
        ],
      },
      {
        id: "r-2",
        name: "Primary Bedroom",
        dimensions: { width: 16, length: 14, height: 9 },
        status: "planning",
        items: [
          { id: "i-4", name: "Platform Bed", category: "furniture", vendor: "Room & Board", price: 3200, quantity: 1, status: "proposed" },
          { id: "i-5", name: "Nightstands", category: "furniture", vendor: "West Elm", price: 650, quantity: 2, status: "proposed" },
        ],
      },
    ],
    images: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800", type: "inspiration", caption: "Living room inspiration", uploadedAt: "2026-01-10" },
      { id: "img-2", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800", type: "before", caption: "Current living room", roomId: "r-1", uploadedAt: "2026-01-10" },
    ],
    createdAt: "2026-01-05",
  },
  {
    id: "dp-2",
    clientName: "Michael Chen",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    clientPhone: "(512) 555-0145",
    projectName: "Downtown Condo Staging",
    projectType: "staging",
    address: "200 Congress Ave #1205, Austin, TX 78701",
    status: "proposal",
    budget: 15000,
    style: "contemporary",
    rooms: [
      {
        id: "r-3",
        name: "Open Living/Dining",
        dimensions: { width: 28, length: 16, height: 9 },
        status: "planning",
        items: [],
      },
    ],
    images: [],
    createdAt: "2026-01-20",
  },
  {
    id: "dp-3",
    clientName: "Emily & James Rodriguez",
    clientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    clientPhone: "(512) 555-0178",
    projectName: "Lakeway Kitchen & Bath",
    projectType: "room_redesign",
    address: "1847 Lakeway Blvd, Lakeway, TX 78734",
    status: "in_progress",
    budget: 45000,
    startDate: "2026-01-02",
    estimatedEndDate: "2026-03-01",
    style: "transitional",
    rooms: [
      {
        id: "r-4",
        name: "Kitchen",
        dimensions: { width: 14, length: 12, height: 9 },
        status: "installation",
        items: [
          { id: "i-6", name: "Pendant Lights", category: "lighting", vendor: "Visual Comfort", price: 1800, quantity: 3, status: "installed" },
          { id: "i-7", name: "Bar Stools", category: "furniture", vendor: "CB2", price: 450, quantity: 4, status: "delivered" },
        ],
      },
      {
        id: "r-5",
        name: "Primary Bath",
        dimensions: { width: 10, length: 8, height: 9 },
        status: "sourcing",
        items: [
          { id: "i-8", name: "Vanity Mirror", category: "decor", vendor: "Pottery Barn", price: 650, quantity: 1, status: "ordered" },
        ],
      },
    ],
    images: [
      { id: "img-3", url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", type: "inspiration", caption: "Kitchen inspiration", uploadedAt: "2026-01-02" },
    ],
    createdAt: "2025-12-20",
  },
];

export const mockMoodBoards: MoodBoard[] = [
  {
    id: "mb-1",
    projectId: "dp-1",
    name: "Westlake Living Room",
    style: "modern",
    colorPalette: ["#2C3E50", "#ECF0F1", "#D4A574", "#1ABC9C", "#95A5A6"],
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    ],
    notes: "Clean lines, neutral palette with warm wood accents",
    createdAt: "2026-01-08",
    updatedAt: "2026-01-15",
  },
  {
    id: "mb-2",
    projectId: "dp-3",
    name: "Lakeway Kitchen Refresh",
    style: "transitional",
    colorPalette: ["#FFFFFF", "#2F4F4F", "#B8860B", "#F5F5DC", "#708090"],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    ],
    notes: "Blend of classic and contemporary, brass hardware accents",
    createdAt: "2026-01-03",
    updatedAt: "2026-01-10",
  },
  {
    id: "mb-3",
    name: "Bohemian Bedroom Concept",
    style: "bohemian",
    colorPalette: ["#8B4513", "#DEB887", "#228B22", "#FF6347", "#F0E68C"],
    images: [
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=400",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400",
    ],
    notes: "Layered textures, global influences, plants",
    createdAt: "2026-01-12",
    updatedAt: "2026-01-12",
  },
];

export const mockFurnitureItems: FurnitureItem[] = [
  {
    id: "f-1",
    name: "Cloud Modular Sectional",
    category: "Seating",
    subcategory: "Sectional Sofas",
    brand: "Restoration Hardware",
    price: 8495,
    dimensions: { width: 131, depth: 67, height: 31 },
    materials: ["Performance Fabric", "Down Fill", "Hardwood Frame"],
    colors: ["Cloud White", "Fog Gray", "Sand"],
    style: ["modern", "contemporary", "transitional"],
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    vendorId: "v-1",
    vendorName: "Restoration Hardware",
    leadTime: "8-12 weeks",
    inStock: false,
  },
  {
    id: "f-2",
    name: "Andes Sofa",
    category: "Seating",
    subcategory: "Sofas",
    brand: "West Elm",
    price: 2299,
    dimensions: { width: 86, depth: 36, height: 34 },
    materials: ["Leather", "Solid Wood Legs"],
    colors: ["Tan Leather", "Black Leather", "Gray Fabric"],
    style: ["mid_century", "modern", "minimalist"],
    imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400",
    vendorId: "v-2",
    vendorName: "West Elm",
    leadTime: "4-6 weeks",
    inStock: true,
  },
  {
    id: "f-3",
    name: "Saarinen Oval Dining Table",
    category: "Tables",
    subcategory: "Dining Tables",
    brand: "Knoll",
    price: 6789,
    dimensions: { width: 78, depth: 47, height: 28 },
    materials: ["Carrara Marble", "Cast Aluminum Base"],
    colors: ["White Marble", "Black Marble"],
    style: ["mid_century", "modern", "minimalist"],
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
    vendorId: "v-3",
    vendorName: "Knoll",
    leadTime: "10-14 weeks",
    inStock: false,
  },
  {
    id: "f-4",
    name: "Eames Lounge Chair",
    category: "Seating",
    subcategory: "Lounge Chairs",
    brand: "Herman Miller",
    price: 7395,
    dimensions: { width: 33, depth: 33, height: 32 },
    materials: ["Leather", "Molded Plywood", "Aluminum"],
    colors: ["Black Leather/Walnut", "Brown Leather/Santos"],
    style: ["mid_century", "modern"],
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    vendorId: "v-4",
    vendorName: "Herman Miller",
    leadTime: "2-4 weeks",
    inStock: true,
  },
  {
    id: "f-5",
    name: "Nelson Platform Bench",
    category: "Storage",
    subcategory: "Benches",
    brand: "Herman Miller",
    price: 1295,
    dimensions: { width: 48, depth: 18, height: 14 },
    materials: ["Solid Wood"],
    colors: ["Walnut", "White Ash", "Ebonized Ash"],
    style: ["mid_century", "modern", "minimalist"],
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    vendorId: "v-4",
    vendorName: "Herman Miller",
    leadTime: "2-4 weeks",
    inStock: true,
  },
];

export const mockDesignVendors: DesignVendor[] = [
  {
    id: "v-1",
    name: "Restoration Hardware",
    category: "furniture",
    contactName: "Trade Program",
    phone: "(800) 910-9836",
    email: "trade@rh.com",
    website: "https://rh.com",
    address: "11410 Domain Dr, Austin, TX 78758",
    tradeDiscount: 20,
    minOrder: 500,
    leadTime: "8-12 weeks",
    rating: 4.5,
    logo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200",
  },
  {
    id: "v-2",
    name: "West Elm",
    category: "furniture",
    contactName: "Trade Services",
    phone: "(888) 922-4119",
    email: "trade@westelm.com",
    website: "https://westelm.com",
    address: "10000 Research Blvd, Austin, TX 78759",
    tradeDiscount: 15,
    leadTime: "4-6 weeks",
    rating: 4.2,
    logo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200",
  },
  {
    id: "v-3",
    name: "Knoll",
    category: "furniture",
    contactName: "Austin Showroom",
    phone: "(512) 476-5655",
    email: "austin@knoll.com",
    website: "https://knoll.com",
    address: "200 W 2nd St, Austin, TX 78701",
    tradeDiscount: 25,
    minOrder: 1000,
    leadTime: "10-14 weeks",
    rating: 4.8,
    logo: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200",
  },
  {
    id: "v-4",
    name: "Herman Miller",
    category: "furniture",
    phone: "(888) 443-4357",
    email: "trade@hermanmiller.com",
    website: "https://hermanmiller.com",
    address: "Showroom by appointment",
    tradeDiscount: 20,
    leadTime: "2-4 weeks",
    rating: 4.9,
    logo: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200",
  },
  {
    id: "v-5",
    name: "Visual Comfort",
    category: "lighting",
    contactName: "Trade Desk",
    phone: "(713) 686-5999",
    email: "trade@visualcomfort.com",
    website: "https://visualcomfort.com",
    address: "Wholesale - Local reps available",
    tradeDiscount: 40,
    minOrder: 250,
    leadTime: "2-6 weeks",
    rating: 4.7,
  },
  {
    id: "v-6",
    name: "Schumacher",
    category: "textiles",
    contactName: "Design Library",
    phone: "(800) 523-1200",
    email: "customerservice@fsco.com",
    website: "https://fschumacher.com",
    address: "To the trade showroom",
    tradeDiscount: 50,
    leadTime: "3-8 weeks",
    rating: 4.6,
  },
];

export const mockDesignStores: DesignStore[] = [
  {
    id: "ds-1",
    name: "Restoration Hardware Gallery",
    category: "furniture",
    address: "11410 Domain Dr, Austin, TX 78758",
    phone: "(512) 339-4570",
    distance: "5.2 mi",
    rating: 4.5,
    isOpen: true,
    openHours: "10AM - 7PM",
    tradeProgram: true,
    tradeDiscount: 20,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    latitude: 30.4020,
    longitude: -97.7253,
  },
  {
    id: "ds-2",
    name: "West Elm",
    category: "furniture",
    address: "10000 Research Blvd, Austin, TX 78759",
    phone: "(512) 342-2120",
    distance: "4.8 mi",
    rating: 4.2,
    isOpen: true,
    openHours: "10AM - 8PM",
    tradeProgram: true,
    tradeDiscount: 15,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    latitude: 30.3944,
    longitude: -97.7385,
  },
  {
    id: "ds-3",
    name: "Pottery Barn",
    category: "decor",
    address: "10000 Research Blvd, Austin, TX 78759",
    phone: "(512) 346-2234",
    distance: "4.8 mi",
    rating: 4.3,
    isOpen: true,
    openHours: "10AM - 8PM",
    tradeProgram: true,
    tradeDiscount: 15,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400",
    latitude: 30.3944,
    longitude: -97.7385,
  },
  {
    id: "ds-4",
    name: "Lumens Light + Living",
    category: "lighting",
    address: "1011 W 5th St, Austin, TX 78703",
    phone: "(512) 478-5000",
    distance: "2.1 mi",
    rating: 4.7,
    isOpen: true,
    openHours: "9AM - 6PM",
    tradeProgram: true,
    tradeDiscount: 25,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    latitude: 30.2714,
    longitude: -97.7533,
  },
  {
    id: "ds-5",
    name: "Room & Board",
    category: "furniture",
    address: "200 W 2nd St, Austin, TX 78701",
    phone: "(512) 391-0025",
    distance: "1.5 mi",
    rating: 4.6,
    isOpen: true,
    openHours: "10AM - 7PM",
    tradeProgram: true,
    tradeDiscount: 10,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400",
    latitude: 30.2652,
    longitude: -97.7453,
  },
  {
    id: "ds-6",
    name: "CB2",
    category: "furniture",
    address: "11410 Domain Dr, Austin, TX 78758",
    phone: "(512) 339-0062",
    distance: "5.2 mi",
    rating: 4.1,
    isOpen: true,
    openHours: "10AM - 8PM",
    tradeProgram: true,
    tradeDiscount: 10,
    image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400",
    latitude: 30.4020,
    longitude: -97.7253,
  },
];

export const mockColorPalettes: ColorPalette[] = [
  {
    id: "cp-1",
    name: "Modern Coastal",
    colors: [
      { id: "c-1", hex: "#FFFFFF", name: "Simply White", type: "primary", paintBrand: "Benjamin Moore", paintCode: "OC-117" },
      { id: "c-2", hex: "#4A6FA5", name: "Van Deusen Blue", type: "secondary", paintBrand: "Benjamin Moore", paintCode: "HC-156" },
      { id: "c-3", hex: "#C9B99A", name: "Bleeker Beige", type: "neutral", paintBrand: "Benjamin Moore", paintCode: "HC-80" },
      { id: "c-4", hex: "#2F4F4F", name: "Deep Sea", type: "accent", paintBrand: "Sherwin Williams", paintCode: "SW 7623" },
    ],
    style: "coastal",
    createdAt: "2026-01-15",
  },
  {
    id: "cp-2",
    name: "Warm Minimalist",
    colors: [
      { id: "c-5", hex: "#F5F0EB", name: "Alabaster", type: "primary", paintBrand: "Sherwin Williams", paintCode: "SW 7008" },
      { id: "c-6", hex: "#A67B5B", name: "Cavern Clay", type: "secondary", paintBrand: "Sherwin Williams", paintCode: "SW 7701" },
      { id: "c-7", hex: "#3D3D3D", name: "Iron Ore", type: "accent", paintBrand: "Sherwin Williams", paintCode: "SW 7069" },
      { id: "c-8", hex: "#D4C4B5", name: "Accessible Beige", type: "neutral", paintBrand: "Sherwin Williams", paintCode: "SW 7036" },
    ],
    style: "minimalist",
    createdAt: "2026-01-10",
  },
  {
    id: "cp-3",
    name: "Bold Traditional",
    colors: [
      { id: "c-9", hex: "#1C3A4B", name: "Hale Navy", type: "primary", paintBrand: "Benjamin Moore", paintCode: "HC-154" },
      { id: "c-10", hex: "#C19A6B", name: "Camel", type: "secondary", paintBrand: "Benjamin Moore", paintCode: "2165-10" },
      { id: "c-11", hex: "#EDEBE6", name: "White Dove", type: "neutral", paintBrand: "Benjamin Moore", paintCode: "OC-17" },
      { id: "c-12", hex: "#8B0000", name: "Caliente", type: "accent", paintBrand: "Benjamin Moore", paintCode: "AF-290" },
    ],
    style: "traditional",
    createdAt: "2026-01-05",
  },
];

export const mockDesignEstimates: DesignEstimate[] = [
  {
    id: "de-1",
    projectId: "dp-2",
    clientName: "Michael Chen",
    clientEmail: "michael.chen@email.com",
    clientPhone: "(512) 555-0145",
    projectType: "Condo Staging",
    rooms: [
      { id: "er-1", name: "Living Room", designFee: 1500, itemsBudget: 6000, notes: "Rental furniture for staging" },
      { id: "er-2", name: "Dining Area", designFee: 800, itemsBudget: 2500 },
      { id: "er-3", name: "Primary Bedroom", designFee: 1000, itemsBudget: 3500 },
    ],
    designFee: 3300,
    furnitureBudget: 12000,
    laborCosts: 800,
    contingency: 900,
    totalEstimate: 17000,
    validUntil: "2026-02-15",
    status: "sent",
    notes: "3-month staging package with rental furniture",
    createdAt: "2026-01-21",
  },
  {
    id: "de-2",
    clientName: "Jennifer & Mark Thompson",
    clientEmail: "jthompson@email.com",
    clientPhone: "(512) 555-0189",
    projectType: "Full Home Design",
    rooms: [
      { id: "er-4", name: "Living Room", designFee: 3500, itemsBudget: 25000 },
      { id: "er-5", name: "Dining Room", designFee: 2000, itemsBudget: 12000 },
      { id: "er-6", name: "Primary Suite", designFee: 2500, itemsBudget: 18000 },
      { id: "er-7", name: "Kitchen", designFee: 1500, itemsBudget: 8000 },
      { id: "er-8", name: "Guest Bedroom", designFee: 1500, itemsBudget: 6000 },
    ],
    designFee: 11000,
    furnitureBudget: 69000,
    laborCosts: 4500,
    contingency: 8000,
    totalEstimate: 92500,
    validUntil: "2026-02-28",
    status: "draft",
    notes: "Phased approach recommended - start with main living areas",
    createdAt: "2026-01-25",
  },
];

export const interiorDesignerInvitations: ProjectInvitation[] = [
  {
    id: "id-inv-1",
    projectName: "Tarrytown Flip - Interior Design",
    projectAddress: "3421 Windsor Rd, Austin, TX 78703",
    projectImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    projectType: "flip",
    inviterId: "user-id-1",
    inviterName: "Marcus Thompson",
    inviterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    inviterPhone: "(512) 555-0142",
    role: "Interior Designer",
    budget: 35000,
    estimatedDuration: "6-8 weeks",
    description: "Looking for an interior designer to create cohesive design scheme for this 4BR flip. Focus on modern farmhouse aesthetic that appeals to buyers.",
    status: "pending",
    createdAt: "2026-01-24",
    expiresAt: "2026-02-10",
    latitude: 30.3052,
    longitude: -97.7703,
  },
  {
    id: "id-inv-2",
    projectName: "Mueller Townhome Staging",
    projectAddress: "1920 Aldrich St, Austin, TX 78723",
    projectImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
    projectType: "flip",
    inviterId: "user-id-2",
    inviterName: "Sarah Chen",
    inviterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    inviterPhone: "(512) 555-0198",
    role: "Stager",
    budget: 12000,
    estimatedDuration: "2-3 weeks",
    description: "Need staging services for a completed townhome flip. Looking for contemporary style that photographs well for listings.",
    status: "pending",
    createdAt: "2026-01-22",
    expiresAt: "2026-02-08",
    latitude: 30.2989,
    longitude: -97.7012,
  },
];

export const getInteriorDesignerInvitations = (): ProjectInvitation[] => {
  return interiorDesignerInvitations.filter(inv => inv.status === "pending");
};

export const getProjectById = (id: string): DesignProject | undefined => {
  return mockDesignProjects.find(p => p.id === id);
};

export const getMoodBoardById = (id: string): MoodBoard | undefined => {
  return mockMoodBoards.find(mb => mb.id === id);
};
