export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
}

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'CONDO' | 'LAND' | 'TOWNHOUSE';
export type SaleStatus = 'FOR_SALE' | 'FOR_RENT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  yearBuilt: number;
  images?: string[];
}
