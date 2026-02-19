/* ===========================
   CORRIESELLS - GOOGLE IDENTITY SERVICES
   One-tap / button flow with placeholder verification
   =========================== */

(() => {
    const GOOGLE_CLIENT_ID = '157685675631-n5m3sp317mhtt74jnf6m3up1fin06oag.apps.googleusercontent.com';

    function loadGoogleScript() {
        if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.async = true;
            s.defer = true;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function getUsers() {
        try {
            const raw = localStorage.getItem('corriesells_users');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem('corriesells_users', JSON.stringify(users));
    }

    function createSessionUser(profile, options = {}) {
        const newsletterOptIn = !!options.newsletterOptIn;
        const existingUsers = getUsers();
        const existingIndex = existingUsers.findIndex((u) => (u.email || '').toLowerCase() === (profile.email || '').toLowerCase());
        const existingUser = existingIndex >= 0 ? existingUsers[existingIndex] : null;
        const existingAvatar = existingUser && (existingUser.avatarUrl || existingUser.avatar || existingUser.photoUrl);
        const profileAvatar = profile.picture || null;
        const avatarUrl = existingAvatar || profileAvatar || null;
        const verified = typeof profile.email_verified === 'boolean'
            ? profile.email_verified
            : (existingUser && typeof existingUser.verified === 'boolean' ? existingUser.verified : false);
        const user = {
            id: `google_${Date.now()}`,
            email: profile.email,
            firstName: profile.given_name || 'Google',
            lastName: profile.family_name || 'User',
            phone: null,
            createdAt: new Date().toISOString(),
            loginTime: new Date().toISOString(),
            oauthProvider: 'google',
            newsletter: newsletterOptIn,
            verified,
            avatarUrl
        };
        localStorage.setItem('corriesells_user', JSON.stringify(user));

        const users = existingUsers;
        const idx = existingIndex;
        if (idx >= 0) {
            users[idx] = {
                ...users[idx],
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                newsletter: newsletterOptIn,
                oauthProvider: 'google',
                verified,
                avatarUrl: existingAvatar || profileAvatar || null
            };
        } else {
            users.push({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: null,
                newsletter: newsletterOptIn,
                createdAt: user.createdAt,
                verified,
                oauthProvider: 'google',
                avatarUrl
            });
        }
        saveUsers(users);
    }


    function decodeJwtPayload(token) {
        try {
            const payload = token.split('.')[1];
            const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decodeURIComponent(escape(json)));
        } catch (error) {
            return null;
        }
    }

    async function handleCredentialResponse(response) {
        if (!response || !response.credential) return;
        const profile = decodeJwtPayload(response.credential);
        if (!profile || !profile.email) return;

        // NOTE: For production, verify the credential on the server.
        const isSignupPage = window.location.pathname.endsWith('/signup.html');
        if (window.verifyRecaptcha) {
            const captchaOk = await window.verifyRecaptcha(isSignupPage ? 'signup' : 'login');
            if (!captchaOk) return;
        }
        const newsletterOptIn = isSignupPage && !!document.getElementById('newsletter')?.checked;
        createSessionUser(profile, { newsletterOptIn });
        window.location.href = '../index.html';
    }

    async function initGoogleButtons() {
        try {
            await loadGoogleScript();
        } catch (error) {
            return;
        }

        if (!window.google || !window.google.accounts || !window.google.accounts.id) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false
        });

        const targets = document.querySelectorAll('[data-google-button]');
        targets.forEach((el) => {
            window.google.accounts.id.renderButton(el, {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill'
            });
        });

        // Enable One Tap prompt only on login page
        if (window.location.pathname.endsWith('/login.html')) {
            window.google.accounts.id.prompt();
        }
    }

    document.addEventListener('DOMContentLoaded', initGoogleButtons);
})();
