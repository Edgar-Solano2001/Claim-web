# Documentación de APIs - Claim Subastas

## Configuración Requerida

### Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY=tu_private_key
```

## Autenticación

Todas las APIs que requieren autenticación deben incluir el token en el header:

```
Authorization: Bearer <token>
```

El token se obtiene de Firebase Auth después de que el usuario inicia sesión.

---

## APIs de Login

## APIs de Productos

### POST /api/products

Crear un nuevo producto

**Headers:**

- `Authorization: Bearer <token>` (requerido)

**Body:**

```json
{
  "title": "Figura de Batman",
  "description": "Descripción detallada del producto...",
  "category": "juguetes",
  "images": ["https://storage.googleapis.com/...", "..."]
}
```

**Response (201):**

```json
{
  "productId": "abc123",
  "status": "pending",
  "message": "Producto creado exitosamente. Esperando aprobación del administrador."
}
```

### GET /api/products

Obtener productos del usuario autenticado

**Headers:**

- `Authorization: Bearer <token>` (requerido)

**Query Params:**

- `status`: `pending` | `approved` | `rejected` (opcional)
- `limit`: número (default: 20)
- `offset`: número (default: 0)

**Response (200):**

```json
{
  "products": [
    {
      "id": "abc123",
      "title": "Figura de Batman",
      "description": "...",
      "category": "juguetes",
      "images": ["..."],
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### GET /api/products/[id]

Obtener detalle de un producto

**Response (200):**

```json
{
  "id": "abc123",
  "title": "Figura de Batman",
  "description": "...",
  "category": "juguetes",
  "images": ["..."],
  "status": "approved",
  "sellerId": "user123",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/products/[id]

Actualizar producto (solo si está pendiente)

**Headers:**

- `Authorization: Bearer <token>` (requerido)

**Body:**

```json
{
  "title": "Nuevo título",
  "description": "Nueva descripción"
}
```

---

## APIs de Subastas

### GET /api/auctions

Listar subastas activas

**Query Params:**

- `category`: slug de categoría (opcional)
- `status`: `active` | `finished` (default: `active`)
- `limit`: número (default: 20)
- `offset`: número (default: 0)

**Response (200):**

```json
{
  "auctions": [
    {
      "id": "auction123",
      "title": "Figura de Batman",
      "category": "juguetes",
      "price": 150,
      "image": "https://...",
      "endsIn": "2h 15m",
      "currentBids": 5
    }
  ],
  "total": 1
}
```

### GET /api/auctions/[id]

Obtener detalle de subasta

**Response (200):**

```json
{
  "id": "auction123",
  "title": "Figura de Batman",
  "description": "...",
  "images": ["..."],
  "category": "juguetes",
  "startingPrice": 100,
  "currentPrice": 150,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-02T00:00:00.000Z",
  "status": "active",
  "timeRemaining": 8100,
  "publisher": "Juan Perez",
  "bids": [...],
  "totalBids": 5
}
```

### GET /api/auctions/category/[slug]

Listar subastas por categoría

**Query Params:**

- `status`: `active` | `finished` (default: `active`)
- `limit`: número (default: 20)

**Response (200):**

```json
{
  "category": "Juguetes",
  "auctions": [...],
  "total": 5
}
```

### POST /api/auctions

Crear subasta (Admin o automático)

**Body:**

```json
{
  "productId": "abc123",
  "startingPrice": 100,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-02T00:00:00.000Z"
}
```

---

## APIs de Pujas

### POST /api/bids

Crear una puja

**Headers:**

- `Authorization: Bearer <token>` (requerido)

**Body:**

```json
{
  "auctionId": "auction123",
  "amount": 200
}
```

**Response (201):**

```json
{
  "bidId": "bid123",
  "message": "Puja realizada exitosamente",
  "currentPrice": 200
}
```

**Validaciones:**

- El monto debe ser mayor al precio actual
- La subasta debe estar activa
- El usuario no puede pujar en su propia subasta
- La fecha de fin no debe haber pasado

### GET /api/bids/auction/[auctionId]

Obtener historial de pujas de una subasta

**Query Params:**

- `limit`: número (default: 50)

**Response (200):**

```json
{
  "auctionId": "auction123",
  "bids": [
    {
      "id": "bid123",
      "amount": 200,
      "timestamp": "2024-01-01T00:00:00.000Z",
      "userId": "user123",
      "username": "Juan Perez",
      "status": "winning"
    }
  ],
  "total": 5
}
```

### GET /api/bids/user/[userId]

Obtener pujas del usuario

**Headers:**

- `Authorization: Bearer <token>` (requerido)

**Query Params:**

- `status`: `active` | `won` | `lost` (opcional)
- `limit`: número (default: 50)

**Response (200):**

```json
{
  "bids": [
    {
      "id": "bid123",
      "amount": 200,
      "timestamp": "2024-01-01T00:00:00.000Z",
      "status": "winning",
      "auction": {
        "id": "auction123",
        "title": "Figura de Batman",
        "image": "https://...",
        "currentPrice": 200,
        "endDate": "2024-01-02T00:00:00.000Z",
        "status": "active"
      }
    }
  ],
  "total": 1
}
```

### GET /api/bids/user/[userId]/auctions

Obtener subastas donde el usuario ha pujado

**Headers:**

- `Authorization: Bearer <token>` (requerido)

**Response (200):**

```json
{
  "auctions": [
    {
      "id": "auction123",
      "title": "Figura de Batman",
      "category": "juguetes",
      "price": 200,
      "image": "https://...",
      "endsIn": "2h 15m",
      "userBid": {
        "amount": 200,
        "status": "winning"
      },
      "currentPrice": 200,
      "status": "active"
    }
  ],
  "total": 1
}
```

---

## APIs de Imágenes

### POST /api/upload/images

Subir múltiples imágenes

**Headers:**

- `Authorization: Bearer <token>` (requerido)
- `Content-Type: multipart/form-data`

**Body (FormData):**

- `images`: File[] (máximo 6 imágenes, máximo 5MB cada una)

**Response (200):**

```json
{
  "urls": [
    "https://storage.googleapis.com/bucket/products/user123/image1.jpg",
    "https://storage.googleapis.com/bucket/products/user123/image2.jpg"
  ]
}
```

**Validaciones:**

- Máximo 6 imágenes
- Máximo 5MB por imagen
- Solo archivos de imagen (image/\*)

---

## Códigos de Estado HTTP

- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Error de validación o solicitud incorrecta
- `401`: No autorizado (falta token o token inválido)
- `403`: Acceso denegado (sin permisos)
- `404`: Recurso no encontrado
- `500`: Error del servidor

---

## Notas Importantes

1. **Autenticación**: Todas las APIs que modifican datos requieren autenticación
2. **Validación**: Los datos se validan usando Zod schemas
3. **Firestore**: Las fechas se almacenan como Timestamps y se convierten a ISO strings en las respuestas
4. **Storage**: Las imágenes se suben a Firebase Storage y se hacen públicas
5. **Roles**: Algunas operaciones requieren rol de administrador
