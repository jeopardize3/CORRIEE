# CORRIESELLS - E-Commerce Website

A premium, modern e-commerce website for selling sustainable clothing with a cowrie shell-inspired aesthetic. Built with HTML5, CSS3, and vanilla JavaScript.

## 📁 Project Structure

```
CORRIESELLS/
├── index.html                 # Homepage
├── sitemap.xml               # SEO sitemap
├── assets/
│   ├── css/
│   │   └── styles.css        # Complete CSS framework with design system
│   ├── js/
│   │   ├── main.js           # Core JavaScript functionality
│   │   └── navigation.js     # Navigation helper (reference)
│   └── images/               # Product images and assets
└── pages/
    ├── shop.html             # Product catalog with filters
    ├── product.html          # Single product detail page
    ├── about.html            # Brand story and values
    ├── contact.html          # Contact form
    ├── account.html          # User dashboard
    ├── wishlist.html         # Saved items
    ├── checkout.html         # Multi-step checkout
    ├── faq.html              # Frequently asked questions
    ├── returns.html          # Return policy
    ├── shipping.html         # Shipping information
    ├── size-guide.html       # Size measurements
    ├── privacy.html          # Privacy policy (GDPR/CCPA compliant)
    ├── terms.html            # Terms of service
    ├── cookies.html          # Cookie policy
    ├── accessibility.html    # Accessibility statement
    └── 404.html              # Error page
```

## 🎨 Design System

### Color Palette
- **Primary Background:** `#000000` (Black)
- **Primary Accent:** `#D4AF37` (Gold)
- **Secondary Accent:** `#F4C430` (Light Gold)
- **Text Color:** `#ffffff` (White)
- **Text Muted:** `#BDBDBD` (Light Gray)
- **Surface:** `#ffffff` (White)

### Typography
- **Display Font:** Montserrat (Bold, uppercase titles)
- **Body Font:** Poppins (Regular, readable text)
- **Accent Font:** Cinzel (Elegant serif)
- **Icons:** Font Awesome 6.4.0

### Responsive Breakpoints
- Desktop: 1024px and above
- Tablet: 768px - 1024px
- Mobile: 480px - 768px
- Small Mobile: Below 480px

## 🚀 Features

### 🔐 User Authentication
✅ User signup with email and password
✅ User login with session management
✅ User profile management and settings
✅ Password strength validation
✅ "Remember me" functionality
✅ Protected checkout (authentication required)
✅ Automatic redirect for unauthorized access

### Shopping Features
✅ Product catalog with advanced filtering (category, price, size, material, color)
✅ Product detail pages with image galleries and reviews
✅ Shopping cart with localStorage persistence
✅ Wishlist functionality
✅ Multi-step checkout with shipping and payment options
✅ Sort and filter by multiple criteria
✅ Product recommendations

### User Account
✅ User registration and login (UI only, backend ready)
✅ Account dashboard with order history
✅ Profile management
✅ Saved addresses
✅ Password management
✅ Wishlist management

### Support & Information
✅ FAQ section with accordion interface
✅ Size guide with measurement tables
✅ Shipping information and international delivery
✅ Returns and refunds policy
✅ Contact form with location information
✅ About Us page with brand story

### Legal & Compliance
✅ Privacy Policy (GDPR and CCPA compliant)
✅ Terms of Service
✅ Cookie Policy
✅ Accessibility Statement (WCAG 2.1 AA reference)
✅ 404 Error page
✅ XML Sitemap for SEO

## 🛠 Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Flexbox, Grid, CSS Variables, Animations
- **JavaScript (Vanilla)** - No frameworks for lightweight performance
- **localStorage** - Client-side data persistence for cart, user sessions, and authentication
- **Font Awesome 6.4.0** - Icon library
- **Google Fonts** - Typography

## 💳 Payment Integrations (Placeholder Ready)

The checkout page is configured for:
- Stripe (credit/debit cards)
- PayPal
- Apple Pay
- Google Pay

Integration requires backend implementation and API keys.

## 📦 Shipping Integrations (Ready for Backend)

Configured for:
- DHL
- FedEx
- UPS

## 🔧 Getting Started

### Local Development

1. **Extract the files** to your web server directory
2. **Open `index.html`** in your web browser
3. **All pages are static** and work without a server initially

### Adding to Your Server

```bash
# Copy all files to your web root
cp -r CORRIESELLS/* /var/www/html/

# Set proper permissions
chmod -R 755 /var/www/html/
```

### Linking Between Pages

All pages use relative paths for navigation:
- From `index.html`: `pages/shop.html`
- From `pages/shop.html`: `shop.html` (same directory)
- Back to home: `../index.html`

## 📊 localStorage Keys

