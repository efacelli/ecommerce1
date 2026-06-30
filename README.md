# Tienda Ropa — Setup completo

## 1. Instalar dependencias
```bash
npm install
```

## 2. Configurar variables de entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales reales
```

## 3. Levantar PostgreSQL con Docker
```bash
docker run --name tienda_db \
  -e POSTGRES_USER=usuario \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=tienda_ropa \
  -p 5432:5432 -d postgres:16-alpine
```

## 4. Inicializar la base de datos
```bash
npm run db:migrate   # Crea las tablas
npm run db:seed      # Carga datos de prueba (opcional)
npm run db:studio    # Abre Prisma Studio en el navegador
```

## 5. Configurar Cloudinary
1. Crear cuenta en https://cloudinary.com
2. Copiar Cloud Name, API Key y API Secret al .env.local

## 6. Configurar Mercado Pago
1. Crear cuenta en https://www.mercadopago.com.ar/developers
2. Crear una aplicación → Checkout Pro
3. Copiar Access Token y Public Key al .env.local
4. Para webhook local: instalar ngrok y apuntar a /api/mp-webhook

## 7. Levantar el servidor
```bash
npm run dev
# → http://localhost:3000       Tienda pública
# → http://localhost:3000/admin Panel de administración
```
