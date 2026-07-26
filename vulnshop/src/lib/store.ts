import { create } from 'zustand'

export type Page = 'home' | 'login' | 'register' | 'product' | 'search' | 'cart' | 'orders' | 'admin' | 'challenges' | 'profile'

export interface User {
  id: string
  email: string
  username: string
  role: string
  token?: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface AppState {
  // Navigation
  currentPage: Page
  navigate: (page: Page, data?: Record<string, string>) => void
  pageData: Record<string, string>

  // Auth
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void

  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void

  // Challenges solved
  solvedChallenges: string[]
  addSolvedChallenge: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'home',
  pageData: {},
  navigate: (page, data = {}) => {
    window.scrollTo(0, 0)
    set({ currentPage: page, pageData: data })
  },

  // Auth
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, cart: [] }),

  // Cart
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.productId === item.productId)
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.productId === item.productId
              ? { ...c, quantity: c.quantity + item.quantity }
              : c
          ),
        }
      }
      return { cart: [...state.cart, item] }
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.productId !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c.productId === productId ? { ...c, quantity } : c
      ),
    })),
  clearCart: () => set({ cart: [] }),

  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Challenges
  solvedChallenges: [],
  addSolvedChallenge: (id) =>
    set((state) => ({
      solvedChallenges: state.solvedChallenges.includes(id)
        ? state.solvedChallenges
        : [...state.solvedChallenges, id],
    })),
}))
