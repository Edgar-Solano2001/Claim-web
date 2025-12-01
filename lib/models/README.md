# Modelos de Datos para Firestore

Este directorio contiene todos los modelos de datos y funciones CRUD para la aplicación de subastas.

## Estructura

```
lib/models/
├── types.ts           # Interfaces TypeScript y tipos
├── users.ts           # Funciones CRUD para usuarios
├── auctions.ts        # Funciones CRUD para subastas
├── bids.ts            # Funciones CRUD para pujas
├── viewHistory.ts     # Funciones para historial de visualizaciones
├── categories.ts      # Funciones para categorías
├── index.ts           # Exportaciones centralizadas
└── README.md          # Este archivo
```

## Uso Básico

### Importar modelos

```typescript
// Importar todo desde el índice
import { 
  createAuction, 
  getAuction, 
  createBid,
  getUser 
} from "@/lib/models";

// O importar desde archivos específicos
import { createAuction } from "@/lib/models/auctions";
import { createBid } from "@/lib/models/bids";
```

### Crear una subasta

```typescript
import { createAuction } from "@/lib/models/auctions";

const auctionId = await createAuction({
  title: "Producto de ejemplo",
  description: "Descripción del producto",
  category: "arte",
  sellerId: "user123",
  initialPrice: 100,
  image: "https://example.com/image.jpg",
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
});
```

### Crear una puja

```typescript
import { createBid } from "@/lib/models/bids";

const bidId = await createBid({
  auctionId: "auction123",
  userId: "user456",
  amount: 150, // Debe ser mayor que el precio actual
});
```

### Obtener subastas activas

```typescript
import { getActiveAuctions } from "@/lib/models/auctions";

const auctions = await getActiveAuctions(10); // Limitar a 10 resultados
```

### Agregar al historial de visualizaciones

```typescript
import { addToViewHistory } from "@/lib/models/viewHistory";

await addToViewHistory({
  userId: "user123",
  auctionId: "auction456",
  auctionTitle: "Producto visto",
  auctionImage: "https://example.com/image.jpg",
});
```


## Modelos de Datos

### Usuario (User)

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  phone: string;
  photoURL: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  totalBids?: number;
  wonAuctions?: number;
  rating?: number;
  totalRatings?: number;
  termsAccepted: boolean;
  conditionsAccepted: boolean;
  isActive: boolean;
  isVerified: boolean;
  role?: UserRole;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastLoginAt?: Date | Timestamp;
}
```

### Subasta (Auction)

```typescript
interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  sellerId: string;
  initialPrice: number;
  currentPrice: number;
  reservePrice?: number;
  image: string;
  images?: string[];
  status: AuctionStatus; // "active" | "ended" | "cancelled" | "sold"
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  currentBidId?: string;
  currentBids: number;
  condition?: "new" | "used" | "refurbished";
  location?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  endsIn?: string; // Calculado en el cliente
}
```

### Puja (Bid)

```typescript
interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: Date | Timestamp;
  isWinning: boolean;
  status: BidStatus; // "active" | "outbid" | "winning" | "cancelled"
  createdAt: Date | Timestamp;
}
```

## Funciones Principales

### Usuarios

- `createUser(userData)` - Crear usuario
- `getUser(userId)` - Obtener usuario por ID
- `getUserByEmail(email)` - Obtener usuario por email
- `updateUser(userId, updateData)` - Actualizar usuario
- `updateUserLastLogin(userId)` - Actualizar último login
- `incrementUserTotalBids(userId)` - Incrementar contador de pujas
- `incrementUserWonAuctions(userId)` - Incrementar subastas ganadas
- `getUserWithStats(userId)` - Obtener usuario con estadísticas

### Subastas

- `createAuction(auctionData)` - Crear subasta
- `getAuction(auctionId)` - Obtener subasta por ID
- `getAuctionWithBids(auctionId)` - Obtener subasta con pujas
- `getActiveAuctions(limit?)` - Obtener subastas activas
- `getAuctionsByCategory(categoryId, status?)` - Obtener por categoría
- `getAuctionsBySeller(sellerId)` - Obtener por vendedor
- `getAuctionsEndingSoon(hours?)` - Obtener subastas que terminan pronto
- `updateAuction(auctionId, updateData)` - Actualizar subasta
- `updateAuctionStatus(auctionId, status)` - Cambiar estado
- `endAuction(auctionId)` - Finalizar subasta

### Pujas

- `createBid(bidData)` - Crear puja (valida y actualiza automáticamente)
- `getBid(bidId)` - Obtener puja por ID
- `getBidsByAuction(auctionId, limit?)` - Obtener pujas de una subasta
- `getBidsByUser(userId, limit?)` - Obtener pujas de un usuario
- `getActiveBidsByUser(userId)` - Obtener pujas activas del usuario
- `getWinningBidsByUser(userId)` - Obtener pujas ganadoras
- `getHighestBid(auctionId)` - Obtener puja más alta
- `canUserBid(userId, auctionId)` - Verificar si puede pujar
- `getMinimumBidAmount(auctionId)` - Obtener monto mínimo requerido
- `finalizeAuctionBids(auctionId)` - Finalizar pujas cuando termina subasta

### Historial de Visualizaciones

- `addToViewHistory(viewData)` - Agregar visualización
- `getViewHistory(userId, limit?)` - Obtener historial completo
- `getRecentViewHistory(userId, days?, limit?)` - Obtener historial reciente
- `removeFromViewHistory(userId, viewId)` - Eliminar del historial
- `clearViewHistory(userId)` - Limpiar todo el historial

### Categorías

- `createCategory(categoryData)` - Crear categoría
- `getCategory(categoryId)` - Obtener categoría por ID
- `getCategoryBySlug(slug)` - Obtener categoría por slug
- `getActiveCategories()` - Obtener categorías activas
- `getAllCategories()` - Obtener todas las categorías
- `updateCategory(categoryId, updateData)` - Actualizar categoría
- `initializeDefaultCategories()` - Inicializar categorías por defecto

## Compatibilidad

El archivo `lib/subastas.ts` mantiene compatibilidad con el código existente:

```typescript
// Funciones antiguas siguen funcionando
import { getSubastas, createSubasta } from "@/lib/subastas";

const subastas = await getSubastas();
const id = await createSubasta(subastaData);
```

## Notas Importantes

1. **Timestamps**: Los modelos usan `serverTimestamp()` para campos de fecha automáticos
2. **Validaciones**: Las funciones validan datos antes de crear/actualizar
3. **Transacciones**: Las pujas usan transacciones batch para garantizar consistencia
4. **Índices**: Ver `FIRESTORE_INDEXES.md` para los índices necesarios
5. **Seguridad**: Configura reglas de seguridad apropiadas en Firestore

## Migración

Para migrar código existente:

1. Reemplaza importaciones directas de Firestore con funciones de los modelos
2. Usa los tipos TypeScript para mejor autocompletado y validación
3. Actualiza las consultas para usar las funciones helper cuando sea posible

## Ejemplos Completos

Ver los archivos de ejemplo en cada módulo o consultar la documentación de TypeScript para ver todas las funciones disponibles.

