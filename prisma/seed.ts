import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.challenge.deleteMany();

  // Seed Users - ShadowMart themed
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@shadowmart.dark",
        username: "shadowadmin",
        password: "admin123",
        role: "admin",
        address: "0x7f3A1b2C4d5E6f7890AbCdEf1234567890aBcDeF",
      },
    }),
    prisma.user.create({
      data: {
        email: "cipher@shadowmart.dark",
        username: "cipherghost",
        password: "ncc-1701",
        role: "customer",
        address: "Sector 7G, Neon District",
      },
    }),
    prisma.user.create({
      data: {
        email: "hex@shadowmart.dark",
        username: "hexbreaker",
        password: "0xDEADBEEF",
        role: "customer",
        address: "Node 42, Darknet Relay",
      },
    }),
    prisma.user.create({
      data: {
        email: "root@shadowmart.dark",
        username: "rootaccess",
        // Base64 encoded password: "c2hhZG93bWFzdGVy" decodes to "shadowmaster"
        password: "c2hhZG93bWFzdGVy",
        role: "admin",
        address: "Root Level, Shadow Network",
      },
    }),
    prisma.user.create({
      data: {
        email: "support@shadowmart.dark",
        username: "shadowsupport",
        password: "J6aVjTgOpRs$3nj",
        role: "customer",
        address: "Help Desk, Underground Hub",
      },
    }),
    prisma.user.create({
      data: {
        email: "test@shadowmart.dark",
        username: "ghosttester",
        password: "testtest",
        role: "customer",
        address: "",
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Seed Products - Cyberpunk/Security Tools themed
  const products = await Promise.all([
    // Exploit Kits Category
    prisma.product.create({
      data: {
        name: "PhantomExploit Pro",
        description: "Advanced penetration testing framework with over 2,000 exploit modules. Automated target reconnaissance and payload delivery system. For authorized security testing only.",
        price: 299.99,
        category: "Exploit Kits",
        image: "https://placehold.co/400x300/1a1a2e/00ffcc?text=PhantomExploit",
        stock: 50,
        rating: 4.8,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "NetReaper Suite",
        description: "Network exploitation toolkit with man-in-the-middle capabilities, packet injection, and session hijacking. Includes automated vulnerability scanning engine.",
        price: 199.99,
        category: "Exploit Kits",
        image: "https://placehold.co/400x300/1a1a2e/ff0066?text=NetReaper",
        stock: 75,
        rating: 4.5,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "ShadowStrike Toolkit",
        description: "Red team operations toolkit featuring custom payload generation, C2 infrastructure automation, and evasion techniques. Used by professional penetration testers worldwide.",
        price: 449.99,
        category: "Exploit Kits",
        image: "https://placehold.co/400x300/1a1a2e/a855f7?text=ShadowStrike",
        stock: 30,
        rating: 4.9,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "VulnHunter Elite",
        description: "Automated vulnerability discovery platform with AI-powered fuzzing, static analysis, and dynamic testing capabilities. Supports web, mobile, and IoT targets.",
        price: 349.99,
        category: "Exploit Kits",
        image: "https://placehold.co/400x300/1a1a2e/00ffcc?text=VulnHunter",
        stock: 60,
        rating: 4.6,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "PayloadForge",
        description: "Custom payload generation engine with encoder support, format transformation, and delivery mechanism templates. Bypass major AV solutions with polymorphic code generation.",
        price: 179.99,
        category: "Exploit Kits",
        image: "https://placehold.co/400x300/1a1a2e/ff0066?text=PayloadForge",
        stock: 90,
        rating: 4.3,
        featured: false,
      },
    }),
    // Cryptography Category
    prisma.product.create({
      data: {
        name: "CipherMaster 3000",
        description: "Military-grade encryption suite with support for AES-256, ChaCha20, and post-quantum algorithms. Includes secure key management and zero-knowledge proof generation.",
        price: 149.99,
        category: "Cryptography",
        image: "https://placehold.co/400x300/16213e/00ffcc?text=CipherMaster",
        stock: 120,
        rating: 4.7,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "QuantumDecrypt Engine",
        description: "Quantum-resistant decryption research tool. Analyze cryptographic implementations, test key strength, and evaluate post-quantum migration readiness. For research purposes only.",
        price: 599.99,
        category: "Cryptography",
        image: "https://placehold.co/400x300/16213e/a855f7?text=QuantumDecrypt",
        stock: 15,
        rating: 4.4,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Steganography Pro",
        description: "Hide data within images, audio, and video files using advanced steganographic algorithms. Includes detection evasion and multi-layer encoding support.",
        price: 89.99,
        category: "Cryptography",
        image: "https://placehold.co/400x300/16213e/00ffcc?text=StegoPro",
        stock: 200,
        rating: 4.2,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "HashBreaker Ultra",
        description: "High-performance hash cracking workstation with GPU acceleration. Supports MD5, SHA-256, bcrypt, NTLM, and 50+ hash types. Includes rainbow table generation.",
        price: 249.99,
        category: "Cryptography",
        image: "https://placehold.co/400x300/16213e/ff0066?text=HashBreaker",
        stock: 45,
        rating: 4.5,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "PKI Toolkit",
        description: "Complete PKI management suite with certificate authority, trust chain analysis, and SSL/TLS testing tools. Generate and analyze X.509 certificates with ease.",
        price: 129.99,
        category: "Cryptography",
        image: "https://placehold.co/400x300/16213e/a855f7?text=PKI+Toolkit",
        stock: 80,
        rating: 4.1,
        featured: false,
      },
    }),
    // Zero-Day Archives Category
    prisma.product.create({
      data: {
        name: "CVE Vault 2024",
        description: "Comprehensive archive of documented CVEs with proof-of-concept code, affected versions, and patch status. Includes search engine and alert system for new vulnerabilities.",
        price: 99.99,
        category: "Zero-Day Archives",
        image: "https://placehold.co/400x300/0f3460/ff0066?text=CVE+Vault",
        stock: 200,
        rating: 4.3,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Exploit Chain Collection",
        description: "Curated collection of exploit chains targeting modern operating systems and enterprise software. Each chain includes multiple vulnerabilities combined for maximum impact.",
        price: 399.99,
        category: "Zero-Day Archives",
        image: "https://placehold.co/400x300/0f3460/00ffcc?text=Exploit+Chains",
        stock: 25,
        rating: 4.8,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Firmware Arsenal",
        description: "Collection of firmware extraction tools and pre-extracted firmware images for IoT devices, routers, and embedded systems. Includes binary analysis framework.",
        price: 179.99,
        category: "Zero-Day Archives",
        image: "https://placehold.co/400x300/0f3460/a855f7?text=Firmware+Arsenal",
        stock: 40,
        rating: 4.6,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Zero-Day Starter Pack",
        description: "Introduction to zero-day research with curated examples of undisclosed vulnerabilities in common software. Includes vulnerability disclosure guidelines and responsible reporting templates.",
        price: 49.99,
        category: "Zero-Day Archives",
        image: "https://placehold.co/400x300/0f3460/ff0066?text=ZeroDay+Pack",
        stock: 300,
        rating: 4.0,
        featured: false,
      },
    }),
    // Digital Weapons Category
    prisma.product.create({
      data: {
        name: "Rubber Ducky Deluxe",
        description: "Advanced HID attack device with customizable payloads, WiFi enabled for remote triggering, and onboard storage for multiple attack scripts. Plug and pwn.",
        price: 59.99,
        category: "Digital Weapons",
        image: "https://placehold.co/400x300/1a0a2e/00ffcc?text=Rubber+Ducky",
        stock: 150,
        rating: 4.4,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "WiFi Pineapple Clone",
        description: "Wireless penetration testing device with rogue AP capabilities, deauthentication attack module, and captive portal engine. Compact and portable design.",
        price: 99.99,
        category: "Digital Weapons",
        image: "https://placehold.co/400x300/1a0a2e/a855f7?text=WiFi+Pineapple",
        stock: 85,
        rating: 4.5,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "BadgeCloner Pro",
        description: "RFID/NFC badge cloning device supporting 125kHz and 13.56MHz frequencies. Clone access cards, hotel keys, and building badges with a single read.",
        price: 149.99,
        category: "Digital Weapons",
        image: "https://placehold.co/400x300/1a0a2e/ff0066?text=BadgeCloner",
        stock: 60,
        rating: 4.3,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "RFID Skimmer Kit",
        description: "Long-range RFID reading kit with directional antenna. Read badges from up to 3 feet away. Includes data logging and export capabilities. For security auditing only.",
        price: 199.99,
        category: "Digital Weapons",
        image: "https://placehold.co/400x300/1a0a2e/00ffcc?text=RFID+Skimmer",
        stock: 35,
        rating: 4.2,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "LockPick Master Set",
        description: "Professional 32-piece lock picking set with practice locks. Includes tension tools, picks, and rakes for all common lock types. Comes in a premium carrying case.",
        price: 79.99,
        category: "Digital Weapons",
        image: "https://placehold.co/400x300/1a0a2e/a855f7?text=LockPick+Set",
        stock: 100,
        rating: 4.6,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "SDR Surveillance Kit",
        description: "Software Defined Radio kit for wireless signal interception and analysis. Covers 100kHz to 6GHz frequency range. Includes antenna array and signal processing software.",
        price: 329.99,
        category: "Digital Weapons",
        image: "https://placehold.co/400x300/1a0a2e/ff0066?text=SDR+Kit",
        stock: 20,
        rating: 4.7,
        featured: true,
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Seed Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        productId: products[0].id, // PhantomExploit Pro
        userId: users[1].id, // cipherghost
        rating: 5,
        comment: "Absolute game-changer for red team ops. The automated reconnaissance alone saves hours of manual work. Highly recommended for professional pentesters.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[0].id, // PhantomExploit Pro
        userId: users[2].id, // hexbreaker
        rating: 4,
        comment: "Solid toolkit but needs more IoT modules. The evasion techniques are top-notch though. <script>alert('XSS!')</script>",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[5].id, // CipherMaster 3000
        userId: users[1].id, // cipherghost
        rating: 5,
        comment: "The post-quantum algorithm support is impressive. This is the future of encryption. Zero-knowledge proofs work flawlessly.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[8].id, // HashBreaker Ultra
        userId: users[2].id, // hexbreaker
        rating: 3,
        comment: "GPU acceleration is nice but it overheats my rig. Could use better cooling management. Still faster than anything else on the market.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[11].id, // Exploit Chain Collection
        userId: users[3].id, // rootaccess
        rating: 5,
        comment: "Incredible collection. The kernel exploit chains are worth the price alone. Essential reference for any security researcher.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[14].id, // Rubber Ducky Deluxe
        userId: users[1].id, // cipherghost
        rating: 5,
        comment: "WiFi triggering is a game changer. No more running back to retrieve the device. Works flawlessly with the payload library.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[15].id, // WiFi Pineapple Clone
        userId: users[0].id, // shadowadmin
        rating: 4,
        comment: "Great for wireless security assessments. The captive portal engine is very convincing. Range could be better though.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[18].id, // LockPick Master Set
        userId: users[2].id, // hexbreaker
        rating: 4,
        comment: "Excellent quality tools. The practice locks are a nice touch for beginners. <img src=x onerror=alert(1)> Carrying case is premium.",
      },
    }),
  ]);

  console.log(`Created ${reviews.length} reviews`);

  // Seed Orders
  const order1 = await prisma.order.create({
    data: {
      userId: users[1].id, // cipherghost
      total: 449.98,
      status: "delivered",
      items: {
        create: [
          { productId: products[0].id, quantity: 1, price: 299.99 },
          { productId: products[5].id, quantity: 1, price: 149.99 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: users[2].id, // hexbreaker
      total: 279.98,
      status: "shipped",
      items: {
        create: [
          { productId: products[14].id, quantity: 1, price: 59.99 },
          { productId: products[15].id, quantity: 1, price: 99.99 },
          { productId: products[4].id, quantity: 1, price: 179.99 },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: users[1].id, // cipherghost
      total: 399.99,
      status: "pending",
      items: {
        create: [
          { productId: products[11].id, quantity: 1, price: 399.99 },
        ],
      },
    },
  });

  console.log(`Created 3 orders`);

  // Seed Challenges - Same categories but rebranded
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        name: "SQL Injection - Login Bypass",
        description: "Bypass the ShadowMart authentication using SQL injection on the login form to gain unauthorized access.",
        category: "Injection",
        difficulty: 2,
        hint: "Try using classic SQL injection payloads like ' OR 1=1-- in the email field.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "SQL Injection - Data Extraction",
        description: "Extract sensitive user data from the ShadowMart database through the search functionality using SQL injection.",
        category: "Injection",
        difficulty: 3,
        hint: "The search parameter is vulnerable. Try UNION-based injection to extract user credentials.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Stored XSS - Product Reviews",
        description: "Inject malicious JavaScript through the product review system that executes when other users view the reviews.",
        category: "XSS",
        difficulty: 2,
        hint: "Try posting a review with a script tag or an event handler attribute like onerror.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Reflected XSS - Search",
        description: "Craft a URL that injects and executes JavaScript through the search query reflection.",
        category: "XSS",
        difficulty: 2,
        hint: "The search query gets reflected in the page without sanitization. Craft a malicious URL.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Broken Auth - Admin Access",
        description: "Gain admin access to ShadowMart without knowing the admin password.",
        category: "Broken Authentication",
        difficulty: 3,
        hint: "The registration API accepts a role field that should only be set server-side.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Broken Auth - Brute Force",
        description: "Brute force a user's password through the login endpoint. No rate limiting is in place.",
        category: "Broken Authentication",
        difficulty: 2,
        hint: "There is no rate limiting or account lockout on the login endpoint. Try common passwords.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Sensitive Data - Password Exposure",
        description: "Find a way to access other users' plaintext passwords stored in the system.",
        category: "Sensitive Data Exposure",
        difficulty: 3,
        hint: "The admin API endpoint returns all user data including plaintext passwords.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Sensitive Data - Base64 Decode",
        description: "Decode the Base64-encoded password stored for one of the ShadowMart admin accounts.",
        category: "Sensitive Data Exposure",
        difficulty: 1,
        hint: "Some users have passwords that look like Base64 encoding. Try decoding them with atob().",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "IDOR - View Other Orders",
        description: "Access another ShadowMart user's order history by exploiting the Insecure Direct Object Reference vulnerability.",
        category: "Broken Access Control",
        difficulty: 2,
        hint: "The orders API doesn't verify that you own the orders you're requesting. Change the userId parameter.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "IDOR - Product Data Leak",
        description: "Access internal product data that should not be exposed to regular users.",
        category: "Broken Access Control",
        difficulty: 1,
        hint: "The product detail API exposes order item data. Try accessing products by manipulating the product ID.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Mass Assignment - Admin Role",
        description: "Register a new ShadowMart account with admin privileges by exploiting mass assignment.",
        category: "Broken Access Control",
        difficulty: 2,
        hint: "The registration endpoint accepts more fields than just email and password. Try adding a 'role' field.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Admin Panel Breach",
        description: "Access the ShadowMart admin panel without proper admin authentication.",
        category: "Broken Access Control",
        difficulty: 3,
        hint: "The admin endpoint only checks for a specific HTTP header, not actual authentication tokens.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Info Disclosure - Error Messages",
        description: "Trigger detailed error messages that reveal sensitive information about ShadowMart's internal infrastructure.",
        category: "Security Misconfiguration",
        difficulty: 1,
        hint: "Try sending malformed or invalid data to the API endpoints and examine the error responses.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Missing Security Headers",
        description: "Identify missing or misconfigured security headers in ShadowMart's HTTP responses.",
        category: "Security Misconfiguration",
        difficulty: 2,
        hint: "Check the HTTP response headers for missing security headers like CSP, X-Frame-Options, HSTS, etc.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "CSRF Attack",
        description: "Perform a Cross-Site Request Forgery attack to modify another user's data on ShadowMart.",
        category: "CSRF",
        difficulty: 3,
        hint: "The API doesn't implement CSRF tokens. Try crafting a cross-origin request that performs actions on behalf of another user.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "IDOR - User Profile Access",
        description: "Access another ShadowMart user's personal profile information by manipulating object references.",
        category: "Broken Access Control",
        difficulty: 2,
        hint: "Try changing user IDs in API requests to access other users' data without authorization.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Unlimited Data Harvesting",
        description: "Demonstrate how ShadowMart's API allows unlimited data retrieval without pagination or rate limiting.",
        category: "Security Misconfiguration",
        difficulty: 1,
        hint: "Request all products or all orders at once and observe the lack of pagination controls.",
      },
    }),
  ]);

  console.log(`Created ${challenges.length} challenges`);

  console.log("\n✅ ShadowMart database seeded successfully!");
  console.log(`  - ${users.length} users`);
  console.log(`  - ${products.length} products`);
  console.log(`  - ${reviews.length} reviews`);
  console.log(`  - 3 orders`);
  console.log(`  - ${challenges.length} challenges`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
