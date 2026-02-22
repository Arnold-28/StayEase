# StayEase - Enterprise-Grade Homestay Rental Platform

A production-ready, fully-featured Airbnb-like platform for managing and booking family-run homestays with advanced security, real-time availability, smart pricing, QR-based check-in, and integrated payment processing.

## 🚀 Key Features

### User Features
- 🏠 Browse and search properties with advanced filters
- 📅 Real-time availability checking and smart date picking
- 💰 Dynamic pricing with weekly/monthly discounts
- 💳 Secure payment processing (Stripe & Razorpay)
- ⭐ Review and rating system
- 📱 Fully responsive design (320px - 2560px)
- 🎬 Netflix-inspired UI with smooth animations

### Owner Features
- 🔧 Complete property management (CRUD with image uploads)
- 📊 Comprehensive analytics dashboard
- 📆 Booking calendar with color coding
- 📱 QR code scanner for check-ins
- 💵 Refund management system
- 📈 Revenue tracking and insights

### Security & Compliance
- 🔒 JWT authentication with refresh tokens
- 🔐 bcrypt password hashing
- 🛡️ HTTPS/SSL (AWS ACM)
- 🚫 CSRF, XSS, SQL injection protection
- ⚡ Rate limiting and CORS whitelist
- 📝 Input validation with Joi
- 🔑 AWS Secrets Manager for sensitive data
- 🔓 PCI-compliant payment processing
- 📋 RBAC (Guest & Owner roles)

### Technology Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Framer Motion (smooth animations)
- Zustand (state management)
- Axios (HTTP client)

**Backend**
- Node.js + Express
- TypeScript
- PostgreSQL (AWS RDS)
- Prisma ORM
- Redis caching
- Stripe & Razorpay
- AWS S3 + CloudFront

**Infrastructure**
- AWS EC2/ECS
- Terraform (Infrastructure as Code)
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- CloudWatch monitoring

## 📋 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- AWS Account (for production)
- Git

### Local Development (5 minutes)

