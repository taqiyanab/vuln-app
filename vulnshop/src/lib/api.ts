// API helper functions for the OWASP Juice Shop clone

const API_BASE = '/api'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  rating: number
  featured: boolean
  createdAt: string
  reviews?: Review[]
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
  user?: { id: string; username: string; email?: string }
}

export interface Challenge {
  id: string
  name: string
  description: string
  category: string
  difficulty: number
  solved: boolean
  hint?: string | null
}

export interface Order {
  id: string
  userId: string
  total: number
  status: string
  createdAt: string
  items?: OrderItem[]
  user?: { id: string; email: string; username: string }
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product?: { id: string; name: string; price: number; image?: string }
}

// Products
export async function getProducts(category?: string, search?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (search) params.set('search', search)
  const res = await fetch(`${API_BASE}/products?${params.toString()}`)
  return res.json()
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`)
  return res.json()
}

// Search
export async function searchProducts(q: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`)
  return res.json()
}

// Auth
export async function register(data: {
  email: string
  username: string
  password: string
  role?: string
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// Reviews
export async function getReviews(productId: string) {
  const res = await fetch(`${API_BASE}/reviews?productId=${productId}`)
  return res.json()
}

export async function addReview(data: {
  productId: string
  userId: string
  rating: number
  comment: string
}) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// Cart
export async function getCart(userId: string) {
  const res = await fetch(`${API_BASE}/cart?userId=${userId}`)
  return res.json()
}

export async function addToCartApi(data: {
  userId: string
  productId: string
  name: string
  price: number
  quantity: number
}) {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// Orders
export async function getOrders(userId?: string) {
  const params = new URLSearchParams()
  if (userId) params.set('userId', userId)
  const res = await fetch(`${API_BASE}/orders?${params.toString()}`)
  return res.json()
}

export async function createOrder(data: {
  userId: string
  items: Array<{ productId: string; quantity: number; price: number }>
}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// Challenges
export async function getChallenges() {
  const res = await fetch(`${API_BASE}/challenges`)
  return res.json()
}

export async function solveChallenge(data: { id?: string; name?: string }) {
  const res = await fetch(`${API_BASE}/challenges`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// Admin
export async function getAdminData() {
  const res = await fetch(`${API_BASE}/admin`, {
    headers: { 'x-admin': 'true' },
  })
  return res.json()
}

// Health
export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`)
  return res.json()
}
