export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  password?: string;
}

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'CONDO' | 'LAND' | 'TOWNHOUSE';
export type SaleStatus = 'FOR_SALE' | 'FOR_RENT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OwnershipType = 'FREEHOLD' | 'LEASEHOLD' | 'GOVERNMENT' | 'PERMIT' | 'OTHER';

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: PropertyType;
  status: SaleStatus;
  approvalStatus: ApprovalStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking?: number | null;
  yearBuilt?: number | null;
  ownershipType?: OwnershipType | null;
  streetAddress?: string | null;
  township?: string | null;
  city?: string | null;
  stateRegion?: string | null;
  zipCode?: string | null;
  hasGrant?: boolean;
  hasPermit?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  features?: string[];
  imageUrl: string;
  owner: string;
  ownerPhone: string;
  createdAt: string;
}

export interface PropertyRequest {
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: PropertyType;
  status: SaleStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking?: number | null;
  yearBuilt?: number | null;
  ownershipType?: OwnershipType | null;
  streetAddress?: string | null;
  township?: string | null;
  city?: string | null;
  stateRegion?: string | null;
  zipCode?: string | null;
  hasGrant?: boolean;
  hasPermit?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  features?: string[];
  imageUrl: string;
}

export interface YangonTownship {
  id: string;
  nameEn: string;
  nameMy: string;
}

export interface MyanmarProperty {
  id: string;
  titleEn: string;
  titleMy: string;
  typeEn: string;
  typeMy: string;
  townshipEn: string;
  townshipMy: string;
  addressEn: string;
  addressMy: string;
  price: number;
  priceMy: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  badgeEn: string;
  badgeMy: string;
  favorite: boolean;
  ownerEn: string;
  ownerMy: string;
  ownerAvatar: string;
  ownerPhone: string;
  yearBuilt: number;
  images?: string[];
}
