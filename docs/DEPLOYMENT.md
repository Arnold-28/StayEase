# StayEase - Production-Ready Homestay Platform

A comprehensive, enterprise-grade Airbnb-like platform for managing and booking family-run homestays with advanced security, payment processing, and real-time availability management.

## Architecture Overview

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Design**: Netflix-inspired white theme with horizontal scrolling

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (AWS RDS)
- **Cache**: Redis (AWS ElastiCache)
- **ORM**: Prisma
- **Authentication**: JWT (access + refresh tokens)
- **Payment**: Stripe & Razorpay
- **File Storage**: AWS S3

### Infrastructure
- **Compute**: AWS EC2/ECS
- **Database**: AWS RDS PostgreSQL
- **Cache**: AWS ElastiCache Redis
- **Storage**: AWS S3 + CloudFront CDN
- **Load Balancing**: AWS ALB
- **SSL/TLS**: AWS ACM
- **IaC**: Terraform
- **Containerization**: Docker

## Features

### Core Features
✅ Property Management (CRUD with image uploads)
✅ Real-time availability validation
✅ Booking engine with date conflict prevention
✅ Secure payment processing (Stripe & Razorpay)
✅ QR code generation per booking
✅ QR code verification system
✅ Owner dashboard with analytics
✅ Booking calendar
✅ Review and rating system
✅ Responsive design (320px - 2560px)

### Security Features
✅ HTTPS only with HTTP to HTTPS redirect
✅ JWT authentication (access + refresh tokens)
✅ bcrypt password hashing
✅ HttpOnly secure cookies
✅ CSRF protection
✅ XSS prevention
✅ SQL injection protection
✅ Rate limiting
✅ CORS whitelist
✅ Input validation (Zod/Joi)
✅ AWS Secrets Manager
✅ AWS KMS encryption
✅ AWS WAF protection
✅ Helmet security headers

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- AWS Account
- Stripe/Razorpay Account

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd StayEase

# Start with Docker Compose
docker-compose up

# Backend will be available at http://localhost:3001
# Frontend will be available at http://localhost:5173

# Database credentials
POSTGRES_USER: stayease_user
POSTGRES_PASSWORD: stayease_password
POSTGRES_DB: stayease_db
```

### Initial Setup

```bash
# Backend setup
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## Project Structure

```
StayEase/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   └── user_data.sh
│   └── kubernetes/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
└── docs/
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/search` - Search properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (OWNER)
- `PATCH /api/properties/:id` - Update property (OWNER)
- `DELETE /api/properties/:id` - Delete property (OWNER)
- `POST /api/properties/:id/unavailable-dates` - Add unavailable dates
- `DELETE /api/properties/:id/unavailable-dates/:date` - Remove unavailable dates

### Bookings
- `POST /api/bookings/check-availability` - Check availability
- `POST /api/bookings/calculate-price` - Calculate price
- `POST /api/bookings` - Create booking (GUEST)
- `GET /api/bookings` - List user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/stripe/create-intent` - Create Stripe payment intent
- `POST /api/payments/stripe/confirm` - Confirm Stripe payment
- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify Razorpay payment
- `GET /api/payments/:bookingId` - Get payment details
- `POST /api/payments/:bookingId/refund` - Request refund

### QR Codes
- `POST /api/qr-codes/:bookingId/generate` - Generate QR code
- `GET /api/qr-codes/:bookingId` - Get QR code
- `POST /api/qr-codes/verify` - Verify QR code
- `GET /api/qr-codes/statistics` - Get QR statistics

### Reviews
- `POST /api/reviews` - Create review (GUEST)
- `GET /api/reviews/property/:propertyId` - Get property reviews
- `DELETE /api/reviews/:id` - Delete review

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/db
REDIS_URL=redis://host:6379
JWT_ACCESS_SECRET=<strong-random-key>
JWT_REFRESH_SECRET=<strong-random-key>
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
AWS_S3_BUCKET=stayease-uploads
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=<key>
RAZORPAY_KEY_SECRET=<secret>
QR_SIGNING_SECRET=<strong-random-key>
CORS_ORIGIN=https://www.yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=https://api.yourdomain.com/api
```

## Domain Configuration (Name.com)

### DNS Records Setup

1. **A Record for www subdomain** (Frontend via CloudFront)
   - Type: CNAME
   - Name: www
   - Value: `d123456.cloudfront.net`

2. **A Record for api subdomain** (Backend via ALB)
   - Type: CNAME
   - Name: api
   - Value: `stayease-alb-1234567.us-east-1.elb.amazonaws.com`

3. **Root domain** (Optional - redirect to www)
   - Type: A
   - Name: @
   - Points to CloudFront distribution

### Steps to Configure in Name.com Dashboard

1. Go to Domain Settings > DNS Records
2. Add the following records:
   ```
   CNAME   www     d123456.cloudfront.net
   CNAME   api     stayease-alb-xxxx.us-east-1.elb.amazonaws.com
   A       @       13.xxx.xxx.xxx (CloudFront IP)
   ```
3. Wait for DNS propagation (5-48 hours)
4. Verify with: `nslookup www.yourdomain.com`

## Production Deployment

