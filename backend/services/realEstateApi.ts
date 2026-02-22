export interface PropertySearchParams {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export interface AuctionSearchParams {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  county?: string;
  state?: string;
  minOwedAmount?: number;
  maxOwedAmount?: number;
  propertyType?: string;
  auctionDateFrom?: string;
  auctionDateTo?: string;
}

export interface ExternalAuction {
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
  image?: string;
  county: string;
  taxYearsOwed: number[];
  contactPhone?: string;
  contactEmail?: string;
  registrationDeadline?: string;
  depositRequired?: number;
  description?: string;
}

export interface ExternalProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  estimatedValue?: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
  taxAssessment?: number;
  image?: string;
}

class RealEstateApiService {
  private attomApiKey: string | null = null;
  private realtyMoleApiKey: string | null = null;

  constructor() {
    this.attomApiKey = process.env.ATTOM_API_KEY || null;
    this.realtyMoleApiKey = process.env.REALTYMOLE_API_KEY || null;
  }

  async searchTaxAuctions(params: AuctionSearchParams): Promise<ExternalAuction[]> {
    console.log("Searching tax auctions with params:", params);

    if (this.attomApiKey) {
      try {
        return await this.fetchAttomAuctions(params);
      } catch (error) {
        console.error("ATTOM API error:", error);
      }
    }

    console.log("No API key configured, returning empty results");
    return [];
  }

