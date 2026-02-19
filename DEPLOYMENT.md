# CORRIESELLS - Deployment Guide

Complete instructions for deploying your e-commerce website to production.

## 📋 Pre-Deployment Checklist

### Content
- [ ] All product images uploaded and optimized
- [ ] Contact information updated (address, phone, email)
- [ ] Social media links configured
- [ ] Newsletter service connected
- [ ] Payment methods configured
- [ ] Shipping rates finalized

### Technical
- [ ] SSL certificate obtained
- [ ] Domain name configured
- [ ] DNS records updated
- [ ] Analytics setup (Google Analytics ID ready)
- [ ] Email service configured (SendGrid, Mailgun)
- [ ] Database schema created (if using backend)

### Legal
- [ ] Privacy Policy customized for your jurisdiction
- [ ] Terms of Service reviewed by legal counsel
- [ ] Cookie policy finalized
- [ ] GDPR/CCPA compliance verified
- [ ] Return policy aligned with business rules

### Testing
- [ ] All pages tested on desktop, tablet, mobile
- [ ] Forms tested and working
- [ ] Shopping cart functionality verified
- [ ] Checkout process tested
- [ ] Links verified (no 404 errors)
- [ ] Performance tested (Core Web Vitals)
- [ ] SEO meta tags verified

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for static sites)

**Advantages:**
- Free tier available
- Automatic HTTPS
- Fast global CDN
- Easy deployment from Git
- Built-in analytics

**Steps:**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/CORRIESELLS.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Keep default settings
   - Click "Deploy"

3. **Configure Custom Domain:**
   - In Vercel dashboard → Settings → Domains
   - Add your domain (corriesells.com)
   - Update nameservers at your domain registrar

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxx
```

### Option 2: Netlify (Alternative static hosting)

**Steps:**

1. **Connect Repository:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect GitHub account
   - Select repository
   - Deploy

2. **Build Settings:**
   - Build command: (leave empty for static)
   - Publish directory: `.` (root)

3. **Domain Configuration:**
   - Settings → Domain Management
   - Add custom domain
   - Update nameservers

### Option 3: AWS S3 + CloudFront (Scalable option)

**Steps:**

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://corriesells.com
   ```

2. **Upload Files:**
   ```bash
   aws s3 sync . s3://corriesells.com --delete
   ```

3. **Configure for Website Hosting:**
   - Properties → Static website hosting
   - Index document: index.html
   - Error document: pages/404.html

4. **Set CloudFront Distribution:**
   - Origin: your S3 bucket
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Alternate domain names: corriesells.com, www.corriesells.com
   - Certificate: AWS Certificate Manager (free)

5. **Invalidate Cache After Updates:**
   ```bash
   aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
   ```

### Option 4: Traditional Web Hosting (cPanel/Shared Hosting)

**Steps:**

1. **FTP Upload:**
   ```bash
   ftp ftp.corriesells.com
   > put -r . public_html/
   ```

2. **Configure SSL:**
   - cPanel → AutoSSL
   - Install Let's Encrypt certificate (free)

3. **Set Error Pages:**
   - .htaccess configuration:
   ```
   ErrorDocument 404 /pages/404.html
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^(.*)$ index.html [QSA,L]
   </IfModule>
   ```

## 🔧 Performance Optimization

### Image Optimization
```bash
# Install ImageMagick
brew install imagemagick

# Convert to WebP
mogrify -format webp *.jpg

# Optimize PNG
pngquant images/*.png --ext .png --force
```

### CSS & JS Minification
```bash
# Using csso-cli
npm install -g csso-cli
csso assets/css/styles.css -o assets/css/styles.min.css

# Using terser
npm install -g terser
terser assets/js/main.js -o assets/js/main.min.js
```

### Update HTML to Use Minified Files
```html
<!-- Development -->
<link rel="stylesheet" href="assets/css/styles.css">
<script src="assets/js/main.js"></script>

<!-- Production -->
<link rel="stylesheet" href="assets/css/styles.min.css">
<script src="assets/js/main.min.js"></script>
```

## 📊 Analytics Setup

### Google Analytics
1. Create account at [google.com/analytics](https://google.com/analytics)
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Add to every page before closing `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Enhanced E-commerce Tracking
```javascript
// Track view item
gtag('event', 'view_item', {
    currency: 'USD',
    value: 9.99,
    items: [{
        item_id: 'SKU123',
        item_name: 'Product Name',
        price: 9.99
    }]
});

// Track purchase
gtag('event', 'purchase', {
    currency: 'USD',
    transaction_id: 'order123',
    value: 99.99,
    items: [...]
});
```

## 🔒 Security Hardening

### HTTPS/SSL
```
# Let's Encrypt (free)
certbot certonly --standalone -d corriesells.com -d www.corriesells.com

# Redirect HTTP to HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### Security Headers
```html
<!-- Add to <head> -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
```

### robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /pages/404.html

Sitemap: https://corriesells.com/sitemap.xml
```

### .htaccess Security Headers
```apache
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

## 📈 SEO Optimization

### Meta Tags (Add to <head> of each page)
```html
<!-- Primary Meta Tags -->
<meta name="title" content="CORRIESELLS - Premium Sustainable Clothing">
<meta name="description" content="Discover CORRIESELLS' collection of sustainable fashion inspired by cowrie shell aesthetics. Premium clothing with free shipping worldwide.">
<meta name="keywords" content="sustainable fashion, ethical clothing, cowrie shell, premium apparel">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://corriesells.com/">
<meta property="og:title" content="CORRIESELLS - Premium Sustainable Clothing">
<meta property="og:description" content="Discover CORRIESELLS' collection of sustainable fashion.">
<meta property="og:image" content="https://corriesells.com/assets/images/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://corriesells.com/">
<meta property="twitter:title" content="CORRIESELLS">
<meta property="twitter:description" content="Premium sustainable clothing">
<meta property="twitter:image" content="https://corriesells.com/assets/images/twitter-image.jpg">
```

### Structured Data (JSON-LD)
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CORRIESELLS",
    "url": "https://corriesells.com",
    "logo": "https://corriesells.com/assets/images/logo.png",
    "description": "Premium sustainable fashion",
    "sameAs": [
        "https://facebook.com/corriesells",
        "https://instagram.com/corriesells",
        "https://twitter.com/corriesells"
    ]
}
</script>
```

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          
      - name: Purge CloudFlare Cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CF_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CF_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"files":["*"]}'
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review analytics and user feedback
- [ ] Monthly: Security updates, dependency updates
- [ ] Quarterly: Performance audit, SEO review
- [ ] Annually: Security audit, compliance check

### Monitoring Tools
- **Uptime:** UptimeRobot (free)
- **Analytics:** Google Analytics
- **Performance:** Lighthouse, GTmetrix
- **Security:** SSL Labs, Mozilla Observatory
- **SEO:** Google Search Console, Ahrefs

### Contact Information
- Email: support@corriesells.com
- Phone: +254-41-471-6723 (Kenya)
- Hours: Monday-Friday 9AM-6PM EAT

---

**Deployment Status:** Ready for Production
**Last Updated:** January 2026