\`\`\`bash
# Clone repository
git clone <repository-url>
cd StayEase

# Start all services with one command
docker-compose up

# Services running on:
# Frontend: [http://localhost:5173](http://127.0.0.1:5177/)
# Backend:  http://localhost:3001
# Database: localhost:5432
# Redis:    localhost:6379
\`\`\`

### Default Test Credentials

**Owner Account**
- Email: \`owner@stayease.com\`
- Password: \`DemoOwner@123\`

**Guest Account**
- Email: \`guest@stayease.com\`
- Password: \`DemoGuest@123\`

### Manual Setup

\`\`\`bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
\`\`\`

## 🏗️ Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)              │
│              CloudFront CDN + S3 (Production)           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│         Application Load Balancer (AWS ALB)             │
│            Auto Scaling Group (1-3 instances)           │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐  ┌─────▼─────┐   ┌────▼────┐
   │ Backend  │  │ PostgreSQL │   │  Redis  │
   │(Express) │  │  (RDS)     │   │(Cache)  │
   └──────────┘  └────────────┘   └─────────┘
                       ▲               │
                       │               │
                  Prisma ORM      Connection Pool
                       │
                    AWS RDS
\`\`\`

## 📁 Project Structure

\`\`\`
StayEase/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── app.ts             # Express app
│   │   ├── middleware/        # Auth, error, security
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Business logic
│   │   ├── services/          # Database operations
│   │   ├── schemas/           # Validation
│   │   └── utils/             # Helpers
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Initial data
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   ├── store/             # Zustand stores
│   │   └── styles/            # Tailwind CSS
│   ├── Dockerfile
│   └── package.json
│
├── infrastructure/             # Infrastructure as Code
│   ├── terraform/
│   │   ├── main.tf            # AWS infrastructure
│   │   └── user_data.sh       # EC2 setup script
│   └── kubernetes/            # K8s manifests (optional)
│
├── .github/workflows/         # GitHub Actions
│   └── ci-cd.yml              # Automated deployment
│
├── docker-compose.yml         # Local development
└── docs/                      # Documentation
    ├── DEPLOYMENT.md          # Detailed deployment guide
    ├── DOMAIN_SETUP.md        # DNS configuration
    └── PRODUCTION_CHECKLIST.md # Pre-deployment checklist
\`\`\`

## 🔌 API Endpoints

### Authentication
\`\`\`
POST   /api/auth/register              # User registration
POST   /api/auth/login                 # User login
POST   /api/auth/refresh               # Refresh token
POST   /api/auth/logout                # Logout
GET    /api/auth/me                    # Current user
POST   /api/auth/change-password       # Change password
\`\`\`

### Properties
\`\`\`
GET    /api/properties                 # List all
GET    /api/properties/search?city=... # Search
GET    /api/properties/:id             # Get details
POST   /api/properties                 # Create (OWNER)
PATCH  /api/properties/:id             # Update (OWNER)
DELETE /api/properties/:id             # Delete (OWNER)
POST   /api/properties/:id/unavailable-dates
DELETE /api/properties/:id/unavailable-dates/:date
\`\`\`

### Bookings
\`\`\`
POST   /api/bookings/check-availability    # Verify dates
POST   /api/bookings/calculate-price       # Get quote
POST   /api/bookings                       # Create (GUEST)
GET    /api/bookings                       # User's bookings
GET    /api/bookings/:id                   # Get details
POST   /api/bookings/:id/cancel            # Cancel
\`\`\`

### Payments
\`\`\`
POST   /api/payments/stripe/create-intent  # Stripe setup
POST   /api/payments/stripe/confirm        # Confirm payment
POST   /api/payments/razorpay/create-order # Razorpay setup
POST   /api/payments/razorpay/verify       # Verify payment
GET    /api/payments/:bookingId            # Get details
POST   /api/payments/:bookingId/refund     # Request refund
\`\`\`

### QR Codes
\`\`\`
POST   /api/qr-codes/:bookingId/generate   # Generate QR
GET    /api/qr-codes/:bookingId            # Get QR details
POST   /api/qr-codes/verify                # Verify QR (check-in)
GET    /api/qr-codes/statistics            # Dashboard stats
\`\`\`

### Reviews
\`\`\`
POST   /api/reviews                        # Leave review
GET    /api/reviews/property/:propertyId   # Get reviews
DELETE /api/reviews/:id                    # Delete review
\`\`\`

## 🚀 Deployment

### Local Development
\`\`\`bash
docker-compose up
\`\`\`

### Production Deployment (AWS)
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete guide

Quick version:
\`\`\`bash
# 1. Infrastructure
cd infrastructure/terraform
terraform init
terraform plan
terraform apply

# 2. Environment Variables
export $(cat .env.production | xargs)

# 3. GitHub Actions
git push main  # Automatic deployment via CI/CD

# 4. Domain Configuration
# See docs/DOMAIN_SETUP.md for Name.com DNS setup
\`\`\`

### Domain Configuration (Name.com)

1. Add CNAME for \`www\` → CloudFront distribution
2. Add CNAME for \`api\` → ALB DNS name
3. SSL automatically handled by AWS ACM
4. Full guide: [docs/DOMAIN_SETUP.md](docs/DOMAIN_SETUP.md)

## 📊 Performance Metrics

### Frontend
- Lighthouse Score: **≥ 90**
- Time to Interactive: **< 3s**
- Largest Contentful Paint: **< 2.5s**

### Backend
- API Response Time: **< 200ms** (p95)
- Database Queries: **< 100ms** (p95)
- Cache Hit Rate: **> 80%**
- Error Rate: **< 1%**

### Infrastructure
- Uptime: **99.5%+**
- Database Backup: **Daily**
- Disaster Recovery: **< 1 hour RTO**

## 🔒 Security Features

- [x] HTTPS/SSL with forced redirect
- [x] JWT authentication (15min access + 7-day refresh)
- [x] Password hashing with bcrypt (10 rounds)
- [x] Rate limiting (100 req/15min)
- [x] CORS whitelist by domain
- [x] CSRF protection
- [x] XSS prevention
- [x] SQL injection prevention
- [x] Input validation (Joi)
- [x] Helmet security headers
- [x] AWS Secrets Manager integration
- [x] KMS encryption for sensitive data
- [x] PCI compliance for payments

## 📚 Documentation

- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Complete deployment guide
- **[docs/DOMAIN_SETUP.md](docs/DOMAIN_SETUP.md)** - DNS & domain configuration
- **[docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md)** - Pre-deployment checklist

## 🧪 Testing

\`\`\`bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
\`\`\`bash
# Find process on port
lsof -i :3001
# Kill process
kill -9 <PID>
\`\`\`

**Database connection failed**
\`\`\`bash
# Check PostgreSQL is running
docker ps | grep postgres
\`\`\`

**Frontend API connection error**
\`\`\`bash
# Verify backend is running
curl http://localhost:3001/health
\`\`\`

More help: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📝 License

MIT License - See LICENSE file

## 👥 Contributing

Contributions welcome! Please fork, create feature branch, and submit PR.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Wishlist feature

## 📧 Contact

**Website**: https://www.yourdomain.com
**Email**: dev@stayease.com

---

**Version**: 1.0.0
**Status**: Production Ready ✅