### Cart Storage
```javascript
// Key: 'corriesells_cart'
// Value: Array of cart items
// Format: [{ id, name, price, quantity, size, color }, ...]
```

### User Storage
```javascript
// Key: 'corriesells_user'
// Value: User object
// Format: { email, firstName, lastName, phone, address }
```

### Wishlist Storage
```javascript
// Key: 'corriesells_wishlist'
// Value: Array of product IDs
```

## 🔗 Footer Navigation

The footer is **automatically generated** by `main.js` and includes:
- Quick Links (Shop, About, Contact, FAQ)
- Support Links (Size Guide, Shipping, Returns)
- Legal Links (Privacy, Terms, Cookies, Accessibility)
- Social Media Links
- Newsletter Signup

## 🔐 Security Notes

### Current State (Frontend Only)
⚠️ Cart data stored in localStorage (client-side only)
⚠️ User authentication is UI only (no backend validation)
⚠️ Payment processing not integrated

### Production Requirements
- [x] SSL/TLS certificate (https://)
- [ ] Backend API with secure data storage
- [ ] Payment gateway integration (Stripe SDK)
- [ ] User authentication system (sessions/JWT)
- [ ] Email verification system
- [ ] CORS configuration
- [ ] Rate limiting on endpoints
- [ ] Input validation on both sides
- [ ] CSRF protection tokens

## 📱 Responsive Design Testing

All pages are tested and responsive at:
- 1920px (Desktop)
- 1024px (Tablet)
- 768px (Mobile)
- 480px (Small Mobile)

## 🔄 Updating Product Data

Currently, products are hardcoded in HTML. For dynamic content:

### Option 1: JSON API
```javascript
// In main.js, update fetchProducts()
async function fetchProducts(filters = {}) {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}
```

### Option 2: Parse from HTML
Update product cards with data attributes:
```html
<div class="product-card" data-id="p1" data-price="89.99" data-category="shirts">
    <!-- content -->
</div>
```

## 📧 Newsletter Subscription

Currently displays a demo form. To enable:

1. Connect to email service (Mailchimp, ConvertKit, etc.)
2. Update form action in HTML:
```html
<form action="https://api.example.com/subscribe" method="POST">
```

## 🐛 Known Limitations

- Cart and user data only persist in browser localStorage
- Search functionality is UI only (no backend)
- Product filtering is static
- Email notifications not implemented
- Chatbot not integrated
- Payment processing is placeholder only

## 🚀 Next Steps for Production

### Phase 1: Backend Development
- [ ] Set up Node.js/Express server
- [ ] Create MongoDB database schema
- [ ] Implement user authentication
- [ ] Build REST API endpoints
- [ ] Add email system (SendGrid, Mailgun)

### Phase 2: Payment Integration
- [ ] Integrate Stripe SDK
- [ ] Add PayPal integration
- [ ] Implement order processing
- [ ] Add email confirmations

### Phase 3: DevOps & Deployment
- [ ] Set up CI/CD pipeline
- [ ] Deploy to production server (AWS, Heroku, Vercel)
- [ ] Configure SSL certificate
- [ ] Set up monitoring and analytics
- [ ] Create admin dashboard

### Phase 4: Optimization
- [ ] Image optimization and WebP conversion
- [ ] Minify CSS and JavaScript
- [ ] Implement caching strategies
- [ ] SEO optimization (meta tags, structured data)
- [ ] Performance audit and optimization

## 📄 Files Included

**Main Pages (17 files):**
- `index.html` - Homepage
- `pages/login.html` - User login page
- `pages/signup.html` - User registration page
- `pages/shop.html` - Product catalog
- `pages/product.html` - Product detail
- `pages/about.html` - Brand story
- `pages/contact.html` - Contact form
- `pages/account.html` - User dashboard
- `pages/wishlist.html` - Saved items
- `pages/checkout.html` - Checkout flow (requires login)
- `pages/faq.html` - FAQ
- `pages/returns.html` - Return policy
- `pages/shipping.html` - Shipping info
- `pages/size-guide.html` - Size charts
- `pages/privacy.html` - Privacy Policy
- `pages/terms.html` - Terms of Service
- `pages/cookies.html` - Cookie Policy
- `pages/accessibility.html` - Accessibility
- `pages/404.html` - Error page

**Assets (2 files):**
- `assets/css/styles.css` - Complete CSS framework (1200+ lines)
- `assets/js/main.js` - Core JavaScript (500+ lines)

**SEO:**
- `sitemap.xml` - XML sitemap for search engines

## 📜 License

This project is created for CORRIESELLS. Modify and use as needed.

## 💬 Support

For questions or issues:
- Email: support@corriesells.com
- Phone: +254-41-471-6723
- Address: Mombasa, Kenya

---

**Version:** 1.0.0
**Last Updated:** January 2026
**Status:** Production Ready (Frontend)
