# CORRIESELLS - Authentication System Guide

## Overview

The CORRIESELLS e-commerce platform now includes a complete professional authentication system with login, signup, and user profile management. Users must create an account before checking out.

## 🔐 Features

### 1. **User Signup (Registration)**
- **File:** `pages/signup.html`
- **Features:**
  - First and last name fields
  - Email address validation
  - Optional phone number
  - Strong password requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
  - Password confirmation field
  - Real-time password strength indicator
  - Terms of Service and Privacy Policy acceptance
  - Optional newsletter subscription
  - Duplicate email prevention

### 2. **User Login**
- **File:** `pages/login.html`
- **Features:**
  - Email-based authentication
  - Password visibility toggle
  - "Remember me" functionality
  - Forgot password link
  - Social login placeholders (Google, Facebook)
  - Error messages for invalid credentials
  - Session persistence

### 3. **User Profile Management**
- **File:** `pages/account.html`
- **Features:**
  - View and edit profile information
  - Change personal details (name, phone)
  - View order history
  - Dashboard with statistics
  - Wishlist management
  - Logout functionality
  - Responsive design

### 4. **Protected Checkout**
- **File:** `pages/checkout.html`
- **Features:**
  - Automatic redirect to login if not authenticated
  - Return to checkout after successful login
  - User data pre-filled from profile

## 🔄 Authentication Flow

### Signup Flow
```
User visits /pages/signup.html
    ↓
Fills in first name, last name, email, phone, password
    ↓
Validates form (all required fields, email format, password strength)
    ↓
Checks if email already exists in localStorage
    ↓
Creates new user record with unique ID and timestamp
    ↓
Saves to localStorage (key: 'corriesells_users')
    ↓
Shows success message
    ↓
Redirects to login page
```

### Login Flow
```
User visits /pages/login.html
    ↓
Enters email and password
    ↓
System validates email format
    ↓
Searches localStorage users database
    ↓
If found and password matches:
    ↓
Saves user object to localStorage (key: 'corriesells_user')
    ↓
Shows success message
    ↓
Redirects to account page OR redirect URL from query parameter
    ↓
If login failed:
    ↓
Shows error message, user can retry
```

### Checkout Authentication Flow
```
User proceeds to checkout (/pages/checkout.html)
    ↓
Page checks localStorage for 'corriesells_user' key
    ↓
If user exists:
    ↓
Show checkout form with user's pre-filled address
    ↓
If user does NOT exist:
    ↓
Redirect to login page with return URL: login.html?redirect=checkout.html
    ↓
After successful login:
    ↓
User is redirected back to checkout.html
    ↓
Checkout form loads with pre-filled information
```

## 📊 Data Structure

### User Object (Stored in localStorage)
```javascript
{
    id: "user_1707489234567",           // Unique identifier
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    createdAt: "2026-02-09T10:15:00Z",
    loginTime: "2026-02-09T14:30:00Z"
}
```

### Users Database (All users stored here)
```javascript
[
    {
        id: "user_1707489234567",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1 (555) 123-4567",
        password: "HashedPassword123",    // In production, use bcrypt!
        newsletter: true,
        createdAt: "2026-02-09T10:15:00Z",
        verified: false
    },
    // ... more users
]
```

**Storage Key:** `corriesells_users` (localStorage)

## 🔄 Session Management

### Current User Session
- **Key:** `corriesells_user`
- **Persistence:** Automatically saved to localStorage on successful login
- **Duration:** Until explicitly logged out or browser cache cleared
- **Access:** All pages can access via `JSON.parse(localStorage.getItem('corriesells_user'))`

### Remember Me
- **Key:** `corriesells_remember`
- **Value:** `"true"` if checked
- **Purpose:** Pre-populates email field on next visit
- **Cleared on:** Logout

## 🛡️ Security Considerations

### ⚠️ Current Implementation (Development Only)
The current system uses localStorage for demonstration purposes:
- ✅ Password validation (strength requirements)
- ✅ Email format validation
- ✅ Duplicate email prevention
- ❌ Passwords stored in plain text (NEVER in production!)
- ❌ No encryption layer
- ❌ No server-side validation
- ❌ No HTTPS enforcement yet

### 🔒 Production Requirements

#### Backend API Endpoints Needed
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET /api/auth/me
PUT /api/auth/profile
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### Necessary Security Measures
1. **Password Security**
   - Use bcrypt or Argon2 for hashing
   - Minimum 8 characters requirement
   - Salt passwords with unique salts
   - Never store plain text passwords

2. **Session Management**
   - Use JWT (JSON Web Tokens) or secure session cookies
   - Implement token expiration (15 minutes for access, 7 days for refresh)
   - HTTPS only transmission
   - HttpOnly, Secure, SameSite flags on cookies

3. **Email Verification**
   - Send verification email on signup
   - Require email confirmation before account activation
   - Token-based email verification links

4. **Password Reset**
   - Send secure reset link via email
   - Links expire after 24 hours
   - Require new password on reset

5. **Rate Limiting**
   - Limit login attempts (5 per minute per IP)
   - Limit signup attempts (3 per hour per IP)
   - Prevent brute force attacks

