export interface ContractorProjectInvitation {
  id: string;
  projectName: string;
  projectAddress: string;
  projectImage: string;
  clientName: string;
  clientAvatar: string;
  clientType: "investor" | "homeowner" | "realtor" | "developer";
  projectType: "renovation" | "addition" | "new_construction" | "remodel" | "commercial";
  projectPhase: "planning" | "permits" | "demolition" | "construction" | "finishing";
  estimatedBudget: string;
  scope: string[];
  timeline: string;
  startDate: string;
  sentAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
  notes?: string;
  sqft?: number;
  permitStatus?: "not_started" | "in_progress" | "approved";
}

export interface ContractorProject {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  client: {
    id: string;
    name: string;
    avatar: string;
    type: string;
    phone: string;
  };
  projectType: "renovation" | "addition" | "new_construction" | "remodel" | "commercial";
  status: "awarded" | "in_progress" | "completed" | "on_hold";
  budget: string;
  spent: string;
  progress: number;
  startDate: string;
  endDate: string;
  tasks: {
    id: string;
    name: string;
    category: string;
    completed: boolean;
    dueDate?: string;
  }[];
  materials: {
    id: string;
    name: string;
    quantity: string;
    ordered: boolean;
    supplier?: string;
    cost: string;
  }[];
  crew: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  }[];
  permits: {
    id: string;
    type: string;
    status: "pending" | "approved" | "rejected";
    number?: string;
  }[];
  inspections: {
    id: string;
    type: string;
    date: string;
    status: "scheduled" | "passed" | "failed";
  }[];
}

export interface ContractorStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  openHours: string;
  storeType: "pool_supply" | "pool_equipment" | "plumbing" | "concrete" | "tile" | "tool_rental" | "building_supply" | "landscape";
  image: string;
  specialties: string[];
  proDiscount?: number;
  deliveryAvailable: boolean;
  bulkPricing: boolean;
  creditAvailable: boolean;
  latitude: number;
  longitude: number;
  inventory?: {
    id: string;
    name: string;
    inStock: boolean;
    quantity: number;
    price: number;
    aisle?: string;
    unit: string;
  }[];
}

export const storeTypeLabels: Record<string, string> = {
  pool_supply: "Pool Supply",
  pool_equipment: "Pool Equipment",
  plumbing: "Pool Plumbing",
  concrete: "Concrete & Gunite",
  tile: "Pool Tile & Coping",
  tool_rental: "Equipment Rental",
  building_supply: "Building Supply",
  landscape: "Landscape & Decking",
};

export const storeTypeColors: Record<string, string> = {
  pool_supply: "#0EA5E9",
  pool_equipment: "#3B82F6",
  plumbing: "#06B6D4",
  concrete: "#78716C",
  tile: "#8B5CF6",
  tool_rental: "#22C55E",
  building_supply: "#272D53",
  landscape: "#16A34A",
};

