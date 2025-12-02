/** Interfaces TypeScript para los modelos de datos de Firestore */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// TIPOS DE ESTADO Y ENUMS
// ============================================================================

export type AuctionStatus = "active" | "ended" | "cancelled" | "sold";
export type BidStatus = "active" | "outbid" | "winning" | "cancelled";
export type UserRole = "user" | "admin" | "moderator";

// ============================================================================
// MODELO DE USUARIO
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  phone: string;
  photoURL: string;
  
  // Información adicional
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Estadísticas de subastas
  totalBids?: number;
  wonAuctions?: number;
  rating?: number; // Promedio de calificaciones recibidas
  totalRatings?: number; // Número de calificaciones recibidas
  
  // Configuración
  termsAccepted: boolean;
  conditionsAccepted: boolean;
  isActive: boolean;
  isVerified: boolean;
  role?: UserRole;
  
  // Metadatos
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastLoginAt?: Date | Timestamp;
}

export interface UserCreateInput {
  id: string;
  email: string;
  username: string;
  displayName: string;
  phone: string;
  photoURL: string;
  termsAccepted: boolean;
  conditionsAccepted: boolean;
  address?: User["address"];
}

export interface UserUpdateInput {
  username?: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  address?: User["address"];
  isActive?: boolean;
  isVerified?: boolean;
}

// ============================================================================
// MODELO DE SUBASTA
// ============================================================================

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string; // ID de la categoría
  
  // Información del vendedor
  sellerId: string;
  
  // Precios
  initialPrice: number;
  currentPrice: number; // Precio actual (mayor puja)
  
  // Imágenes
  image: string; // Imagen principal
  images?: string[]; // Array de imágenes adicionales
  
  // Estado y fechas
  status: AuctionStatus;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  
  // Información de la puja actual
  currentBidId?: string; // ID de la puja ganadora actual
  currentBids: number; // Número total de pujas
  
  
  // Metadatos
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  
  // Campos calculados (no se guardan en Firestore)
  endsIn?: string; // Calculado en el cliente
}

export interface AuctionCreateInput {
  title: string;
  description: string;
  category: string;
  sellerId: string;
  initialPrice: number;
  reservePrice?: number;
  image: string;
  images?: string[];
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  location?: string;
}

export interface AuctionUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  initialPrice?: number;
  reservePrice?: number;
  image?: string;
  images?: string[];
  endDate?: Date | Timestamp;
  status?: AuctionStatus;
  location?: string;
}

// ============================================================================
// MODELO DE PUJA
// ============================================================================

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: Date | Timestamp;
  isWinning: boolean;
  status: BidStatus;
  
  // Metadatos
  createdAt: Date | Timestamp;
}

// Bid con información del usuario
export interface BidWithUser extends Bid {
  user?: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  };
}

export interface BidCreateInput {
  auctionId: string;
  userId: string;
  amount: number;
}

// ============================================================================
// MODELO DE HISTORIAL DE VISUALIZACIONES
// ============================================================================

export interface ViewHistory {
  id: string;
  userId: string;
  auctionId: string;
  auctionTitle: string;
  auctionImage: string;
  viewedAt: Date | Timestamp;
}

export interface ViewHistoryCreateInput {
  userId: string;
  auctionId: string;
  auctionTitle: string;
  auctionImage: string;
}

// ============================================================================
// MODELO DE CATEGORÍA
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  image?: string;
  isActive: boolean;
  
  // Metadatos
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface CategoryCreateInput {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

// ============================================================================
// TIPOS DE RESPUESTA Y HELPERS
// ============================================================================

export interface AuctionWithBids extends Auction {
  bids?: Bid[];
  highestBid?: Bid;
}

export interface UserWithStats extends User {
  activeBids?: number;
}

// Helper para convertir Timestamp a Date
export function timestampToDate(
  timestamp: Date | Timestamp | { seconds: number; nanoseconds?: number } | string | number
): Date {
  // Si ya es Date, retornarlo
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Si es Timestamp de Firestore, convertir a Date
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Si tiene propiedades seconds y nanoseconds (Timestamp de Firestore serializado)
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
  }
  
  // Si es un número (timestamp en milisegundos)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Si es un string ISO
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // Fallback: retornar fecha actual
  console.warn('No se pudo convertir timestamp a Date:', timestamp);
  return new Date();
}

// Helper para calcular tiempo restante
export function calculateTimeRemaining(
  endDate: Date | Timestamp | { seconds: number; nanoseconds?: number } | string | number
): string {
  try {
    const end = timestampToDate(endDate);
    
    // Verificar que end sea un Date válido
    if (!(end instanceof Date) || isNaN(end.getTime())) {
      console.warn('Fecha inválida en calculateTimeRemaining:', endDate);
      return "Fecha inválida";
    }
    
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      return "Finalizada";
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  } catch (error) {
    console.error('Error en calculateTimeRemaining:', error, 'endDate:', endDate);
    return "Error al calcular";
  }
}

