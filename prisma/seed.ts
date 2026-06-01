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

  // Seed Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@juice-sh.op",
        username: "admin",
        password: "admin123",
        role: "admin",
        address: "123 Admin Street, Adminville",
      },
    }),
    prisma.user.create({
      data: {
        email: "jim@juice-sh.op",
        username: "jim",
        password: "ncc-1701",
        role: "customer",
        address: "456 Federation Ave, Starbase 12",
      },
    }),
    prisma.user.create({
      data: {
        email: "bender@juice-sh.op",
        username: "bender",
        password: "ohmymother",
        role: "customer",
        address: "789 Robot Arms Apts, New New York",
      },
    }),
    prisma.user.create({
      data: {
        email: "bjoern.kimminich@juice-sh.op",
        username: "bjoern.kimminich",
        // Base64 encoded password: the original is "bW9jLmxpYW1nQGhjaGltbmFtLm9yZw==" 
        // which decodes to "moc.liamg@hcinam.or" (a reversed email)
        password: "bW9jLmxpYW1nQGhjaGltbmFtLm9yZw==",
        role: "admin",
        address: "42 Security Lane, Hamburg",
      },
    }),
    prisma.user.create({
      data: {
        email: "support@juice-sh.op",
        username: "support",
        password: "J6aVjTgOpRs$3nj",
        role: "customer",
        address: "Support Center, Juice City",
      },
    }),
    prisma.user.create({
      data: {
        email: "test@juice-sh.op",
        username: "tester",
        password: "testtest",
        role: "customer",
        address: "",
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Seed Products
  const products = await Promise.all([
    // Juice Category
    prisma.product.create({
      data: {
        name: "Orange Juice (OJ)",
        description: "Freshly squeezed from the finest Valencia oranges. Pure sunshine in a glass! No added sugar, no preservatives - just 100% pure orange goodness.",
        price: 3.99,
        category: "Juice",
        image: "https://placehold.co/400x300/ff6b35/ffffff?text=Orange+Juice",
        stock: 150,
        rating: 4.5,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Apple Juice",
        description: "Crisp and refreshing apple juice made from hand-picked Granny Smith and Golden Delicious apples. A classic for a reason!",
        price: 2.99,
        category: "Juice",
        image: "https://placehold.co/400x300/8bc34a/ffffff?text=Apple+Juice",
        stock: 200,
        rating: 4.2,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Carrot Kick",
        description: "An energizing blend of fresh carrots with a hint of ginger. Packed with beta-carotene and vitamins to fuel your day!",
        price: 4.49,
        category: "Juice",
        image: "https://placehold.co/400x300/ff9800/ffffff?text=Carrot+Kick",
        stock: 80,
        rating: 3.8,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Lemon Squeeze",
        description: "Tangy and invigorating, our Lemon Squeeze is perfect for those who love a zesty kick. Made with organic lemons and a touch of honey.",
        price: 3.49,
        category: "Juice",
        image: "https://placehold.co/400x300/ffeb3b/333333?text=Lemon+Squeeze",
        stock: 120,
        rating: 4.0,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Watermelon Wave",
        description: "Ride the wave of refreshment! Our Watermelon Wave juice is the ultimate summer cooler. Light, sweet, and incredibly hydrating.",
        price: 4.99,
        category: "Juice",
        image: "https://placehold.co/400x300/e91e63/ffffff?text=Watermelon+Wave",
        stock: 90,
        rating: 4.3,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Pineapple Punch",
        description: "A tropical punch of pure pineapple juice. Sweet, tart, and bursting with island flavor. Close your eyes and you're on the beach!",
        price: 4.79,
        category: "Juice",
        image: "https://placehold.co/400x300/ffc107/333333?text=Pineapple+Punch",
        stock: 110,
        rating: 4.6,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cherry Bomb",
        description: "Explosive cherry flavor that will blow your taste buds away! Made from dark Montmorency cherries for a rich, bold taste.",
        price: 5.49,
        category: "Juice",
        image: "https://placehold.co/400x300/b71c1c/ffffff?text=Cherry+Bomb",
        stock: 70,
        rating: 4.1,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Peach Perfection",
        description: "Sun-ripened Georgia peaches transformed into liquid perfection. Sweet, aromatic, and absolutely delightful. Summer in every sip!",
        price: 5.99,
        category: "Juice",
        image: "https://placehold.co/400x300/ff8a65/ffffff?text=Peach+Perfection",
        stock: 60,
        rating: 4.7,
        featured: true,
      },
    }),
    // Smoothie Category
    prisma.product.create({
      data: {
        name: "Mango Smoothie",
        description: "A velvety smooth blend of Alphonso mangoes with a hint of coconut milk. Tropical paradise in every sip!",
        price: 6.99,
        category: "Smoothie",
        image: "https://placehold.co/400x300/ff9800/ffffff?text=Mango+Smoothie",
        stock: 100,
        rating: 4.8,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Berry Blast",
        description: "An explosion of mixed berries - strawberries, blueberries, raspberries, and blackberries all blended into one delicious smoothie!",
        price: 6.49,
        category: "Smoothie",
        image: "https://placehold.co/400x300/9c27b0/ffffff?text=Berry+Blast",
        stock: 85,
        rating: 4.6,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Tropical Paradise",
        description: "Close your eyes and drift away to a tropical island. Mango, passion fruit, and guava blended with creamy banana.",
        price: 7.49,
        category: "Smoothie",
        image: "https://placehold.co/400x300/00bcd4/ffffff?text=Tropical+Paradise",
        stock: 75,
        rating: 4.9,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Green Detox",
        description: "Cleanse and rejuvenate with our powerhouse green smoothie. Kale, spinach, cucumber, green apple, and a splash of lemon. Your body will thank you!",
        price: 7.99,
        category: "Smoothie",
        image: "https://placehold.co/400x300/4caf50/ffffff?text=Green+Detox",
        stock: 95,
        rating: 4.0,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Banana Boost",
        description: "Need energy? Our Banana Boost combines ripe bananas with almond butter and a drizzle of honey for the perfect pre-workout fuel!",
        price: 5.99,
        category: "Smoothie",
        image: "https://placehold.co/400x300/ffe082/333333?text=Banana+Boost",
        stock: 110,
        rating: 4.3,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Strawberry Fields",
        description: "Imagine forever with our luscious strawberry smoothie. Fresh strawberries blended with Greek yogurt and a touch of vanilla.",
        price: 6.79,
        category: "Smoothie",
        image: "https://placehold.co/400x300/e91e63/ffffff?text=Strawberry+Fields",
        stock: 130,
        rating: 4.5,
        featured: false,
      },
    }),
    // Fruit Basket Category
    prisma.product.create({
      data: {
        name: "Mixed Fruit Basket",
        description: "A bountiful basket of seasonal fruits hand-picked for maximum freshness. Includes apples, oranges, bananas, grapes, and more!",
        price: 29.99,
        category: "Fruit Basket",
        image: "https://placehold.co/400x300/8bc34a/ffffff?text=Mixed+Fruit+Basket",
        stock: 30,
        rating: 4.4,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Tropical Fruit Basket",
        description: "Transport yourself to the tropics with mangoes, pineapples, papayas, coconuts, and passion fruit. A vacation for your taste buds!",
        price: 39.99,
        category: "Fruit Basket",
        image: "https://placehold.co/400x300/ff5722/ffffff?text=Tropical+Basket",
        stock: 20,
        rating: 4.7,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Berry Lovers Basket",
        description: "Calling all berry enthusiasts! This basket overflows with strawberries, blueberries, raspberries, blackberries, and cranberries.",
        price: 34.99,
        category: "Fruit Basket",
        image: "https://placehold.co/400x300/ad1457/ffffff?text=Berry+Basket",
        stock: 25,
        rating: 4.5,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Citrus Sensation Basket",
        description: "A zesty collection of the finest citrus fruits - oranges, lemons, limes, grapefruits, and tangerines. Vitamin C overload!",
        price: 24.99,
        category: "Fruit Basket",
        image: "https://placehold.co/400x300/ffa726/ffffff?text=Citrus+Basket",
        stock: 35,
        rating: 4.2,
        featured: false,
      },
    }),
    // Accessory Category
    prisma.product.create({
      data: {
        name: "Juice Press",
        description: "Professional-grade manual juice press for extracting every last drop of goodness. Works great with citrus fruits!",
        price: 29.99,
        category: "Accessory",
        image: "https://placehold.co/400x300/607d8b/ffffff?text=Juice+Press",
        stock: 50,
        rating: 4.1,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Glass Bottle (1L)",
        description: "Eco-friendly borosilicate glass bottle perfect for carrying your favorite juice on the go. BPA-free with a leak-proof cap.",
        price: 12.99,
        category: "Accessory",
        image: "https://placehold.co/400x300/26a69a/ffffff?text=Glass+Bottle",
        stock: 200,
        rating: 4.3,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Bamboo Straw Set",
        description: "Set of 6 handcrafted bamboo straws with a cleaning brush. The sustainable alternative to plastic straws!",
        price: 8.99,
        category: "Accessory",
        image: "https://placehold.co/400x300/795548/ffffff?text=Bamboo+Straws",
        stock: 300,
        rating: 4.0,
        featured: false,
      },
    }),
    prisma.product.create({
      data: {
        name: "Juice Cleanse Kit",
        description: "Everything you need for a 3-day juice cleanse. Includes 18 bottles of our signature cold-pressed juices and a detailed guide.",
        price: 49.99,
        category: "Accessory",
        image: "https://placehold.co/400x300/66bb6a/ffffff?text=Cleanse+Kit",
        stock: 40,
        rating: 4.6,
        featured: true,
      },
    }),
    prisma.product.create({
      data: {
        name: "Insulated Tote Bag",
        description: "Keep your juices cold for up to 8 hours with our premium insulated tote bag. Stylish, durable, and eco-friendly!",
        price: 19.99,
        category: "Accessory",
        image: "https://placehold.co/400x300/5c6bc0/ffffff?text=Tote+Bag",
        stock: 150,
        rating: 4.4,
        featured: false,
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Seed Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        productId: products[0].id, // Orange Juice
        userId: users[1].id, // jim
        rating: 5,
        comment: "Best orange juice I've ever had! So fresh and natural.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[0].id, // Orange Juice
        userId: users[2].id, // bender
        rating: 4,
        comment: "Pretty good, but I prefer my drinks with a bit more... kick. <script>alert('XSS!')</script>",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[8].id, // Mango Smoothie
        userId: users[1].id, // jim
        rating: 5,
        comment: "Absolutely divine! The coconut milk makes it so creamy and smooth.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[11].id, // Green Detox
        userId: users[2].id, // bender
        rating: 3,
        comment: "Tastes like health. I don't like health. But my circuits feel cleaner.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[9].id, // Berry Blast
        userId: users[3].id, // bjoern
        rating: 5,
        comment: "Fantastic berry blend! The mix of different berries creates a complex flavor profile.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[10].id, // Tropical Paradise
        userId: users[1].id, // jim
        rating: 5,
        comment: "It really does taste like paradise! My new favorite smoothie.",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[15].id, // Tropical Fruit Basket
        userId: users[0].id, // admin
        rating: 4,
        comment: "Great variety of tropical fruits. Perfect gift for fruit lovers!",
      },
    }),
    prisma.review.create({
      data: {
        productId: products[21].id, // Juice Cleanse Kit
        userId: users[2].id, // bender
        rating: 4,
        comment: "Not bad for a cleanse. My oil reserves feel purified. <img src=x onerror=alert(1)>",
      },
    }),
  ]);

  console.log(`Created ${reviews.length} reviews`);

  // Seed Orders
  const order1 = await prisma.order.create({
    data: {
      userId: users[1].id, // jim
      total: 18.97,
      status: "delivered",
      items: {
        create: [
          { productId: products[0].id, quantity: 2, price: 3.99 },
          { productId: products[8].id, quantity: 1, price: 6.99 },
          { productId: products[1].id, quantity: 1, price: 2.99 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: users[2].id, // bender
      total: 12.48,
      status: "shipped",
      items: {
        create: [
          { productId: products[9].id, quantity: 1, price: 6.49 },
          { productId: products[4].id, quantity: 1, price: 4.99 },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: users[1].id, // jim
      total: 44.98,
      status: "pending",
      items: {
        create: [
          { productId: products[22].id, quantity: 1, price: 49.99 },
        ],
      },
    },
  });

  console.log(`Created 3 orders`);

  // Seed Challenges
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        name: "SQL Injection - Login",
        description: "Perform a SQL Injection attack on the login form to bypass authentication.",
        category: "Injection",
        difficulty: 2,
        hint: "Try using classic SQL injection payloads like ' OR 1=1-- in the email field.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "SQL Injection - Search",
        description: "Use SQL Injection to extract data from the search functionality.",
        category: "Injection",
        difficulty: 3,
        hint: "The search parameter is vulnerable. Try UNION-based injection.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Stored XSS - Reviews",
        description: "Inject a malicious script through the product review system that persists and executes for other users.",
        category: "XSS",
        difficulty: 2,
        hint: "Try posting a review with a script tag or an event handler attribute.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Reflected XSS - Search",
        description: "Inject a script through the search field that gets reflected back and executed.",
        category: "XSS",
        difficulty: 2,
        hint: "The search query gets reflected in the response. Try injecting script tags.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Broken Authentication - Admin Login",
        description: "Log in as the administrator without knowing the admin password.",
        category: "Broken Authentication",
        difficulty: 3,
        hint: "The login API accepts role in the request body during registration.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Broken Authentication - Brute Force",
        description: "Brute force a user's password through the login endpoint.",
        category: "Broken Authentication",
        difficulty: 2,
        hint: "There is no rate limiting on the login endpoint. Try common passwords.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Sensitive Data Exposure - Passwords",
        description: "Find a way to access other users' password information.",
        category: "Sensitive Data Exposure",
        difficulty: 3,
        hint: "The admin API endpoint might expose more data than it should.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Sensitive Data Exposure - Base64",
        description: "Decode the admin's base64-encoded password to discover the plaintext.",
        category: "Sensitive Data Exposure",
        difficulty: 1,
        hint: "Some users have passwords that look like Base64 encoding. Try decoding them.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "IDOR - View Other Orders",
        description: "Access another user's order details that you shouldn't be able to see.",
        category: "Broken Access Control",
        difficulty: 2,
        hint: "The orders API doesn't verify that you own the orders you're requesting.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "IDOR - Product Details",
        description: "Access product information you shouldn't be able to see.",
        category: "Broken Access Control",
        difficulty: 1,
        hint: "Try accessing products by manipulating the product ID in the URL.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Mass Assignment - Admin Role",
        description: "Register a new user with admin privileges through mass assignment.",
        category: "Broken Access Control",
        difficulty: 2,
        hint: "The registration endpoint accepts more fields than just email and password.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Admin Section Access",
        description: "Access the admin-only section of the application without proper authorization.",
        category: "Broken Access Control",
        difficulty: 3,
        hint: "The admin endpoint only checks for a specific header, not actual authentication.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Information Disclosure - Error Messages",
        description: "Trigger an error that reveals sensitive internal information about the application.",
        category: "Security Misconfiguration",
        difficulty: 1,
        hint: "Try sending malformed data to the API endpoints and examine error messages.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Security Misconfiguration - HTTP Headers",
        description: "Identify missing or misconfigured security headers in the API responses.",
        category: "Security Misconfiguration",
        difficulty: 2,
        hint: "Check the HTTP response headers for missing security headers like CSP, X-Frame-Options, etc.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Cross-Site Request Forgery",
        description: "Perform a CSRF attack by crafting a malicious request that modifies another user's data.",
        category: "CSRF",
        difficulty: 3,
        hint: "The API doesn't implement CSRF protection. Try crafting a cross-origin request.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Insecure Direct Object Reference - User Data",
        description: "Access another user's personal information by manipulating references.",
        category: "Broken Access Control",
        difficulty: 2,
        hint: "Try changing user IDs in API requests to access other users' data.",
      },
    }),
    prisma.challenge.create({
      data: {
        name: "Unrestricted Resource Consumption",
        description: "Demonstrate how the API allows unlimited data retrieval without pagination or rate limiting.",
        category: "Security Misconfiguration",
        difficulty: 1,
        hint: "Request all products and observe the lack of pagination controls.",
      },
    }),
  ]);

  console.log(`Created ${challenges.length} challenges`);

  console.log("\n✅ Database seeded successfully!");
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