export const mockContractorInvitations: ContractorProjectInvitation[] = [
  {
    id: "ci1",
    projectName: "Victorian Home Full Renovation",
    projectAddress: "1847 Heritage Lane, Boston, MA 02115",
    projectImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    clientName: "Marcus Chen",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    clientType: "investor",
    projectType: "renovation",
    projectPhase: "permits",
    estimatedBudget: "$185,000 - $220,000",
    scope: [
      "Full kitchen renovation",
      "3 bathroom remodels",
      "Electrical upgrade to 200 amp",
      "HVAC replacement",
      "Hardwood floor refinishing",
      "Window replacement (12 windows)",
      "Roof repair",
    ],
    timeline: "4-5 months",
    startDate: "Feb 15, 2026",
    sentAt: "2 hours ago",
    expiresAt: "Jan 30, 2026",
    status: "pending",
    notes: "Looking for experienced GC with Victorian restoration experience. Permits already in progress.",
    sqft: 2800,
    permitStatus: "in_progress",
  },
  {
    id: "ci2",
    projectName: "Garage to ADU Conversion",
    projectAddress: "456 Suburban Dr, Newton, MA 02458",
    projectImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    clientName: "Jennifer Walsh",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    clientType: "homeowner",
    projectType: "addition",
    projectPhase: "planning",
    estimatedBudget: "$95,000 - $120,000",
    scope: [
      "Garage conversion to living space",
      "New bathroom installation",
      "Kitchenette build",
      "Separate electrical panel",
      "Mini-split HVAC",
      "Egress windows",
    ],
    timeline: "2-3 months",
    startDate: "Mar 1, 2026",
    sentAt: "1 day ago",
    expiresAt: "Feb 5, 2026",
    status: "pending",
    sqft: 450,
    permitStatus: "not_started",
  },
  {
    id: "ci3",
    projectName: "Flip Property - Complete Rehab",
    projectAddress: "789 Oak Street, Somerville, MA 02143",
    projectImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    clientName: "David & Sarah Miller",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    clientType: "investor",
    projectType: "remodel",
    projectPhase: "demolition",
    estimatedBudget: "$145,000 - $175,000",
    scope: [
      "Demo existing kitchen and baths",
      "New open floor plan",
      "Custom kitchen install",
      "Master bath addition",
      "All new electrical",
      "Plumbing updates",
      "New HVAC system",
    ],
    timeline: "3-4 months",
    startDate: "Feb 1, 2026",
    sentAt: "3 days ago",
    expiresAt: "Feb 2, 2026",
    status: "pending",
    notes: "Fast timeline needed. Property already purchased. Ready to start demo immediately.",
    sqft: 1650,
    permitStatus: "approved",
  },
  {
    id: "ci4",
    projectName: "Commercial Office Build-Out",
    projectAddress: "200 Tech Park Way, Cambridge, MA 02139",
    projectImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    clientName: "TechStart Inc.",
    clientAvatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
    clientType: "developer",
    projectType: "commercial",
    projectPhase: "planning",
    estimatedBudget: "$280,000 - $350,000",
    scope: [
      "Office space build-out",
      "Conference rooms (3)",
      "Break room with kitchenette",
      "Server room construction",
      "ADA compliant restrooms",
      "Open workspace areas",
    ],
    timeline: "2-3 months",
    startDate: "Mar 15, 2026",
    sentAt: "5 days ago",
    expiresAt: "Feb 10, 2026",
    status: "pending",
    sqft: 5200,
    permitStatus: "not_started",
  },
];

