#!/bin/bash
set -e

# Update system
yum update -y
yum install -y nodejs git docker

# Start Docker
systemctl start docker
systemctl enable docker

# Create application directory
mkdir -p /opt/stayease
cd /opt/stayease

# Clone repository (you'll need to set this up)
# git clone <your-repo-url> .

# Create environment file
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://stayease_admin:${db_password}@${db_endpoint}
REDIS_URL=redis://${redis_endpoint}:6379
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
AWS_S3_BUCKET=${s3_bucket}
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://www.yourdomain.com
EOF

# Install Node dependencies
npm ci --omit=dev

# Build TypeScript
npm run build

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start dist/index.js --name stayease-api
pm2 save
pm2 startup

# Setup log rotation
cat > /etc/logrotate.d/stayease << 'LOGROTATE'
/var/log/stayease/*.log {
  daily
  rotate 7
  compress
  missingok
  notifempty
  create 0640 root root
}
LOGROTATE

echo "StayEase Backend Setup Complete"
