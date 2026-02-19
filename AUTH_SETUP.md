# CORRIESELLS - Authentication System Setup Guide

## ✅ Quick Start

### 1. **Test the Signup Flow**
- Go to: `pages/signup.html`
- Create a test account:
  - First Name: `Sarah`
  - Last Name: `Johnson`
  - Email: `sarah@example.com`
  - Phone: `+1 (555) 987-6543`
  - Password: `SecurePass123`
  
### 2. **Test the Login Flow**
- Go to: `pages/login.html`
- Log in with your test account:
  - Email: `sarah@example.com`
  - Password: `SecurePass123`
  - Check "Remember me"
- You should be redirected to: `pages/account.html`

### 3. **Test Protected Checkout**
- While logged in, go to: `pages/checkout.html`
- Your information should be pre-filled
- If logged out, you'll be redirected to login page

### 4. **Test Profile Management**
- On `pages/account.html`:
  - View your profile information
  - Edit first name, last name, or phone
  - Click "Save Changes"
  - Click "Logout" to sign out

## 🎯 Key Pages Added

### Authentication Pages
1. **Login Page** (`pages/login.html`)
   - Email/password input
   - Password visibility toggle
   - Remember me checkbox
   - Social login placeholders
   - Link to signup page

2. **Signup Page** (`pages/signup.html`)
   - First & last name fields
   - Email validation
   - Phone number (optional)
   - Strong password requirements
   - Password strength indicator
   - Terms acceptance
   - Newsletter subscription option

3. **Updated Account Page** (`pages/account.html`)
   - User profile display
   - Profile editing functionality
   - Order history view
   - Dashboard statistics
   - Logout button

4. **Protected Checkout** (`pages/checkout.html`)
   - Requires authentication
   - Auto-redirects to login if not authenticated
   - Pre-fills user information

## 🔄 User Authentication Flow

### Creating New Account
```
1. Click signup link → pages/signup.html
2. Fill form with details
3. System validates input
4. Checks for duplicate email
5. Creates user account
6. Account saved to localStorage
7. Redirects to login page
```

### Logging In
```
1. Go to pages/login.html
2. Enter email & password
3. System verifies credentials
4. Creates session (localStorage)
5. Stores user object
6. Redirects to account page
```

### Accessing Checkout
```
1. User not logged in → Tries to checkout
2. Automatic redirect to login.html
3. After login → Redirected back to checkout.html
4. Form pre-filled with user details
5. Can proceed with order
```

## 📊 Data Storage

### Where Data is Stored
- **Current User Session:** `localStorage['corriesells_user']`
- **All Users Database:** `localStorage['corriesells_users']`
- **User Preferences:** `localStorage['corriesells_remember']`

### Checking User Status
```javascript
// Check if user is logged in
const user = JSON.parse(localStorage.getItem('corriesells_user'));
if (user) {
    console.log(`Welcome ${user.firstName}!`);
} else {
    console.log('User not logged in');
}
```

### Clearing User Data
```javascript
// Logout user
localStorage.removeItem('corriesells_user');
localStorage.removeItem('corriesells_remember');
```

## 🔒 Security Features Implemented

✅ **Password Strength Requirements**
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Real-time validation feedback

✅ **Email Validation**
- Format checking
- Duplicate prevention
- Case-insensitive comparison

✅ **Form Validation**
- All required fields checked
- Terms acceptance required
- Password confirmation matching

✅ **Session Management**
- User object stored in localStorage
- Auto-persist on login
- Clear on logout
- Remember me option

⚠️ **Known Security Limitations** (for development only)
- Passwords stored in localStorage (use bcrypt in production)
- No HTTPS enforcement yet
- No backend validation
- No email verification
- No rate limiting

## 🧪 Test Scenarios

### Scenario 1: New User Signup
```
1. Visit pages/signup.html
2. Fill in all fields correctly
3. Accept terms and conditions
4. Click "Create Account"
5. ✅ Redirected to login page
6. See success message on login page
```

### Scenario 2: Password Validation
```
1. On signup page
2. Enter password in wrong format
3. See real-time validation errors
4. Requirements not met show red
5. As requirements met → turn green
6. All green → "Create Account" enabled
```

