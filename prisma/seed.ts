import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Categorías
  const mujer = await prisma.categoria.upsert({
    where: { slug: "mujer" },
    update: {},
    create: { nombre: "Mujer", slug: "mujer", orden: 1 },
  });
  const hombre = await prisma.categoria.upsert({
    where: { slug: "hombre" },
    update: {},
    create: { nombre: "Hombre", slug: "hombre", orden: 2 },
  });
  const remMujer = await prisma.categoria.upsert({
    where: { slug: "remeras-mujer" },
    update: {},
    create: { nombre: "Remeras Mujer", slug: "remeras-mujer", parentId: mujer.id, orden: 1 },
  });
  const remHombre = await prisma.categoria.upsert({
    where: { slug: "remeras-hombre" },
    update: {},
    create: { nombre: "Remeras Hombre", slug: "remeras-hombre", parentId: hombre.id, orden: 1 },
  });

  // Producto 1
  await prisma.producto.upsert({
    where: { slug: "remera-basica-blanca" },
    update: {},
    create: {
      nombre: "Remera Básica Blanca",
      slug: "remera-basica-blanca",
      descripcion: "Remera de algodón 100%, corte recto.",
      precio: 9500,
      precioAnterior: 12000,
      imagenes: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
      activo: true,
      destacado: true,
      categoriaId: remMujer.id,
      variantes: {
        create: [
          { sku: "REM-001-S-BLA", talle: "S", color: "Blanco", stock: 5 },
          { sku: "REM-001-M-BLA", talle: "M", color: "Blanco", stock: 8 },
          { sku: "REM-001-L-BLA", talle: "L", color: "Blanco", stock: 3 },
          { sku: "REM-001-S-NEG", talle: "S", color: "Negro", stock: 4 },
          { sku: "REM-001-M-NEG", talle: "M", color: "Negro", stock: 0 },
        ],
      },
    },
  });

  // Producto 2
  await prisma.producto.upsert({
    where: { slug: "remera-oversize-gris" },
    update: {},
    create: {
      nombre: "Remera Oversize Gris",
      slug: "remera-oversize-gris",
      descripcion: "Remera oversize unisex, tela premium.",
      precio: 11500,
      imagenes: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400"],
      activo: true,
      destacado: true,
      categoriaId: remHombre.id,
      variantes: {
        create: [
          { sku: "REM-002-M-GRI", talle: "M", color: "Gris", stock: 6 },
          { sku: "REM-002-L-GRI", talle: "L", color: "Gris", stock: 4 },
          { sku: "REM-002-XL-GRI", talle: "XL", color: "Gris", stock: 2 },
        ],
      },
    },
  });

  // Producto 3
  await prisma.producto.upsert({
    where: { slug: "jean-skinny-azul" },
    update: {},
    create: {
      nombre: "Jean Skinny Azul",
      slug: "jean-skinny-azul",
      descripcion: "Jean de corte skinny, tiro medio.",
      precio: 18900,
      precioAnterior: 22000,
      imagenes: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
      activo: true,
      destacado: false,
      categoriaId: mujer.id,
      variantes: {
        create: [
          { sku: "JEA-001-38-AZU", talle: "38", color: "Azul", stock: 3 },
          { sku: "JEA-001-40-AZU", talle: "40", color: "Azul", stock: 5 },
          { sku: "JEA-001-42-AZU", talle: "42", color: "Azul", stock: 2 },
        ],
      },
    },
  });

  console.log("✅ Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .then(() => prisma.$disconnect());