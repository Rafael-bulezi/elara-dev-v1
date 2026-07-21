/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type UserRole = 'buyer' | 'seller' | 'admin';

export type SellerStatus = 'none' | 'pending' | 'active' | 'suspended' | 'rejected';
export type VerificationLevel = 'basic' | 'verified' | 'premium';
export type MixeiroStatus = 'none' | 'pending' | 'active' | 'verified';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  sellerStatus?: SellerStatus;
  shopName?: string;
  verificationLevel?: VerificationLevel;
  idDocumentUrl?: string;
  bankDetails?: string;
  mixeiroStatus?: MixeiroStatus;
  mixeiroVerified?: boolean;
  avatar?: string;
  photoURL?: string; // For compatibility
  displayName?: string; // For compatibility
  description?: string;
  bio?: string; // For compatibility
  phone?: string;
  phoneNumber?: string; // For compatibility
  banner?: string;
  address?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt?: any;
};

export type ProductCondition = 'Novo' | 'Semi-novo' | 'Usado';
export type ProductOrigin = 'China' | 'Europa' | 'Local';
export type ProductStatus = 'pending' | 'approved' | 'rejected';

export type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  imageUrl?: string;
  condition: ProductCondition;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number; // Novo campo
  sellerPhone?: string;
  sellerReviews?: number;
  category: string;
  isImport: boolean;
  status: ProductStatus;
  emPromocao: boolean; // Novo campo
  stock?: number;
  createdAt: number; // Timestamp
  description?: string;
  verified?: boolean;
  productRating?: number;
  productReviews?: number;
  deliveryStatus?: string;
  origin?: ProductOrigin;
};

export type OrderStatus = 'pending' | 'held' | 'shipped' | 'received';
export type PaymentStatus = 'pending' | 'verifying' | 'verified' | 'rejected';

export type Order = {
  id: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerIds?: string[];
  products: Product[];
  productName?: string; // For compatibility
  productPrice?: number; // For compatibility
  total: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentReceipt?: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Chat = {
  id: string;
  participants: string[];
  participantNames?: { [uid: string]: string };
  participantAvatars?: { [uid: string]: string };
  participantDetails?: {
    [uid: string]: {
      name: string;
      avatar: string;
    }
  };
  productId?: string;
  productName?: string;
  lastMessage?: string;
  lastMessageAt?: any;
  lastMessageTime?: any;
  lastSenderId?: string;
  unreadCount?: { [uid: string]: number };
  updatedAt: any;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  read?: boolean;
  createdAt: any;
};

export type ChatMessage = Message; // For compatibility

export type Quote = {
  id: string;
  userId: string;
  userName: string;
  productName: string;
  productUrl?: string;
  quantity: number;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'completed';
  createdAt: any;
};

export type CartItem = Product & {
  cartQuantity: number;
};
