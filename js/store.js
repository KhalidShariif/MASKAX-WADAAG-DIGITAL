const store = {
    // API Helper
    call: async function (url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (e) {
            console.error('API Error:', e);
            return null;
        }
    },

    // Products
    getProducts: async function () {
        return await this.call('api/products.php?action=list') || [];
    },

    saveProduct: async function (product) {
        return await this.call('api/products.php?action=save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
    },

    deleteProduct: async function (id) {
        return await this.call(`api/products.php?action=delete&id=${id}`);
    },

    // Customers
    getCustomers: async function () {
        return await this.call('api/customers.php?action=list') || [];
    },

    saveCustomer: async function (customer) {
        return await this.call('api/customers.php?action=save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
    },

    deleteCustomer: async function (id) {
        return await this.call(`api/customers.php?action=delete&id=${id}`);
    },

    addCustomerDebt: async function (id, amount, type, details) {
        return await this.call('api/customers.php?action=add_debt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, amount, type, details })
        });
    },

    getCustomerHistory: async function (id) {
        return await this.call(`api/customers.php?action=get_history&id=${id}`) || [];
    },

    // Sales
    getSales: async function () {
        return await this.call('api/sales.php?action=list') || [];
    },

    addSale: async function (sale) {
        const user = auth.getUser();
        sale.cashierId = user.id;

        return await this.call('api/sales.php?action=process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sale)
        });
    },

    // Employees (Users with roles)
    getEmployees: async function () {
        return await this.call('api/users.php?action=list') || [];
    },

    deleteEmployee: async function (id) {
        return await this.call(`api/users.php?action=delete&id=${id}`);
    },

    updateEmployee: async function (id, username, password, role) {
        return await this.call('api/users.php?action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, username, password, role })
        });
    },

    // Accounting / Settings
    getClosingMonth: function () {
        return parseInt(localStorage.getItem('shop_closing_month')) || 12; // Default Dec
    },

    saveClosingMonth: function (month) {
        localStorage.setItem('shop_closing_month', month);
    },

    getSalesByRange: async function (startDate, endDate) {
        return await this.call(`api/sales.php?action=list&start=${startDate}&end=${endDate}`) || [];
    },

    init: function () {
        console.log('Backend sync active');
    }
};

// Auto-init
store.init();
