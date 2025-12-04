# Índices de Firestore Requeridos

Este documento lista los índices compuestos necesarios para que las consultas funcionen correctamente en Firestore.

## Cómo crear los índices

Los índices se pueden crear de dos formas:

1. **Automáticamente**: Cuando ejecutes una consulta que requiera un índice, Firestore mostrará un enlace en la consola para crearlo automáticamente.

2. **Manualmente**: Ve a la consola de Firebase → Firestore → Índices y crea los índices manualmente.

## Índices Requeridos

### Colección: `auctions`

1. **Subastas activas ordenadas por fecha de fin**

   - Campo: `status` (Ascendente)
   - Campo: `endDate` (Ascendente)
   - Consulta usada en: `getActiveAuctions()`

2. **Subastas por categoría y estado**

   - Campo: `category` (Ascendente)
   - Campo: `status` (Ascendente)
   - Campo: `endDate` (Ascendente)
   - Consulta usada en: `getAuctionsByCategory()`

3. **Subastas por vendedor**

   - Campo: `sellerId` (Ascendente)
   - Campo: `createdAt` (Descendente)
   - Consulta usada en: `getAuctionsBySeller()`

4. **Subastas que terminan pronto**
   - Campo: `status` (Ascendente)
   - Campo: `endDate` (Ascendente)
   - Consulta usada en: `getAuctionsEndingSoon()`

### Subcolección: `auctions/{auctionId}/bids`

1. **Pujas ordenadas por monto**
   - Campo: `amount` (Descendente)
   - Consulta usada en: `getBidsByAuction()`

### Subcolección: `users/{userId}/bids`

1. **Pujas del usuario ordenadas por fecha**

   - Campo: `timestamp` (Descendente)
   - Consulta usada en: `getBidsByUser()`

2. **Pujas activas del usuario**

   - Campo: `status` (Ascendente)
   - Campo: `timestamp` (Descendente)
   - Consulta usada en: `getActiveBidsByUser()`

3. **Pujas ganadoras del usuario**

   - Campo: `isWinning` (Ascendente)
   - Campo: `status` (Ascendente)
   - Campo: `timestamp` (Descendente)
   - Consulta usada en: `getWinningBidsByUser()`

4. **Pujas del usuario por subasta**
   - Campo: `auctionId` (Ascendente)
   - Campo: `timestamp` (Descendente)
   - Consulta usada en: `getUserBidsForAuction()`

### Subcolección: `users/{userId}/viewHistory`

1. **Historial ordenado por fecha**

   - Campo: `viewedAt` (Descendente)
   - Consulta usada en: `getViewHistory()`

2. **Historial reciente**

   - Campo: `viewedAt` (Ascendente)
   - Consulta usada en: `getRecentViewHistory()`

3. **Visualización por subasta**
   - Campo: `auctionId` (Ascendente)
   - Campo: `viewedAt` (Descendente)
   - Consulta usada en: `getViewHistoryForAuction()`

### Colección: `categories`

1. **Categorías activas ordenadas por nombre**

   - Campo: `isActive` (Ascendente)
   - Campo: `name` (Ascendente)
   - Consulta usada en: `getActiveCategories()`

2. **Categoría por slug**
   - Campo: `slug` (Ascendente)
   - Consulta usada en: `getCategoryBySlug()`

## Notas Importantes

- Los índices se crean automáticamente cuando ejecutas las consultas por primera vez.
- Los índices compuestos pueden tardar varios minutos en construirse.
- Si una consulta falla con un error de índice faltante, sigue el enlace proporcionado por Firestore para crearlo.
- Para producción, considera crear todos los índices necesarios antes del despliegue.

## Reglas de Seguridad Recomendadas

Asegúrate de configurar reglas de seguridad apropiadas en Firestore. Ejemplo básico:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios: solo pueden leer/escribir su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Subcolecciones del usuario
      match /bids/{bidId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /viewHistory/{viewId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      // watchlist removido - no se usa por ahora
    }

    // Subastas: todos pueden leer, solo el vendedor puede escribir
    match /auctions/{auctionId} {
      allow read: if true;
      allow write: if request.auth != null &&
        resource.data.sellerId == request.auth.uid;

      // Pujas: todos pueden leer, usuarios autenticados pueden crear
      match /bids/{bidId} {
        allow read: if true;
        allow create: if request.auth != null &&
          request.resource.data.userId == request.auth.uid;
      }
    }

    // Categorías: todos pueden leer, solo admins pueden escribir
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Pujas globales: todos pueden leer
    match /bids/{bidId} {
      allow read: if true;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```
