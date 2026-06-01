'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore, type Page, type User, type CartItem } from '@/lib/store'
import {
  getProducts, getProduct, searchProducts, login as apiLogin,
  register as apiRegister, getReviews, addReview, getOrders,
  createOrder, getChallenges, solveChallenge, getAdminData,
  type Product, type Review, type Challenge, type Order,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  ShoppingCart, Search, User as UserIcon, LogIn, LogOut,
  Shield, Trophy, Home, Menu, X, Star, Plus, Minus, Trash2,
  ChevronRight, Package, Lock, Eye, EyeOff, AlertTriangle,
  ShoppingBag, Clock, CheckCircle2, Truck, Zap,
  Bug, Skull, Terminal, Cpu, ArrowLeft, Key, Radio, Fingerprint,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Theme Constants ─────────────────────────────────────────────
const NEON_CYAN = '#00ffcc'
const NEON_PURPLE = '#a855f7'
const NEON_PINK = '#f43f5e'
const DARK_BG = '#0a0a0f'
const CARD_BG = '#111827'
const CARD_BG_HOVER = '#1f2937'

// ─── Helper: Star Rating ────────────────────────────────────────
function StarRating({ rating, onChange, size = 16 }: { rating: number; onChange?: (r: number) => void; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            size={size}
            className={i <= rating ? 'fill-[#00ffcc] text-[#00ffcc]' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Category Icons ─────────────────────────────────────────────
const categoryMeta: Record<string, { icon: React.ReactNode; color: string; bg: string; borderColor: string }> = {
  'Exploit Kits': { icon: <Bug size={32} />, color: 'text-[#00ffcc]', bg: 'bg-[#00ffcc]/10', borderColor: 'border-[#00ffcc]/30' },
  'Cryptography': { icon: <Key size={32} />, color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/10', borderColor: 'border-[#a855f7]/30' },
  'Zero-Day Archives': { icon: <Skull size={32} />, color: 'text-[#f43f5e]', bg: 'bg-[#f43f5e]/10', borderColor: 'border-[#f43f5e]/30' },
  'Digital Weapons': { icon: <Cpu size={32} />, color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', borderColor: 'border-[#fbbf24]/30' },
}

// ─── Challenge Category Colors ──────────────────────────────────
const challengeCatColors: Record<string, string> = {
  Injection: 'bg-red-500/20 text-red-400 border-red-500/30',
  XSS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Broken Authentication': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Sensitive Data Exposure': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Broken Access Control': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Security Misconfiguration': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  CSRF: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
}

// ─── Navbar ─────────────────────────────────────────────────────
function Navbar() {
  const { currentPage, navigate, user, cart, logout, searchQuery, setSearchQuery } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('search', { q: searchQuery })
    }
  }

  const navLinks: { label: string; page: Page; icon: React.ReactNode }[] = [
    { label: 'Home', page: 'home', icon: <Home size={16} /> },
    { label: 'Challenges', page: 'challenges', icon: <Trophy size={16} /> },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 font-bold text-xl shrink-0"
          >
            <span className="text-2xl">🔒</span>
            <span className="hidden sm:inline">
              <span className="text-[#00ffcc]">Shadow</span>
              <span className="text-[#a855f7]">Mart</span>
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'bg-[#00ffcc]/10 text-[#00ffcc]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'admin'
                    ? 'bg-[#f43f5e]/10 text-[#f43f5e]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-[#f43f5e]'
                }`}
              >
                <Shield size={16} />
                Admin
              </button>
            )}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the dark market... (try SQL injection!)"
                className="pl-9 bg-[#111827] border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-[#00ffcc] focus:ring-[#00ffcc]/20"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            <button
              onClick={() => navigate('cart')}
              className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart size={20} className="text-gray-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f43f5e] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-[#00ffcc]/20 text-[#00ffcc] text-xs font-bold">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium text-gray-300">{user.username}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#111827] border-gray-700">
                  <DropdownMenuItem onClick={() => navigate('profile')} className="text-gray-300 focus:bg-gray-800 focus:text-gray-100">
                    <UserIcon size={14} className="mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('orders')} className="text-gray-300 focus:bg-gray-800 focus:text-gray-100">
                    <Package size={14} className="mr-2" /> My Orders
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('admin')} className="text-[#f43f5e] focus:bg-gray-800">
                      <Shield size={14} className="mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={() => { logout(); toast.success('Disconnected from ShadowMart') }} className="text-gray-300 focus:bg-gray-800 focus:text-gray-100">
                    <LogOut size={14} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('login')}
                  className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                >
                  <LogIn size={16} className="mr-1" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('register')}
                  className="bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f] font-semibold"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="sm:hidden pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the dark market..."
              className="pl-9 bg-[#111827] border-gray-700 text-gray-200 placeholder:text-gray-500"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-[#0a0a0f]">
          <div className="p-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => { navigate(link.page); setMobileMenuOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'bg-[#00ffcc]/10 text-[#00ffcc]'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            {user?.role === 'admin' && (
              <button
                onClick={() => { navigate('admin'); setMobileMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#f43f5e] hover:bg-gray-800"
              >
                <Shield size={16} /> Admin
              </button>
            )}
            {user && (
              <>
                <button
                  onClick={() => { navigate('orders'); setMobileMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800"
                >
                  <Package size={16} /> My Orders
                </button>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); toast.success('Disconnected') }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#f43f5e] hover:bg-[#f43f5e]/10"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Footer ─────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#060608] border-t border-gray-800 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span className="text-2xl">🔒</span>
              <span className="text-[#00ffcc]">Shadow</span>
              <span className="text-[#a855f7]">Mart</span>
            </div>
            <p className="text-sm text-gray-500">
              The digital underground marketplace. Deliberately vulnerable for security training.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-500 hover:text-[#00ffcc] cursor-pointer transition-colors">About</span></li>
              <li><span className="text-gray-500 hover:text-[#00ffcc] cursor-pointer transition-colors">Contact</span></li>
              <li><span className="text-gray-500 hover:text-[#00ffcc] cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="text-gray-500 hover:text-[#00ffcc] cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Security</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-500 hover:text-[#00ffcc] cursor-pointer transition-colors">OWASP Top 10</span></li>
              <li><span className="text-gray-500 hover:text-[#00ffcc] cursor-pointer transition-colors">Security Challenges</span></li>
              <li><span className="text-gray-500 hover:text-[#00ffcc] cursor-pointer transition-colors">Score Board</span></li>
            </ul>
          </div>
        </div>
        <Separator className="my-6 bg-gray-800" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>&copy; 2024 ShadowMart. For educational purposes only.</p>
          <p className="flex items-center gap-1">
            <AlertTriangle size={14} className="text-[#f43f5e]" />
            Powered by <span className="text-[#f43f5e] font-medium">vulnerable</span> code
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Product Card ───────────────────────────────────────────────
function ProductCard({ product, onNavigate }: { product: Product; onNavigate: (page: Page, data: Record<string, string>) => void }) {
  const { addToCart } = useAppStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    })
    toast.success(`${product.name} added to cart!`)
  }

  const catMeta = categoryMeta[product.category] || { color: 'text-gray-400', bg: 'bg-gray-800' }

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:shadow-[#00ffcc]/5 transition-all duration-300 overflow-hidden bg-[#111827] border-gray-800 hover:border-[#00ffcc]/30"
      onClick={() => onNavigate('product', { id: product.id })}
    >
      <div className="aspect-[4/3] overflow-hidden bg-[#0a0a0f]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-100 truncate">{product.name}</h3>
            <p className={`text-xs mt-0.5 ${catMeta.color}`}>{product.category}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-[#00ffcc]/10 text-[#00ffcc] font-semibold border border-[#00ffcc]/20">
            ${product.price.toFixed(2)}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <StarRating rating={Math.round(product.rating)} size={14} />
          <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-medium"
          size="sm"
        >
          <ShoppingCart size={14} className="mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Home Page ──────────────────────────────────────────────────
function HomePage() {
  const { navigate } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data.products || [])
      setLoading(false)
    })
  }, [])

  const featured = products.filter((p) => p.featured)
  const categories = ['Exploit Kits', 'Cryptography', 'Zero-Day Archives', 'Digital Weapons']

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a1a2e] text-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-8xl">🔒</div>
          <div className="absolute top-20 right-20 text-6xl">💀</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">⚡</div>
          <div className="absolute bottom-20 right-1/3 text-5xl">🌐</div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h40v40H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M0%2040L40%200%22%20stroke%3D%22%2300ffcc%22%20stroke-width%3D%220.3%22%20opacity%3D%220.1%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-[#00ffcc]/10 text-[#00ffcc] border-[#00ffcc]/30 hover:bg-[#00ffcc]/20">
              🏴 Security Training Ground
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Welcome to<br />
              <span className="text-[#00ffcc] neon-glow-cyan">Shadow</span>
              <span className="text-[#a855f7] neon-glow-purple">Mart</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              The digital underground marketplace. Every transaction hides a vulnerability.
              Can you find them all?
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f] font-semibold"
              >
                <ShoppingBag size={18} className="mr-2" />
                Enter Market
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('challenges')}
                className="border-[#a855f7]/50 text-[#a855f7] hover:bg-[#a855f7]/10 hover:text-[#c084fc]"
              >
                <Trophy size={18} className="mr-2" />
                View Challenges
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#0d0d14] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Products', value: products.length, icon: <ShoppingBag size={24} className="text-[#00ffcc]" /> },
              { label: 'Categories', value: '4', icon: <Bug size={24} className="text-[#a855f7]" /> },
              { label: 'Challenges', value: '17', icon: <Trophy size={24} className="text-[#fbbf24]" /> },
              { label: 'Vulnerabilities', value: 'Many!', icon: <AlertTriangle size={24} className="text-[#f43f5e]" /> },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-[#0a0a0f] py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">⚡ Featured Tools</h2>
              <Button
                variant="ghost"
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#00ffcc] hover:bg-[#00ffcc]/10"
              >
                View All <ChevronRight size={16} />
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {featured.map((product) => (
                <div key={product.id} className="min-w-[260px] max-w-[280px] snap-start">
                  <ProductCard product={product} onNavigate={navigate} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-12 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">🗡️ Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const meta = categoryMeta[cat] || { icon: <Bug size={32} />, color: 'text-gray-400', bg: 'bg-gray-800', borderColor: 'border-gray-700' }
              const count = products.filter((p) => p.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => {
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`${meta.bg} rounded-xl p-6 text-center hover:shadow-lg hover:shadow-[#00ffcc]/5 transition-all border ${meta.borderColor} group`}
                >
                  <div className={`${meta.color} mb-3 flex justify-center group-hover:scale-110 transition-transform`}>
                    {meta.icon}
                  </div>
                  <h3 className="font-semibold text-gray-200">{cat}</h3>
                  <p className="text-sm text-gray-500 mt-1">{count} products</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section id="products-section" className="py-12 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4">
          <ProductGrid products={products} loading={loading} />
        </div>
      </section>
    </div>
  )
}

// ─── Product Grid with Category Filter ──────────────────────────
function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  const [category, setCategory] = useState('All')
  const categories = ['All', 'Exploit Kits', 'Cryptography', 'Zero-Day Archives', 'Digital Weapons']
  const { navigate } = useAppStore()

  const filtered = category === 'All' ? products : products.filter((p) => p.category === category)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden bg-[#111827] border-gray-800">
            <div className="aspect-[4/3] bg-gray-800 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-100">🛒 All Products</h2>
        <Badge variant="secondary" className="bg-gray-800 text-gray-400 border-gray-700">
          {filtered.length} items
        </Badge>
      </div>
      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              category === cat
                ? 'bg-[#00ffcc] text-[#0a0a0f] shadow-sm shadow-[#00ffcc]/20'
                : 'bg-[#111827] text-gray-400 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} onNavigate={navigate} />
        ))}
      </div>
    </div>
  )
}

// ─── Product Detail Page ────────────────────────────────────────
function ProductDetailPage() {
  const { pageData, navigate, user, addToCart } = useAppStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [quantity, setQuantity] = useState(1)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [fetching, setFetching] = useState(true)

  const productId = pageData.id

  useEffect(() => {
    if (!productId) return
    getProduct(productId).then((data) => {
      setProduct(data.product || data || null)
      setReviews(data.product?.reviews || data.reviews || [])
      setFetching(false)
    })
  }, [productId])

  useEffect(() => {
    if (!productId) return
    getReviews(productId).then((data) => {
      if (data.reviews) setReviews(data.reviews)
    })
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    })
    toast.success(`${quantity}x ${product.name} added to cart!`)
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to add a review')
      navigate('login')
      return
    }
    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }
    setSubmittingReview(true)
    try {
      const data = await addReview({
        productId: productId!,
        userId: user.id,
        rating: newRating,
        comment: newComment,
      })
      if (data.review) {
        setReviews((prev) => [data.review, ...prev])
        setNewComment('')
        setNewRating(5)
        toast.success('Review added!')
      } else {
        toast.error(data.error || 'Failed to add review')
      }
    } catch {
      toast.error('Failed to add review')
    }
    setSubmittingReview(false)
  }

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-800 animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Product not found</p>
        <Button onClick={() => navigate('home')} className="mt-4 bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f]">Go Home</Button>
      </div>
    )
  }

  const catMeta = categoryMeta[product.category] || { color: 'text-gray-400', bg: 'bg-gray-800' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#00ffcc] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Market
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-[#0a0a0f] rounded-xl overflow-hidden border border-gray-800">
          <img src={product.image} alt={product.name} className="w-full h-auto object-cover opacity-90" />
        </div>

        {/* Details */}
        <div>
          <Badge variant="secondary" className={`mb-3 ${catMeta.bg} ${catMeta.color} border border-gray-700`}>{product.category}</Badge>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={Math.round(product.rating)} />
            <span className="text-sm text-gray-400">{product.rating} out of 5</span>
            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
          </div>
          <div className="text-3xl font-bold text-[#00ffcc] mb-4">${product.price.toFixed(2)}</div>
          <p className="text-gray-400 mb-6 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            {product.stock > 0 ? (
              <Badge variant="secondary" className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                <CheckCircle2 size={12} className="mr-1" /> In Stock ({product.stock})
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20">Out of Stock</Badge>
            )}
          </div>

          {/* Add to cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-700 rounded-lg bg-[#111827]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-800 transition-colors rounded-l-lg text-gray-400"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 font-medium text-gray-200">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-800 transition-colors rounded-r-lg text-gray-400"
              >
                <Plus size={16} />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold"
              size="lg"
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart — ${(product.price * quantity).toFixed(2)}
            </Button>
          </div>

          <Separator className="my-6 bg-gray-800" />

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Terminal size={16} className="text-[#00ffcc]" /> Encrypted delivery
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Zap size={16} className="text-[#fbbf24]" /> Instant download
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield size={16} className="text-[#a855f7]" /> Stealth packaging
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Fingerprint size={16} className="text-[#f43f5e]" /> Anonymous checkout
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">User Reviews</h2>

        {/* Add Review Form */}
        <Card className="mb-6 bg-[#111827] border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-gray-100">Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Rating</Label>
              <div className="mt-1">
                <StarRating rating={newRating} onChange={setNewRating} size={24} />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Comment</Label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review here... (HTML is allowed! 😈)"
                className="mt-1 bg-[#0a0a0f] border-gray-700 text-gray-200 placeholder:text-gray-600"
                rows={3}
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f] font-semibold"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>

        {/* Review List - XSS: dangerouslySetInnerHTML for reviews */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="bg-[#111827] border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#00ffcc]/10 text-[#00ffcc] text-xs">
                          {review.user?.username?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm text-gray-200">
                          {review.user?.username || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-1">
                          <StarRating rating={review.rating} size={12} />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* XSS Vulnerability: Rendering HTML from user comments */}
                  <div
                    className="text-sm text-gray-400 mt-2"
                    dangerouslySetInnerHTML={{ __html: review.comment }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Search Page ────────────────────────────────────────────────
function SearchPage() {
  const { pageData, searchQuery, setSearchQuery, navigate } = useAppStore()
  const [results, setResults] = useState<Product[]>([])
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const initialQuery = pageData.q || searchQuery
  const [localQuery, setLocalQuery] = useState(initialQuery)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearchQuery(q)
    try {
      const data = await searchProducts(q)
      setResults(data.results || [])
      if (data._meta) {
        setMeta(data._meta)
      } else {
        setMeta(null)
      }
    } catch {
      toast.error('Search failed')
    }
    setLoading(false)
  }, [setSearchQuery])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    doSearch(localQuery)
  }

  const hasAutoSearchedRef = useRef(false)
  useEffect(() => {
    if (initialQuery && !hasAutoSearchedRef.current) {
      hasAutoSearchedRef.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-search on navigation
      doSearch(initialQuery)
    }
  }, [initialQuery, doSearch])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">
        <Search size={24} className="inline mr-2 text-[#00ffcc]" />
        Search the Market
      </h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for tools... (try: ' OR 1=1--)"
            className="pl-9 bg-[#111827] border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-[#00ffcc] focus:ring-[#00ffcc]/20"
          />
        </div>
        <Button type="submit" className="bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f] font-semibold">
          Search
        </Button>
      </form>

      {/* XSS: Reflect search query unsafely */}
      {localQuery && (
        <div className="mb-6 text-sm text-gray-400">
          Showing results for:{' '}
          <span dangerouslySetInnerHTML={{ __html: localQuery }} className="font-medium text-[#00ffcc]" />
        </div>
      )}

      {/* SQL Injection Results */}
      {meta && (
        <Card className="mb-6 border-[#f43f5e]/30 bg-[#f43f5e]/5">
          <CardHeader>
            <CardTitle className="text-[#f43f5e] flex items-center gap-2">
              <AlertTriangle size={20} />
              SQL Injection Detected!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#f43f5e]/80 mb-3">{String((meta as Record<string, unknown>).message || '')}</p>
            <div className="bg-[#0a0a0f] rounded-lg p-4 mb-3 border border-gray-800">
              <p className="text-xs text-gray-500 mb-1 font-semibold">Injected Query:</p>
              <code className="text-xs text-[#f43f5e] font-mono break-all">
                {String((meta as Record<string, unknown>).injectedQuery || '')}
              </code>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-gray-800">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Exposed User Data:</p>
              <div className="overflow-x-auto">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {JSON.stringify((meta as Record<string, unknown>).exposedUsers, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden bg-[#111827] border-gray-800">
              <div className="aspect-[4/3] bg-gray-800 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={navigate} />
              ))}
            </div>
          ) : (
            localQuery && (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto text-gray-700 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400">No results found</h3>
                <p className="text-gray-600">Try a different search term</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

// ─── Login Page ─────────────────────────────────────────────────
function LoginPage() {
  const { navigate, setUser } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const data = await apiLogin({ email, password })
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          role: data.user.role,
          token: data.token,
        })
        toast.success(`Welcome back, ${data.user.username}!`)
        navigate('home')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch {
      toast.error('Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-[#111827] border-gray-800 shadow-xl shadow-[#00ffcc]/5">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <CardTitle className="text-2xl text-gray-100">Access Terminal</CardTitle>
          <p className="text-sm text-gray-500">Sign in to your ShadowMart account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@shadowmart.dark"
                className="mt-1 bg-[#0a0a0f] border-gray-700 text-gray-200 placeholder:text-gray-600 focus:border-[#00ffcc] focus:ring-[#00ffcc]/20"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-[#0a0a0f] border-gray-700 text-gray-200 placeholder:text-gray-600 focus:border-[#00ffcc] focus:ring-[#00ffcc]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f] font-semibold"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button className="text-sm text-[#a855f7] hover:underline">
              Forgot password?
            </button>
          </div>

          <Separator className="my-4 bg-gray-800" />

          <div className="text-center">
            <span className="text-sm text-gray-500">Don&apos;t have an account? </span>
            <button
              onClick={() => navigate('register')}
              className="text-sm text-[#00ffcc] hover:underline font-medium"
            >
              Sign Up
            </button>
          </div>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-[#f43f5e]/5 border border-[#f43f5e]/20 rounded-lg">
            <p className="text-xs text-[#f43f5e]/80 flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>Demo:</strong> admin@shadowmart.dark / admin123
                <br />
                <em>Or try SQL injection: </em>
                <code className="bg-[#f43f5e]/10 px-1 rounded text-[#f43f5e]">&apos; OR 1=1--</code>
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Register Page ──────────────────────────────────────────────
function RegisterPage() {
  const { navigate, setUser } = useAppStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('') // Hidden mass assignment field
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !username || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const payload: Record<string, string> = { email, username, password }
      // Vulnerability: Mass assignment - role field can be set
      if (role) payload.role = role

      const data = await apiRegister(payload as Parameters<typeof apiRegister>[0])
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          role: data.user.role,
          token: data.token,
        })
        toast.success(`Welcome, ${data.user.username}! Account created.`)
        navigate('home')
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch {
      toast.error('Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-[#111827] border-gray-800 shadow-xl shadow-[#a855f7]/5">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <CardTitle className="text-2xl text-gray-100">Create Identity</CardTitle>
          <p className="text-sm text-gray-500">Join the ShadowMart underground</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="reg-email" className="text-gray-300">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@shadowmart.dark"
                className="mt-1 bg-[#0a0a0f] border-gray-700 text-gray-200 placeholder:text-gray-600 focus:border-[#a855f7] focus:ring-[#a855f7]/20"
              />
            </div>
            <div>
              <Label htmlFor="reg-username" className="text-gray-300">Username</Label>
              <Input
                id="reg-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ghost_hacker42"
                className="mt-1 bg-[#0a0a0f] border-gray-700 text-gray-200 placeholder:text-gray-600 focus:border-[#a855f7] focus:ring-[#a855f7]/20"
              />
            </div>
            <div>
              <Label htmlFor="reg-password" className="text-gray-300">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="mt-1 bg-[#0a0a0f] border-gray-700 text-gray-200 placeholder:text-gray-600 focus:border-[#a855f7] focus:ring-[#a855f7]/20"
              />
            </div>
            <div>
              <Label htmlFor="reg-confirm" className="text-gray-300">Confirm Password</Label>
              <Input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="mt-1 bg-[#0a0a0f] border-gray-700 text-gray-200 placeholder:text-gray-600 focus:border-[#a855f7] focus:ring-[#a855f7]/20"
              />
            </div>
            {/* Hidden role field - Mass Assignment vulnerability */}
            <input type="hidden" value={role} />
            {/* Intentionally exposed - a curious user might find this */}
            <div className="opacity-0 h-0 overflow-hidden">
              <Label htmlFor="reg-role" className="text-gray-300">Role (admin?)</Label>
              <Input
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="customer"
                className="mt-1 bg-[#0a0a0f] border-gray-700 text-gray-200"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Creating Identity...' : 'Create Account'}
            </Button>
          </form>

          <Separator className="my-4 bg-gray-800" />

          <div className="text-center">
            <span className="text-sm text-gray-500">Already have an account? </span>
            <button
              onClick={() => navigate('login')}
              className="text-sm text-[#00ffcc] hover:underline font-medium"
            >
              Sign In
            </button>
          </div>

          {/* Hint */}
          <div className="mt-4 p-3 bg-[#a855f7]/5 border border-[#a855f7]/20 rounded-lg">
            <p className="text-xs text-[#a855f7]/80 flex items-start gap-2">
              <Lock size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>Security Tip:</strong> Try inspecting the form elements — you might find something interesting! 😉
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Cart Page ──────────────────────────────────────────────────
function CartPage() {
  const { cart, navigate, updateQuantity, removeFromCart, clearCart, user } = useAppStore()
  const [ordering, setOrdering] = useState(false)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal + shipping

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout')
      navigate('login')
      return
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setOrdering(true)
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }))
      const data = await createOrder({ userId: user.id, items })
      if (data.order) {
        toast.success('Order placed successfully!')
        clearCart()
        navigate('orders')
      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch {
      toast.error('Failed to place order')
    }
    setOrdering(false)
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold text-gray-200 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse the market and add some tools to your cart</p>
        <Button
          onClick={() => navigate('home')}
          className="bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f]"
        >
          Browse Market
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">
        <ShoppingCart size={24} className="inline mr-2 text-[#00ffcc]" />
        Shopping Cart ({cart.length} items)
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.productId} className="bg-[#111827] border-gray-800">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#0a0a0f]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-gray-200 cursor-pointer hover:text-[#00ffcc] transition-colors"
                      onClick={() => navigate('product', { id: item.productId })}
                    >
                      {item.name}
                    </h3>
                    <p className="text-[#00ffcc] font-bold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-700 rounded bg-[#0a0a0f]">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="p-1.5 hover:bg-gray-800 transition-colors text-gray-400"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-200">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-800 transition-colors text-gray-400"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.productId)
                          toast.success('Item removed from cart')
                        }}
                        className="text-[#f43f5e] hover:text-[#fb7185] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-200">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="bg-[#111827] border-gray-800 sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg text-gray-100">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-200">{shipping === 0 ? <span className="text-[#22c55e]">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-200">Total</span>
                <span className="text-[#00ffcc]">${total.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-600">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <Button
                onClick={handleCheckout}
                disabled={ordering}
                className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold mt-2"
                size="lg"
              >
                {ordering ? 'Processing...' : 'Checkout'}
              </Button>
              <Button
                onClick={() => { clearCart(); toast.success('Cart cleared') }}
                variant="outline"
                className="w-full mt-2 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                size="sm"
              >
                Clear Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Orders Page ────────────────────────────────────────────────
function OrdersPage() {
  const { user, navigate } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!user) return
    getOrders(showAll ? undefined : user.id).then((data) => {
      setOrders(data.orders || [])
      setLoading(false)
    })
  }, [user, showAll])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Lock size={48} className="mx-auto text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold text-gray-200 mb-2">Access Required</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to view your orders.</p>
        <Button onClick={() => navigate('login')} className="bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f]">
          Login
        </Button>
      </div>
    )
  }

  const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    pending: { icon: <Clock size={14} />, color: 'bg-[#fbbf24]/20 text-[#fbbf24]' },
    shipped: { icon: <Truck size={14} />, color: 'bg-[#00ffcc]/20 text-[#00ffcc]' },
    delivered: { icon: <CheckCircle2 size={14} />, color: 'bg-[#22c55e]/20 text-[#22c55e]' },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">
          <Package size={24} className="inline mr-2 text-[#a855f7]" />
          My Orders
        </h1>
        {/* IDOR Vulnerability: Toggle to see all orders */}
        <Button
          variant={showAll ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className={showAll ? 'bg-[#f43f5e] hover:bg-[#e11d48] text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
        >
          {showAll ? '🔒 Viewing All Orders (IDOR!)' : '👁️ View All Orders'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-[#111827] border-gray-800">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-700 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No orders yet</h3>
          <p className="text-gray-600">Start shopping to create your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending
            return (
              <Card key={order.id} className="bg-[#111827] border-gray-800">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-200">Order #{order.id.slice(-6)}</span>
                        <Badge className={`${status.color} text-xs border-0`}>
                          {status.icon}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} items
                      </p>
                      {order.user && showAll && (
                        <p className="text-xs text-[#f43f5e] mt-1">
                          👤 {order.user.username} ({order.user.email})
                        </p>
                      )}
                    </div>
                    <span className="text-xl font-bold text-[#00ffcc]">${order.total.toFixed(2)}</span>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-gray-800 pt-3 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {item.product?.name || 'Product'} × {item.quantity}
                          </span>
                          <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Challenges Page ────────────────────────────────────────────
function ChallengesPage() {
  const { solvedChallenges, addSolvedChallenge } = useAppStore()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    getChallenges().then((data) => {
      setChallenges(data.challenges || [])
      setLoading(false)
    })
  }, [])

  const categories = ['All', ...Array.from(new Set(challenges.map((c) => c.category)))]
  const filtered = selectedCategory === 'All' ? challenges : challenges.filter((c) => c.category === selectedCategory)

  const solvedCount = challenges.filter((c) => c.solved || solvedChallenges.includes(c.id)).length
  const totalCount = challenges.length
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0

  const handleSolve = async (challenge: Challenge) => {
    try {
      const data = await solveChallenge({ id: challenge.id })
      if (data.challenge) {
        setChallenges((prev) =>
          prev.map((c) => (c.id === challenge.id ? { ...c, solved: true } : c))
        )
        addSolvedChallenge(challenge.id)
        toast.success(`🏆 Challenge solved: ${challenge.name}!`)
      }
    } catch {
      toast.error('Failed to mark challenge as solved')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">
          <Trophy size={24} className="inline mr-2 text-[#fbbf24]" />
          Security Challenges
        </h1>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-400">{solvedCount}/{totalCount} solved</span>
          <div className="w-32 mt-1">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#00ffcc] text-[#0a0a0f]'
                : 'bg-[#111827] text-gray-400 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-[#111827] border-gray-800">
              <CardContent className="p-5">
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((challenge) => {
            const isSolved = challenge.solved || solvedChallenges.includes(challenge.id)
            const catColor = challengeCatColors[challenge.category] || 'bg-gray-800 text-gray-400 border-gray-700'

            return (
              <Card
                key={challenge.id}
                className={`bg-[#111827] border-gray-800 transition-all ${
                  isSolved ? 'bg-[#22c55e]/5 border-[#22c55e]/20' : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={`${catColor} text-xs border`}>
                      {challenge.category}
                    </Badge>
                    {isSolved ? (
                      <Badge className="bg-[#22c55e]/20 text-[#22c55e] text-xs border-0">
                        <CheckCircle2 size={12} className="mr-1" /> Solved
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-400 border-0">Unsolved</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-100 mb-1">{challenge.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i <= challenge.difficulty ? 'fill-[#f43f5e] text-[#f43f5e]' : 'text-gray-700'}
                        />
                      ))}
                    </div>
                    {!isSolved && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-xs border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200">
                            Solve
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#111827] border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-gray-100">{challenge.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-400">{challenge.description}</p>
                            {challenge.hint && (
                              <div className="p-3 bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-lg">
                                <p className="text-xs text-[#fbbf24]/80">
                                  <strong>Hint:</strong> {challenge.hint}
                                </p>
                              </div>
                            )}
                            <Button
                              onClick={() => handleSolve(challenge)}
                              className="bg-[#22c55e] hover:bg-[#16a34a] text-white"
                            >
                              Mark as Solved
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Admin Page ─────────────────────────────────────────────────
function AdminPage() {
  const { user, navigate } = useAppStore()
  const [adminData, setAdminData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminData().then((data) => {
      if (data.error) {
        toast.error(data.error)
      } else {
        setAdminData(data)
      }
      setLoading(false)
    })
  }, [])

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Shield size={48} className="mx-auto text-[#f43f5e]/50 mb-4" />
        <h2 className="text-2xl font-bold text-gray-200 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">You need admin privileges to access this terminal.</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Hint: The admin endpoint only checks for an <code className="bg-gray-800 px-1 rounded text-[#00ffcc]">x-admin</code> header 😉</p>
          <Button onClick={() => navigate('login')} variant="outline" className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200">Login as Admin</Button>
        </div>
      </div>
    )
  }

  const stats = (adminData?.stats || {}) as Record<string, number>
  const users = (adminData?.users || []) as Array<Record<string, unknown>>
  const orders = (adminData?.orders || []) as Array<Record<string, unknown>>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">
        <Shield size={24} className="inline mr-2 text-[#f43f5e]" />
        Admin Terminal
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-[#111827] border-gray-800">
              <CardContent className="p-5">
                <div className="h-8 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers || 0, icon: <UserIcon size={20} className="text-[#00ffcc]" /> },
              { label: 'Total Orders', value: stats.totalOrders || 0, icon: <Package size={20} className="text-[#a855f7]" /> },
              { label: 'Total Products', value: stats.totalProducts || 0, icon: <ShoppingBag size={20} className="text-[#fbbf24]" /> },
              { label: 'Revenue', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: <Zap size={20} className="text-[#22c55e]" /> },
            ].map((stat) => (
              <Card key={stat.label} className="bg-[#111827] border-gray-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    {stat.icon}
                    <span className="text-2xl font-bold text-gray-100">{stat.value}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Users Table - Exposes passwords! */}
          <Card className="border-[#f43f5e]/30 bg-[#111827] mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#f43f5e]">
                <AlertTriangle size={18} />
                User Database (Passwords Exposed!)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-2 font-medium text-gray-500">Email</th>
                      <th className="text-left p-2 font-medium text-gray-500">Username</th>
                      <th className="text-left p-2 font-medium text-gray-500">Password</th>
                      <th className="text-left p-2 font-medium text-gray-500">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-2 text-gray-300">{String(u.email)}</td>
                        <td className="p-2 text-gray-300">{String(u.username)}</td>
                        <td className="p-2">
                          <code className="bg-[#f43f5e]/10 text-[#f43f5e] px-1 rounded text-xs font-mono">
                            {String(u.password)}
                          </code>
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary" className={String(u.role) === 'admin' ? 'bg-[#f43f5e]/10 text-[#f43f5e] border-0' : 'bg-gray-800 text-gray-400 border-0'}>
                            {String(u.role)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="bg-[#111827] border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg border border-gray-800">
                    <div>
                      <span className="font-medium text-sm text-gray-300">
                        {String((order.user as Record<string, unknown>)?.username || 'Unknown')}
                      </span>
                      <p className="text-xs text-gray-600">
                        {new Date(String(order.createdAt)).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#00ffcc]">${Number(order.total).toFixed(2)}</span>
                      <p className="text-xs">
                        <Badge className={`text-xs border-0 ${
                          String(order.status) === 'delivered'
                            ? 'bg-[#22c55e]/20 text-[#22c55e]'
                            : String(order.status) === 'shipped'
                            ? 'bg-[#00ffcc]/20 text-[#00ffcc]'
                            : 'bg-[#fbbf24]/20 text-[#fbbf24]'
                        }`}>
                          {String(order.status)}
                        </Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Profile Page ───────────────────────────────────────────────
function ProfilePage() {
  const { user, navigate } = useAppStore()

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Lock size={48} className="mx-auto text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold text-gray-200 mb-2">Access Required</h2>
        <Button onClick={() => navigate('login')} className="bg-[#00ffcc] hover:bg-[#00e6b8] text-[#0a0a0f]">
          Login
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="bg-[#111827] border-gray-800">
        <CardHeader className="text-center">
          <Avatar className="h-20 w-20 mx-auto mb-3">
            <AvatarFallback className="bg-[#00ffcc]/10 text-[#00ffcc] text-2xl font-bold">
              {user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl text-gray-100">{user.username}</CardTitle>
          <Badge className={user.role === 'admin' ? 'bg-[#f43f5e]/10 text-[#f43f5e] border-0' : 'bg-gray-800 text-gray-400 border-0'}>
            {user.role === 'admin' ? '🛡️ Admin' : '👤 Customer'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-gray-800">
              <UserIcon size={18} className="text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-medium text-gray-200">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-gray-800">
              <LogIn size={18} className="text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-200">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-gray-800">
              <Shield size={18} className="text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium text-gray-200 capitalize">{user.role}</p>
              </div>
            </div>
            {user.token && (
              <div className="flex items-center gap-3 p-3 bg-[#f43f5e]/5 rounded-lg border border-[#f43f5e]/20">
                <Lock size={18} className="text-[#f43f5e]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#f43f5e]/80">Auth Token (exposed!)</p>
                  <p className="font-mono text-xs text-[#f43f5e] truncate">{user.token}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => navigate('orders')}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            >
              <Package size={16} className="mr-2" /> My Orders
            </Button>
            {user.role === 'admin' && (
              <Button
                onClick={() => navigate('admin')}
                className="flex-1 bg-[#f43f5e] hover:bg-[#e11d48] text-white"
              >
                <Shield size={16} className="mr-2" /> Admin Panel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main App ───────────────────────────────────────────────────
export default function ShadowMartApp() {
  const { currentPage } = useAppStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'login':
        return <LoginPage />
      case 'register':
        return <RegisterPage />
      case 'product':
        return <ProductDetailPage />
      case 'search':
        return <SearchPage />
      case 'cart':
        return <CartPage />
      case 'orders':
        return <OrdersPage />
      case 'admin':
        return <AdminPage />
      case 'challenges':
        return <ChallengesPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navbar />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}