### Prerequisites
- AWS Account with appropriate permissions
- Terraform installed
- AWS CLI configured
- Domain registered with Name.com

### Step 1: Infrastructure Setup

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply configuration
terraform apply tfplan

# Save outputs
terraform output
```

### Step 2: Configure GitHub Secrets

Add to GitHub repository secrets:
- `AWS_ACCOUNT_ID`: Your AWS account ID
- `FRONTEND_BUCKET`: S3 bucket name for frontend
- `CLOUDFRONT_DIST_ID`: CloudFront distribution ID
- `SLACK_WEBHOOK`: (Optional) For deployment notifications

### Step 3: Configure Environment Variables

Create `.env` files in production:

```bash
# Backend
STRIPE_SECRET_KEY=sk_live_...
RAZORPAY_KEY_ID=<production-key>
JWT_ACCESS_SECRET=<new-strong-secret>
JWT_REFRESH_SECRET=<new-strong-secret>

# Frontend
VITE_API_URL=https://api.yourdomain.com/api
```

### Step 4: Domain SSL Configuration

1. AWS ACM will automatically validate your domain
2. Create DNS CNAME record in Name.com for validation
3. Once validated, SSL is ready
4. HTTP requests automatically redirect to HTTPS

### Step 5: Database Migration

```bash
# SSH into backend instance
ssh -i your-key.pem ec2-user@backend-instance

# Run migrations
npm run prisma:migrate -- --name init

# Seed initial data
npm run prisma:seed
```

### Step 6: Enable Monitoring

```bash
# CloudWatch monitoring
aws cloudwatch put-metric-alarm \
  --alarm-name stayease-error-rate \
  --alarm-description "Alert on high error rates" \
  --metric-name ErrorCount \
  --namespace AWS/ApplicationELB

# Enable RDS backups (already configured)
# Enable S3 versioning (already configured)
```

## Performance Optimization

### Frontend Optimization
- Lazy loading images
- Code splitting via Vite
- CloudFront CDN caching
- Asset compression (gzip)
- Lighthouse score target: ≥90

### Backend Optimization
- Redis caching for frequently accessed data
- Database query optimization with indexes
- RDS Multi-AZ for failover
- Connection pooling
- Rate limiting to prevent abuse

### Database Optimization
- Indexes on frequently queried columns
- Partitioning for large tables
- Automated backups every 6 hours
- Point-in-time recovery enabled

## Security Checklist

- [ ] HTTPS/SSL enabled globally
- [ ] HTTP to HTTPS redirect active
- [ ] Database passwords stored in AWS Secrets Manager
- [ ] S3 buckets not publicly accessible
- [ ] VPC security groups properly configured
- [ ] IAM roles follow least privilege principle
- [ ] CloudTrail logging enabled
- [ ] WAF rules active
- [ ] Backup strategy automated
- [ ] Monitoring and alerts configured
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] Input sanitization active
- [ ] Helmet security headers active

## Monitoring & Logging

### CloudWatch Metrics
- Application error rates
- RDS performance
- ALB latency
- S3 request count
- ElastiCache hit rate

### Logs
- Backend: `/aws/ecs/stayease-backend`
- RDS: CloudWatch RDS logs
- CloudFront: S3 bucket for access logs

### Alerts
- High error rate (>5%)
- Database connection errors
- S3 upload failures
- Payment processing errors

## Backup & Disaster Recovery

### Automated Backups
- RDS: Daily snapshots (30-day retention)
- S3: Versioning enabled
- Database: Transaction logs for point-in-time recovery

### Recovery Procedures
1. RDS restore: `aws rds restore-db-instance-from-db-snapshot`
2. S3 restore: Recover from AWS S3 versions
3. Docker rebuild: Re-deploy via GitHub Actions

## Cost Optimization

### Recommended Settings
- RDS: db.t3.micro (free tier eligible)
- EC2: t3.micro/t3.small for backend (auto-scaling)
- S3: Standard with lifecycle policies
- CloudFront: Standard caching
- ElastiCache: cache.t3.micro

### Estimated Monthly Costs
- RDS: $0-50
- EC2: $0-30
- S3: $1-5
- CloudFront: $5-20
- ElastiCache: $0-15
- **Total: ~$40-120/month**

## Testing

### Backend Tests
```bash
npm run test
npm run test:cov
```

### Frontend Tests
```bash
npm run test
npm run test:cov
```

### End-to-End Tests (Recommended)
- Use Cypress or Playwright
- Test authentication flow
- Test booking creation
- Test payment processing
- Test QR code verification

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Update dependencies monthly
- Review security patches weekly
- Analyze performance metrics weekly
- Check backup completion status

### Scaling Considerations
- Increase ASG desired capacity if CPU > 70%
- Upgrade RDS instance type if queries slow
- Increase CloudFront cache TTL if hit rate < 80%
- Add more ElastiCache nodes if memory usage > 80%

## Support & Documentation

### API Documentation
- Postman collection (available in `/docs`)
- OpenAPI/Swagger specification (can be generated)

### Troubleshooting
- Check CloudWatch logs
- Review application monitoring dashboard
- Test database connectivity
- Verify AWS IAM permissions
- Check domain DNS records

## License

MIT License - See LICENSE file

## Contact

For support or questions, contact the development team.