  private async fetchAttomAuctions(params: AuctionSearchParams): Promise<ExternalAuction[]> {
    const baseUrl = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";
    
    const url = new URL(`${baseUrl}/sale/snapshot`);
    url.searchParams.set("latitude", params.latitude.toString());
    url.searchParams.set("longitude", params.longitude.toString());
    url.searchParams.set("radius", (params.radiusMiles || 25).toString());
    url.searchParams.set("saletype", "Foreclosure");
    
    if (params.state) {
      url.searchParams.set("state2", params.state);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "apikey": this.attomApiKey!,
      },
    });

    if (!response.ok) {
      throw new Error(`ATTOM API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformAttomToAuctions(data);
  }

  private transformAttomToAuctions(data: Record<string, unknown>): ExternalAuction[] {
    const properties = (data as { property?: unknown[] }).property || [];
    
    return properties.map((prop: unknown) => {
      const p = prop as Record<string, unknown>;
      const address = (p.address || {}) as Record<string, unknown>;
      const location = (p.location || {}) as Record<string, unknown>;
      const building = (p.building || {}) as Record<string, unknown>;
      const sale = (p.sale || {}) as Record<string, unknown>;
      const assessment = (p.assessment || {}) as Record<string, unknown>;
      
      const saleAmount = (sale.amount || {}) as Record<string, unknown>;
      const assessed = (assessment.assessed || {}) as Record<string, unknown>;
      const market = (assessment.market || {}) as Record<string, unknown>;
      const summary = (building.summary || {}) as Record<string, unknown>;
      const rooms = (building.rooms || {}) as Record<string, unknown>;
      const size = (building.size || {}) as Record<string, unknown>;

      return {
        id: `attom-${p.identifier || Math.random().toString(36).substr(2, 9)}`,
        address: `${address.line1 || ""}`,
        city: (address.locality || "") as string,
        state: (address.countrySubd || "") as string,
        zipCode: (address.postal1 || "") as string,
        latitude: Number(location.latitude) || 0,
        longitude: Number(location.longitude) || 0,
        parcelId: (p.parcelId || "") as string,
        owedAmount: Number(saleAmount.saleAmt) || 0,
        assessedValue: Number(assessed.assdTtlValue) || 0,
        marketValue: Number(market.mktTtlValue) || 0,
        propertyType: this.mapPropertyType((summary.propClass || "") as string),
        bedrooms: Number(rooms.beds) || undefined,
        bathrooms: Number(rooms.bathsFull) || undefined,
        sqft: Number(size.livingSize) || undefined,
        lotSize: size.lotSize ? `${size.lotSize} sqft` : undefined,
        yearBuilt: Number(summary.yearBuilt) || undefined,
        auctionDate: (sale.saleTransDate || new Date().toISOString().split('T')[0]) as string,
        auctionTime: "10:00 AM",
        auctionLocation: `${address.locality} County Courthouse`,
        startingBid: Number(saleAmount.saleAmt) || 0,
        status: "upcoming" as const,
        county: (address.locality || "") as string,
        taxYearsOwed: [],
        description: `Property available through tax sale in ${address.locality}, ${address.countrySubd}`,
      };
    });
  }

  private mapPropertyType(propClass: string): ExternalAuction["propertyType"] {
    const typeMap: Record<string, ExternalAuction["propertyType"]> = {
      "Single Family Residence": "single_family",
      "SFR": "single_family",
      "Multi-Family": "multi_family",
      "Commercial": "commercial",
      "Vacant Land": "land",
      "Condominium": "condo",
    };
    return typeMap[propClass] || "single_family";
  }

  async searchProperties(params: PropertySearchParams): Promise<ExternalProperty[]> {
    console.log("Searching properties with params:", params);

    if (this.realtyMoleApiKey) {
      try {
        return await this.fetchRealtyMoleProperties(params);
      } catch (error) {
        console.error("RealtyMole API error:", error);
      }
    }

    if (this.attomApiKey) {
      try {
        return await this.fetchAttomProperties(params);
      } catch (error) {
        console.error("ATTOM API error:", error);
      }
    }

    console.log("No API key configured, returning empty results");
    return [];
  }

  private async fetchRealtyMoleProperties(params: PropertySearchParams): Promise<ExternalProperty[]> {
    const baseUrl = "https://realty-mole-property-api.p.rapidapi.com/saleListings";
    
    const url = new URL(baseUrl);
    url.searchParams.set("latitude", params.latitude.toString());
    url.searchParams.set("longitude", params.longitude.toString());
    url.searchParams.set("radius", ((params.radiusMiles || 10) * 1609.34).toString());

    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": this.realtyMoleApiKey!,
        "X-RapidAPI-Host": "realty-mole-property-api.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      throw new Error(`RealtyMole API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformRealtyMoleToProperties(data);
  }

  private transformRealtyMoleToProperties(data: unknown[]): ExternalProperty[] {
    return data.map((prop: unknown) => {
      const p = prop as Record<string, unknown>;
      return {
        id: `rm-${p.id || Math.random().toString(36).substr(2, 9)}`,
        address: (p.formattedAddress || p.addressLine1 || "") as string,
        city: (p.city || "") as string,
        state: (p.state || "") as string,
        zipCode: (p.zipCode || "") as string,
        latitude: Number(p.latitude) || 0,
        longitude: Number(p.longitude) || 0,
        propertyType: (p.propertyType || "single_family") as string,
        bedrooms: Number(p.bedrooms) || undefined,
        bathrooms: Number(p.bathrooms) || undefined,
        sqft: Number(p.squareFootage) || undefined,
        lotSize: p.lotSize ? `${p.lotSize} sqft` : undefined,
        yearBuilt: Number(p.yearBuilt) || undefined,
        estimatedValue: Number(p.price) || undefined,
        lastSalePrice: Number(p.lastSalePrice) || undefined,
        lastSaleDate: (p.lastSaleDate || "") as string,
      };
    });
  }

  private async fetchAttomProperties(params: PropertySearchParams): Promise<ExternalProperty[]> {
    const baseUrl = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";
    
    const url = new URL(`${baseUrl}/property/snapshot`);
    url.searchParams.set("latitude", params.latitude.toString());
    url.searchParams.set("longitude", params.longitude.toString());
    url.searchParams.set("radius", (params.radiusMiles || 10).toString());

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "apikey": this.attomApiKey!,
      },
    });

    if (!response.ok) {
      throw new Error(`ATTOM API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformAttomToProperties(data);
  }

  private transformAttomToProperties(data: Record<string, unknown>): ExternalProperty[] {
    const properties = (data as { property?: unknown[] }).property || [];
    
    return properties.map((prop: unknown) => {
      const p = prop as Record<string, unknown>;
      const address = (p.address || {}) as Record<string, unknown>;
      const location = (p.location || {}) as Record<string, unknown>;
      const building = (p.building || {}) as Record<string, unknown>;
      const assessment = (p.assessment || {}) as Record<string, unknown>;
      
      const summary = (building.summary || {}) as Record<string, unknown>;
      const rooms = (building.rooms || {}) as Record<string, unknown>;
      const size = (building.size || {}) as Record<string, unknown>;
      const market = (assessment.market || {}) as Record<string, unknown>;
      const assessed = (assessment.assessed || {}) as Record<string, unknown>;

      return {
        id: `attom-${p.identifier || Math.random().toString(36).substr(2, 9)}`,
        address: `${address.line1 || ""}`,
        city: (address.locality || "") as string,
        state: (address.countrySubd || "") as string,
        zipCode: (address.postal1 || "") as string,
        latitude: Number(location.latitude) || 0,
        longitude: Number(location.longitude) || 0,
        propertyType: (summary.propClass || "single_family") as string,
        bedrooms: Number(rooms.beds) || undefined,
        bathrooms: Number(rooms.bathsFull) || undefined,
        sqft: Number(size.livingSize) || undefined,
        lotSize: size.lotSize ? `${size.lotSize} sqft` : undefined,
        yearBuilt: Number(summary.yearBuilt) || undefined,
        estimatedValue: Number(market.mktTtlValue) || undefined,
        taxAssessment: Number(assessed.assdTtlValue) || undefined,
      };
    });
  }

  async getPropertyDetails(address: string, zipCode: string): Promise<ExternalProperty | null> {
    console.log("Getting property details for:", address, zipCode);

    if (this.realtyMoleApiKey) {
      try {
        const url = new URL("https://realty-mole-property-api.p.rapidapi.com/properties");
        url.searchParams.set("address", address);
        url.searchParams.set("zipCode", zipCode);

        const response = await fetch(url.toString(), {
          headers: {
            "X-RapidAPI-Key": this.realtyMoleApiKey,
            "X-RapidAPI-Host": "realty-mole-property-api.p.rapidapi.com",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            return this.transformRealtyMoleToProperties([data[0]])[0];
          }
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    }

    return null;
  }
}

export const realEstateApi = new RealEstateApiService();
