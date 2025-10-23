# 🛍️ Shop-Ease - Smart E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js, featuring AI-powered recommendations, comprehensive admin dashboard, and multiple payment integrations.

![Shop-Ease Logo](https://img.shields.io/badge/Shop--Ease-Smart%20Shopping-blue?style=for-the-badge&logo=shopping-cart)

## ✨ Features

### 🎯 Customer Features
- **AI-Powered Recommendations**: Personalized product suggestions using collaborative and content-based filtering
- **Smart Shopping Cart**: Add, remove, and manage items with real-time updates
- **Wishlist Management**: Save favorite products for later purchase
- **Order Tracking**: Complete order lifecycle management
- **Product Reviews & Ratings**: Customer feedback system with star ratings
- **Address Management**: Multiple shipping addresses support
- **User Authentication**: Secure login/register with email verification
- **Responsive Design**: Mobile-first approach with modern UI/UX

### 🔧 Admin Features
- **Comprehensive Dashboard**: Real-time analytics and key performance metrics
- **Product Management**: Create, edit, delete products with image uploads
- **Category Management**: Organize products with hierarchical categories
- **Order Management**: Process orders, update statuses, and handle cancellations
- **Customer Management**: View customer profiles, manage account status
- **Feedback Management**: Monitor and respond to customer reviews
- **Revenue Analytics**: Track sales performance and trends
- **Inventory Management**: Monitor stock levels and low-stock alerts

### 💳 Payment Integration
- **Stripe Integration**: Secure online payments with credit/debit cards
- **Cash on Delivery**: Traditional payment method support
- **Extensible Architecture**: Easy to add new payment methods (PayPal, Razorpay, etc.)
- **Refund Processing**: Automated refund handling

### 🤖 AI & Recommendations
- **Collaborative Filtering**: Recommendations based on similar users
- **Content-Based Filtering**: Suggestions based on product attributes
- **Trending Products**: Popular items across the platform
- **Similar Products**: Find related items based on current selection
- **Personalized Experience**: Tailored recommendations for each user

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with SSR/SSG
- **React 19.1.0** - Modern React with latest features
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **TypeScript** - Type-safe development
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing

### Database
- **MongoDB** - NoSQL database for scalability

### Services
- **Stripe** - Payment processing
- **Resend** - Email service for notifications
- **Swagger** - API documentation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Stripe account (for payments)
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shop-ease.git
   cd shop-ease
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/shop-ease
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   
   # Email Service
   RESEND_API_KEY=your_resend_api_key
   
   # App Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
shop-ease/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components (Button, Card, Input)
│   │   ├── layout/         # Layout components
│   │   ├── Navbar.jsx      # Navigation component
│   │   └── Footer.jsx      # Footer component
│   ├── lib/                # Core application logic
│   │   ├── controllers/    # API route handlers
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Authentication & file upload
│   │   ├── utils/          # Utility functions
│   │   └── db/             # Database connection
│   ├── pages/              # Next.js pages and API routes
│   │   ├── api/            # API endpoints
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Authentication pages
│   │   └── index.tsx       # Home page
│   └── styles/             # Global styles
├── public/                 # Static assets
│   ├── uploads/           # User uploaded files
│   └── swagger/           # API documentation assets
└── README.md
```

## 🔌 API Documentation

The API is fully documented with Swagger. Access the interactive documentation at:
- **Development**: `http://localhost:3000/api/docs/swagger.json`
- **Swagger UI**: `http://localhost:3000/swagger.html`

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `GET /api/auth/me` - Get current user (customer/admin)

#### Products
- `GET /api/public/products` - Get all products
- `GET /api/public/products/[id]` - Get product details
- `POST /api/admin/product` - Create product (Admin)
- `PUT /api/admin/product/[id]` - Update product (Admin)

#### Orders
- `GET /api/customer/order` - Get user orders
- `POST /api/customer/order` - Create new order
- `GET /api/admin/orders` - Get all orders (Admin)

#### Recommendations
- `GET /api/customer/recommendations` - Get personalized recommendations
- `GET /api/customer/recommendations/trending` - Get trending products
- `GET /api/customer/recommendations/similar/[id]` - Get similar products

## 🎨 Design System

The application uses a consistent design system with:
- **Color Palette**: Primary blues and purples with accent colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Reusable UI components with consistent styling
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG compliant with proper contrast ratios

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Joi schema validation for all inputs
- **File Upload Security**: Secure file handling with type validation
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API endpoint protection

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React/Next.js expertise
- **Backend Development**: Node.js/TypeScript
- **Database Design**: MongoDB/Mongoose
- **UI/UX Design**: Modern, responsive design
- **DevOps**: Deployment and CI/CD

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/shop-ease/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Roadmap

### Upcoming Features
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Social media integration
- [ ] Advanced search with filters
- [ ] Inventory management system
- [ ] Multi-vendor support
- [ ] Advanced recommendation algorithms

### Performance Improvements
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Database indexing
- [ ] CDN integration
- [ ] Progressive Web App (PWA)

---

**Made with ❤️ by the Shop-Ease Team**

*Smart Shopping Experience for Everyone*
