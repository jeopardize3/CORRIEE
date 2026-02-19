/* ===========================
   CORRIESELLS - SIGNUP AUTH JS
   =========================== */

(() => {
    const form = document.getElementById('signupForm');
    if (!form) return;

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupBtn = document.getElementById('signupBtn');
    const successMessage = document.getElementById('successMessage');
    const STORAGE_USERS = 'corriesells_users';

    function normalizeEmail(value) {
        return (value || '').toString().trim().toLowerCase();
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

    function buildLocalUserId() {
        return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    }

    function createLocalUser({ firstName, lastName, email, password, newsletter }) {
        const users = readLocalUsers();
        const exists = users.some((user) => normalizeEmail(user.email) === email);
        if (exists) {
            return { ok: false, error: 'This email is already registered. Try logging in instead.' };
        }

        const createdAt = new Date().toISOString();
        const user = {
            id: buildLocalUserId(),
            firstName,
            lastName,
            email,
            phone: null,
            createdAt,
            verified: true,
            newsletter: !!newsletter,
            passwordHash: simpleHash(password)
        };

        users.push(user);
        if (!writeLocalUsers(users)) {
            return { ok: false, error: 'Unable to save your account in this browser. Please check storage settings.' };
        }
        return { ok: true, user };
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

    function clearErrors() {
        document.querySelectorAll('.form-error, .form-error-checkbox').forEach((el) => {
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

        const fieldMap = {
            firstNameError: 'firstName',
            lastNameError: 'lastName',
            emailError: 'email',
            passwordError: 'password',
            confirmPasswordError: 'confirmPassword',
            agreeError: 'agreeTerms'
        };
        const fieldId = fieldMap[elementId];
        if (!fieldId) return;
        const inputEl = document.getElementById(fieldId);
        if (!inputEl) return;
        inputEl.classList.add('has-error');
        inputEl.setAttribute('aria-invalid', 'true');
    }

    function togglePasswordVisibility(fieldId) {
        const input = document.getElementById(fieldId);
        const iconId = fieldId === 'password' ? 'toggleIcon1' : 'toggleIcon2';
        const icon = document.getElementById(iconId);
        if (!input || !icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    function isPasswordStrong(password) {
        return /[A-Z]/.test(password)
            && /[a-z]/.test(password)
            && /\d/.test(password)
            && (password || '').length >= 8;
    }

    function setSignupLoading(isLoading) {
        if (!signupBtn) return;
        signupBtn.disabled = isLoading;
        signupBtn.innerHTML = isLoading
            ? '<span class="loading-spinner"></span>Creating account...'
            : 'Create Secure Account';
    }

    // Password strength validation
    const requirementsBox = document.querySelector('.password-requirements');

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            clearFieldError('password', 'passwordError');
            const password = passwordInput.value;
            if (requirementsBox) {
                requirementsBox.classList.toggle('is-active', password.length > 0);
            }

            document.getElementById('req-length').classList.toggle('met', password.length >= 8);
            document.getElementById('req-upper').classList.toggle('met', /[A-Z]/.test(password));
            document.getElementById('req-lower').classList.toggle('met', /[a-z]/.test(password));
            document.getElementById('req-number').classList.toggle('met', /\d/.test(password));
        });
    }

    document.getElementById('firstName')?.addEventListener('input', () => clearFieldError('firstName', 'firstNameError'));
    document.getElementById('lastName')?.addEventListener('input', () => clearFieldError('lastName', 'lastNameError'));
    document.getElementById('email')?.addEventListener('input', () => clearFieldError('email', 'emailError'));
    confirmPasswordInput?.addEventListener('input', () => clearFieldError('confirmPassword', 'confirmPasswordError'));
    document.getElementById('agreeTerms')?.addEventListener('change', () => clearFieldError('agreeTerms', 'agreeError'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const newsletter = document.getElementById('newsletter').checked;
        const rememberMe = document.getElementById('rememberMe').checked;

        let isValid = true;

        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }

        if (!firstName) {
            showError('firstNameError', 'Please enter your first name');
            isValid = false;
        }

        if (!lastName) {
            showError('lastNameError', 'Please enter your last name');
            isValid = false;
        }

        if (!isPasswordStrong(password)) {
            showError('passwordError', 'Use at least 8 characters, including uppercase, lowercase, and a number.');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        if (!agreeTerms) {
            showError('agreeError', 'Please accept the Terms of Service and Privacy Policy to continue.');
            isValid = false;
        }

        if (!isValid) return;

        if (window.verifyRecaptcha) {
            const captchaOk = await window.verifyRecaptcha('signup');
            if (!captchaOk) {
                showError('emailError', 'Verification failed. Please try again.');
                return;
            }
        }

        setSignupLoading(true);
        const handleLocalSignup = () => {
            const result = createLocalUser({
                firstName,
                lastName,
                email,
                password,
                newsletter
            });
            if (!result.ok) {
                showError('emailError', result.error || 'Unable to create account. Please try again.');
                setSignupLoading(false);
                return false;
            }
            if (successMessage) {
                successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Account created! You can now sign in.';
                successMessage.classList.add('show');
            }
            setTimeout(() => {
                const next = `login.html?email=${encodeURIComponent(email)}`;
                window.location.href = next;
            }, 1500);
            return true;
        };

        try {
            const csrf = window.CorrieAuth && typeof window.CorrieAuth.ensureCsrfToken === 'function'
                ? await window.CorrieAuth.ensureCsrfToken()
                : '';

            const headers = { 'Content-Type': 'application/json' };
            if (csrf) headers['X-CSRF-Token'] = csrf;

            const res = await fetch(buildApiUrl('/api/auth/signup'), {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    newsletter,
                    rememberMe
                }),
                credentials: 'include'
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (shouldFallbackToLocalAuth(res) && handleLocalSignup()) {
                    return;
                }
                if (res.status === 409) {
                    showError('emailError', data.error || 'This email is already registered. Try logging in instead.');
                } else {
                    showError('emailError', data.error || 'An error occurred. Please try again.');
                }
                setSignupLoading(false);
                return;
            }

            if (successMessage) {
                successMessage.classList.add('show');
            }

            setTimeout(() => {
                const next = `login.html?verify=1&email=${encodeURIComponent(email)}`;
                window.location.href = next;
            }, 2000);
        } catch (error) {
            if (shouldFallbackToLocalAuth(null) && handleLocalSignup()) {
                return;
            }
            showError('emailError', 'An error occurred. Please try again.');
            setSignupLoading(false);
        }
    });

    window.togglePasswordVisibility = togglePasswordVisibility;
})();
