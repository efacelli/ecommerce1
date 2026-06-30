-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_ENVIO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO', 'EN_PROCESO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'MERCADO_PAGO', 'TARJETA_DEBITO', 'TARJETA_CREDITO');

-- CreateEnum
CREATE TYPE "TipoEnvio" AS ENUM ('RETIRO_LOCAL', 'ENVIO_DOMICILIO', 'CORREO_ARGENTINO', 'ANDREANI', 'OTRO');

-- CreateEnum
CREATE TYPE "RolAdmin" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'OPERADOR');

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "imagenUrl" VARCHAR(500),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "parentId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "precioAnterior" DECIMAL(10,2),
    "imagenes" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "categoriaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variantes" (
    "id" SERIAL NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "talle" VARCHAR(10) NOT NULL,
    "color" VARCHAR(50),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "variantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "color" VARCHAR(7) NOT NULL DEFAULT '#000000',

    CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas_productos" (
    "productoId" INTEGER NOT NULL,
    "etiquetaId" INTEGER NOT NULL,

    CONSTRAINT "etiquetas_productos_pkey" PRIMARY KEY ("productoId","etiquetaId")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "numeroPedido" VARCHAR(20) NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "clienteNombre" VARCHAR(150) NOT NULL,
    "clienteEmail" VARCHAR(254) NOT NULL,
    "clienteTelefono" VARCHAR(30),
    "clienteDni" VARCHAR(20),
    "envioTipo" "TipoEnvio" NOT NULL DEFAULT 'RETIRO_LOCAL',
    "envioCalle" VARCHAR(200),
    "envioNumero" VARCHAR(20),
    "envioPiso" VARCHAR(20),
    "envioLocalidad" VARCHAR(100),
    "envioProvincia" VARCHAR(100),
    "envioCodigoPostal" VARCHAR(10),
    "envioReferencia" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "costoEnvio" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "pagoExternoId" VARCHAR(200),
    "pagoFecha" TIMESTAMP(3),
    "adminId" INTEGER,
    "notas_internas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_pedido" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "productoNombre" VARCHAR(200) NOT NULL,
    "varianteTalle" VARCHAR(10) NOT NULL,
    "varianteColor" VARCHAR(50),
    "productoImagen" VARCHAR(500),
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "varianteId" INTEGER,

    CONSTRAINT "detalles_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" SERIAL NOT NULL,
    "estado" "EstadoPedido" NOT NULL,
    "nota" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pedidoId" INTEGER NOT NULL,
    "adminId" INTEGER,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_pedido" (
    "id" SERIAL NOT NULL,
    "mensaje" TEXT NOT NULL,
    "esPublica" BOOLEAN NOT NULL DEFAULT false,
    "pedidoId" INTEGER NOT NULL,
    "adminId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "rol" "RolAdmin" NOT NULL DEFAULT 'EDITOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_slug_idx" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_activa_idx" ON "categorias"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "productos_slug_key" ON "productos"("slug");

-- CreateIndex
CREATE INDEX "productos_slug_idx" ON "productos"("slug");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE INDEX "productos_categoriaId_idx" ON "productos"("categoriaId");

-- CreateIndex
CREATE INDEX "productos_destacado_idx" ON "productos"("destacado");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_sku_key" ON "variantes"("sku");

-- CreateIndex
CREATE INDEX "variantes_sku_idx" ON "variantes"("sku");

-- CreateIndex
CREATE INDEX "variantes_productoId_idx" ON "variantes"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_productoId_talle_color_key" ON "variantes"("productoId", "talle", "color");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_nombre_key" ON "etiquetas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_slug_key" ON "etiquetas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numeroPedido_key" ON "pedidos"("numeroPedido");

-- CreateIndex
CREATE INDEX "pedidos_numeroPedido_idx" ON "pedidos"("numeroPedido");

-- CreateIndex
CREATE INDEX "pedidos_clienteEmail_idx" ON "pedidos"("clienteEmail");

-- CreateIndex
CREATE INDEX "pedidos_estado_idx" ON "pedidos"("estado");

-- CreateIndex
CREATE INDEX "pedidos_estadoPago_idx" ON "pedidos"("estadoPago");

-- CreateIndex
CREATE INDEX "pedidos_creadoEn_idx" ON "pedidos"("creadoEn");

-- CreateIndex
CREATE INDEX "detalles_pedido_pedidoId_idx" ON "detalles_pedido"("pedidoId");

-- CreateIndex
CREATE INDEX "historial_estados_pedidoId_idx" ON "historial_estados"("pedidoId");

-- CreateIndex
CREATE INDEX "notas_pedido_pedidoId_idx" ON "notas_pedido"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_email_key" ON "administradores"("email");

-- CreateIndex
CREATE INDEX "administradores_email_idx" ON "administradores"("email");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes" ADD CONSTRAINT "variantes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etiquetas_productos" ADD CONSTRAINT "etiquetas_productos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etiquetas_productos" ADD CONSTRAINT "etiquetas_productos_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "etiquetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_pedido" ADD CONSTRAINT "detalles_pedido_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "variantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_pedido" ADD CONSTRAINT "notas_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_pedido" ADD CONSTRAINT "notas_pedido_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
