const auth = {
    key: 'shop_session',

    checkSession: function () {
        const session = localStorage.getItem(this.key);
        if (!session) {
            const isLoginPage = window.location.pathname.includes('login.html');
            const isRegisterPage = window.location.pathname.includes('register.html');
            if (!isLoginPage && !isRegisterPage) {
                window.location.href = 'login.html';
                return false;
            }
        }
        return true;
    },

    getUser: function () {
        return JSON.parse(localStorage.getItem(this.key));
    },

    login: async function (username, password) {
        try {
            const response = await fetch('api/auth.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();

            if (result.success) {
                localStorage.setItem(this.key, JSON.stringify(result.user));
            }
            return result;
        } catch (e) {
            return { success: false, message: 'Server connection failed' };
        }
    },

    register: async function (username, password, shopName = 'My Shop', role = 'staff') {
        try {
            const response = await fetch('api/auth.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, shopName, role })
            });
            return await response.json();
        } catch (e) {
            return { success: false, message: 'Server connection failed' };
        }
    },

    logout: function () {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(this.key);
            window.location.href = 'login.html';
        }
    }
};
