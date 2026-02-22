# StayEase - DNS & Domain Configuration Guide

## Overview

This guide demonstrates how to configure your Name.com domain to point to StayEase infrastructure hosted on AWS.

## Prerequisites

- Domain registered with Name.com
- AWS infrastructure deployed (CloudFront, ALB, etc.)
- Access to Name.com dashboard
- Access to AWS Console for resource values

## Getting AWS Resource Information

### 1. CloudFront Distribution Domain

```bash
aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].DomainName' \
  --output text
```

**Expected Output**: `d123abc.cloudfront.net`

### 2. Application Load Balancer DNS

```bash
aws elbv2 describe-load-balancers \
  --names stayease-alb \
  --region us-east-1 \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

**Expected Output**: `stayease-alb-1234567.us-east-1.elb.amazonaws.com`

### 3. ACM Certificate Status

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID \
  --region us-east-1
```

Check that:
- Status is `ISSUED`
- DomainName matches your domain
- SubjectAlternativeNames include `*.yourdomain.com`

## Name.com DNS Configuration

### Step 1: Access Name.com DNS Settings

1. Log in to [Name.com](https://www.name.com)
2. Go to **My Domains**
3. Find your domain and click **Manage DNS**

### Step 2: Add DNS Records

#### Record 1: WWW Subdomain (Frontend via CloudFront)

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Host** | www |
| **Target** | `d123abc.cloudfront.net` |
| **TTL** | 3600 (1 hour) |

**Steps**:
1. Click "Add Record"
2. Select Type: **CNAME**
3. Enter Host: **www**
4. Enter Target: Your CloudFront domain
5. Click **Save**

#### Record 2: API Subdomain (Backend via ALB)

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Host** | api |
| **Target** | `stayease-alb-xxxx.us-east-1.elb.amazonaws.com` |
| **TTL** | 600 (10 minutes) |

**Steps**:
1. Click "Add Record"
2. Select Type: **CNAME**
3. Enter Host: **api**
4. Enter Target: Your ALB DNS name
5. Click **Save**

#### Record 3: Root Domain (Optional - Redirect to WWW)

| Field | Value |
|-------|-------|
| **Type** | A (or ANAME if supported) |
| **Host** | @ |
| **Target** | CloudFront IP or redirect |
| **TTL** | 3600 |

**Note**: Name.com may require using a forwarding service or CNAME at root.

#### Record 4: SSL Verification (if not auto-validated)

If AWS ACM requires DNS validation:

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Host** | `_xxx.yourdomain.com` |
| **Target** | AWS provided validation CNAME |
| **TTL** | 300 |

## Complete DNS Record Layout

After configuration, your DNS should look like:

```
NAME.COM DNS RECORDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type    Host                Target
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CNAME   www                 d123abc.cloudfront.net
CNAME   api                 stayease-alb-xxxx.us-east-1.elb.amazonaws.com
A       @                   CloudFront IP (auto-populated)
CNAME   _xxx.yourdomain.com AWS ACM Validation CNAME (if needed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## DNS Propagation Verification

### Check Propagation Status

```bash
# Check www subdomain
nslookup www.yourdomain.com

# Expected output:
# Non-authoritative answer:
# Name: www.yourdomain.com
# Address: CloudFront IP

# Check api subdomain
nslookup api.yourdomain.com

# Expected output:
# Non-authoritative answer:
# Name: api.yourdomain.com
# Address: ALB IP
```

### Online Verification Tools

Use these services to verify DNS propagation:

1. **MXToolbox**: https://mxtoolbox.com/dnslookup.aspx
2. **DNS Checker**: https://dnschecker.org/
3. **What's My DNS**: https://www.whatsmydns.net/

### Propagation Timeline

| Time | Status |
|------|--------|
| 0-5 min | Changes in progress |
| 5-15 min | Most ISPs updated |
| 15-48 hrs | Full global propagation |
| 48 hrs+ | All propagation complete |

## SSL/TLS Configuration

### Verify Certificate

```bash
# Check certificate validity
openssl s_client -connect www.yourdomain.com:443

# Look for:
# subject=CN=yourdomain.com
# issuer=C=US,O=Amazon,CN=Amazon RSA 2048 M03
```

### Force HTTPS Redirect

Configured in your ALB listener:

```
HTTP (80) → Redirect → HTTPS (443)
Status Code: 301 (Permanent Redirect)
```

### Certificate Renewal

AWS ACM automatically renews certificates. No action needed.

## Troubleshooting

### Problem: Domain not resolving

**Solution**:
```bash
# Check Name.com nameservers
nslookup -type=NS yourdomain.com

# Should show:
# ns1.name.com
# ns2.name.com
# ns3.name.com
# ns4.name.com

# If different, update nameservers in domain registrar
```

### Problem: www resolves but api doesn't

**Solution**:
1. Verify CNAME record for `api` exists
2. Check ALB is running: `aws elbv2 describe-load-balancers`
3. Verify security group allows port 443
4. Check ALB listener is configured for HTTPS

### Problem: SSL certificate not trusted

**Solution**:
```bash
# Verify certificate details
aws acm describe-certificate \
  --certificate-arn <CERT_ARN> \
  --region us-east-1

# Check status is ISSUED
# Check DomainName matches your domain
```

### Problem: Slow DNS resolution

**Solution**:
1. Reduce TTL to 300 seconds
2. Clear local DNS cache:
   - **Windows**: `ipconfig /flushdns`
   - **Mac**: `sudo dscacheutil -flushcache`
   - **Linux**: `sudo systemctl restart systemd-resolved`

## Testing After Configuration

### Frontend Test

```bash
curl -I https://www.yourdomain.com

# Expected:
# HTTP/2 200
# Content-Type: text/html
# Server: CloudFront
```

### API Test

```bash
curl -I https://api.yourdomain.com/health

# Expected:
# HTTP/2 200
# Content-Type: application/json
# {"status":"ok"}
```

### Browser Test

1. Open https://www.yourdomain.com
   - Should load frontend
   - SSL certificate should be valid (green lock)
   - No security warnings

2. Open https://api.yourdomain.com/health
   - Should return JSON: `{"status":"ok"}`
   - SSL certificate should be valid

3. Test login at https://www.yourdomain.com/login
   - Should make request to https://api.yourdomain.com/auth/login

## Security Configuration

### HSTS Headers

Already configured via Helmet in backend:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### CORS Configuration

Configured in backend:

```javascript
corsConfig: {
  origin: 'https://www.yourdomain.com',
  credentials: true,
}
```

### WAF Rules (Optional)

To add AWS WAF protection:

```bash
# Create WAF Web ACL
aws wafv2 create-web-acl \
  --region us-east-1 \
  --name stayease-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules Priority=0,Statement={...}
```

## Monitoring & Analytics

### CloudFront Metrics

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-07T00:00:00Z \
  --period 86400 \
  --statistics Sum
```

### ALB Metrics

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=... \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-07T00:00:00Z \
  --period 3600 \
  --statistics Average
```

## Common Configurations

### Multi-Region Setup

To add additional regions:

1. Create CloudFront origin group with multiple ALBs
2. Add CNAME records in Name.com for each region (optional)
3. Configure ALB failover health checks

### Custom Domain with Subdomain

| Subdomain | Use Case | Target |
|-----------|----------|--------|
| www | Main website | CloudFront |
| api | API server | ALB |
| admin | Admin panel | CloudFront (separate) |
| cdn | Asset CDN | S3 + CloudFront |
| mail | Email | Email provider MX record |

### Using Apex Domain

If you want to use `yourdomain.com` instead of `www.yourdomain.com`:

1. Use ALIAS record (if Name.com supports)
2. Or use DNS forwarder to redirect to www
3. Update CORS in backend to accept apex domain

## References

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [Name.com DNS Management](https://www.name.com/support/article/dns-management)
- [ACM Certificate Documentation](https://docs.aws.amazon.com/acm/)

## Support

For issues with:
- **AWS Configuration**: See AWS documentation or contact AWS support
- **Name.com DNS**: Contact Name.com support
- **Application**: Check backend logs in CloudWatch

---

**Last Updated**: January 2024
**Domain**: yourdomain.com
**Region**: us-east-1
