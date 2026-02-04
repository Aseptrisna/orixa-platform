import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IMenuItem } from '@orixa/shared';

interface CartItem {
  menuItem: IMenuItem;
  quantity: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (menuItem: IMenuItem, note?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, note) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.menuItem._id === menuItem._id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.menuItem._id === menuItem._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { menuItem, quantity: 1, note }],
          };
        });
      },

      removeItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem._id !== menuItemId),
        }));
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem._id === menuItemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (sum, item) => sum + item.menuItem.basePrice * item.quantity,
          0
        );
      },
    }),
    {
      name: 'orixa-cart',
    }
  )
);
