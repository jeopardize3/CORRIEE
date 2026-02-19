/* ===========================
   CORRIESELLS - LOGIN AUTH JS
   =========================== */

(() => {
    const STORAGE_USER = 'corriesells_user';
    const STORAGE_REMEMBER = 'corriesells_remember';
    const STORAGE_USERS = 'corriesells_users';
    const AUTH_ERROR_MESSAGE = 'Email or password is incorrect';

    const form = document.getElementById('loginForm');
    if (!form) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('rememberMe');
    const loginBtn = document.getElementById('loginBtn');
    const successMessage = document.getElementById('successMessage');
    const verifyNotice = document.getElementById('verifyNotice');
    const verifyNoticeText = document.getElementById('verifyNoticeText');
    const resendVerifyBtn = document.getElementById('resendVerifyBtn');
    const loginBtnDefaultText = loginBtn ? loginBtn.textContent.trim() : 'Sign In';

    let lastVerifyEmail = '';

    function normalizeEmail(value) {
        return (value || '').trim().toLowerCase();
    }

    function simpleHash(value) {
        let hash = 5381;
        const input = String(value || '');
        for (let i = 0; i < input.length; i++) {
            hash = ((hash << 5) + hash) + input.charCodeAt(i);
        }
        return `h${(hash >>> 0).toString(16)}`;
    }

    function readLocalUsers() {
        try {
            const raw = localStorage.getItem(STORAGE_USERS);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function writeLocalUsers(list) {
        try {
            localStorage.setItem(STORAGE_USERS, JSON.stringify(list));
            return true;
        } catch (error) {
            return false;
        }
    }

    function isLocalAuthAllowed() {
        if (window.CORRIESELLS_FORCE_LOCAL_AUTH === true) return true;
        const protocol = window.location.protocol || '';
        const host = window.location.hostname || '';
        if (protocol === 'file:') return true;
        if (host === 'localhost' || host === '127.0.0.1') return true;
        if (host.endsWith('.local') || host.endsWith('.localhost')) return true;
        if (host.endsWith('.github.io')) return true;
        return false;
    }

    function shouldFallbackToLocalAuth(response) {
        if (!isLocalAuthAllowed()) return false;
        if (!response) return true;
        return [404, 405, 501, 502, 503].includes(response.status);
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function setLoginLoading(isLoading) {
        if (!loginBtn) return;
        loginBtn.disabled = isLoading;
        loginBtn.innerHTML = isLoading
            ? '<span class="loading-spinner"></span>Signing in...'
            : loginBtnDefaultText;
    }

    function clearErrors() {
        document.querySelectorAll('.form-error').forEach((el) => {
            el.classList.remove('show');
            el.textContent = '';
        });
        form.querySelectorAll('.has-error').forEach((el) => {
            el.classList.remove('has-error');
            el.removeAttribute('aria-invalid');
        });
    }

    function showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.classList.add('show');

        const fieldId = elementId.endsWith('Error') ? elementId.slice(0, -5) : '';
        if (!fieldId) return;
        const inputEl = document.getElementById(fieldId);
        if (!inputEl) return;
        inputEl.classList.add('has-error');
        inputEl.setAttribute('aria-invalid', 'true');
    }

    function clearFieldError(fieldId, errorId) {
        const inputEl = document.getElementById(fieldId);
        if (inputEl) {
            inputEl.classList.remove('has-error');
            inputEl.removeAttribute('aria-invalid');
        }
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.classList.remove('show');
            errorEl.textContent = '';
        }
    }

    function resolveRedirectUrl() {
        const redirectParam = new URLSearchParams(window.location.search).get('redirect');
        if (!redirectParam) return 'account.html';
        if (redirectParam.includes('://') || redirectParam.startsWith('//')) return 'account.html';
        if (redirectParam.toLowerCase().startsWith('javascript:')) return 'account.html';
        return redirectParam;
    }

    function togglePasswordVisibility() {
        const toggleIcon = document.getElementById('toggleIcon');
        if (!passwordInput || !toggleIcon) return;

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
            return;
        }

        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }

    function showForgotPassword() {
        showNotification('Password reset link sent to your email', 'success');
    }

    function hideVerificationNotice() {
        if (verifyNotice) verifyNotice.classList.remove('show');
    }

    function showVerificationNotice(email, message) {
        lastVerifyEmail = email || lastVerifyEmail;
        if (verifyNoticeText && message) {
            verifyNoticeText.textContent = message;
        }
        if (verifyNotice) verifyNotice.classList.add('show');
    }

    async function resendVerification() {
        const email = normalizeEmail(lastVerifyEmail || (emailInput ? emailInput.value : ''));
        if (!email || !validateEmail(email)) {
            showError('emailError', 'Please enter a valid email to resend verification.');
            return;
        }

        if (resendVerifyBtn) {
            resendVerifyBtn.disabled = true;
            resendVerifyBtn.textContent = 'Sending...';
        }

        try {
            const csrf = window.CorrieAuth && typeof window.CorrieAuth.ensureCsrfToken === 'function'
                ? await window.CorrieAuth.ensureCsrfToken()
                : '';
            const headers = { 'Content-Type': 'application/json' };
            if (csrf) headers['X-CSRF-Token'] = csrf;

            const res = await fetch(buildApiUrl('/api/auth/resend-verification'), {
                method: 'POST',
                headers,
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            if (res.ok) {
                showNotification('Verification email sent. Check your inbox.', 'success');
            } else {
                showNotification('Unable to resend verification. Please try again.', 'error');
            }
        } catch (error) {
            showNotification('Unable to resend verification. Please try again.', 'error');
        }

        if (resendVerifyBtn) {
            resendVerifyBtn.disabled = false;
            resendVerifyBtn.textContent = 'Resend';
        }
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            clearFieldError('email', 'emailError');
            hideVerificationNotice();
        });
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', () => clearFieldError('password', 'passwordError'));
    }
    if (resendVerifyBtn) {
        resendVerifyBtn.addEventListener('click', resendVerification);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();
        hideVerificationNotice();

        const email = normalizeEmail(emailInput ? emailInput.value : '');
        const password = passwordInput ? passwordInput.value : '';
        const rememberMe = !!(rememberCheckbox && rememberCheckbox.checked);

        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            return;
        }

        if (!password) {
            showError('passwordError', 'Please enter your password');
            return;
        }

        if (window.verifyRecaptcha) {
            const captchaOk = await window.verifyRecaptcha('login');
            if (!captchaOk) {
                showError('emailError', 'Verification failed. Please try again.');
                return;
            }
        }

        setLoginLoading(true);
        const handleLocalLogin = () => {
            const users = readLocalUsers();
            const userIndex = users.findIndex((entry) => normalizeEmail(entry?.email) === email);
            if (userIndex < 0) {
                showError('passwordError', AUTH_ERROR_MESSAGE);
                setLoginLoading(false);
                return false;
            }

            const user = users[userIndex] || {};
            const storedHash = user.passwordHash || (user.password ? simpleHash(user.password) : '');
            const inputHash = simpleHash(password);
            if (!storedHash || storedHash !== inputHash) {
                showError('passwordError', AUTH_ERROR_MESSAGE);
                setLoginLoading(false);
                return false;
            }

            const loginTime = new Date().toISOString();
            const sessionUser = { ...user, loginTime };
            localStorage.setItem(STORAGE_USER, JSON.stringify(sessionUser));

            if (rememberMe) {
                localStorage.setItem(STORAGE_REMEMBER, 'true');
            } else {
                localStorage.removeItem(STORAGE_REMEMBER);
            }

            users[userIndex] = { ...user, passwordHash: storedHash, loginTime };
            if (users[userIndex].password) delete users[userIndex].password;
            writeLocalUsers(users);

            if (successMessage) {
                successMessage.classList.add('show');
            }

            setTimeout(() => {
                window.location.href = resolveRedirectUrl();
            }, 1200);
            return true;
        };

        try {
            const csrf = window.CorrieAuth && typeof window.CorrieAuth.ensureCsrfToken === 'function'
                ? await window.CorrieAuth.ensureCsrfToken()
                : '';

            const headers = { 'Content-Type': 'application/json' };
            if (csrf) headers['X-CSRF-Token'] = csrf;

            const res = await fetch(buildApiUrl('/api/auth/login'), {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, password, rememberMe }),
                credentials: 'include'
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (shouldFallbackToLocalAuth(res) && handleLocalLogin()) {
                    return;
                }
                if (data && data.code === 'EMAIL_NOT_VERIFIED') {
                    showVerificationNotice(email, 'Please verify your email to continue.');
                    showError('emailError', data.error || 'Email not verified.');
                } else {
                    showError('passwordError', data.error || AUTH_ERROR_MESSAGE);
                }
                setLoginLoading(false);
                return;
            }

            if (window.CorrieAuth && typeof window.CorrieAuth.storeSession === 'function') {
                window.CorrieAuth.storeSession({
                    accessToken: data.accessToken,
                    user: data.user,
                    remember: rememberMe
                });
            } else if (data.user) {
                localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
            }

            if (rememberMe) {
                localStorage.setItem(STORAGE_REMEMBER, 'true');
            } else {
                localStorage.removeItem(STORAGE_REMEMBER);
            }

            if (successMessage) {
                successMessage.classList.add('show');
            }

            setTimeout(() => {
                window.location.href = resolveRedirectUrl();
            }, 1500);
        } catch (error) {
            if (shouldFallbackToLocalAuth(null) && handleLocalLogin()) {
                return;
            }
            showError('emailError', 'An error occurred. Please try again.');
            setLoginLoading(false);
        }
    });

    window.addEventListener('load', () => {
        const params = new URLSearchParams(window.location.search);
        const prefillEmail = params.get('email');
        const pendingVerify = params.get('verify');

        if (prefillEmail && emailInput) {
            emailInput.value = prefillEmail;
        }

        if (pendingVerify) {
            showVerificationNotice(prefillEmail, 'Account created. Check your email to verify your account.');
        }

        if (!localStorage.getItem(STORAGE_REMEMBER)) return;

        const user = (() => {
            try {
                const raw = localStorage.getItem(STORAGE_USER);
                return raw ? JSON.parse(raw) : null;
            } catch (error) {
                return null;
            }
        })();
        if (!user || !user.email || !emailInput || !rememberCheckbox) return;

        emailInput.value = user.email;
        rememberCheckbox.checked = true;
    });

    // Export handlers for inline onclick attributes in login.html.
    window.togglePasswordVisibility = togglePasswordVisibility;
    window.showForgotPassword = showForgotPassword;
})();