export const mockContractorProjects: ContractorProject[] = [
  {
    id: "cp1",
    name: "Beacon Hill Townhouse Renovation",
    description: "Full gut renovation of a historic Beacon Hill townhouse. Updating the kitchen with custom cabinetry, renovating all three bathrooms, upgrading electrical to 200 amp service, replacing the HVAC system, and refinishing original hardwood floors throughout.",
    address: "42 Mount Vernon St, Boston, MA 02108",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    client: {
      id: "cl1",
      name: "Robert Sterling",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      type: "Investor",
      phone: "(617) 555-0123",
    },
    projectType: "renovation",
    status: "in_progress",
    budget: "$210,000",
    spent: "$142,500",
    progress: 68,
    startDate: "Dec 1, 2025",
    endDate: "Mar 15, 2026",
    tasks: [
      { id: "t1", name: "Demo complete", category: "Demolition", completed: true },
      { id: "t2", name: "Framing inspection", category: "Structure", completed: true },
      { id: "t3", name: "Electrical rough-in", category: "Electrical", completed: true },
      { id: "t4", name: "Plumbing rough-in", category: "Plumbing", completed: true },
      { id: "t5", name: "HVAC installation", category: "HVAC", completed: false, dueDate: "Jan 30" },
      { id: "t6", name: "Drywall installation", category: "Finishing", completed: false, dueDate: "Feb 10" },
      { id: "t7", name: "Kitchen cabinet install", category: "Kitchen", completed: false, dueDate: "Feb 20" },
      { id: "t8", name: "Final finishes", category: "Finishing", completed: false, dueDate: "Mar 10" },
    ],
    materials: [
      { id: "m1", name: "Kitchen Cabinets (custom)", quantity: "1 set", ordered: true, supplier: "Cabinet World", cost: "$18,500" },
      { id: "m2", name: "Hardwood Flooring", quantity: "1,200 sqft", ordered: true, supplier: "Boston Flooring", cost: "$9,600" },
      { id: "m3", name: "Bathroom Fixtures", quantity: "3 sets", ordered: false, cost: "$4,200" },
      { id: "m4", name: "Interior Doors", quantity: "14 doors", ordered: false, cost: "$3,500" },
    ],
    crew: [
      { id: "c1", name: "Mike Thompson", role: "Lead Carpenter", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200" },
      { id: "c2", name: "Carlos Rodriguez", role: "Electrician", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
      { id: "c3", name: "James Wilson", role: "Plumber", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" },
    ],
    permits: [
      { id: "p1", type: "Building Permit", status: "approved", number: "BP-2025-4521" },
      { id: "p2", type: "Electrical Permit", status: "approved", number: "EP-2025-2341" },
      { id: "p3", type: "Plumbing Permit", status: "approved", number: "PP-2025-1892" },
    ],
    inspections: [
      { id: "i1", type: "Framing", date: "Dec 15, 2025", status: "passed" },
      { id: "i2", type: "Electrical Rough", date: "Jan 10, 2026", status: "passed" },
      { id: "i3", type: "Plumbing Rough", date: "Jan 15, 2026", status: "passed" },
      { id: "i4", type: "HVAC", date: "Feb 1, 2026", status: "scheduled" },
    ],
  },
  {
    id: "cp2",
    name: "South End Condo Flip",
    description: "Quick-turn condo flip focusing on a modern kitchen remodel with quartz countertops and new cabinetry, full bathroom renovation with new tile and fixtures, and fresh finishes throughout the unit.",
    address: "156 Tremont St Unit 4, Boston, MA 02111",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    client: {
      id: "cl2",
      name: "Amanda Foster",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      type: "Investor",
      phone: "(617) 555-0456",
    },
    projectType: "remodel",
    status: "in_progress",
    budget: "$85,000",
    spent: "$32,400",
    progress: 38,
    startDate: "Jan 5, 2026",
    endDate: "Mar 1, 2026",
    tasks: [
      { id: "t1", name: "Kitchen demo", category: "Demolition", completed: true },
      { id: "t2", name: "Bathroom demo", category: "Demolition", completed: true },
      { id: "t3", name: "Electrical updates", category: "Electrical", completed: false, dueDate: "Feb 1" },
      { id: "t4", name: "Plumbing updates", category: "Plumbing", completed: false, dueDate: "Feb 5" },
      { id: "t5", name: "New kitchen install", category: "Kitchen", completed: false, dueDate: "Feb 15" },
      { id: "t6", name: "Bathroom tile", category: "Bathroom", completed: false, dueDate: "Feb 20" },
    ],
    materials: [
      { id: "m1", name: "Kitchen Cabinets", quantity: "1 set", ordered: true, supplier: "IKEA", cost: "$4,200" },
      { id: "m2", name: "Quartz Countertops", quantity: "45 sqft", ordered: true, supplier: "Stone Center", cost: "$3,150" },
      { id: "m3", name: "Tile (bathroom)", quantity: "120 sqft", ordered: false, cost: "$960" },
    ],
    crew: [
      { id: "c1", name: "Tony Martinez", role: "Lead", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
    ],
    permits: [
      { id: "p1", type: "Building Permit", status: "approved", number: "BP-2026-0112" },
    ],
    inspections: [
      { id: "i1", type: "Final", date: "Feb 28, 2026", status: "scheduled" },
    ],
  },
];

export const mockContractorStores: ContractorStore[] = [
  {
    id: "cs1",
    name: "Leslie's Pool Supplies",
    address: "1001 VFW Parkway, West Roxbury, MA 02132",
    phone: "(617) 555-0101",
    distance: "2.3 mi",
    latitude: 42.2835,
    longitude: -71.1589,
    rating: 4.7,
    isOpen: true,
    openHours: "7:00 AM - 7:00 PM",
    storeType: "pool_supply",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800",
    specialties: ["Pool Chemicals", "Water Testing", "Pool Covers", "Cleaning Equipment", "Accessories"],
    proDiscount: 15,
    deliveryAvailable: true,
    bulkPricing: true,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "Chlorine Tablets 50lb", inStock: true, quantity: 120, price: 189.99, aisle: "Chemicals", unit: "bucket" },
      { id: "i2", name: "Pool Shock 12-pack", inStock: true, quantity: 85, price: 54.99, aisle: "Chemicals", unit: "pack" },
      { id: "i3", name: "DE Filter Powder 25lb", inStock: true, quantity: 45, price: 32.99, aisle: "Filters", unit: "bag" },
      { id: "i4", name: "Pool Test Kit Pro", inStock: true, quantity: 30, price: 89.99, aisle: "Testing", unit: "each" },
      { id: "i5", name: "Solar Pool Cover 18x36", inStock: true, quantity: 15, price: 249.99, aisle: "Covers", unit: "each" },
    ],
  },
  {
    id: "cs2",
    name: "Pentair Pool Equipment Center",
    address: "75 Mystic Ave, Somerville, MA 02145",
    phone: "(617) 555-0202",
    distance: "3.1 mi",
    latitude: 42.3954,
    longitude: -71.0817,
    rating: 4.9,
    isOpen: true,
    openHours: "6:30 AM - 5:00 PM",
    storeType: "pool_equipment",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    specialties: ["Pool Pumps", "Filters", "Heaters", "Automation", "LED Lighting"],
    proDiscount: 12,
    deliveryAvailable: true,
    bulkPricing: true,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "Pentair VS Pump 1.5HP", inStock: true, quantity: 18, price: 1299.00, aisle: "Pumps", unit: "each" },
      { id: "i2", name: "Hayward DE Filter 60sqft", inStock: true, quantity: 12, price: 649.00, aisle: "Filters", unit: "each" },
      { id: "i3", name: "Pentair MasterTemp 400K BTU", inStock: true, quantity: 6, price: 2899.00, aisle: "Heaters", unit: "each" },
      { id: "i4", name: "IntelliCenter Automation", inStock: true, quantity: 8, price: 1599.00, aisle: "Auto", unit: "each" },
      { id: "i5", name: "IntelliBrite LED Color Light", inStock: true, quantity: 25, price: 449.00, aisle: "Lights", unit: "each" },
    ],
  },
  {
    id: "cs3",
    name: "Pool Plumbing Pros",
    address: "234 Cambridge St, Boston, MA 02114",
    phone: "(617) 555-0303",
    distance: "1.8 mi",
    latitude: 42.3612,
    longitude: -71.0654,
    rating: 4.6,
    isOpen: true,
    openHours: "7:00 AM - 5:00 PM",
    storeType: "plumbing",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800",
    specialties: ["PVC Pipe & Fittings", "Valves", "Skimmers", "Main Drains", "Return Fittings"],
    proDiscount: 18,
    deliveryAvailable: true,
    bulkPricing: true,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "2\" Schedule 40 PVC 10ft", inStock: true, quantity: 200, price: 12.99, aisle: "Pipe", unit: "each" },
      { id: "i2", name: "3-Way Valve 2\"", inStock: true, quantity: 45, price: 89.99, aisle: "Valves", unit: "each" },
      { id: "i3", name: "Hayward Skimmer SP1082", inStock: true, quantity: 30, price: 149.00, aisle: "Skimmers", unit: "each" },
      { id: "i4", name: "Main Drain Anti-Vortex", inStock: true, quantity: 50, price: 45.99, aisle: "Drains", unit: "each" },
      { id: "i5", name: "Return Jet Eyeball", inStock: true, quantity: 100, price: 8.99, aisle: "Returns", unit: "each" },
    ],
  },
  {
    id: "cs4",
    name: "Gunite & Concrete Supply",
    address: "450 Harrison Ave, Boston, MA 02118",
    phone: "(617) 555-0404",
    distance: "2.5 mi",
    latitude: 42.3445,
    longitude: -71.0698,
    rating: 4.8,
    isOpen: true,
    openHours: "5:00 AM - 3:00 PM",
    storeType: "concrete",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    specialties: ["Gunite Mix", "Shotcrete", "Rebar", "Pool Plaster", "Pebble Finish"],
    proDiscount: 10,
    deliveryAvailable: true,
    bulkPricing: true,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "Gunite Mix (per yard)", inStock: true, quantity: 500, price: 145.00, aisle: "Yard", unit: "yard" },
      { id: "i2", name: "#3 Rebar 20ft", inStock: true, quantity: 800, price: 8.50, aisle: "Steel", unit: "each" },
      { id: "i3", name: "Pool Plaster White 80lb", inStock: true, quantity: 200, price: 28.99, aisle: "Finish", unit: "bag" },
      { id: "i4", name: "PebbleTec Finish (per sqft)", inStock: true, quantity: 5000, price: 12.50, aisle: "Finish", unit: "sqft" },
      { id: "i5", name: "Shotcrete Accelerator", inStock: true, quantity: 40, price: 89.00, aisle: "Additives", unit: "gal" },
    ],
  },
  {
    id: "cs5",
    name: "Pool Tile & Stone Gallery",
    address: "567 Boylston St, Boston, MA 02116",
    phone: "(617) 555-0505",
    distance: "1.2 mi",
    latitude: 42.3503,
    longitude: -71.0757,
    rating: 4.5,
    isOpen: true,
    openHours: "8:00 AM - 6:00 PM",
    storeType: "tile",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
    specialties: ["Waterline Tile", "Glass Mosaic", "Coping Stones", "Pool Deck Pavers", "Grout & Adhesive"],
    proDiscount: 15,
    deliveryAvailable: true,
    bulkPricing: true,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "Glass Mosaic Tile 1x1", inStock: true, quantity: 3000, price: 18.99, aisle: "Tile", unit: "sqft" },
      { id: "i2", name: "Travertine Coping 12x24", inStock: true, quantity: 500, price: 12.50, aisle: "Coping", unit: "LF" },
      { id: "i3", name: "Pool Deck Paver 12x12", inStock: true, quantity: 2000, price: 4.99, aisle: "Deck", unit: "each" },
      { id: "i4", name: "Epoxy Pool Grout 25lb", inStock: true, quantity: 80, price: 65.00, aisle: "Supplies", unit: "bag" },
      { id: "i5", name: "Waterline Tile 6x6 Blue", inStock: true, quantity: 1500, price: 8.99, aisle: "Tile", unit: "sqft" },
    ],
  },
  {
    id: "cs6",
    name: "Pool Builder Equipment Rental",
    address: "125 Industrial Way, Watertown, MA 02472",
    phone: "(617) 555-0707",
    distance: "4.2 mi",
    latitude: 42.3654,
    longitude: -71.1857,
    rating: 4.4,
    isOpen: true,
    openHours: "5:00 AM - 7:00 PM",
    storeType: "tool_rental",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
    specialties: ["Excavators", "Gunite Machines", "Concrete Mixers", "Rebar Equipment", "Pumps"],
    deliveryAvailable: true,
    bulkPricing: false,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "Mini Excavator (daily)", inStock: true, quantity: 5, price: 350.00, aisle: "Yard", unit: "day" },
      { id: "i2", name: "Gunite Machine (daily)", inStock: true, quantity: 3, price: 450.00, aisle: "Yard", unit: "day" },
      { id: "i3", name: "Concrete Mixer 9cf", inStock: true, quantity: 8, price: 95.00, aisle: "Yard", unit: "day" },
      { id: "i4", name: "Rebar Bender/Cutter", inStock: true, quantity: 6, price: 75.00, aisle: "Tools", unit: "day" },
      { id: "i5", name: "Dewatering Pump 4\"", inStock: true, quantity: 10, price: 125.00, aisle: "Pumps", unit: "day" },
    ],
  },
  {
    id: "cs7",
    name: "Pool Deck & Landscape Supply",
    address: "890 Commonwealth Ave, Boston, MA 02215",
    phone: "(617) 555-0606",
    distance: "3.8 mi",
    latitude: 42.3505,
    longitude: -71.1054,
    rating: 4.6,
    isOpen: true,
    openHours: "7:00 AM - 5:00 PM",
    storeType: "landscape",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    specialties: ["Pool Decking", "Fencing", "Outdoor Lighting", "Plants", "Irrigation"],
    proDiscount: 12,
    deliveryAvailable: true,
    bulkPricing: true,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "Composite Decking 16ft", inStock: true, quantity: 400, price: 45.00, aisle: "Deck", unit: "each" },
      { id: "i2", name: "Aluminum Pool Fence 6ft", inStock: true, quantity: 100, price: 89.00, aisle: "Fence", unit: "section" },
      { id: "i3", name: "LED Landscape Light", inStock: true, quantity: 150, price: 45.00, aisle: "Lights", unit: "each" },
      { id: "i4", name: "Pool-Safe Plants (palm)", inStock: true, quantity: 40, price: 125.00, aisle: "Plants", unit: "each" },
      { id: "i5", name: "Drip Irrigation Kit", inStock: true, quantity: 25, price: 75.00, aisle: "Irrigation", unit: "kit" },
    ],
  },
  {
    id: "cs8",
    name: "SCP Distributors",
    address: "300 Terminal St, Charlestown, MA 02129",
    phone: "(617) 555-0808",
    distance: "2.9 mi",
    latitude: 42.3782,
    longitude: -71.0483,
    rating: 4.7,
    isOpen: true,
    openHours: "6:00 AM - 4:00 PM",
    storeType: "building_supply",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800",
    specialties: ["Pool Kits", "Steel Panels", "Vinyl Liners", "Safety Covers", "Spa Equipment"],
    proDiscount: 20,
    deliveryAvailable: true,
    bulkPricing: true,
    creditAvailable: true,
    inventory: [
      { id: "i1", name: "Steel Wall Panel Kit 16x32", inStock: true, quantity: 8, price: 4500.00, aisle: "Kits", unit: "kit" },
      { id: "i2", name: "Vinyl Liner 16x32 Blue", inStock: true, quantity: 15, price: 1299.00, aisle: "Liners", unit: "each" },
      { id: "i3", name: "Safety Cover Mesh 18x36", inStock: true, quantity: 12, price: 1899.00, aisle: "Covers", unit: "each" },
      { id: "i4", name: "Spa Jet Kit 8-pack", inStock: true, quantity: 20, price: 289.00, aisle: "Spa", unit: "kit" },
      { id: "i5", name: "Pool Light Niche", inStock: true, quantity: 35, price: 125.00, aisle: "Lights", unit: "each" },
    ],
  },
];
