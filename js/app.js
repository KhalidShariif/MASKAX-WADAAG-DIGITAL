/**
 * Main Application Logic
 */

const app = {
    // Application State
    state: {
        currentUser: null,
        currentView: 'dashboard'
    },

    // Initialization
    init: async function () {
        console.log('MASKAX-WADAAG DIGITAL Initializing...');

        // Initialize Theme
        if (typeof ui !== 'undefined' && ui.initTheme) ui.initTheme();

        // Check Auth
        if (!auth.checkSession()) {
            return; // Auth will handle redirect
        }

        // Setup UI
        this.setupUI();

        // Initial Navigation
        await this.router.navigate('dashboard');

        // Show App
        document.getElementById('app-shell').style.display = 'grid';
    },

    setupUI: function () {
        // Set current date
        const dateEl = document.getElementById('current-date');
        if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Set User Info
        const user = auth.getUser();
        if (user) {
            // Header Info
            document.getElementById('user-name').textContent = user.username;
            document.getElementById('user-avatar').textContent = user.username.substring(0, 2).toUpperCase();

            // Mobile Sidebar Info
            if (document.getElementById('user-name-sidebar')) {
                document.getElementById('user-name-sidebar').textContent = user.username;
                document.getElementById('user-avatar-sidebar').textContent = user.username.substring(0, 2).toUpperCase();
            }

            // Update Sidebar Access
            if (ui.updateSidebar) ui.updateSidebar();

            // Set User Role Title
            const roleEl = document.getElementById('user-role');
            const roleElSidebar = document.getElementById('user-role-sidebar');
            const roleText = (user.role === 'admin' || user.role === 'manager') ? 'Shop Owner' : 'Shop Staff';

            if (roleEl) roleEl.textContent = roleText;
            if (roleElSidebar) roleElSidebar.textContent = roleText;
        }
    },

    // Simple Router
    router: {
        navigate: async function (viewName) {
            console.log('Navigating to:', viewName);

            // Role-Based Access Control (Navigation Guard)
            const user = auth.getUser();
            const role = user ? user.role : 'staff';
            const restrictedViews = ['employees', 'analysis'];

            if (role === 'staff' && restrictedViews.includes(viewName)) {
                console.warn('Access Denied to:', viewName);
                if (ui.showToast) ui.showToast('Access Denied: Admin only', 'danger');
                // Redirect to dashboard instead
                if (app.state.currentView !== 'dashboard') {
                    this.navigate('dashboard');
                }
                return;
            }

            // Update Active Nav
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-item[onclick*="'${viewName}'"]`);
            if (activeLink) activeLink.classList.add('active');

            // Update Header Title
            const titles = {
                'dashboard': 'Dashboard',
                'products': 'Product Management',
                'pos': 'Point of Sale',
                'employees': 'Employee Management',
                'customers': 'Customer Debts',
                'analysis': 'Reports & Analysis'
            };
            document.getElementById('page-header-title').textContent = titles[viewName] || 'MASKAX-WADAAG DIGITAL';

            // Load Content (Awaiting async view templates)
            const contentArea = document.getElementById('content-area');
            if (ui.views[viewName]) {
                // Templates are now synchronous to prevent [object Promise]
                contentArea.innerHTML = ui.views[viewName]();
            } else {
                contentArea.innerHTML = `<h3>Coming Soon: ${viewName}</h3>`;
            }


            // Trigger specific view logic
            if (viewName === 'dashboard') ui.initDashboard();
            if (viewName === 'products') ui.renderProductTable();
            if (viewName === 'pos') ui.initPos();
            if (viewName === 'employees') ui.renderEmployeeTable();
            if (viewName === 'customers') ui.renderCustomerTable();
            if (viewName === 'analysis') ui.initAnalysis();

            app.state.currentView = viewName;

            // Close mobile sidebar if open
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        }
    }


};

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Dependent scripts might not be loaded if we don't wait or order them correctly.
    // In production, we'd use modules.
    if (typeof auth !== 'undefined' && typeof ui !== 'undefined') {
        app.init();
    } else {
        console.error('Core modules not loaded');
    }
});
