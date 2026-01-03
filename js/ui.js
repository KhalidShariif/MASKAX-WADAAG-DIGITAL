/**
 * UI Module (Refactored for PHP Backend)
 * Handles View Rendering and Dynamic Components
 */
const ui = {
    version: "2.7",

    initTheme: function () {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        }
    },

    toggleTheme: function () {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        document.documentElement.setAttribute('data-theme', next);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = next === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
        }

        // Refresh charts if on relevant pages
        const currentView = app.state.currentView;
        if (currentView === 'dashboard') this.initDashboard();
        if (currentView === 'analysis') this.initAnalysis();
    },

    toggleSidebar: function () {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const isOpen = sidebar.classList.toggle('open');
        overlay.classList.toggle('active', isOpen);
    },

    getThemeColor: function (type) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const colors = {
            text: isDark ? '#94a3b8' : '#64748b',
            grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            secondary: isDark ? '#64748b' : '#94a3b8'
        };
        return colors[type];
    },

    // Global State
    cart: [],
    reportLoading: false,

    // View Templates
    views: {
        dashboard: function () {
            return `
                <div class="dashboard-stats-grid">
                    <div class="glass-card fade-in" style="animation-delay: 0.1s; display: flex; align-items: center; gap: 1.5rem;">
                        <div class="stat-icon" style="background: rgba(37, 99, 235, 0.1); color: var(--primary-main); padding: 1rem; border-radius: 12px; font-size: 1.5rem;">
                            <i class="ri-money-dollar-circle-line"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted">Total Sales</div>
                            <h2 class="stat-value" style="margin: 0;">$<span id="stat-sales">0.00</span></h2>
                        </div>
                    </div>
                    <div class="glass-card fade-in" style="animation-delay: 0.2s; display: flex; align-items: center; gap: 1.5rem;">
                        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-success); padding: 1rem; border-radius: 12px; font-size: 1.5rem;">
                            <i class="ri-line-chart-line"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted">Est. Net Profit</div>
                            <h2 class="stat-value" style="margin: 0;">$<span id="stat-profit">0.00</span></h2>
                        </div>
                    </div>
                    <div class="glass-card fade-in" style="animation-delay: 0.3s; display: flex; align-items: center; gap: 1.5rem;">
                        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--accent-warning); padding: 1rem; border-radius: 12px; font-size: 1.5rem;">
                            <i class="ri-box-3-line"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted">Total Products</div>
                            <h2 class="stat-value" id="stat-items" style="margin: 0;">0</h2>
                        </div>
                    </div>
                    <div class="glass-card fade-in" style="animation-delay: 0.4s; display: flex; align-items: center; gap: 1.5rem;">
                        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--accent-danger); padding: 1rem; border-radius: 12px; font-size: 1.5rem;">
                            <i class="ri-error-warning-line"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted">Low Stock</div>
                            <h2 class="stat-value" id="stat-stock" style="margin: 0;">0</h2>
                        </div>
                    </div>
                </div>

                <div class="dashboard-charts-grid">
                    <div class="glass-card fade-in" style="animation-delay: 0.5s">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="margin: 0;">Sales Overview</h3>
                            <div class="text-muted" style="font-size: 0.8rem;">Last 7 Days</div>
                        </div>
                        <div class="chart-container-compact">
                            <canvas id="salesChart"></canvas>
                        </div>
                    </div>
                    <div class="glass-card fade-in" style="animation-delay: 0.6s">
                        <h3 style="margin-bottom: 1.5rem;">Top Selling Products</h3>
                        <div id="top-products-list">
                            <div style="text-align: center; padding: 2rem;" class="text-muted">
                                <i class="ri-loader-4-line ri-spin" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                                Loading...
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        products: function () {
            return `
                <div class="glass-card fade-in" style="padding: 2rem;">
                    <div class="page-header-actions">
                        <div>
                            <h3 style="margin:0;">Product Inventory</h3>
                            <p class="text-muted" style="font-size: 0.9rem;">Manage and track your shop items</p>
                        </div>
                        ${auth.getUser().role !== 'staff' ? `
                        <button class="btn btn-primary" onclick="ui.openProductModal()">
                            <i class="ri-add-line"></i> Add New Product
                        </button>` : ''}
                    </div>
                    <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                        <div style="position: relative; flex: 1; max-width: 400px;">
                            <i class="ri-search-line" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                            <input type="text" id="product-search" placeholder="Search by name or category..." onkeyup="ui.renderProductTable(this.value)" style="padding-left: 2.8rem;">
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-size: 0.9rem;">
                                    <th style="padding: 1rem;">PRODUCT</th>
                                    <th style="padding: 1rem;">CATEGORY</th>
                                    <th style="padding: 1rem;">PRICE</th>
                                    <th style="padding: 1rem;">STOCK</th>
                                    <th style="padding: 1rem; text-align: right;">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody id="product-table-body">
                                <tr><td colspan="5" style="text-align:center; padding:3rem;">
                                    <i class="ri-loader-4-line ri-spin" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                                    Loading inventory...
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },
        pos: function () {
            return `
                <div class="pos-main-grid">
                    <div class="glass-card" style="display: flex; flex-direction: column; overflow: hidden; padding: 1.5rem;">
                        <div style="margin-bottom: 1.5rem;">
                            <div style="position: relative;">
                                <i class="ri-search-line" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                                <input type="text" id="pos-search" placeholder="Scan or search products..." onkeyup="ui.renderPosProducts(this.value)" style="padding-left: 2.8rem;">
                            </div>
                        </div>
                        <div id="pos-products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.2rem; overflow-y: auto; padding-right: 0.5rem;">
                            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading products...</div>
                        </div>
                    </div>
                    
                    <div class="glass-card" style="display: flex; flex-direction: column; padding: 1.5rem; background: var(--bg-surface);">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                            <i class="ri-shopping-cart-2-line" style="font-size: 1.2rem; color: var(--primary-main);"></i>
                            <h3 style="margin: 0;">Current Sale</h3>
                        </div>
                        
                        <div id="pos-cart-items" style="flex: 1; overflow-y: auto; margin-bottom: 1.5rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                            <div style="text-align: center; padding: 3rem;" class="text-muted">
                                <i class="ri-shopping-bag-line" style="font-size: 2.5rem; display: block; opacity: 0.3; margin-bottom: 1rem;"></i>
                                Your cart is empty
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <div style="margin-bottom: 1.2rem;">
                                <label style="display: block; margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Customer Selection</label>
                                <div style="position: relative;">
                                    <i class="ri-user-smile-line" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--primary-main); pointer-events: none;"></i>
                                    <select id="pos-customer" style="padding-left: 2.8rem; height: 52px; appearance: none;">
                                        <option value="">Guest / Walk-in</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Payment Method</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                                <label class="payment-option" style="cursor: pointer; position: relative; display: block;">
                                    <input type="radio" name="payment-method" value="cash" checked style="position: absolute; opacity: 0; width: 0; height: 0;">
                                    <div style="border: 1.5px solid var(--border-color); padding: 1rem 0.5rem; border-radius: 12px; text-align: center; font-weight: 600; transition: all 0.2s ease;">
                                        <i class="ri-bank-card-line" style="display: block; margin-bottom: 0.4rem; font-size: 1.3rem;"></i> Cash
                                    </div>
                                </label>
                                <label class="payment-option" style="cursor: pointer; position: relative; display: block;">
                                    <input type="radio" name="payment-method" value="debt" style="position: absolute; opacity: 0; width: 0; height: 0;">
                                    <div style="border: 1.5px solid var(--border-color); padding: 1rem 0.5rem; border-radius: 12px; text-align: center; font-weight: 600; transition: all 0.2s ease;">
                                        <i class="ri-hand-coin-line" style="display: block; margin-bottom: 0.4rem; font-size: 1.3rem;"></i> Debt
                                    </div>
                                </label>
                            </div>
                            
                            <div style="padding: 1rem; background: var(--bg-body); border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span class="text-muted">Subtotal</span>
                                    <span id="cart-subtotal">$0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 1.4rem;">
                                    <span>Total</span>
                                    <span id="cart-total" style="color: var(--primary-main);">$0.00</span>
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary" style="width: 100%; height: 56px; font-size: 1.1rem;" onclick="ui.processSale()">
                            Complete Checkout <i class="ri-arrow-right-line"></i>
                        </button>
                    </div>
                </div>
            `;
        },
        employees: function () {
            return `
                <div class="glass-card fade-in" style="padding: 2rem;">
                    <div class="page-header-actions">
                        <div>
                            <h3 style="margin: 0;">Employee Management</h3>
                            <p class="text-muted">Manage staff accounts and permissions</p>
                        </div>
                        <button class="btn btn-primary" onclick="ui.openEmployeeModal()">
                            <i class="ri-user-add-line"></i> Add Employee
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
                                    <th style="padding: 1rem; text-align: left;">USERNAME</th>
                                    <th style="padding: 1rem; text-align: left;">ROLE</th>
                                    <th style="padding: 1rem; text-align: right;">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody id="employee-table-body"></tbody>
                        </table>
                    </div>
                </div>
            `;
        },
        customers: function () {
            return `
                <div class="glass-card fade-in" style="padding: 2rem;">
                    <div class="page-header-actions">
                        <div>
                            <h3 style="margin: 0;">Customer Debts</h3>
                            <p class="text-muted">Track payments and outstanding balances</p>
                        </div>
                        <button class="btn btn-primary" onclick="ui.openCustomerModal()">
                            <i class="ri-user-follow-line"></i> New Customer
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
                                    <th style="padding: 1rem; text-align: left;">CUSTOMER NAME</th>
                                    <th style="padding: 1rem; text-align: left;">CONTACT INFO</th>
                                    <th style="padding: 1rem; text-align: left;">CURRENT DEBT</th>
                                    <th style="padding: 1rem; text-align: right;">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody id="customer-table-body"></tbody>
                        </table>
                    </div>
                </div>
            `;
        },
        analysis: function () {
            return `
                <div class="fade-in">
                    <!-- Page Header -->
                    <div style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="background: var(--primary-main); color: white; width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);">
                            <i class="ri-pie-chart-2-line"></i>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.5rem;">Financial Intelligence</h2>
                            <p class="text-muted" style="margin: 0; font-size: 0.9rem;">comprehensive business insights and performance reports</p>
                        </div>
                    </div>

                    <!-- Report Control Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
                        
                        <!-- Card 1: Time Perspective -->
                        <div class="glass-card" style="padding: 1.5rem; position: relative; overflow: hidden; border-top: 4px solid var(--primary-main);">
                            <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem;">
                                <i class="ri-calendar-check-line" style="font-size: 1.4rem; color: var(--primary-main);"></i>
                                <h4 style="margin: 0; font-size: 1.1rem;">Periodic Analysis</h4>
                            </div>
                            
                            <div style="display: flex; gap: 0.6rem; margin-bottom: 1rem;">
                                <select id="report-year" style="flex: 1.2; height: 46px; font-weight: 600; border-radius: 10px;">
                                    <option value="2027">2027</option>
                                    <option value="2026" selected>2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                                <select id="report-month" style="flex: 2; height: 46px; font-weight: 600; border-radius: 10px;">
                                    <option value="1">January</option><option value="2">February</option>
                                    <option value="3">March</option><option value="4">April</option>
                                    <option value="5">May</option><option value="6">June</option>
                                    <option value="7">July</option><option value="8">August</option>
                                    <option value="9">September</option><option value="10">October</option>
                                    <option value="11">November</option><option value="12">December</option>
                                </select>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                                <button class="btn btn-primary" onclick="ui.generateReport('year')" style="height: 46px; width: 100%;">
                                    <i class="ri-calendar-2-line"></i> Yearly Recap
                                </button>
                                <button class="btn btn-ghost" onclick="ui.generateReport('month')" style="height: 46px; border: 1px solid var(--border-color); width: 100%;">
                                    <i class="ri-calendar-event-line"></i> Monthly
                                </button>
                            </div>
                        </div>

                        <!-- Card 2: Precision Tracking -->
                        <div class="glass-card" style="padding: 1.5rem; position: relative; overflow: hidden; border-top: 4px solid var(--accent-success);">
                            <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem;">
                                <i class="ri-focus-3-line" style="font-size: 1.4rem; color: var(--accent-success);"></i>
                                <h4 style="margin: 0; font-size: 1.1rem;">Precision Tracking</h4>
                            </div>

                            <div style="margin-bottom: 1rem;">
                                <div style="position: relative;">
                                    <i class="ri-calendar-todo-line" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                                    <input type="date" id="report-date" value="${new Date().toISOString().split('T')[0]}" style="height: 46px; padding-left: 2.8rem; font-weight: 600;">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                                <button class="btn btn-ghost" onclick="ui.generateReport('day')" style="height: 46px; border: 1px solid var(--border-color); width: 100%; color: var(--accent-success);">
                                    <i class="ri-flashlight-line"></i> Daily
                                </button>
                                <button class="btn btn-ghost" onclick="ui.generateReport('week')" style="height: 46px; border: 1px solid var(--border-color); width: 100%;">
                                    <i class="ri-history-line"></i> Weekly
                                </button>
                            </div>
                        </div>

                        <!-- Card 3: Fiscal Strategy -->
                        <div class="glass-card" style="padding: 1.5rem; position: relative; overflow: hidden; border-top: 4px solid var(--accent-warning);">
                            <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.5rem;">
                                <i class="ri-safe-2-line" style="font-size: 1.4rem; color: var(--accent-warning);"></i>
                                <h4 style="margin: 0; font-size: 1.1rem;">Fiscal Strategy</h4>
                            </div>

                            <div style="background: var(--bg-body); border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.5;">
                                    Generate official accounting records based on your configured closing month cycle.
                                </p>
                            </div>

                            <button class="btn btn-primary" onclick="ui.generateReport('fiscal')" style="width: 100%; height: 46px; background: linear-gradient(135deg, var(--accent-warning), #d97706); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2); border: none;">
                                <i class="ri-file-chart-line"></i> Global Fiscal Report
                            </button>
                        </div>
                    </div>

                    <!-- Analysis Output Area -->
                    <div id="analysis-container">
                        <div class="glass-card" style="padding: 4rem; text-align: center; background: var(--bg-surface);">
                            <div style="position: relative; display: inline-block;">
                                <i class="ri-loader-4-line ri-spin" style="font-size: 3rem; color: var(--primary-main);"></i>
                                <i class="ri-database-2-line" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.2rem; color: var(--primary-main);"></i>
                            </div>
                            <h3 style="margin-top: 1.5rem; color: var(--text-main);">Aggregating Business Intelligence</h3>
                            <p class="text-muted" style="max-width: 400px; margin: 0.5rem auto 0;">Please wait while we synthesize your sales data and generate visual insights.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // --- DASHBOARD LOGIC ---
    salesChartInstance: null,
    initDashboard: async function () {
        if (this.salesChartInstance) this.salesChartInstance.destroy();

        const products = await store.getProducts();
        const sales = await store.getSales();

        // Update stats
        const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        const netProfit = totalSales * 0.2;
        const lowStock = products.filter(p => p.stock < 10).length;

        if (document.getElementById('stat-sales')) document.getElementById('stat-sales').innerText = totalSales.toFixed(2);
        if (document.getElementById('stat-profit')) document.getElementById('stat-profit').innerText = netProfit.toFixed(2);
        if (document.getElementById('stat-items')) document.getElementById('stat-items').innerText = products.length;
        if (document.getElementById('stat-stock')) {
            const el = document.getElementById('stat-stock');
            el.innerText = lowStock;
            el.className = 'stat-value ' + (lowStock > 0 ? 'text-danger' : 'text-success');
        }

        // Render Top Products
        const prodSales = {};
        sales.forEach(s => {
            const items = typeof s.items === 'string' ? JSON.parse(s.items) : (s.items || []);
            items.forEach(i => prodSales[i.id] = (prodSales[i.id] || 0) + i.quantity);
        });
        const top = Object.entries(prodSales)
            .map(([id, qty]) => {
                const p = products.find(p => p.id == id);
                return p ? { ...p, sold: qty } : null;
            })
            .filter(p => p)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        const listEl = document.getElementById('top-products-list');
        if (listEl) {
            listEl.innerHTML = top.map(p => `
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${p.name}</div>
                        <div class="text-muted" style="font-size: 0.8rem;">${p.sold} sold</div>
                    </div>
                    <div style="font-weight: 600;">$${(p.sold * p.price).toFixed(2)}</div>
                </div>
            `).join('') || '<p class="text-muted">No sales yet.</p>';
        }

        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        const days = [];
        const dailyTotals = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            const dStr = d.toISOString().split('T')[0];
            const dayTotal = sales
                .filter(s => s.sale_date.startsWith(dStr))
                .reduce((sum, s) => sum + parseFloat(s.total), 0);
            dailyTotals.push(dayTotal);
        }

        this.salesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Revenue',
                    data: dailyTotals,
                    backgroundColor: '#2563eb',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: this.getThemeColor('text') } },
                    y: { beginAtZero: true, ticks: { color: this.getThemeColor('text'), callback: v => '$' + v } }
                }
            }
        });
    },

    formatCurrency: function (value) {
        const val = parseFloat(value);
        return isNaN(val) ? '0.00' : val.toFixed(2);
    },

    initAnalysis: async function () {
        try {
            const sales = await store.getSales();
            const container = document.getElementById('analysis-container');
            if (!container) return;

            const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
            const categoryData = {};
            sales.forEach(s => {
                const items = typeof s.items === 'string' ? JSON.parse(s.items) : (s.items || []);
                items.forEach(item => {
                    const cat = item.category || 'Uncategorized';
                    categoryData[cat] = (categoryData[cat] || 0) + (parseFloat(item.price) * item.quantity);
                });
            });

            const fyeMonth = store.getClosingMonth();
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 style="margin:0;">Business Analysis</h3>
                    <button class="btn btn-primary no-print" onclick="window.print()"><i class="ri-printer-line"></i> Print</button>
                </div>
                <div class="dashboard-stats-grid">
                    <div class="glass-card">
                        <div class="text-muted">Total Revenue</div>
                        <h2>$${this.formatCurrency(totalRevenue)}</h2>
                    </div>
                    <div class="glass-card">
                        <div class="text-muted">Transactions</div>
                        <h2>${sales.length}</h2>
                    </div>
                </div>
                <div class="glass-card" style="margin: 2rem 0; border-left: 4px solid var(--primary-main);">
                    <h3>Accounting Settings</h3>
                    <div style="display:flex; gap:1rem; align-items:flex-end;">
                        <div>
                            <label class="text-muted">Closing Month</label>
                            <select id="closing-month-select" onchange="ui.updateClosingMonth(this.value)">
                                ${months.map((m, i) => `<option value="${i + 1}" ${fyeMonth == i + 1 ? 'selected' : ''}>${m}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="glass-card" style="margin-bottom: 2rem;">
                    <h3>Revenue by Category</h3>
                    <div style="height:300px;"><canvas id="categoryChart"></canvas></div>
                </div>

                <div class="glass-card">
                    <h3 style="margin-bottom: 1.5rem;">Recent Transactions</h3>
                    <div class="table-responsive">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <th style="padding: 1rem; text-align: left;">Date</th>
                                    <th style="padding: 1rem; text-align: left;">ID</th>
                                    <th style="padding: 1rem; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sales.slice(0, 10).map(s => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 1rem;">${new Date(s.sale_date).toLocaleString()}</td>
                                        <td style="padding: 1rem;">${s.id}</td>
                                        <td style="padding: 1rem; text-align: right;">$${this.formatCurrency(s.total)}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3" style="text-align:center; padding:1rem;">No transactions</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            const ctx = document.getElementById('categoryChart');
            if (ctx && typeof Chart !== 'undefined') {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(categoryData),
                        datasets: [{ data: Object.values(categoryData), backgroundColor: '#10b981' }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                });
            }
        } catch (e) {
            console.error('Analysis Failed:', e);
        }
    },

    updateClosingMonth: function (val) {
        store.saveClosingMonth(val);
        ui.showToast('Updated settings');
        this.initAnalysis();
    },

    generateReport: function (type) {
        let start, end, title;
        const now = new Date();
        const selYear = parseInt(document.getElementById('report-year')?.value || now.getFullYear());
        const selMonth = parseInt(document.getElementById('report-month')?.value || (now.getMonth() + 1));
        const selDateStr = document.getElementById('report-date')?.value || now.toISOString().split('T')[0];

        switch (type) {
            case 'day':
                start = new Date(selDateStr);
                end = new Date(selDateStr);
                title = `Daily Report (${selDateStr})`;
                break;
            case 'week':
                const d = new Date();
                const day = d.getDay() || 7;
                start = new Date(d);
                start.setDate(d.getDate() - day + 1);
                end = new Date(start);
                end.setDate(start.getDate() + 6);
                title = 'Weekly Report';
                break;
            case 'month':
                start = new Date(selYear, selMonth - 1, 1);
                end = new Date(selYear, selMonth, 0);
                title = `Monthly Report (${start.toLocaleString('default', { month: 'long' })} ${selYear})`;
                break;
            case 'year':
                start = new Date(selYear, 0, 1);
                end = new Date(selYear, 11, 31);
                title = `Calendar Year ${selYear} Report`;
                break;
            case 'fiscal':
                const closingMonth = store.getClosingMonth();
                end = new Date(selYear, closingMonth, 0);
                start = new Date(end);
                start.setFullYear(end.getFullYear() - 1);
                start.setDate(start.getDate() + 1);
                title = `Fiscal Year ${selYear} Report`;
                break;
        }

        const formatDate = d => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        this.renderReportModal(formatDate(start), formatDate(end), title);
    },

    printReportContent: function (elementId) {
        const source = document.getElementById(elementId);
        if (!source) return;

        // Create a temporary print-only container
        const printArea = document.createElement('div');
        printArea.id = 'system-print-area';

        // Clone the content card (the actual data)
        const content = source.querySelector('.glass-card') || source.querySelector('div[style*="background:white"]');
        if (!content) return;

        printArea.innerHTML = content.innerHTML;
        document.body.appendChild(printArea);

        // Notify CSS to hide everything else
        document.body.classList.add('is-printing-now');

        // Trigger print and cleanup
        setTimeout(() => {
            window.print();
            document.body.classList.remove('is-printing-now');
            printArea.remove();
        }, 300);
    },

    renderReportModal: async function (startStr, endStr, reportTitle) {
        if (this.reportLoading) return;
        this.reportLoading = true;
        try {
            const existing = document.getElementById('fiscal-modal');
            if (existing) existing.remove();
            document.body.classList.add('modal-printing-active');
            ui.showToast(`Loading ${reportTitle}...`, 'info');

            const sales = await store.getSalesByRange(startStr, endStr);
            const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

            const html = `
                <div class="modal-overlay" id="fiscal-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:10000; backdrop-filter: blur(8px);">
                    <div class="glass-card" style="width:95%; max-width:900px; padding:2rem; max-height:92vh; overflow-y:auto; border: 1px solid var(--border-color); position: relative;">
                        <!-- Header -->
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem;">
                            <div style="display: flex; gap: 1.2rem; align-items: center;">
                                <div style="background: var(--primary-main); color: white; width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                                    <i class="ri-file-list-3-line"></i>
                                </div>
                                <div>
                                    <h2 style="margin: 0; font-size: 1.6rem; color: var(--text-main);">${reportTitle}</h2>
                                    <p class="text-muted" style="margin: 0.2rem 0 0; font-weight: 500; font-size: 1rem;">
                                        <i class="ri-calendar-line"></i> ${startStr} — ${endStr}
                                    </p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.8rem;">
                                <button class="btn btn-ghost no-print" onclick="ui.printReportContent('fiscal-modal')" style="background: var(--bg-body); border: 1px solid var(--border-color);">
                                    <i class="ri-printer-line"></i> Print
                                </button>
                                <button class="btn btn-ghost no-print" onclick="document.body.classList.remove('modal-printing-active'); document.getElementById('fiscal-modal').remove()" style="background: var(--bg-body); border: 1px solid var(--border-color);">
                                    <i class="ri-close-line"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Highlights Section -->
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem; margin-bottom:2.5rem;">
                            <div style="padding:1.5rem; background: var(--bg-body); border-radius:16px; border-left: 5px solid var(--primary-main);">
                                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.8rem;">Total Volume</div>
                                <h3 style="color:var(--primary-main); font-size: 2rem; margin: 0;">$${totalRevenue.toFixed(2)}</h3>
                            </div>
                            <div style="padding:1.5rem; background: var(--bg-body); border-radius:16px; border-left: 5px solid var(--accent-success);">
                                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.8rem;">Transactions</div>
                                <h3 style="color:var(--accent-success); font-size: 2rem; margin: 0;">${sales.length}</h3>
                            </div>
                            <div style="padding:1.5rem; background: var(--bg-body); border-radius:16px; border-left: 5px solid var(--accent-warning);">
                                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.8rem;">Avg Sale</div>
                                <h3 style="color:var(--accent-warning); font-size: 2rem; margin: 0;">$${sales.length ? (totalRevenue / sales.length).toFixed(2) : '0.00'}</h3>
                            </div>
                        </div>

                        <!-- Data Table -->
                        <div style="background: var(--bg-body); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color);">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead>
                                    <tr style="background: var(--primary-light); color: var(--primary-main);">
                                        <th style="padding:1.2rem; text-align: left; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Timeline</th>
                                        <th style="padding:1.2rem; text-align: center; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Ops Count</th>
                                        <th style="padding:1.2rem; text-align: right; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Net Contribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${reportTitle.includes('Daily') ? this.calculateDailySummary(sales) : this.calculateMonthlySummary(sales)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
        } catch (e) {
            console.error(e);
        } finally {
            this.reportLoading = false;
        }
    },

    calculateMonthlySummary: function (sales) {
        const monthly = {};
        sales.forEach(s => {
            const d = new Date(s.sale_date);
            const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            if (!monthly[key]) monthly[key] = { rev: 0, count: 0 };
            monthly[key].rev += parseFloat(s.total);
            monthly[key].count++;
        });
        return Object.entries(monthly).sort().map(([key, val]) => `
            <tr>
                <td style="padding:1rem;">${key}</td>
                <td style="padding:1rem; text-align:center;">${val.count}</td>
                <td style="padding:1rem; text-align:right;">$${val.rev.toFixed(2)}</td>
            </tr>
        `).join('') || '<tr><td colspan="3" style="text-align:center;">No data</td></tr>';
    },

    calculateDailySummary: function (sales) {
        const daily = {};
        sales.forEach(s => {
            const dStr = s.sale_date.split(' ')[0];
            if (!daily[dStr]) daily[dStr] = { rev: 0, count: 0 };
            daily[dStr].rev += parseFloat(s.total);
            daily[dStr].count++;
        });
        return Object.entries(daily).sort().reverse().map(([key, val]) => `
            <tr>
                <td style="padding:1rem;">${key}</td>
                <td style="padding:1rem; text-align:center;">${val.count}</td>
                <td style="padding:1rem; text-align:right;">$${val.rev.toFixed(2)}</td>
            </tr>
        `).join('') || '<tr><td colspan="3" style="text-align:center;">No data</td></tr>';
    },

    // --- POS & CRUD LOGIC ---
    initPos: async function () {
        const select = document.getElementById('pos-customer');
        if (select) {
            const customers = await store.getCustomers();
            select.innerHTML = '<option value="">Guest / Walk-in</option>' +
                customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
        this.renderPosProducts();
        this.renderCart();
    },

    renderPosProducts: async function (term = '') {
        const grid = document.getElementById('pos-products-grid');
        if (!grid) return;
        let products = await store.getProducts();
        if (term) products = products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
        grid.innerHTML = products.map(p => `
            <div class="glass-card" style="padding:1rem; cursor:pointer;" onclick="ui.addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <div style="font-weight:600;">${p.name}</div>
                <div class="text-muted">$${parseFloat(p.price).toFixed(2)}</div>
            </div>
        `).join('');
    },

    addToCart: function (p) {
        const existing = this.cart.find(item => item.id == p.id);
        if (existing) existing.quantity++;
        else this.cart.push({ ...p, quantity: 1 });
        this.renderCart();
    },

    renderCart: function () {
        const container = document.getElementById('pos-cart-items');
        if (!container) return;
        let total = 0;
        container.innerHTML = this.cart.map((item, idx) => {
            total += item.price * item.quantity;
            return `
    < div style = "display:flex; justify-content:space-between; padding:1rem; border-bottom:1px solid var(--border-color);" >
                    <div>${item.name} x${item.quantity}</div>
                    <button class="btn btn-ghost text-danger" onclick="ui.removeFromCart(${idx})"><i class="ri-close-line"></i></button>
                </div >
    `;
        }).join('') || '<div style="padding:2rem; text-align:center;">Cart empty</div>';
        if (document.getElementById('cart-total')) document.getElementById('cart-total').innerText = `$${total.toFixed(2)} `;
    },

    removeFromCart: function (idx) {
        this.cart.splice(idx, 1);
        this.renderCart();
    },

    processSale: async function () {
        if (this.cart.length === 0) return alert('Cart empty');
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const customerId = document.getElementById('pos-customer').value;
        if (paymentMethod === 'debt' && !customerId) return alert('Select customer for debt');
        const total = this.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const res = await store.addSale({ total, paymentMethod, customerId, items: this.cart });
        if (res.success) {
            this.showToast('Sale complete!');
            this.printReceipt({ id: res.saleId, sale_date: new Date().toISOString(), total, items: this.cart });
            this.cart = [];
            this.renderCart();
        }
    },

    renderProductTable: async function (term = '') {
        const tbody = document.getElementById('product-table-body');
        if (!tbody) return;
        let products = await store.getProducts();
        if (term) products = products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
        tbody.innerHTML = products.map(p => `
            <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:1rem;">${p.name}</td>
                <td style="padding:1rem;">${p.category}</td>
                <td style="padding:1rem;">$${parseFloat(p.price).toFixed(2)}</td>
                <td style="padding:1rem;">${p.stock}</td>
                <td style="padding:1rem; text-align:right;">
                    <button class="btn btn-ghost" onclick="ui.openProductModal(${JSON.stringify(p).replace(/"/g, '&quot;')})"><i class="ri-pencil-line"></i></button>
                    <button class="btn btn-ghost text-danger" onclick="ui.deleteProduct(${p.id})"><i class="ri-delete-bin-line"></i></button>
                </td>
            </tr>
        `).join('');
    },

    openProductModal: function (p = null) {
        const isEdit = !!p;
        const html = `
            <div class="modal-overlay" id="p-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
                <div class="glass-card" style="width:400px;">
                    <h3>${isEdit ? 'Edit' : 'Add'} Product</h3>
                    <form onsubmit="ui.handleSaveProduct(event, ${isEdit ? p.id : 'null'})">
                        <input type="text" id="p-name" value="${isEdit ? p.name : ''}" placeholder="Name" required style="width:100%; margin:1rem 0;">
                        <input type="number" step="0.01" id="p-price" value="${isEdit ? p.price : ''}" placeholder="Price" required style="width:100%; margin-bottom:1rem;">
                        <input type="number" id="p-stock" value="${isEdit ? p.stock : ''}" placeholder="Stock" required style="width:100%; margin-bottom:1rem;">
                        <div style="display:flex; justify-content:flex-end; gap:1rem;">
                            <button type="button" class="btn btn-ghost" onclick="document.getElementById('p-modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    handleSaveProduct: async function (e, id) {
        e.preventDefault();
        const p = { id, name: document.getElementById('p-name').value, price: document.getElementById('p-price').value, stock: document.getElementById('p-stock').value, category: 'General' };
        await store.saveProduct(p);
        document.getElementById('p-modal').remove();
        this.showToast('Saved');
        this.renderProductTable();
    },

    deleteProduct: async function (id) {
        if (confirm('Delete?')) { await store.deleteProduct(id); this.renderProductTable(); }
    },

    renderEmployeeTable: async function () {
        const tbody = document.getElementById('employee-table-body');
        if (!tbody) return;
        const employees = await store.getEmployees();
        tbody.innerHTML = employees.map(e => `
            <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:1rem;">${e.username}</td>
                <td style="padding:1rem;">${e.role}</td>
                <td style="padding:1rem; text-align:right;">
                    <button class="btn btn-ghost" onclick='ui.openEmployeeModal(${JSON.stringify(e).replace(/'/g, "&#39;")})'><i class="ri-pencil-line"></i></button>
                    <button class="btn btn-ghost text-danger" onclick="ui.deleteEmployee(${e.id})"><i class="ri-delete-bin-line"></i></button>
                </td>
            </tr>
        `).join('');
    },

    openEmployeeModal: function (e = null) {
        const isEdit = !!e;
        const html = `
            <div class="modal-overlay" id="e-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
                <div class="glass-card" style="width:400px;">
                    <h3>${isEdit ? 'Edit' : 'Add'} Employee</h3>
                    <form onsubmit="ui.handleSaveEmployee(event, ${isEdit ? e.id : 'null'})">
                        <input type="text" id="e-user" value="${isEdit ? e.username : ''}" placeholder="Username" required style="width:100%; margin:1rem 0;">
                        <input type="password" id="e-pass" placeholder="${isEdit ? 'New Password (optional)' : 'Password'}" style="width:100%; margin-bottom:1rem;">
                        <select id="e-role" style="width:100%; margin-bottom:1rem;">
                            <option value="staff" ${isEdit && e.role === 'staff' ? 'selected' : ''}>Staff</option>
                            <option value="manager" ${isEdit && e.role === 'manager' ? 'selected' : ''}>Manager</option>
                        </select>
                        <div style="display:flex; justify-content:flex-end; gap:1rem;">
                            <button type="button" class="btn btn-ghost" onclick="document.getElementById('e-modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    handleSaveEmployee: async function (evt, id) {
        evt.preventDefault();
        const user = document.getElementById('e-user').value;
        const pass = document.getElementById('e-pass').value;
        const role = document.getElementById('e-role').value;
        if (id) await store.updateEmployee(id, user, pass, role);
        else await auth.register(user, pass, 'Shop', role);
        document.getElementById('e-modal').remove();
        this.renderEmployeeTable();
    },

    deleteEmployee: async function (id) {
        if (confirm('Delete?')) { await store.deleteEmployee(id); this.renderEmployeeTable(); }
    },

    renderCustomerTable: async function () {
        const tbody = document.getElementById('customer-table-body');
        if (!tbody) return;
        const customers = await store.getCustomers();
        tbody.innerHTML = customers.map(c => `
                <tr style="border-bottom:1px solid var(--border-color);">
                    <td style="padding:1rem;">${c.name}</td>
                    <td style="padding:1rem;">${c.contact}</td>
                    <td style="padding:1rem;">$${parseFloat(c.debt).toFixed(2)}</td>
                    <td style="padding:1rem; text-align:right;">
                        <button class="btn btn-ghost" onclick="ui.viewCustomerHistory(${c.id})"><i class="ri-history-line"></i></button>
                        ${auth.getUser().role !== 'staff' ? `<button class="btn btn-ghost text-danger" onclick="ui.deleteCustomer(${c.id})"><i class="ri-delete-bin-line"></i></button>` : ''}
                    </td>
                </tr>
                `).join('');
    },

    openCustomerModal: function () {
        const html = `
            <div class="modal-overlay" id="c-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
                <div class="glass-card" style="width:400px;">
                    <h3>Add Customer</h3>
                    <form onsubmit="ui.handleSaveCustomer(event)">
                        <input type="text" id="c-name" placeholder="Name" required style="width:100%; margin:1rem 0;">
                        <input type="text" id="c-contact" placeholder="Contact" style="width:100%; margin-bottom:1rem;">
                        <div style="display:flex; justify-content:flex-end; gap:1rem;">
                            <button type="button" class="btn btn-ghost" onclick="document.getElementById('c-modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    handleSaveCustomer: async function (e) {
        e.preventDefault();
        await store.saveCustomer({ name: document.getElementById('c-name').value, contact: document.getElementById('c-contact').value, debt: 0 });
        document.getElementById('c-modal').remove();
        this.renderCustomerTable();
    },

    deleteCustomer: async function (id) {
        if (auth.getUser().role === 'staff') return alert('Access Denied: Staff cannot delete customers.');
        if (confirm('Delete?')) { await store.deleteCustomer(id); this.renderCustomerTable(); }
    },

    viewCustomerHistory: async function (id) {
        const customers = await store.getCustomers();
        const customer = customers.find(c => c.id == id);
        const history = await store.getCustomerHistory(id);
        document.body.classList.add('modal-printing-active');
        const html = `
                    <div class="modal-overlay" id="h-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
                        <div class="glass-card" style="width:500px; max-height:80vh; overflow-y:auto;">
                            <h3>History: ${customer.name}</h3>
                            <table style="width:100%; margin:1rem 0;">
                                ${history.map(t => `<tr><td>${t.created_at}</td><td>${t.type}</td><td style="text-align:right;">$${parseFloat(t.amount).toFixed(2)}</td></tr>`).join('')}
                            </table>
                            <button class="btn btn-primary" onclick="ui.handlePaymentModal(${id}, ${customer.debt})">Make Payment</button>
                            <button class="btn btn-ghost" onclick="document.body.classList.remove('modal-printing-active'); document.getElementById('h-modal').remove()">Close</button>
                        </div>
                    </div>
                    `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    handlePaymentModal: function (id, debt) {
        const amount = prompt("Amount:");
        if (amount && confirm("Confirm?")) {
            store.addCustomerDebt(id, parseFloat(amount), 'PAYMENT', 'Customer payment').then(() => {
                document.getElementById('h-modal').remove();
                this.renderCustomerTable();
            });
        }
    },

    printReceipt: function (sale) {
        document.body.classList.add('modal-printing-active');
        const user = auth.getUser();
        const html = `
                    <div id="receipt-modal" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center;">
                        <div style="background:white; padding:20px; width:300px; color:black; font-family:'Courier New', monospace;">
                            <h2 style="text-align:center;">${user.shop_name || 'Receipt'}</h2>
                            <table style="width:100%; margin:10px 0;">
                                ${sale.items.map(i => `<tr><td>${i.name} x${i.quantity}</td><td style="text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('')}
                            </table>
                            <div style="font-weight:bold; display:flex; justify-content:space-between;"><span>TOTAL</span><span>$${parseFloat(sale.total).toFixed(2)}</span></div>
                            <button class="btn btn-primary no-print" onclick="ui.printReportContent('receipt-modal')" style="width:100%; margin-top:20px;">Print</button>
                            <button class="btn btn-ghost no-print" onclick="document.body.classList.remove('modal-printing-active'); document.getElementById('receipt-modal').remove()" style="width:100%;">Close</button>
                        </div>
                    </div>
                    `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    showToast: function (msg, type = 'success') {
        const c = document.getElementById('toast-container');
        if (!c) return;
        const t = document.createElement('div');
        t.className = `toast ${type} show`;
        t.innerText = msg;
        c.appendChild(t);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
    },

    updateSidebar: function () {
        const user = auth.getUser();
        if (!user) return;
        if (user.role === 'staff') {
            ['nav-employees', 'nav-analysis'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }
    }
};

// Auto-init toast container
if (!document.getElementById('toast-container')) {
    document.body.insertAdjacentHTML('beforeend', '<div id="toast-container" style="position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;"></div>');
}
