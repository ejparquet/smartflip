export interface TaxAuctionProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  parcelId: string;
  owedAmount: number;
  assessedValue: number;
  marketValue: number;
  propertyType: "single_family" | "multi_family" | "commercial" | "land" | "condo";
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  auctionDate: string;
  auctionTime: string;
  auctionLocation: string;
  startingBid: number;
  status: "upcoming" | "active" | "sold" | "cancelled";
  image: string;
  county: string;
  taxYearsOwed: number[];
  contactPhone: string;
  contactEmail: string;
  registrationDeadline: string;
  depositRequired: number;
  description: string;
}

export const mockTaxAuctions: TaxAuctionProperty[] = [
  {
    id: "ta-001",
    address: "1245 Magnolia Ave",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70801",
    latitude: 30.4515,
    longitude: -91.1871,
    parcelId: "BR-2024-001245",
    owedAmount: 12450,
    assessedValue: 145000,
    marketValue: 185000,
    propertyType: "single_family",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    lotSize: "0.25 acres",
    yearBuilt: 1965,
    auctionDate: "2026-02-15",
    auctionTime: "10:00 AM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 12450,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-02-10",
    depositRequired: 2500,
    description: "Single family home in established neighborhood. Property requires some renovation but has good bones and a large backyard."
  },
  {
    id: "ta-002",
    address: "892 Oak Street",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70802",
    latitude: 30.4407,
    longitude: -91.1761,
    parcelId: "BR-2024-000892",
    owedAmount: 8920,
    assessedValue: 98000,
    marketValue: 125000,
    propertyType: "single_family",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    lotSize: "0.18 acres",
    yearBuilt: 1958,
    auctionDate: "2026-02-15",
    auctionTime: "10:30 AM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 8920,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2022, 2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-02-10",
    depositRequired: 2000,
    description: "Charming cottage-style home with original hardwood floors. Great investment opportunity in a growing area."
  },
  {
    id: "ta-003",
    address: "3456 Government St",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70806",
    latitude: 30.4485,
    longitude: -91.1551,
    parcelId: "BR-2024-003456",
    owedAmount: 45600,
    assessedValue: 320000,
    marketValue: 425000,
    propertyType: "commercial",
    sqft: 4500,
    lotSize: "0.5 acres",
    yearBuilt: 1978,
    auctionDate: "2026-02-20",
    auctionTime: "2:00 PM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 45600,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2021, 2022, 2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-02-15",
    depositRequired: 10000,
    description: "Prime commercial property on Government Street. Previously used as retail space with ample parking."
  },
  {
    id: "ta-004",
    address: "567 Highland Rd",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70808",
    latitude: 30.3977,
    longitude: -91.1288,
    parcelId: "BR-2024-000567",
    owedAmount: 18750,
    assessedValue: 225000,
    marketValue: 295000,
    propertyType: "single_family",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    lotSize: "0.35 acres",
    yearBuilt: 1985,
    auctionDate: "2026-02-22",
    auctionTime: "11:00 AM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 18750,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-02-17",
    depositRequired: 5000,
    description: "Spacious family home near LSU campus. Features updated kitchen and large master suite."
  },
  {
    id: "ta-005",
    address: "234 Perkins Rd",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70810",
    latitude: 30.3654,
    longitude: -91.0651,
    parcelId: "BR-2024-000234",
    owedAmount: 6800,
    assessedValue: 85000,
    marketValue: 110000,
    propertyType: "land",
    lotSize: "1.2 acres",
    auctionDate: "2026-02-25",
    auctionTime: "9:00 AM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 6800,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2022, 2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-02-20",
    depositRequired: 1500,
    description: "Prime undeveloped land with road frontage. Zoned for residential development."
  },
  {
    id: "ta-006",
    address: "789 College Dr",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70808",
    latitude: 30.4018,
    longitude: -91.1345,
    parcelId: "BR-2024-000789",
    owedAmount: 15200,
    assessedValue: 175000,
    marketValue: 220000,
    propertyType: "multi_family",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 2200,
    lotSize: "0.22 acres",
    yearBuilt: 1972,
    auctionDate: "2026-03-01",
    auctionTime: "1:00 PM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 15200,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-02-24",
    depositRequired: 4000,
    description: "Duplex property near colleges. Currently generating rental income. Great investment opportunity."
  },
  {
    id: "ta-007",
    address: "4521 Burbank Dr",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70816",
    latitude: 30.4485,
    longitude: -91.0551,
    parcelId: "BR-2024-004521",
    owedAmount: 22300,
    assessedValue: 265000,
    marketValue: 335000,
    propertyType: "single_family",
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 3200,
    lotSize: "0.4 acres",
    yearBuilt: 1995,
    auctionDate: "2026-03-05",
    auctionTime: "10:00 AM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 22300,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-02-28",
    depositRequired: 5000,
    description: "Modern family home in desirable neighborhood. Features pool and updated interior."
  },
  {
    id: "ta-008",
    address: "156 Florida Blvd",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70801",
    latitude: 30.4525,
    longitude: -91.1901,
    parcelId: "BR-2024-000156",
    owedAmount: 35400,
    assessedValue: 280000,
    marketValue: 365000,
    propertyType: "commercial",
    sqft: 3800,
    lotSize: "0.3 acres",
    yearBuilt: 1968,
    auctionDate: "2026-03-10",
    auctionTime: "2:30 PM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 35400,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2022, 2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-03-05",
    depositRequired: 8000,
    description: "Historic building in downtown area. Suitable for office or retail conversion."
  },
  {
    id: "ta-009",
    address: "2890 Airline Hwy",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70805",
    latitude: 30.4755,
    longitude: -91.1421,
    parcelId: "BR-2024-002890",
    owedAmount: 9500,
    assessedValue: 115000,
    marketValue: 145000,
    propertyType: "single_family",
    bedrooms: 3,
    bathrooms: 1,
    sqft: 1450,
    lotSize: "0.2 acres",
    yearBuilt: 1960,
    auctionDate: "2026-03-12",
    auctionTime: "11:30 AM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 9500,
    status: "active",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-03-07",
    depositRequired: 2500,
    description: "Starter home with renovation potential. Large lot with mature trees."
  },
  {
    id: "ta-010",
    address: "678 Jefferson Hwy",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70806",
    latitude: 30.4322,
    longitude: -91.1188,
    parcelId: "BR-2024-000678",
    owedAmount: 28900,
    assessedValue: 340000,
    marketValue: 425000,
    propertyType: "condo",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    yearBuilt: 2008,
    auctionDate: "2026-03-15",
    auctionTime: "3:00 PM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 28900,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-03-10",
    depositRequired: 6000,
    description: "Luxury condo in gated community. High-end finishes and amenities included."
  },
  {
    id: "ta-011",
    address: "1122 Greenwell Springs Rd",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70814",
    latitude: 30.4855,
    longitude: -91.0821,
    parcelId: "BR-2024-001122",
    owedAmount: 11200,
    assessedValue: 135000,
    marketValue: 175000,
    propertyType: "single_family",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1650,
    lotSize: "0.28 acres",
    yearBuilt: 1982,
    auctionDate: "2026-03-18",
    auctionTime: "10:00 AM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 11200,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-03-13",
    depositRequired: 3000,
    description: "Well-maintained home in quiet neighborhood. Move-in ready condition."
  },
  {
    id: "ta-012",
    address: "3345 Plank Rd",
    city: "Baton Rouge",
    state: "LA",
    zipCode: "70805",
    latitude: 30.4655,
    longitude: -91.1521,
    parcelId: "BR-2024-003345",
    owedAmount: 7800,
    assessedValue: 92000,
    marketValue: 118000,
    propertyType: "single_family",
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1100,
    lotSize: "0.15 acres",
    yearBuilt: 1955,
    auctionDate: "2026-03-20",
    auctionTime: "1:30 PM",
    auctionLocation: "East Baton Rouge Parish Courthouse",
    startingBid: 7800,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80",
    county: "East Baton Rouge Parish",
    taxYearsOwed: [2022, 2023, 2024],
    contactPhone: "(225) 389-3920",
    contactEmail: "taxsales@brla.gov",
    registrationDeadline: "2026-03-15",
    depositRequired: 2000,
    description: "Affordable fixer-upper with solid structure. Great for first-time investors."
  }
];

export const getAuctionsByDistance = (
  auctions: TaxAuctionProperty[],
  userLat: number,
  userLon: number,
  maxDistanceMiles: number
): (TaxAuctionProperty & { distance: number })[] => {
  const R = 3959;
  
  return auctions
    .map(auction => {
      const dLat = (auction.latitude - userLat) * Math.PI / 180;
      const dLon = (auction.longitude - userLon) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLat * Math.PI / 180) * Math.cos(auction.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return { ...auction, distance };
    })
    .filter(auction => auction.distance <= maxDistanceMiles)
    .sort((a, b) => a.distance - b.distance);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getPropertyTypeLabel = (type: TaxAuctionProperty["propertyType"]): string => {
  const labels: Record<TaxAuctionProperty["propertyType"], string> = {
    single_family: "Single Family",
    multi_family: "Multi Family",
    commercial: "Commercial",
    land: "Land",
    condo: "Condo",
  };
  return labels[type];
};