6. **CSRF Protection**
   - Implement CSRF tokens on all forms
   - Validate origin headers

7. **Logging & Monitoring**
   - Log all authentication events
   - Monitor for suspicious activity
   - Alert on multiple failed login attempts

## 🔧 Integration with Checkout

### Step 1: Automatic Redirect
When user clicks "Checkout" without logging in:
```javascript
// In checkout.html
document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('corriesells_user');
    if (!user) {
        window.location.href = 'login.html?redirect=checkout.html';
    }
});
```

### Step 2: Login with Return URL
User signs in at login page:
```javascript
// In login.html
setTimeout(() => {
    const redirectUrl = new URLSearchParams(window.location.search)
        .get('redirect') || 'account.html';
    window.location.href = redirectUrl;
}, 1500);
```

### Step 3: Pre-filled Checkout
On checkout page, user data is automatically filled:
```javascript
// In checkout.html (to add)
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('corriesells_user'));
    if (user) {
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
    }
});
```

## 📱 User Journey Maps

### New Customer (Complete Flow)
```
Homepage
    ↓ [Click Add to Cart]
    ↓ [Click Checkout]
    ↓ [Redirected to Login]
    ↓ [Click Create Account]
Sign Up Page
    ↓ [Fill form]
    ↓ [Accept Terms]
    ↓ [Submit]
    ↓ [Redirected to Login]
Login Page
    ↓ [Enter credentials]
    ↓ [Successfully logged in]
Checkout Page
    ↓ [Pre-filled with user info]
    ↓ [Enter shipping/payment]
    ↓ [Place Order]
```

### Returning Customer (Quick Flow)
```
Homepage
    ↓ [Click Cart]
    ↓ [Click Checkout]
    ↓ [Already logged in]
Checkout Page
    ↓ [Auto-filled form]
    ↓ [Enter shipping/payment]
    ↓ [Place Order]
```

### Account Management
```
Any Page
    ↓ [Click User Icon (if logged in)]
    ↓ Account Page
    ↓ [View Profile / Orders / Settings]
    ↓ [Edit Information]
    ↓ [Click Logout]
    ↓ [Redirect to Homepage]
```

## 🧪 Testing the Auth System

### Test Signup
1. Go to `pages/signup.html`
2. Enter details:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: +1 (555) 123-4567
   - Password: SecurePass123
   - Confirm Password: SecurePass123
   - Accept Terms
3. Click "Create Account"
4. Should redirect to login page

### Test Login
1. Go to `pages/login.html`
2. Enter:
   - Email: john@example.com
   - Password: SecurePass123
3. Click "Sign In"
4. Should see success message and redirect to account page

### Test Protected Checkout
1. Logout if logged in
2. Go to `pages/checkout.html`
3. Should be redirected to login page
4. Log in
5. Should redirect back to checkout.html

### Test Remember Me
1. On login page, check "Remember me"
2. Log in
3. Log out
4. Go back to login page
5. Email should be pre-filled

## 🐛 Common Issues

### Issue: "Email already exists" on signup
**Cause:** Email is already registered in localStorage
**Solution:** Use a different email or clear localStorage

### Issue: Can't login after signup
**Cause:** Password was entered differently
**Solution:** Passwords are case-sensitive; ensure caps lock is off

### Issue: Logout not working
**Cause:** JavaScript errors or blocking
**Solution:** Check browser console for errors

### Issue: Data lost after page refresh
**Cause:** Not all data is synced to localStorage
**Solution:** Check that localStorage isn't full or disabled

## 📚 JavaScript Functions

### Current Implementation
```javascript
// Check if user is logged in
const user = JSON.parse(localStorage.getItem('corriesells_user'));
if (user) {
    console.log(`Logged in as ${user.firstName} ${user.lastName}`);
}

// Login user
function loginUser(email, password) {
    // Validates credentials and saves to localStorage
}

// Logout user
function logoutUser() {
    localStorage.removeItem('corriesells_user');
    localStorage.removeItem('corriesells_remember');
}

// Update Auth UI
function updateAuthUI() {
    // Updates account button based on login state
}

// Validate email
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## 🚀 Next Steps

### Phase 1: Backend Integration
- [ ] Create Node.js/Express server
- [ ] Set up MongoDB user collection
- [ ] Implement bcrypt password hashing
- [ ] Create JWT token system
- [ ] Add email verification

### Phase 2: Advanced Features
- [ ] Two-factor authentication
- [ ] OAuth2 integrations (Google, Facebook)
- [ ] Password recovery email
- [ ] Session timeout
- [ ] Account suspension/deletion

### Phase 3: Security Hardening
- [ ] HTTPS enforcement
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] ReCAPTCHA on forms
- [ ] Security audit

## 📞 Support

For questions about the authentication system:
- Email: support@corriesells.com
- Phone: +254-41-471-6723
- Hours: Monday-Friday 9AM-6PM EAT

---

**Auth System Version:** 1.0.0
**Last Updated:** February 9, 2026
**Status:** Production Ready (Frontend) | Needs Backend Implementation
