"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  ReactNode,
} from "react";
import type { Product } from "@/data/products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = { items: CartItem[] };

type Action =
  | { type: "ADD"; product: Product; quantity?: number }
  | { type: "REMOVE"; slug: string }
  | { type: "SET_QTY"; slug: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; state: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "ADD": {
      const qty = action.quantity ?? 1;
      const existing = state.items.find((i) => i.slug === action.product.slug);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.slug === action.product.slug
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            slug: action.product.slug,
            name: action.product.name,
            price: action.product.price,
            image: action.product.image,
            quantity: qty,
          },
        ],
      };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.slug !== action.slug) };
    case "SET_QTY":
      return {
        items: state.items
          .map((i) =>
            i.slug === action.slug ? { ...i, quantity: action.quantity } : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { items: [] };
  }
}

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  buyNow: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  bumpKey: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "farmo-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state, hydrated]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value: CartContextValue = {
    items: state.items,
    addItem: (product, quantity) => {
      dispatch({ type: "ADD", product, quantity });
      setIsOpen(true);
      setBumpKey((k) => k + 1);
    },
    buyNow: (product, quantity) => {
      dispatch({ type: "ADD", product, quantity });
      setBumpKey((k) => k + 1);
    },
    removeItem: (slug) => dispatch({ type: "REMOVE", slug }),
    setQuantity: (slug, quantity) => dispatch({ type: "SET_QTY", slug, quantity }),
    clear: () => dispatch({ type: "CLEAR" }),
    totalItems,
    subtotal,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    bumpKey,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