### Scenario 3: Duplicate Email
```
1. Create account with: test@example.com
2. Try to create another account with same email
3. ✅ Error message: "Email already registered"
4. Suggest login instead
```

### Scenario 4: Forgot Password
```
1. On login page
2. Click "Forgot password?"
3. ✅ Toast notification appears
4. Message: "Password reset link sent to email"
5. (In production: would email reset link)
```

### Scenario 5: Protected Checkout
```
1. Clear browser localStorage (logout)
2. Go to pages/checkout.html
3. ✅ Auto-redirect to login.html
4. Notice URL: login.html?redirect=checkout.html
5. Log in with valid credentials
6. ✅ Auto-redirect back to checkout.html
```

### Scenario 6: Profile Management
```
1. Go to pages/account.html (while logged in)
2. See pre-filled user information
3. Change phone number
4. Click "Save Changes"
5. ✅ Toast: "Profile updated successfully!"
6. Changes saved to localStorage
```

### Scenario 7: Logout & Remember Me
```
1. On login page
2. Check "Remember me"
3. Log in
4. Go to pages/account.html
5. Click "Logout"
6. ✅ Logged out, redirected to login page
7. Email field pre-filled from remember value
```

## 🛠️ Customization

### Changing Validation Rules
Edit `pages/signup.html` and `pages/login.html` JavaScript:

```javascript
// Change password length requirement
if (password.length < 10) {  // Changed from 8
    showError('passwordError', 'Password must be at least 10 characters');
    return false;
}
```

### Modifying Redirect After Login
In `pages/login.html`:
```javascript
// Change default redirect destination
const redirectUrl = new URLSearchParams(window.location.search)
    .get('redirect') || 'shop.html';  // Changed from account.html
```

### Storing Additional User Data
Update user object structure:
```javascript
const newUser = {
    id: 'user_' + Date.now(),
    firstName,
    lastName,
    email,
    phone,
    password,
    newsletter,
    preferredCurrency: 'USD',      // New field
    language: 'en',                // New field
    // ... other fields
};
```

## 🚨 Troubleshooting

### Issue: Cannot Create Account
**Check:**
1. All fields are filled
2. Email format is valid
3. Password meets requirements
4. Terms checkbox is checked
5. Browser localStorage is enabled

### Issue: Login Fails After Signup
**Check:**
1. Email is spelled correctly (case-insensitive)
2. Password is exactly as entered in signup
3. localStorage contains the user data
4. Browser console for JavaScript errors

### Issue: Checkout Redirect Loop
**Check:**
1. localStorage has `corriesells_user` key
2. User object has all required fields
3. No JavaScript errors in console
4. Cookie/localStorage is not cleared

### Issue: Profile Not Saving
**Check:**
1. User is logged in (check localStorage)
2. No JavaScript errors in console
3. Try clearing browser cache
4. Verify localStorage quota not exceeded

## 📱 Browser Compatibility

**Tested & Working:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Requirements at Minimum:**
- localStorage support
- ES6 JavaScript support
- CSS Grid/Flexbox support

## 🔧 Production Checklist

Before deploying to production:

- [ ] Implement backend API for authentication
- [ ] Use bcrypt for password hashing (never plain text!)
- [ ] Set up JWT or secure session system
- [ ] Add HTTPS/SSL certificate
- [ ] Implement email verification
- [ ] Add rate limiting on login attempts
- [ ] Set up password reset functionality
- [ ] Add CSRF protection
- [ ] Implement 2-factor authentication (optional)
- [ ] Add reCAPTCHA to prevent bot signup
- [ ] Set up monitoring/logging for auth events
- [ ] Conduct security audit
- [ ] Add terms of service acceptance (saved date)

## 📞 Support

For questions about the authentication system:
- **Documentation:** See `AUTH_SYSTEM.md`
- **Email:** support@corriesells.com
- **Phone:** +254-41-471-6723

## 🎓 Learning Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN - Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [localStorage Security](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

**Auth System Version:** 1.0.0
**Created:** February 9, 2026
**Last Updated:** February 9, 2026
