"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { ItemCarrito } from "@/types";

// ─── Estado ──────────────────────────────────────────────────────────────────

type EstadoCarrito = {
  items: ItemCarrito[];
  abierto: boolean;
};

// ─── Acciones ─────────────────────────────────────────────────────────────────

type AccionCarrito =
  | { type: "AGREGAR"; item: ItemCarrito }
  | { type: "QUITAR"; varianteId: number }
  | { type: "CAMBIAR_CANTIDAD"; varianteId: number; cantidad: number }
  | { type: "VACIAR" }
  | { type: "ABRIR_DRAWER" }
  | { type: "CERRAR_DRAWER" }
  | { type: "HIDRATAR"; items: ItemCarrito[] };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducerCarrito(
  estado: EstadoCarrito,
  accion: AccionCarrito
): EstadoCarrito {
  switch (accion.type) {
    case "HIDRATAR":
      return { ...estado, items: accion.items };

    case "AGREGAR": {
      const existe = estado.items.find(
        (i) => i.varianteId === accion.item.varianteId
      );
      if (existe) {
        return {
          ...estado,
          items: estado.items.map((i) =>
            i.varianteId === accion.item.varianteId
              ? { ...i, cantidad: i.cantidad + accion.item.cantidad }
              : i
          ),
        };
      }
      return { ...estado, items: [...estado.items, accion.item] };
    }

    case "QUITAR":
      return {
        ...estado,
        items: estado.items.filter((i) => i.varianteId !== accion.varianteId),
      };

    case "CAMBIAR_CANTIDAD":
      if (accion.cantidad <= 0) {
        return {
          ...estado,
          items: estado.items.filter(
            (i) => i.varianteId !== accion.varianteId
          ),
        };
      }
      return {
        ...estado,
        items: estado.items.map((i) =>
          i.varianteId === accion.varianteId
            ? { ...i, cantidad: accion.cantidad }
            : i
        ),
      };

    case "VACIAR":
      return { ...estado, items: [] };

    case "ABRIR_DRAWER":
      return { ...estado, abierto: true };

    case "CERRAR_DRAWER":
      return { ...estado, abierto: false };

    default:
      return estado;
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

type ContextoCarrito = {
  items: ItemCarrito[];
  abierto: boolean;
  totalItems: number;
  subtotal: number;
  agregarItem: (item: ItemCarrito) => void;
  quitarItem: (varianteId: number) => void;
  cambiarCantidad: (varianteId: number, cantidad: number) => void;
  vaciarCarrito: () => void;
  abrirDrawer: () => void;
  cerrarDrawer: () => void;
};

const CarritoContext = createContext<ContextoCarrito | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "carrito_v1";

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducerCarrito, {
    items: [],
    abierto: false,
  });

  // Hidratar desde localStorage al montar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        dispatch({ type: "HIDRATAR", items: JSON.parse(guardado) });
      }
    } catch {
      // Si el localStorage falla (modo privado, etc.), ignoramos
    }
  }, []);

  // Persistir en localStorage al cambiar items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.items));
    } catch {
      // Ignorar errores de escritura
    }
  }, [estado.items]);

  const totalItems = estado.items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = estado.items.reduce(
    (acc, i) => acc + i.precio * i.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        items: estado.items,
        abierto: estado.abierto,
        totalItems,
        subtotal,
        agregarItem: (item) => dispatch({ type: "AGREGAR", item }),
        quitarItem: (id) => dispatch({ type: "QUITAR", varianteId: id }),
        cambiarCantidad: (id, cantidad) =>
          dispatch({ type: "CAMBIAR_CANTIDAD", varianteId: id, cantidad }),
        vaciarCarrito: () => dispatch({ type: "VACIAR" }),
        abrirDrawer: () => dispatch({ type: "ABRIR_DRAWER" }),
        cerrarDrawer: () => dispatch({ type: "CERRAR_DRAWER" }),
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCarrito(): ContextoCarrito {
  const ctx = useContext(CarritoContext);
  if (!ctx)
    throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
