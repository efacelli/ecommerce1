import { CarritoProvider } from "@/context/CarritoContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CarritoProvider>
      <Header />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </CarritoProvider>
  );
}
