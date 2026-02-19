/* ===========================
   CORRIESELLS - AUTH CLIENT
   Handles access token storage + refresh
   =========================== */

(() => {
    const ACCESS_TOKEN_KEY = 'corriesells_access_token';
    const USER_KEY = 'corriesells_user';
    const REMEMBER_KEY = 'corriesells_remember';

    function resolveApiUrl(path) {
        if (typeof buildApiUrl === 'function') return buildApiUrl(path);
        return path;
    }


    function getCookie(name) {
        const parts = (`; ${document.cookie}`).split(`; ${name}=`);
        if (parts.length < 2) return '';
        return parts.pop().split(';').shift() || '';
    }

    function getCsrfToken() {
        return getCookie('corriesells_csrf');
    }

    async function ensureCsrfToken() {
        const existing = getCsrfToken();
        if (existing) return existing;
        try {
            const res = await fetch(resolveApiUrl('/api/auth/csrf'), {
                method: 'GET',
                credentials: 'include'
            });
            if (!res.ok) return '';
            const data = await res.json().catch(() => ({}));
            return data.csrfToken || getCsrfToken();
        } catch (error) {
            return '';
        }
    }

    function getRememberFlag() {
        return localStorage.getItem(REMEMBER_KEY) === 'true';
    }

    function getAccessToken() {
        return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY) || '';
    }

    function storeAccessToken(token, remember) {
        if (!token) return;
        if (remember) {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
            sessionStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.setItem(REMEMBER_KEY, 'true');
            return;
        }
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REMEMBER_KEY);
    }

    function storeUser(user) {
        if (!user) return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        try {
            const existing = window.name ? JSON.parse(window.name) : {};
            const next = (existing && typeof existing === 'object') ? existing : {};
            next.corriesells_user = user;
            window.name = JSON.stringify(next);
        } catch (error) {
            try {
                window.name = JSON.stringify({ corriesells_user: user });
            } catch (e) {}
        }
    }

    function clearSession() {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        try {
            const existing = window.name ? JSON.parse(window.name) : {};
            if (existing && typeof existing === 'object' && existing.corriesells_user) {
                delete existing.corriesells_user;
                window.name = JSON.stringify(existing);
            }
        } catch (error) {}
    }

    function hasToken() {
        return !!getAccessToken();
    }

    async function refresh() {
        try {
            const csrf = await ensureCsrfToken();
            const res = await fetch(resolveApiUrl('/api/auth/refresh'), {
                method: 'POST',
                headers: csrf ? { 'X-CSRF-Token': csrf } : undefined,
                credentials: 'include'
            });
            if (!res.ok) return false;
            const data = await res.json();
            if (data && data.accessToken) {
                storeAccessToken(data.accessToken, getRememberFlag());
            }
            if (data && data.user) {
                storeUser(data.user);
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    async function apiFetch(path, options = {}) {
        const opts = { ...options };
        const headers = new Headers(opts.headers || {});
        const token = getAccessToken();
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        const method = (opts.method || 'GET').toUpperCase();
        if (method !== 'GET' && method !== 'HEAD' && !headers.has('X-CSRF-Token')) {
            const csrf = await ensureCsrfToken();
            if (csrf) headers.set('X-CSRF-Token', csrf);
        }
        opts.headers = headers;
        opts.credentials = 'include';

        let response = await fetch(resolveApiUrl(path), opts);
        if (response.status === 401) {
            const refreshed = await refresh();
            if (refreshed) {
                const nextToken = getAccessToken();
                if (nextToken) headers.set('Authorization', `Bearer ${nextToken}`);
                response = await fetch(resolveApiUrl(path), opts);
            }
        }
        return response;
    }

    async function getMe() {
        const res = await apiFetch('/api/auth/me', { method: 'GET' });
        if (!res.ok) return null;
        const data = await res.json();
        if (data && data.user) {
            storeUser(data.user);
            return data.user;
        }
        return null;
    }

    async function logout() {
        try {
            const csrf = await ensureCsrfToken();
            await fetch(resolveApiUrl('/api/auth/logout'), {
                method: 'POST',
                headers: csrf ? { 'X-CSRF-Token': csrf } : undefined,
                credentials: 'include'
            });
        } catch (error) {}
        clearSession();
    }

    function storeSession({ accessToken, user, remember }) {
        if (accessToken) {
            storeAccessToken(accessToken, !!remember);
        }
        if (user) {
            storeUser(user);
        }
    }

    window.CorrieAuth = {
        storeSession,
        storeAccessToken,
        getAccessToken,
        storeUser,
        clearSession,
        refresh,
        apiFetch,
        getMe,
        logout,
        hasToken,
        ensureCsrfToken,
        getCsrfToken
    };

    // Pre-seed CSRF cookie for form submissions
    ensureCsrfToken();
})();
