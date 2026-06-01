# Worklog - OWASP Juice Shop Clone Backend

## Task 2: Backend (Database + API Routes)
**Agent**: Backend Developer
**Date**: 2026-06-01

### Completed Work:

1. **Prisma Schema Update** (`prisma/schema.prisma`)
   - Replaced default schema with full Juice Shop models
   - Models: User, Product, Order, OrderItem, Review, Challenge
   - User model includes: email, username, password (plaintext!), role, address
   - Product model includes: name, description, price, category, image, stock, rating, featured
   - Challenge model for security challenge tracking

2. **Database Migration** - Ran `bun run db:push` successfully

3. **Seed Script** (`prisma/seed.ts`)
   - 6 Users: admin, jim, bender, bjoern.kimminich (base64 password), support, test
   - 23 Products across 4 categories: Juice (8), Smoothie (6), Fruit Basket (4), Accessory (5)
   - 8 Reviews (including XSS payload examples in seed data)
   - 3 Orders with order items
   - 17 Security Challenges across categories: Injection, XSS, Broken Authentication, Sensitive Data Exposure, Broken Access Control, Security Misconfiguration, CSRF
   - Ran seed script successfully with `bunx tsx prisma/seed.ts`

4. **API Routes Created:**

   | Route | Method | Function | Vulnerability |
   |-------|--------|----------|---------------|
   | `/api/products` | GET | List products (filter/search) | No pagination, no rate limiting |
   | `/api/products/[id]` | GET | Get product by ID | IDOR, exposes orderItems |
   | `/api/auth/register` | POST | Register user | Mass assignment (role field) |
   | `/api/auth/login` | POST | Login | SQL injection bypass, no rate limiting |
   | `/api/search` | GET | Search products | SQL injection exposes user data |
   | `/api/reviews` | GET/POST | Get/add reviews | Stored XSS (no sanitization) |
   | `/api/cart` | GET/POST | Cart management | Price manipulation (client-supplied) |
   | `/api/orders` | GET/POST | Get/create orders | IDOR (view other users' orders) |
   | `/api/challenges` | GET/PATCH | List/solve challenges | No auth check on solving |
   | `/api/admin` | GET | Admin panel data | Header-based auth only, exposes passwords |
   | `/api/health` | GET | Health check | Exposes tech stack info |

5. **Lint Check** - Passed with no errors

6. **All API Endpoints Tested Successfully:**
   - Health endpoint returns database stats
   - Products endpoint returns 23 products
   - SQL injection on login works (`' OR 1=1--` bypasses auth)
   - SQL injection on search exposes all user passwords
   - Mass assignment allows registering admin users
   - Admin endpoint accessible with `x-admin` header
   - Cart accepts manipulated prices
   - Reviews store XSS payloads without sanitization
   - Orders accessible by any userId (IDOR)
