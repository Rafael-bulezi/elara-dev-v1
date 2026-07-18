# ELARA ARCHITECTURE DUMP

This document provides a low-level technical dump of the Elara codebase. It is designed to provide sufficient context for a lead architect AI to plan an MVP implementation.

## 1. FILE TREE (Source)

```text
src/
   App.tsx
   index.css
   main.tsx
   vite-env.d.ts
   
+---assets/
       react.svg
       
+---components/
   +---auth/
          AuthModal.tsx
          ProfileDrawer.tsx
          
   +---cart/
          CartDrawer.tsx
          CheckoutModal.tsx
          
   +---common/
          DevTools.tsx
          ErrorBoundary.tsx
          ImageWithFallback.tsx
          ImportSection.tsx
          InstallPrompt.tsx
          
   +---layout/
          BottomNav.tsx
          Footer.tsx
          Header.tsx
          Hero.tsx
          MobileMenu.tsx
          
   +---product/
           ImportRequestForm.tsx
           ProductCard.tsx
           ProductDetailsModal.tsx
           ProductFormModal.tsx
           ProductSkeleton.tsx
           
+---constants/
       index.ts
       logo.ts
       verses.ts
       
+---lib/
       notifications.ts
       supabase.ts
       utils.ts
       
+---types/
       index.ts
       
+---utils/
       animations.ts
       avatar.ts
       
+---views/
        AdminView.tsx
        ChatListView.tsx
        ChatRoomView.tsx
        ImportQuoteView.tsx
        OrdersView.tsx
        ProductsView.tsx
        ProfileSettingsView.tsx
        SellerProfileView.tsx
```

## 2. CORE TYPES & SCHEMAS

### User & Roles
```typescript
export type UserRole = 'buyer' | 'seller' | 'admin' | 'intermediary';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  photoURL?: string; 
  displayName?: string; 
  description?: string;
  bio?: string; 
  phone?: string;
  phoneNumber?: string; 
  banner?: string;
  address?: string;
  rating?: number;
  reviewsCount?: number;
  createdAt?: any;
};
```

### Products & Cart
```typescript
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
  sellerRating: number;
  sellerPhone?: string;
  sellerReviews?: number;
  category: string;
  isImport: boolean;
  status: ProductStatus;
  emPromocao: boolean;
  stock?: number;
  createdAt: number;
  description?: string;
  verified?: boolean;
};

export type CartItem = Product & {
  cartQuantity: number;
};
```

## 3. GLOBAL STATE & ROUTING (App.tsx)

### Primary State Hub
- **User Session**: `userProfile` (State managed via Supabase auth listener).
- **Navigation**: `currentView` (Values: `'home'`, `'orders'`, `'products'`, `'settings'`, `'seller'`, `'admin'`, `'messages'`, `'chat'`, `'quote'`, `'category'`).
- **UI States**: `isDark`, `isMobileMenuOpen`, `isCartOpen`, `isProfileOpen`, `isAuthModalOpen`, `isImportModalOpen`.
- **Commerce Data**: `products`, `cart`, `searchQuery`, `activeCategory`, `sortBy`.

### Role-Based Conditional Logic
- **Header Actions**: "Vender" and "Importar" buttons are conditionally displayed (though currently visible to all, actions are gated by auth).
- **View Management**: `navigateTo` helper resets scrolls and closes drawers.
- **Home View**: Uses `userProfile.role` logic to differentiate dashboard experiences (e.g., Buyer vs. Micheiro feed).

## 4. UI & DESIGN SYSTEM

### Tailwind Configuration
```javascript
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {}, // Brand color #5A189A currently applied via hardcoded hexes.
  },
  plugins: [],
}
```

### Common UI Components
- **Common**: `DevTools`, `ErrorBoundary`, `ImageWithFallback`, `InstallPrompt`.
- **Layout**: `Header`, `Hero`, `Footer`, `BottomNav`, `MobileMenu`.

## 5. DATA CONNECTIONS

### Supabase SDK (`src/lib/supabase.ts`)
- **Exports**:
  - `supabase`: Initialized client (uses `import.meta.env`).
  - `getSession()`: Async wrapper for current session.
  - `getUser()`: Async wrapper for current user data.
- **Tables Referenced**: `profiles`, `products`, `orders`, `chats`, `quotes` (legacy).
