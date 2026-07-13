# 🍔 Food Delivery Platform

A full-stack **food delivery web application** built with **Node.js**, **Express**, **MongoDB**, and **EJS** — supporting four distinct user roles: **Customer**, **Restaurant Owner**, **Delivery Boy**, and **Admin**.

---

## 🚀 Features

### 👤 Customer
- Register / Login with email verification
- Browse restaurants and food items
- Manage cart & checkout
- Track orders in real-time
- Manage delivery addresses
- Write reviews & ratings
- Wishlist favourite food items
- View order history

### 🏪 Restaurant Owner
- Owner dashboard with sales analytics
- Manage restaurant profile & menu
- Add/edit food items with images
- Manage categories & addons
- Create discount offers & coupons
- Monitor assigned delivery riders
- View & manage incoming orders

### 🚴 Delivery Boy
- Dedicated delivery dashboard
- View assigned orders
- Update live delivery location
- Track earnings
- Manage delivery profile

### 🛡️ Admin
- Admin dashboard with platform-wide stats
- Manage users (customers, owners, delivery boys)
- Manage all restaurants, foods & categories
- Manage orders & payments
- Create banners & platform-wide offers
- Generate reports
- Platform settings control

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| **Runtime**  | Node.js                             |
| **Framework**| Express.js v5                       |
| **Database** | MongoDB + Mongoose v9               |
| **Templating**| EJS (Embedded JavaScript)          |
| **Auth**     | JWT + bcryptjs + Cookie-based sessions |
| **File Uploads** | Multer                          |
| **Validation**| express-validator                  |
| **Rate Limiting**| express-rate-limit              |
| **Logging**  | Winston                             |
| **Dev Tool** | Nodemon                             |

---

## 📁 Project Structure

```
Project_food-delivery/
│
├── app.js                  # Express app setup & middleware
├── server.js               # Server entry point & DB connection
├── package.json
│
├── config/
│   └── database.js         # MongoDB connection config
│
├── controllers/            # Route handler logic
│   ├── adminController.js
│   ├── authController.js
│   ├── cartController.js
│   ├── categoryController.js
│   ├── deliveryController.js
│   ├── foodController.js
│   ├── notificationController.js
│   ├── orderController.js
│   ├── ownerController.js
│   ├── paymentController.js
│   ├── restaurantController.js
│   ├── reviewController.js
│   └── userController.js
│
├── middleware/
│   └── auth.js             # JWT auth & role-based access
│
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Restaurant.js
│   ├── Food.js
│   ├── Order.js
│   ├── Cart.js / CartItem.js
│   ├── Category.js
│   ├── Coupon.js
│   ├── DeliveryBoy.js
│   ├── DeliveryLiveLocation.js
│   ├── Payment.js
│   ├── Review.js / Rating.js
│   ├── Notification.js
│   ├── Wishlist.js
│   ├── Address.js
│   ├── OrderHistory.js
│   ├── Banner.js
│   ├── Contact.js
│   ├── Addon.js
│   └── Setting.js
│
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── ownerRoutes.js
│   ├── customerRoutes.js
│   └── deliveryRoutes.js
│
├── views/                  # EJS templates
│   ├── partials/           # Shared header/footer
│   ├── admin-*.ejs         # Admin pages
│   ├── owner-*.ejs         # Owner pages
│   ├── delivery-*.ejs      # Delivery boy pages
│   └── *.ejs               # Customer-facing pages
│
├── public/                 # Static assets (CSS, JS, images)
│   └── css/
│
├── uploads/                # User-uploaded images (served statically)
├── utils/
│   ├── errorHandler.js
│   ├── logger.js
│   └── seeder.js           # Auto-seeds 160 restaurants & food items
└── logs/                   # Winston log files
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally or a connection URI

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Project_food-delivery.git
cd Project_food-delivery
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URI=mongodb://127.0.0.1:27017/Food_Delivery
PORT=555
NODE_ENV=development
COOKIE_SECRET=your_cookie_secret
JWT_SECRET=your_jwt_secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Run the development server

```bash
npm run dev
```

The server will start at **http://localhost:555**

### 5. Seed the database (optional)

The app **auto-seeds** 160 Swiggy & Zomato-style restaurant and food items on startup if the database is empty. You can also manually seed:

```bash
npm run seed
```

---

## 🔐 User Roles & Access

| Role               | Login Route           | Dashboard Route       |
|--------------------|-----------------------|-----------------------|
| Customer           | `/login`              | `/dashboard`          |
| Restaurant Owner   | `/owner/login`        | `/owner/dashboard`    |
| Delivery Boy       | `/delivery/login`     | `/delivery/dashboard` |
| Admin              | `/admin/login`        | `/admin/dashboard`    |

---

## 📦 Key NPM Scripts

| Script         | Command            | Description                          |
|----------------|--------------------|--------------------------------------|
| `dev`          | `npm run dev`      | Start with Nodemon (auto-restart)    |
| `seed`         | `npm run seed`     | Manually seed the database           |

---

## 🔒 Security Features

- **JWT Authentication** via signed HTTP-only cookies
- **bcryptjs** password hashing (12 salt rounds)
- **Rate Limiting** — 100 requests per 15 minutes globally
- **Email Verification** with crypto token & expiry
- **Role-based Access Control** via middleware
- **Input Validation** with express-validator
- **Request body size limit** — 25kb

---

## 📝 License

This project is licensed under the **ISC License**.

---

> Built with ❤️ using Node.js, Express & MongoDB
