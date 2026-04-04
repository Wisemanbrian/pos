// ============================================
// WORLD-CLASS POS SYSTEM - CONFIGURATION
// ============================================
const CURRENCY = {
    code: 'MWK',
    symbol: 'MK',
    name: 'Malawi Kwacha',
    decimalPlaces: 0
};

const TAX_CONFIG = {
    VAT_RATE: 0.165,
    VAT_NUMBER: 'MW-VAT-123456789',
    WITHHOLDING_TAX: 0.03
};

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_USERS = 'pos_world_users';
const STORAGE_PRODUCTS = 'pos_world_products';
const STORAGE_ORDERS = 'pos_world_orders';
const STORAGE_VOIDS = 'pos_world_voids';
const STORAGE_CUSTOMERS = 'pos_world_customers';
const STORAGE_SUPPLIERS = 'pos_world_suppliers';
const STORAGE_CATEGORIES = 'pos_world_categories';
const STORAGE_PURCHASES = 'pos_world_purchases';
const STORAGE_RETURNS = 'pos_world_returns';
const STORAGE_STORES = 'pos_world_stores';
const STORAGE_AUDIT = 'pos_world_audit';
const STORAGE_CURRENT_USER = 'pos_world_current_user';
const STORAGE_SESSION = 'pos_world_session';
const STORAGE_TAX_SETTINGS = 'pos_world_tax';

// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let products = [];
let orders = [];
let voids = [];
let customers = [];
let suppliers = [];
let categories = [];
let purchases = [];
let returns = [];
let stores = [];
let auditLog = [];
let cart = [];
let currentView = 'dashboard';
let currentCategoryFilter = 'all';
let searchQuery = '';
let currentStore = null;
let taxSettings = { vatRate: TAX_CONFIG.VAT_RATE, enabled: true };

// ============================================
// INITIAL DATA
// ============================================
const defaultUsers = [
    { id: 'u1', username: 'admin', password: 'admin123', name: 'System Administrator', role: 'admin', email: 'admin@pos.com', phone: '+265 888 123 456', createdAt: new Date().toISOString() },
    { id: 'u2', username: 'manager', password: 'manager123', name: 'Store Manager', role: 'manager', email: 'manager@pos.com', phone: '+265 888 123 457', createdAt: new Date().toISOString() },
    { id: 'u3', username: 'cashier1', password: 'cash123', name: 'John Cashier', role: 'cashier', email: 'john@pos.com', phone: '+265 888 123 458', createdAt: new Date().toISOString() }
];

const defaultCategories = [
    { id: 'cat1', name: 'Beverages', description: 'Hot and cold drinks', color: '#2563eb', icon: 'coffee' },
    { id: 'cat2', name: 'Food', description: 'Meals and snacks', color: '#10b981', icon: 'restaurant' },
    { id: 'cat3', name: 'Desserts', description: 'Sweet treats', color: '#f59e0b', icon: 'cake' },
    { id: 'cat4', name: 'Groceries', description: 'Daily essentials', color: '#3b82f6', icon: 'shopping_cart' },
    { id: 'cat5', name: 'Electronics', description: 'Electronic devices', color: '#8b5cf6', icon: 'devices' }
];

const defaultProducts = [
    { id: 'p1', name: 'Cappuccino', price: 4500, cost: 2000, category: 'Beverages', stock: 100, sku: 'BEV001', barcode: '123456789', icon: 'coffee', reorderLevel: 20, taxRate: 0.165, brand: 'Premium Coffee' },
    { id: 'p2', name: 'Cheesecake', price: 5900, cost: 2500, category: 'Desserts', stock: 50, sku: 'DES001', barcode: '123456790', icon: 'cake', reorderLevel: 15, taxRate: 0.165, brand: 'Homemade' },
    { id: 'p3', name: 'Iced Latte', price: 5000, cost: 2200, category: 'Beverages', stock: 80, sku: 'BEV002', barcode: '123456791', icon: 'local_cafe', reorderLevel: 20, taxRate: 0.165, brand: 'Premium Coffee' },
    { id: 'p4', name: 'Club Sandwich', price: 7500, cost: 3500, category: 'Food', stock: 40, sku: 'FOO001', barcode: '123456792', icon: 'restaurant', reorderLevel: 10, taxRate: 0.165, brand: 'Deli' },
    { id: 'p5', name: 'Espresso', price: 3200, cost: 1500, category: 'Beverages', stock: 120, sku: 'BEV003', barcode: '123456793', icon: 'coffee', reorderLevel: 25, taxRate: 0.165, brand: 'Premium Coffee' },
    { id: 'p6', name: 'Croissant', price: 3800, cost: 1800, category: 'Pastries', stock: 60, sku: 'PAS001', barcode: '123456794', icon: 'bakery_dining', reorderLevel: 15, taxRate: 0.165, brand: 'French Bakery' },
    { id: 'p7', name: 'Mocha', price: 5500, cost: 2300, category: 'Beverages', stock: 75, sku: 'BEV004', barcode: '123456795', icon: 'coffee', reorderLevel: 18, taxRate: 0.165, brand: 'Premium Coffee' },
    { id: 'p8', name: 'Tiramisu', price: 6500, cost: 3000, category: 'Desserts', stock: 45, sku: 'DES002', barcode: '123456796', icon: 'cake', reorderLevel: 12, taxRate: 0.165, brand: 'Italian' },
    { id: 'p9', name: 'Maize Flour (2kg)', price: 2500, cost: 1800, category: 'Groceries', stock: 200, sku: 'GR001', barcode: '123456797', icon: 'grass', reorderLevel: 40, taxRate: 0.165, brand: 'Local' },
    { id: 'p10', name: 'Cooking Oil (1L)', price: 3500, cost: 2600, category: 'Groceries', stock: 150, sku: 'GR002', barcode: '123456798', icon: 'oil_barrel', reorderLevel: 30, taxRate: 0.165, brand: 'SunGold' }
];

const defaultCustomers = [
    { id: 'c1', name: 'Walk-in Customer', email: '', phone: '', points: 0, totalSpent: 0, joinDate: new Date().toISOString(), tier: 'Bronze', address: '' }
];

const defaultSuppliers = [
    { id: 's1', name: 'Premium Coffee Supplies', contact: 'John Smith', email: 'orders@premiumcoffee.com', phone: '+265 888 111 222', address: 'Lilongwe, Malawi', category: 'Beverages', paymentTerms: 'Net 30', rating: 5 },
    { id: 's2', name: 'French Bakery', contact: 'Marie Curie', email: 'info@frenchbakery.com', phone: '+265 888 222 333', address: 'Blantyre, Malawi', category: 'Pastries', paymentTerms: 'Net 15', rating: 4 },
    { id: 's3', name: 'Local Grocers Ltd', contact: 'Peter Mwale', email: 'sales@localgrocers.mw', phone: '+265 888 333 444', address: 'Mzuzu, Malawi', category: 'Groceries', paymentTerms: 'Net 30', rating: 5 }
];

const defaultStores = [
    { id: 'store1', name: 'Main Store - Lilongwe', address: 'Area 3, Lilongwe', phone: '+265 888 123 456', manager: 'John Manager', status: 'active' },
    { id: 'store2', name: 'Branch Store - Blantyre', address: 'Ginnery Corner, Blantyre', phone: '+265 888 123 457', manager: 'Jane Branch', status: 'active' }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatCurrency(amount) {
    return `${CURRENCY.symbol} ${Math.round(amount).toLocaleString()}`;
}

function formatCurrencyBlurred(amount, isAdmin) {
    if (isAdmin) {
        return formatCurrency(amount);
    }
    return '••••••';
}

function calculateVAT(amount) {
    return amount * taxSettings.vatRate;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'info'));
    toast.innerHTML = `<span class="material-icons" style="color: var(--${type})">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function addAuditLog(action, details) {
    if (!currentUser) return;
    const logEntry = {
        id: 'audit_' + Date.now(),
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        userId: currentUser.id,
        role: currentUser.role,
        action: action,
        details: details,
        store: currentStore?.name || 'Main Store'
    };
    auditLog.unshift(logEntry);
    localStorage.setItem(STORAGE_AUDIT, JSON.stringify(auditLog));
    
    if (auditLog.length > 1000) auditLog = auditLog.slice(0, 1000);
}

function saveProducts() { localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products)); }
function saveOrders() { localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders)); }
function saveVoids() { localStorage.setItem(STORAGE_VOIDS, JSON.stringify(voids)); }
function saveCustomers() { localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(customers)); }
function saveSuppliers() { localStorage.setItem(STORAGE_SUPPLIERS, JSON.stringify(suppliers)); }
function saveCategories() { localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(categories)); }
function savePurchases() { localStorage.setItem(STORAGE_PURCHASES, JSON.stringify(purchases)); }
function saveReturns() { localStorage.setItem(STORAGE_RETURNS, JSON.stringify(returns)); }
function saveStores() { localStorage.setItem(STORAGE_STORES, JSON.stringify(stores)); }
function saveTaxSettings() { localStorage.setItem(STORAGE_TAX_SETTINGS, JSON.stringify(taxSettings)); }

function loadData() {
    const storedProducts = localStorage.getItem(STORAGE_PRODUCTS);
    if (storedProducts) products = JSON.parse(storedProducts);
    else { products = [...defaultProducts]; saveProducts(); }
    
    const storedOrders = localStorage.getItem(STORAGE_ORDERS);
    if (storedOrders) orders = JSON.parse(storedOrders);
    else orders = [];
    
    const storedVoids = localStorage.getItem(STORAGE_VOIDS);
    if (storedVoids) voids = JSON.parse(storedVoids);
    else voids = [];
    
    const storedCustomers = localStorage.getItem(STORAGE_CUSTOMERS);
    if (storedCustomers) customers = JSON.parse(storedCustomers);
    else { customers = [...defaultCustomers]; saveCustomers(); }
    
    const storedSuppliers = localStorage.getItem(STORAGE_SUPPLIERS);
    if (storedSuppliers) suppliers = JSON.parse(storedSuppliers);
    else { suppliers = [...defaultSuppliers]; saveSuppliers(); }
    
    const storedCategories = localStorage.getItem(STORAGE_CATEGORIES);
    if (storedCategories) categories = JSON.parse(storedCategories);
    else { categories = [...defaultCategories]; saveCategories(); }
    
    const storedPurchases = localStorage.getItem(STORAGE_PURCHASES);
    if (storedPurchases) purchases = JSON.parse(storedPurchases);
    else purchases = [];
    
    const storedReturns = localStorage.getItem(STORAGE_RETURNS);
    if (storedReturns) returns = JSON.parse(storedReturns);
    else returns = [];
    
    const storedStores = localStorage.getItem(STORAGE_STORES);
    if (storedStores) stores = JSON.parse(storedStores);
    else { stores = [...defaultStores]; saveStores(); }
    
    const storedAudit = localStorage.getItem(STORAGE_AUDIT);
    if (storedAudit) auditLog = JSON.parse(storedAudit);
    else auditLog = [];
    
    const storedTax = localStorage.getItem(STORAGE_TAX_SETTINGS);
    if (storedTax) taxSettings = JSON.parse(storedTax);
    
    if (!localStorage.getItem(STORAGE_USERS)) localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
    
    currentStore = stores[0];
}

function updateDateTime() {
    const el = document.getElementById('datetimeDisplay');
    if (el) {
        const now = new Date();
        el.innerHTML = `<span class="material-icons" style="font-size: 0.8rem;">schedule</span> ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
    }
}
setInterval(updateDateTime, 1000);

// ============================================
// AUTHENTICATION
// ============================================
function login(username, password) {
    const users = JSON.parse(localStorage.getItem(STORAGE_USERS)) || defaultUsers;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = { ...user, password: undefined };
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
        localStorage.setItem(STORAGE_SESSION, Date.now().toString());
        document.getElementById('sidebarUserName').innerHTML = `${currentUser.name} <span class="role-badge">${currentUser.role.toUpperCase()}</span>`;
        document.getElementById('userRoleBadge').innerText = currentUser.role.toUpperCase();
        document.getElementById('storeName').innerText = currentStore?.name || 'Main Store';
        addAuditLog('LOGIN', `User ${currentUser.name} logged in`);
        showToast(`Welcome back, ${currentUser.name}!`);
        
        document.querySelectorAll('.admin-only').forEach(el => {
            if (currentUser.role === 'admin') el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
        
        renderCurrentView();
        return true;
    }
    showToast('Invalid credentials!', 'error');
    return false;
}

function logout() {
    addAuditLog('LOGOUT', `User ${currentUser?.name} logged out`);
    currentUser = null;
    localStorage.removeItem(STORAGE_CURRENT_USER);
    localStorage.removeItem(STORAGE_SESSION);
    showLoginModal();
}

function isAdmin() { return currentUser && currentUser.role === 'admin'; }
function isManager() { return currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager'); }
function isAuthenticated() { return currentUser !== null; }

// ============================================
// VOID TRANSACTION (ADMIN ONLY)
// ============================================
function voidTransaction(orderId, reason) {
    if (!isAdmin()) { showToast('Only Admin can void transactions!', 'error'); return false; }
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) { showToast('Order not found!', 'error'); return false; }
    
    const order = orders[orderIndex];
    if (order.status === 'voided') { showToast('Order already voided!', 'warning'); return false; }
    
    const voidRecord = {
        id: 'void_' + Date.now(),
        orderId: orderId,
        originalOrder: { ...order },
        voidDate: new Date().toISOString(),
        voidedBy: currentUser.name,
        voidedById: currentUser.id,
        reason: reason,
        totalVoided: order.total
    };
    
    voids.unshift(voidRecord);
    saveVoids();
    
    order.status = 'voided';
    order.voidedBy = currentUser.name;
    order.voidedDate = new Date().toISOString();
    order.voidReason = reason;
    orders[orderIndex] = order;
    saveOrders();
    
    order.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock += item.quantity;
            saveProducts();
        }
    });
    
    addAuditLog('VOID_TRANSACTION', `Voided order ${orderId} - Reason: ${reason} - Amount: ${formatCurrency(order.total)}`);
    showToast(`Transaction ${orderId} voided successfully!`, 'success');
    renderCurrentView();
    return true;
}

// ============================================
// DAILY SALES SUMMARY
// ============================================
function getDailySummary(date = new Date()) {
    const targetDate = date.toDateString();
    const dayOrders = orders.filter(o => new Date(o.date).toDateString() === targetDate && o.status !== 'voided');
    const dayVoids = voids.filter(v => new Date(v.voidDate).toDateString() === targetDate);
    
    const totalSales = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalVAT = dayOrders.reduce((sum, o) => sum + (o.vat || 0), 0);
    const totalVoided = dayVoids.reduce((sum, v) => sum + v.totalVoided, 0);
    const netSales = totalSales - totalVoided;
    const transactionCount = dayOrders.length;
    const voidCount = dayVoids.length;
    
    const paymentBreakdown = {};
    dayOrders.forEach(order => {
        const method = order.paymentMethod || 'cash';
        paymentBreakdown[method] = (paymentBreakdown[method] || 0) + order.total;
    });
    
    const categorySales = {};
    dayOrders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                categorySales[product.category] = (categorySales[product.category] || 0) + item.subtotal;
            }
        });
    });
    
    const productSales = {};
    dayOrders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });
    const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    return {
        date: targetDate,
        totalSales,
        totalVAT,
        totalVoided,
        netSales,
        transactionCount,
        voidCount,
        paymentBreakdown,
        categorySales,
        topProducts
    };
}

// ============================================
// STAFF MANAGEMENT
// ============================================
function getUsers() { return JSON.parse(localStorage.getItem(STORAGE_USERS)) || defaultUsers; }
function saveUsersToStorage(users) { localStorage.setItem(STORAGE_USERS, JSON.stringify(users)); }

function createStaff(userData) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    const users = getUsers();
    if (users.find(u => u.username === userData.username)) {
        showToast('Username already exists!', 'error');
        return false;
    }
    const newUser = {
        id: 'u' + Date.now(),
        username: userData.username,
        password: userData.password,
        name: userData.name,
        role: userData.role || 'cashier',
        email: userData.email || '',
        phone: userData.phone || '',
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsersToStorage(users);
    addAuditLog('CREATE_STAFF', `Created staff: ${newUser.name} (${newUser.role})`);
    showToast(`${newUser.name} created successfully!`);
    renderCurrentView();
    return true;
}

function updateStaff(id, userData) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        saveUsersToStorage(users);
        addAuditLog('UPDATE_STAFF', `Updated staff: ${users[index].name}`);
        showToast('Staff updated!');
        renderCurrentView();
        return true;
    }
    return false;
}

function deleteStaff(id) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    if (currentUser.id === id) { showToast('Cannot delete own account!', 'error'); return false; }
    let users = getUsers();
    const deletedUser = users.find(u => u.id === id);
    users = users.filter(u => u.id !== id);
    saveUsersToStorage(users);
    addAuditLog('DELETE_STAFF', `Deleted staff: ${deletedUser?.name}`);
    showToast('Staff deleted!');
    renderCurrentView();
    return true;
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================
function addProduct(productData) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return false; }
    const newProduct = { id: 'p' + Date.now(), ...productData, stock: productData.stock || 0, sales: 0 };
    products.push(newProduct);
    saveProducts();
    addAuditLog('ADD_PRODUCT', `Added product: ${newProduct.name}`);
    showToast('Product added!');
    renderCurrentView();
    return true;
}

function updateProduct(id, productData) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return false; }
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        const oldName = products[index].name;
        products[index] = { ...products[index], ...productData };
        saveProducts();
        addAuditLog('UPDATE_PRODUCT', `Updated product: ${oldName} -> ${products[index].name}`);
        showToast('Product updated!');
        renderCurrentView();
        return true;
    }
    return false;
}

function deleteProduct(id) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    const product = products.find(p => p.id === id);
    products = products.filter(p => p.id !== id);
    cart = cart.filter(i => i.id !== id);
    saveProducts();
    addAuditLog('DELETE_PRODUCT', `Deleted product: ${product?.name}`);
    showToast('Product deleted!');
    renderCurrentView();
    return true;
}

function updateStock(productId, quantity, type = 'sale') {
    const product = products.find(p => p.id === productId);
    if (product) {
        if (type === 'sale') {
            product.stock -= quantity;
            product.sales = (product.sales || 0) + quantity;
        } else if (type === 'purchase') {
            product.stock += quantity;
        }
        if (product.stock < 0) product.stock = 0;
        saveProducts();
        
        if (product.stock <= product.reorderLevel) {
            showToast(`⚠️ Low stock alert: ${product.name} (${product.stock} left)`, 'warning');
        }
    }
}

// ============================================
// CATEGORY MANAGEMENT
// ============================================
function addCategory(categoryData) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    const newCategory = { id: 'cat' + Date.now(), ...categoryData };
    categories.push(newCategory);
    saveCategories();
    addAuditLog('ADD_CATEGORY', `Added category: ${newCategory.name}`);
    showToast('Category added!');
    renderCurrentView();
    return true;
}

function updateCategory(id, categoryData) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
        categories[index] = { ...categories[index], ...categoryData };
        saveCategories();
        addAuditLog('UPDATE_CATEGORY', `Updated category: ${categories[index].name}`);
        showToast('Category updated!');
        renderCurrentView();
        return true;
    }
    return false;
}

function deleteCategory(id) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    const cat = categories.find(c => c.id === id);
    const productsInCategory = products.filter(p => p.category === cat?.name);
    if (productsInCategory.length > 0) {
        showToast(`Cannot delete: ${productsInCategory.length} products in this category`, 'error');
        return false;
    }
    categories = categories.filter(c => c.id !== id);
    saveCategories();
    addAuditLog('DELETE_CATEGORY', `Deleted category: ${cat?.name}`);
    showToast('Category deleted!');
    renderCurrentView();
    return true;
}

// ============================================
// SUPPLIER MANAGEMENT
// ============================================
function addSupplier(supplierData) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return false; }
    const newSupplier = { id: 's' + Date.now(), ...supplierData, createdAt: new Date().toISOString() };
    suppliers.push(newSupplier);
    saveSuppliers();
    addAuditLog('ADD_SUPPLIER', `Added supplier: ${newSupplier.name}`);
    showToast('Supplier added!');
    renderCurrentView();
    return true;
}

function updateSupplier(id, supplierData) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return false; }
    const index = suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
        suppliers[index] = { ...suppliers[index], ...supplierData };
        saveSuppliers();
        addAuditLog('UPDATE_SUPPLIER', `Updated supplier: ${suppliers[index].name}`);
        showToast('Supplier updated!');
        renderCurrentView();
        return true;
    }
    return false;
}

function deleteSupplier(id) {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); return false; }
    const supplier = suppliers.find(s => s.id === id);
    suppliers = suppliers.filter(s => s.id !== id);
    saveSuppliers();
    addAuditLog('DELETE_SUPPLIER', `Deleted supplier: ${supplier?.name}`);
    showToast('Supplier deleted!');
    renderCurrentView();
    return true;
}

// ============================================
// PURCHASE ORDER MANAGEMENT
// ============================================
function createPurchaseOrder(orderData) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return false; }
    const purchaseOrder = {
        id: 'PO' + Date.now(),
        date: new Date().toISOString(),
        supplierId: orderData.supplierId,
        supplierName: suppliers.find(s => s.id === orderData.supplierId)?.name,
        items: orderData.items,
        total: orderData.items.reduce((sum, i) => sum + (i.cost * i.quantity), 0),
        status: 'pending',
        createdBy: currentUser.name,
        expectedDelivery: orderData.expectedDelivery
    };
    purchases.unshift(purchaseOrder);
    savePurchases();
    addAuditLog('CREATE_PO', `Created PO: ${purchaseOrder.id} for ${purchaseOrder.supplierName}`);
    showToast('Purchase order created!');
    renderCurrentView();
    return true;
}

function receivePurchaseOrder(orderId) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return false; }
    const order = purchases.find(p => p.id === orderId);
    if (order && order.status === 'pending') {
        order.status = 'received';
        order.receivedDate = new Date().toISOString();
        order.items.forEach(item => {
            updateStock(item.productId, item.quantity, 'purchase');
        });
        savePurchases();
        addAuditLog('RECEIVE_PO', `Received PO: ${order.id}`);
        showToast('Order received and stock updated!');
        renderCurrentView();
        return true;
    }
    return false;
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================
function addCustomer(customerData) {
    const newCustomer = { 
        id: 'c' + Date.now(), 
        ...customerData, 
        points: 0, 
        totalSpent: 0, 
        joinDate: new Date().toISOString(),
        tier: 'Bronze',
        visits: 0,
        lastVisit: new Date().toISOString()
    };
    customers.push(newCustomer);
    saveCustomers();
    addAuditLog('ADD_CUSTOMER', `Added customer: ${newCustomer.name}`);
    showToast('Customer added!');
    renderCurrentView();
    return true;
}

function updateCustomerPoints(customerId, amount) {
    const customer = customers.find(c => c.id === customerId);
    if (customer && customer.id !== 'c1') {
        customer.totalSpent += amount;
        customer.points = Math.floor(customer.totalSpent / 5000);
        customer.visits = (customer.visits || 0) + 1;
        customer.lastVisit = new Date().toISOString();
        
        if (customer.totalSpent >= 500000) customer.tier = 'Platinum';
        else if (customer.totalSpent >= 200000) customer.tier = 'Gold';
        else if (customer.totalSpent >= 50000) customer.tier = 'Silver';
        else customer.tier = 'Bronze';
        
        saveCustomers();
    }
}

function redeemPoints(customerId, points) {
    const customer = customers.find(c => c.id === customerId);
    if (customer && customer.points >= points) {
        customer.points -= points;
        saveCustomers();
        const discount = points * 50;
        addAuditLog('REDEEM_POINTS', `${customer.name} redeemed ${points} points for ${formatCurrency(discount)}`);
        showToast(`Redeemed ${points} points for ${formatCurrency(discount)} discount!`, 'success');
        return discount;
    }
    return 0;
}

// ============================================
// RETURN MANAGEMENT
// ============================================
function createReturn(orderId, items, reason) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return false; }
    const order = orders.find(o => o.id === orderId);
    if (!order) { showToast('Order not found!', 'error'); return false; }
    
    const returnOrder = {
        id: 'RET' + Date.now(),
        orderId: orderId,
        date: new Date().toISOString(),
        items: items,
        total: items.reduce((sum, i) => sum + i.refundAmount, 0),
        reason: reason,
        status: 'approved',
        processedBy: currentUser.name
    };
    
    returns.unshift(returnOrder);
    saveReturns();
    
    items.forEach(item => {
        updateStock(item.productId, item.quantity, 'purchase');
    });
    
    addAuditLog('CREATE_RETURN', `Return processed for order ${orderId} - Amount: ${formatCurrency(returnOrder.total)}`);
    showToast(`Return processed: ${formatCurrency(returnOrder.total)} refunded`, 'success');
    renderCurrentView();
    return true;
}

// ============================================
// CART & SALE FUNCTIONS
// ============================================
let appliedDiscount = 0;
let appliedDiscountPercent = 0;
let selectedCustomerId = 'c1';

function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        if (existing.quantity + 1 > product.stock) {
            showToast(`Only ${product.stock} ${product.name}(s) in stock!`, 'error');
            return;
        }
        existing.quantity++;
    } else {
        if (product.stock < 1) {
            showToast(`${product.name} is out of stock!`, 'error');
            return;
        }
        cart.push({ ...product, quantity: 1 });
    }
    renderCurrentView();
    showToast(`${product.name} added to cart`);
}

function updateCartQty(id, delta) {
    const idx = cart.findIndex(i => i.id === id);
    const product = products.find(p => p.id === id);
    if (idx !== -1 && product) {
        const newQty = cart[idx].quantity + delta;
        if (newQty > product.stock) {
            showToast(`Only ${product.stock} items available!`, 'error');
            return;
        }
        if (newQty <= 0) cart.splice(idx, 1);
        else cart[idx].quantity = newQty;
        renderCurrentView();
    }
}

function clearCart() { 
    cart = []; 
    appliedDiscount = 0;
    appliedDiscountPercent = 0;
    renderCurrentView(); 
    showToast('Cart cleared'); 
}

function getCartSubtotal() { return cart.reduce((sum, i) => sum + (i.price * i.quantity), 0); }
function getCartDiscount() { return getCartSubtotal() * (appliedDiscountPercent / 100); }
function getCartVAT() { return calculateVAT(getCartSubtotal() - getCartDiscount()); }
function getCartTotal() { return getCartSubtotal() - getCartDiscount() + getCartVAT(); }
function getCartItemCount() { return cart.reduce((sum, i) => sum + i.quantity, 0); }

function applyDiscount(percent) {
    if (percent < 0 || percent > 100) {
        showToast('Discount must be between 0-100%', 'error');
        return false;
    }
    appliedDiscountPercent = percent;
    appliedDiscount = getCartSubtotal() * (percent / 100);
    renderCurrentView();
    showToast(`${percent}% discount applied!`, 'success');
    return true;
}

// ============================================
// COMPLETE SALE
// ============================================
function completeSale(amountReceived, paymentMethod = 'cash') {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const vat = getCartVAT();
    const total = getCartTotal();
    
    if (amountReceived < total) throw new Error(`Insufficient amount! Need ${formatCurrency(total)}`);
    const change = amountReceived - total;
    
    cart.forEach(item => {
        updateStock(item.id, item.quantity, 'sale');
    });
    
    if (selectedCustomerId && selectedCustomerId !== 'c1') {
        updateCustomerPoints(selectedCustomerId, total);
    }
    
    const order = {
        id: 'ORD' + Date.now(),
        date: new Date().toISOString(),
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, subtotal: i.price * i.quantity })),
        subtotal: subtotal,
        discount: discount,
        discountPercent: appliedDiscountPercent,
        vat: vat,
        vatRate: taxSettings.vatRate,
        total: total,
        paid: amountReceived,
        change: change,
        cashier: currentUser.name,
        cashierId: currentUser.id,
        customerId: selectedCustomerId || 'c1',
        customerName: customers.find(c => c.id === selectedCustomerId)?.name || 'Walk-in Customer',
        paymentMethod: paymentMethod,
        store: currentStore?.name || 'Main Store',
        vatNumber: TAX_CONFIG.VAT_NUMBER,
        status: 'completed'
    };
    orders.unshift(order);
    saveOrders();
    addAuditLog('SALE_COMPLETED', `Sale completed - Order: ${order.id} - Total: ${formatCurrency(order.total)}`);
    clearCart();
    return order;
}

function showReceipt(order) {
    const customer = customers.find(c => c.id === order.customerId) || { name: 'Walk-in Customer' };
    const modal = createModal('🧾 Tax Invoice', `
        <div class="receipt">
            <h3 style="text-align:center">🏪 POS Enterprise Pro</h3>
            <p style="text-align:center">${order.store}</p>
            <p style="text-align:center">VAT No: ${TAX_CONFIG.VAT_NUMBER}</p>
            <p style="text-align:center">${new Date(order.date).toLocaleString()}</p>
            <p style="text-align:center">Cashier: ${order.cashier}</p>
            <p style="text-align:center">Customer: ${customer.name}</p>
            <hr/>
            ${order.items.map(item => `<p>${item.name} x${item.quantity} = ${formatCurrency(item.subtotal)}</p>`).join('')}
            <hr/>
            <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
            ${order.discount > 0 ? `<p>Discount (${order.discountPercent}%): -${formatCurrency(order.discount)}</p>` : ''}
            <p>VAT (${(order.vatRate * 100).toFixed(1)}%): ${formatCurrency(order.vat)}</p>
            <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
            <p>Paid: ${formatCurrency(order.paid)}</p>
            <p>Change: ${formatCurrency(order.change)}</p>
            <hr/>
            ${customer.points > 0 ? `<p>Loyalty Points: ${customer.points}</p>` : ''}
            <p style="text-align:center; font-size:0.6rem;">Thank you! Visit again</p>
            <p style="text-align:center; font-size:0.55rem;">This is a computer generated invoice</p>
        </div>
        <div class="form-actions">
            <button class="btn btn-primary" id="printReceiptBtn">🖨️ Print</button>
            <button class="btn" id="closeReceiptBtn">Close</button>
        </div>
    `);
    document.body.appendChild(modal);
    document.getElementById('printReceiptBtn')?.addEventListener('click', () => {
        const receiptHtml = modal.querySelector('.receipt').cloneNode(true);
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Tax Invoice</title><style>body{font-family:monospace;padding:20px;}</style></head><body>${receiptHtml.outerHTML}</body></html>`);
        win.print();
    });
    document.getElementById('closeReceiptBtn')?.addEventListener('click', () => modal.remove());
}

// ============================================
// MODAL HELPERS
// ============================================
function createModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="close-modal material-icons">close</button>
            </div>
            <div class="modal-body">${content}</div>
        </div>
    `;
    overlay.querySelector('.close-modal').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    return overlay;
}

function showVoidModal(orderId) {
    const modal = createModal('Void Transaction', `
        <div class="form-group">
            <label>Reason for Void</label>
            <textarea id="voidReason" placeholder="Enter reason for voiding this transaction..." rows="3"></textarea>
        </div>
        <div class="form-actions">
            <button class="btn btn-danger" id="confirmVoidBtn">✅ Confirm Void</button>
            <button class="btn" id="cancelBtn">Cancel</button>
        </div>
    `);
    document.body.appendChild(modal);
    document.getElementById('confirmVoidBtn')?.addEventListener('click', () => {
        const reason = document.getElementById('voidReason').value;
        if (!reason) { showToast('Please provide a reason!', 'error'); return; }
        voidTransaction(orderId, reason);
        modal.remove();
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showPaymentModal() {
    if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }
    const total = getCartTotal();
    const customerOptions = customers.map(c => `<option value="${c.id}" ${selectedCustomerId === c.id ? 'selected' : ''}>${c.name} (${c.tier} - ${c.points} pts)</option>`).join('');
    
    const modal = createModal('💳 Payment', `
        <div class="form-group">
            <label>Customer</label>
            <select id="customerSelect">${customerOptions}</select>
        </div>
        <div class="form-group">
            <label>Discount (%)</label>
            <input type="number" id="discountPercent" step="1" min="0" max="100" value="${appliedDiscountPercent}">
        </div>
        <div class="form-group">
            <label>Payment Method</label>
            <select id="paymentMethod">
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="mobile">Mobile Money</option>
                <option value="points">Loyalty Points</option>
            </select>
        </div>
        <p style="font-size:0.85rem; font-weight:800; text-align:center; margin:0.5rem 0;">
            Subtotal: ${formatCurrency(getCartSubtotal())}<br>
            Discount: -${formatCurrency(getCartDiscount())}<br>
            VAT (16.5%): ${formatCurrency(getCartVAT())}<br>
            <strong>Total: ${formatCurrency(total)}</strong>
        </p>
        <div class="form-group">
            <label>Amount Received</label>
            <input type="number" id="amountPaid" step="100" placeholder="Enter amount" autofocus>
        </div>
        <div id="paymentError" style="color:var(--danger); font-size:0.7rem;"></div>
        <div class="form-actions">
            <button class="btn btn-success" id="confirmPayBtn">✅ Complete Sale</button>
            <button class="btn" id="cancelPayBtn">Cancel</button>
        </div>
    `);
    document.body.appendChild(modal);
    
    document.getElementById('discountPercent')?.addEventListener('change', (e) => {
        applyDiscount(parseFloat(e.target.value) || 0);
        modal.remove();
        showPaymentModal();
    });
    
    document.getElementById('confirmPayBtn')?.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('amountPaid').value);
        const paymentMethod = document.getElementById('paymentMethod').value;
        selectedCustomerId = document.getElementById('customerSelect').value;
        
        if (isNaN(amount)) { document.getElementById('paymentError').innerText = 'Enter valid amount'; return; }
        try {
            const order = completeSale(amount, paymentMethod);
            modal.remove();
            showReceipt(order);
            renderCurrentView();
            showToast('Sale completed successfully!');
        } catch (err) {
            document.getElementById('paymentError').innerText = err.message;
        }
    });
    document.getElementById('cancelPayBtn')?.addEventListener('click', () => modal.remove());
}

function showProductModal(product = null) {
    if (!isManager()) { showToast('Manager access required!', 'error'); return; }
    const isEdit = !!product;
    const categoryOptions = categories.map(c => `<option value="${c.name}" ${product?.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('');
    
    const modal = createModal(isEdit ? '✏️ Edit Product' : '➕ Add Product', `
        <div class="form-group"><label>Product Name</label><input id="prodName" value="${product?.name || ''}"></div>
        <div class="form-group"><label>Selling Price (MWK)</label><input id="prodPrice" type="number" step="100" value="${product?.price || ''}"></div>
        <div class="form-group"><label>Cost Price (MWK)</label><input id="prodCost" type="number" step="100" value="${product?.cost || ''}"></div>
        <div class="form-group"><label>Category</label><select id="prodCategory">${categoryOptions}</select></div>
        <div class="form-group"><label>Stock Quantity</label><input id="prodStock" type="number" value="${product?.stock || 0}"></div>
        <div class="form-group"><label>SKU / Barcode</label><input id="prodSku" value="${product?.sku || ''}"></div>
        <div class="form-group"><label>Reorder Level</label><input id="prodReorder" type="number" value="${product?.reorderLevel || 20}"></div>
        <div class="form-group"><label>Brand</label><input id="prodBrand" value="${product?.brand || ''}"></div>
        <div class="form-actions"><button class="btn btn-primary" id="saveProductBtn">Save</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    document.getElementById('saveProductBtn')?.addEventListener('click', () => {
        const name = document.getElementById('prodName').value.trim();
        const price = parseFloat(document.getElementById('prodPrice').value);
        const cost = parseFloat(document.getElementById('prodCost').value);
        const category = document.getElementById('prodCategory').value;
        const stock = parseInt(document.getElementById('prodStock').value) || 0;
        const sku = document.getElementById('prodSku').value.trim();
        const reorderLevel = parseInt(document.getElementById('prodReorder').value) || 20;
        const brand = document.getElementById('prodBrand').value.trim();
        if (name && !isNaN(price) && category) {
            if (isEdit) updateProduct(product.id, { name, price, cost, category, stock, sku, reorderLevel, brand });
            else addProduct({ name, price, cost, category, stock, sku, reorderLevel, brand, icon: 'inventory_2', taxRate: TAX_CONFIG.VAT_RATE });
            modal.remove();
        } else showToast('Please fill required fields', 'error');
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showCategoryModal(category = null) {
    const modal = createModal(category ? '✏️ Edit Category' : '➕ Add Category', `
        <div class="form-group"><label>Category Name</label><input id="catName" value="${category?.name || ''}"></div>
        <div class="form-group"><label>Description</label><textarea id="catDesc">${category?.description || ''}</textarea></div>
        <div class="form-group"><label>Icon (material icon name)</label><input id="catIcon" value="${category?.icon || 'category'}"></div>
        <div class="form-actions"><button class="btn btn-primary" id="saveCatBtn">Save</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    document.getElementById('saveCatBtn')?.addEventListener('click', () => {
        const name = document.getElementById('catName').value.trim();
        const description = document.getElementById('catDesc').value;
        const icon = document.getElementById('catIcon').value.trim();
        if (name) {
            if (category) updateCategory(category.id, { name, description, icon });
            else addCategory({ name, description, icon });
            modal.remove();
        } else showToast('Category name required!', 'error');
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showSupplierModal(supplier = null) {
    const modal = createModal(supplier ? '✏️ Edit Supplier' : '➕ Add Supplier', `
        <div class="form-group"><label>Supplier Name</label><input id="supName" value="${supplier?.name || ''}"></div>
        <div class="form-group"><label>Contact Person</label><input id="supContact" value="${supplier?.contact || ''}"></div>
        <div class="form-group"><label>Email</label><input id="supEmail" type="email" value="${supplier?.email || ''}"></div>
        <div class="form-group"><label>Phone</label><input id="supPhone" value="${supplier?.phone || ''}"></div>
        <div class="form-group"><label>Address</label><textarea id="supAddress">${supplier?.address || ''}</textarea></div>
        <div class="form-group"><label>Category</label><input id="supCategory" value="${supplier?.category || ''}"></div>
        <div class="form-actions"><button class="btn btn-primary" id="saveSupBtn">Save</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    document.getElementById('saveSupBtn')?.addEventListener('click', () => {
        const name = document.getElementById('supName').value.trim();
        const contact = document.getElementById('supContact').value;
        const email = document.getElementById('supEmail').value;
        const phone = document.getElementById('supPhone').value;
        const address = document.getElementById('supAddress').value;
        const category = document.getElementById('supCategory').value;
        if (name) {
            if (supplier) updateSupplier(supplier.id, { name, contact, email, phone, address, category });
            else addSupplier({ name, contact, email, phone, address, category });
            modal.remove();
        } else showToast('Supplier name required!', 'error');
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showPOModal() {
    const supplierOptions = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const productOptions = products.map(p => `<option value="${p.id}" data-price="${p.cost}">${p.name} (${p.sku}) - ${formatCurrency(p.cost)}</option>`).join('');
    
    const modal = createModal('Create Purchase Order', `
        <div class="form-group"><label>Supplier</label><select id="poSupplier">${supplierOptions}</select></div>
        <div class="form-group"><label>Expected Delivery Date</label><input type="date" id="poDelivery"></div>
        <div class="form-group"><label>Add Item</label><div style="display:flex; gap:0.5rem;"><select id="poProduct" style="flex:2">${productOptions}</select><input type="number" id="poQty" placeholder="Qty" style="flex:1"><button class="btn btn-sm btn-primary" id="addItemBtn">Add</button></div></div>
        <div id="poItemsList"></div>
        <div class="form-actions"><button class="btn btn-success" id="submitPOBtn">Create PO</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    let items = [];
    
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        const productId = document.getElementById('poProduct').value;
        const product = products.find(p => p.id === productId);
        const quantity = parseInt(document.getElementById('poQty').value);
        if (product && quantity > 0) {
            items.push({ productId, productName: product.name, quantity, cost: product.cost });
            document.getElementById('poItemsList').innerHTML = items.map(i => `<div>${i.productName} x${i.quantity} = ${formatCurrency(i.cost * i.quantity)}</div>`).join('');
            document.getElementById('poQty').value = '';
        }
    });
    
    document.getElementById('submitPOBtn')?.addEventListener('click', () => {
        const supplierId = document.getElementById('poSupplier').value;
        const expectedDelivery = document.getElementById('poDelivery').value;
        if (items.length === 0) { showToast('Add at least one item!', 'error'); return; }
        createPurchaseOrder({ supplierId, items, expectedDelivery });
        modal.remove();
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showReturnModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = createModal('Process Return', `
        <div class="form-group"><label>Order: ${order.id}</label></div>
        <div id="returnItems"></div>
        <div class="form-group"><label>Return Reason</label><textarea id="returnReason" placeholder="Reason for return..."></textarea></div>
        <div class="form-actions"><button class="btn btn-success" id="processReturnBtn">Process Return</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    
    const itemsDiv = document.getElementById('returnItems');
    itemsDiv.innerHTML = order.items.map(item => `
        <div><input type="checkbox" class="return-checkbox" data-id="${item.id}" data-price="${item.price}" data-max="${item.quantity}"> ${item.name} - Qty: <input type="number" class="return-qty" data-id="${item.id}" min="0" max="${item.quantity}" value="0" style="width:60px;"> (Max ${item.quantity})</div>
    `).join('');
    
    document.getElementById('processReturnBtn')?.addEventListener('click', () => {
        const reason = document.getElementById('returnReason').value;
        const returnItems = [];
        document.querySelectorAll('.return-checkbox:checked').forEach(cb => {
            const productId = cb.dataset.id;
            const qtyInput = document.querySelector(`.return-qty[data-id="${productId}"]`);
            const quantity = parseInt(qtyInput.value);
            if (quantity > 0) {
                const item = order.items.find(i => i.id === productId);
                returnItems.push({ productId, productName: item.name, quantity, refundAmount: item.price * quantity });
            }
        });
        if (returnItems.length === 0) { showToast('Select items to return!', 'error'); return; }
        createReturn(orderId, returnItems, reason);
        modal.remove();
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showCustomerModal(customer = null) {
    const modal = createModal(customer ? '✏️ Edit Customer' : '➕ Add Customer', `
        <div class="form-group"><label>Customer Name</label><input id="custName" value="${customer?.name || ''}"></div>
        <div class="form-group"><label>Phone Number</label><input id="custPhone" value="${customer?.phone || ''}"></div>
        <div class="form-group"><label>Email</label><input id="custEmail" type="email" value="${customer?.email || ''}"></div>
        <div class="form-group"><label>Address</label><textarea id="custAddress">${customer?.address || ''}</textarea></div>
        <div class="form-actions"><button class="btn btn-primary" id="saveCustBtn">Save</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    document.getElementById('saveCustBtn')?.addEventListener('click', () => {
        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value;
        const email = document.getElementById('custEmail').value;
        const address = document.getElementById('custAddress').value;
        if (name) {
            if (customer) {
                customer.name = name; customer.email = email; customer.phone = phone; customer.address = address;
                saveCustomers();
                addAuditLog('UPDATE_CUSTOMER', `Updated customer: ${name}`);
                showToast('Customer updated!');
            } else addCustomer({ name, email, phone, address });
            modal.remove();
            renderCurrentView();
        } else showToast('Customer name required!', 'error');
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showStaffModal(staff = null) {
    const modal = createModal(staff ? '✏️ Edit Staff' : '➕ Add Staff', `
        <div class="form-group"><label>Full Name</label><input id="staffName" value="${staff?.name || ''}"></div>
        <div class="form-group"><label>Username</label><input id="staffUsername" value="${staff?.username || ''}" ${staff ? 'readonly' : ''}></div>
        <div class="form-group"><label>Password</label><input id="staffPassword" type="password" placeholder="${staff ? 'Leave blank to keep' : 'Enter password'}"></div>
        <div class="form-group"><label>Role</label><select id="staffRole"><option value="cashier" ${staff?.role === 'cashier' ? 'selected' : ''}>Cashier</option><option value="manager" ${staff?.role === 'manager' ? 'selected' : ''}>Manager</option></select></div>
        <div class="form-group"><label>Phone</label><input id="staffPhone" value="${staff?.phone || ''}"></div>
        <div class="form-group"><label>Email</label><input id="staffEmail" type="email" value="${staff?.email || ''}"></div>
        <div class="form-actions"><button class="btn btn-primary" id="saveStaffBtn">Save</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    document.getElementById('saveStaffBtn')?.addEventListener('click', () => {
        const name = document.getElementById('staffName').value.trim();
        const username = document.getElementById('staffUsername').value.trim();
        const password = document.getElementById('staffPassword').value;
        const role = document.getElementById('staffRole').value;
        const phone = document.getElementById('staffPhone').value;
        const email = document.getElementById('staffEmail').value;
        if (!name || !username) { showToast('Name and username required!', 'error'); return; }
        if (!staff && !password) { showToast('Password required for new staff!', 'error'); return; }
        
        if (staff) {
            const updateData = { name, phone, email, role };
            if (password) updateData.password = password;
            updateStaff(staff.id, updateData);
        } else createStaff({ name, username, password, role, phone, email });
        modal.remove();
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

function showStoreModal(store = null) {
    const modal = createModal(store ? '✏️ Edit Store' : '➕ Add Store', `
        <div class="form-group"><label>Store Name</label><input id="storeNameInput" value="${store?.name || ''}"></div>
        <div class="form-group"><label>Manager Name</label><input id="storeManager" value="${store?.manager || ''}"></div>
        <div class="form-group"><label>Phone</label><input id="storePhone" value="${store?.phone || ''}"></div>
        <div class="form-group"><label>Address</label><textarea id="storeAddress">${store?.address || ''}</textarea></div>
        <div class="form-actions"><button class="btn btn-primary" id="saveStoreBtn">Save</button><button class="btn" id="cancelBtn">Cancel</button></div>
    `);
    document.body.appendChild(modal);
    document.getElementById('saveStoreBtn')?.addEventListener('click', () => {
        const name = document.getElementById('storeNameInput').value.trim();
        const manager = document.getElementById('storeManager').value;
        const phone = document.getElementById('storePhone').value;
        const address = document.getElementById('storeAddress').value;
        if (name) {
            if (store) {
                store.name = name; store.manager = manager; store.phone = phone; store.address = address;
                saveStores();
                addAuditLog('UPDATE_STORE', `Updated store: ${name}`);
                showToast('Store updated!');
            } else {
                stores.push({ id: 'store' + Date.now(), name, manager, phone, address, status: 'active' });
                saveStores();
                addAuditLog('ADD_STORE', `Added store: ${name}`);
                showToast('Store added!');
            }
            modal.remove();
            renderCurrentView();
        } else showToast('Store name required!', 'error');
    });
    document.getElementById('cancelBtn')?.addEventListener('click', () => modal.remove());
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderDashboard() {
    const today = new Date().toDateString();
    const summary = getDailySummary();
    const totalRevenue = orders.filter(o => o.status !== 'voided').reduce((sum, o) => sum + o.total, 0);
    const totalVAT = orders.filter(o => o.status !== 'voided').reduce((sum, o) => sum + (o.vat || 0), 0);
    const lowStock = products.filter(p => p.stock <= p.reorderLevel).length;
    const voidCount = voids.length;
    const isAdminUser = isAdmin();
    
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar">
            <h1 class="page-title">Dashboard</h1>
            <div class="datetime" id="datetimeDisplay"></div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">Today's Sales</div><div class="stat-value ${!isAdminUser ? 'stat-value-blur' : ''}">${isAdminUser ? formatCurrency(summary.netSales) : '••••••'}</div><div class="stat-change">${summary.transactionCount} transactions</div></div>
            <div class="stat-card"><div class="stat-title">Total Revenue</div><div class="stat-value ${!isAdminUser ? 'stat-value-blur' : ''}">${isAdminUser ? formatCurrency(totalRevenue) : '••••••'}</div></div>
            <div class="stat-card"><div class="stat-title">Total VAT</div><div class="stat-value ${!isAdminUser ? 'stat-value-blur' : ''}">${isAdminUser ? formatCurrency(totalVAT) : '••••••'}</div></div>
            <div class="stat-card"><div class="stat-title">Voided Transactions</div><div class="stat-value ${voidCount > 0 ? 'stock-low' : ''}">${voidCount}</div></div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">Low Stock Items</div><div class="stat-value ${lowStock > 0 ? 'stock-low' : ''}">${lowStock}</div></div>
            <div class="stat-card"><div class="stat-title">Total Products</div><div class="stat-value">${products.length}</div></div>
            <div class="stat-card"><div class="stat-title">Total Orders</div><div class="stat-value">${orders.filter(o => o.status !== 'voided').length}</div></div>
            <div class="stat-card"><div class="stat-title">👋 Welcome</div><div class="stat-value" style="font-size:0.9rem;">${currentUser?.name}</div><div class="stat-change">${currentUser?.role?.toUpperCase()}</div></div>
        </div>
        ${!isAdminUser ? '<div class="stat-card" style="text-align:center; padding:0.5rem; background:var(--warning); color:white;">🔒 Financial data is hidden for privacy. Only Admin can view figures.</div>' : ''}
    `;
    updateDateTime();
}

function renderPOSView() {
    const allCategories = ['all', ...categories.map(c => c.name)];
    let filtered = currentCategoryFilter === 'all' ? products : products.filter(p => p.category === currentCategoryFilter);
    if (searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">🛒 Point of Sale</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="category-tabs" id="posCategoryTabs"></div>
        <div class="search-bar"><input type="text" id="posSearch" placeholder="🔍 Search by name, SKU..."></div>
        <div class="products-grid" id="posProductsGrid"></div>
        <div class="cart-panel" id="cartPanel"></div>
    `;
    
    const tabsDiv = document.getElementById('posCategoryTabs');
    tabsDiv.innerHTML = allCategories.map(cat => `<button class="category-tab ${currentCategoryFilter === cat ? 'active' : ''}" data-cat="${cat}">${cat === 'all' ? '📋 All' : cat}</button>`).join('');
    document.querySelectorAll('.category-tab').forEach(btn => btn.addEventListener('click', () => { currentCategoryFilter = btn.dataset.cat; renderPOSView(); }));
    document.getElementById('posSearch').addEventListener('input', (e) => { searchQuery = e.target.value; renderPOSView(); });
    
    const grid = document.getElementById('posProductsGrid');
    grid.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}">
            <span class="material-icons product-icon">${p.icon || 'inventory_2'}</span>
            <div class="product-name">${p.name}</div>
            <div class="product-category">${p.category}</div>
            <div class="product-price">${formatCurrency(p.price)}</div>
            <div class="product-stock ${p.stock <= p.reorderLevel ? 'stock-low' : ''}">Stock: ${p.stock}</div>
        </div>
    `).join('');
    document.querySelectorAll('#posProductsGrid .product-card').forEach(card => card.addEventListener('click', () => { 
        const prod = products.find(p => p.id === card.dataset.id); 
        if (prod) addToCart(prod); 
    }));
    
    renderCartUI();
}

function renderCartUI() {
    const cartPanel = document.getElementById('cartPanel');
    if (!cartPanel) return;
    if (cart.length === 0) { 
        cartPanel.innerHTML = `<div style="text-align:center; padding:0.8rem;">🛒 Cart is empty - Click products to add</div>`; 
        return; 
    }
    cartPanel.innerHTML = `
        <div class="cart-header"><h3>Current Order (${getCartItemCount()} items)</h3><button class="btn btn-sm btn-danger" id="clearCartBtn">Clear All</button></div>
        ${cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info"><strong>${item.name}</strong><br/>${formatCurrency(item.price)}</div>
                <div class="cart-qty">
                    <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
                    <span style="width:65px;text-align:right;">${formatCurrency(item.price * item.quantity)}</span>
                </div>
            </div>
        `).join('')}
        <div class="total-row">
            <div>Subtotal: ${formatCurrency(getCartSubtotal())}</div>
            ${appliedDiscountPercent > 0 ? `<div>Discount (${appliedDiscountPercent}%): -${formatCurrency(getCartDiscount())}</div>` : ''}
            <div>VAT (16.5%): ${formatCurrency(getCartVAT())}</div>
            <div><strong>Total: ${formatCurrency(getCartTotal())}</strong></div>
        </div>
        <div class="form-actions">
            <button class="btn btn-warning" id="applyDiscountBtn">🏷️ Apply Discount</button>
            <button class="btn btn-success" id="checkoutBtn">💵 Checkout</button>
        </div>
    `;
    document.querySelectorAll('.qty-btn').forEach(btn => btn.addEventListener('click', () => updateCartQty(btn.dataset.id, parseInt(btn.dataset.delta))));
    document.getElementById('checkoutBtn')?.addEventListener('click', showPaymentModal);
    document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);
    document.getElementById('applyDiscountBtn')?.addEventListener('click', () => {
        const percent = prompt('Enter discount percentage (0-100):', appliedDiscountPercent);
        if (percent !== null) applyDiscount(parseFloat(percent));
    });
}

function renderProductsView() {
    if (!isManager()) { showToast('Manager access required!', 'error'); renderDashboard(); return; }
    const allCategories = ['all', ...categories.map(c => c.name)];
    let filtered = currentCategoryFilter === 'all' ? products : products.filter(p => p.category === currentCategoryFilter);
    if (searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">📦 Inventory Management</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="category-tabs" id="prodCategoryTabs"></div>
        <div class="search-bar"><input type="text" id="prodSearch" placeholder="🔍 Search products..."><button class="btn btn-primary" id="addProductBtn">+ Add Product</button></div>
        <div class="products-grid" id="productsGrid"></div>
    `;
    const tabsDiv = document.getElementById('prodCategoryTabs');
    tabsDiv.innerHTML = allCategories.map(cat => `<button class="category-tab ${currentCategoryFilter === cat ? 'active' : ''}" data-cat="${cat}">${cat === 'all' ? '📋 All' : cat}</button>`).join('');
    document.querySelectorAll('.category-tab').forEach(btn => btn.addEventListener('click', () => { currentCategoryFilter = btn.dataset.cat; renderProductsView(); }));
    document.getElementById('prodSearch').addEventListener('input', (e) => { searchQuery = e.target.value; renderProductsView(); });
    document.getElementById('addProductBtn').addEventListener('click', () => showProductModal());
    
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <span class="material-icons product-icon">${p.icon || 'inventory_2'}</span>
            <div class="product-name">${p.name}</div>
            <div class="product-category">${p.category}</div>
            <div class="product-price">${formatCurrency(p.price)}</div>
            <div class="product-stock ${p.stock <= p.reorderLevel ? 'stock-low' : ''}">Stock: ${p.stock} | Min: ${p.reorderLevel}</div>
            <div class="form-actions" style="margin-top:0.4rem;">
                <button class="btn btn-sm btn-primary edit-product" data-id="${p.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-product" data-id="${p.id}">Delete</button>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.edit-product').forEach(btn => btn.addEventListener('click', () => showProductModal(products.find(p => p.id === btn.dataset.id))));
    document.querySelectorAll('.delete-product').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
    updateDateTime();
}

function renderCategoriesView() {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">📂 Categories</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="search-bar"><button class="btn btn-primary" id="addCategoryBtn">+ Add Category</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Name</th><th>Description</th><th>Products</th><th>Actions</th></tr></thead><tbody>${categories.map(c => `<tr><td><span class="material-icons" style="font-size:1rem;">${c.icon || 'category'}</span> ${c.name}</td><td>${c.description || '-'}</td><td>${products.filter(p => p.category === c.name).length}</td><td><button class="btn btn-sm btn-primary edit-cat" data-id="${c.id}">Edit</button> <button class="btn btn-sm btn-danger delete-cat" data-id="${c.id}">Delete</button></td></tr>`).join('')}</tbody>}</table></div>
    `;
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => showCategoryModal());
    document.querySelectorAll('.edit-cat').forEach(btn => btn.addEventListener('click', () => showCategoryModal(categories.find(c => c.id === btn.dataset.id))));
    document.querySelectorAll('.delete-cat').forEach(btn => btn.addEventListener('click', () => deleteCategory(btn.dataset.id)));
    updateDateTime();
}

function renderPurchasesView() {
    if (!isManager()) { showToast('Manager access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">📦 Purchase Orders</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="search-bar"><button class="btn btn-primary" id="createPOBtn">+ Create PO</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>PO #</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>${purchases.map(po => `<tr><td>${po.id}</td><td>${new Date(po.date).toLocaleDateString()}</td><td>${po.supplierName}</td><td>${po.items.length}</td><td>${formatCurrency(po.total)}</td><td><span class="badge badge-${po.status === 'received' ? 'success' : 'warning'}">${po.status}</span></td><td>${po.status === 'pending' ? `<button class="btn btn-sm btn-success receive-po" data-id="${po.id}">Receive</button>` : 'Received'}</td></tr>`).join('')}</tbody>}</table></div>
    `;
    document.getElementById('createPOBtn')?.addEventListener('click', () => showPOModal());
    document.querySelectorAll('.receive-po').forEach(btn => btn.addEventListener('click', () => receivePurchaseOrder(btn.dataset.id)));
    updateDateTime();
}

function renderSuppliersView() {
    if (!isManager()) { showToast('Manager access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">🚚 Suppliers</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="search-bar"><button class="btn btn-primary" id="addSupplierBtn">+ Add Supplier</button></div>
        <div class="supplier-grid">${suppliers.map(s => `
            <div class="supplier-card">
                <span class="material-icons" style="font-size:1.5rem;">local_shipping</span>
                <div class="supplier-name">${s.name}</div>
                <div class="supplier-category" style="font-size:0.6rem; background:var(--primary); display:inline-block; padding:2px 6px; border-radius:10px; color:white;">${s.category || 'General'}</div>
                <div style="font-size:0.7rem; margin-top:0.3rem;">Contact: ${s.contact || '-'}</div>
                <div style="font-size:0.7rem;">${s.email || '-'}</div>
                <div style="font-size:0.7rem;">${s.phone || '-'}</div>
                <div class="form-actions" style="margin-top:0.5rem;">
                    <button class="btn btn-sm btn-primary edit-supplier" data-id="${s.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-supplier" data-id="${s.id}">Delete</button>
                </div>
            </div>
        `).join('')}</div>
    `;
    document.getElementById('addSupplierBtn')?.addEventListener('click', () => showSupplierModal());
    document.querySelectorAll('.edit-supplier').forEach(btn => btn.addEventListener('click', () => showSupplierModal(suppliers.find(s => s.id === btn.dataset.id))));
    document.querySelectorAll('.delete-supplier').forEach(btn => btn.addEventListener('click', () => deleteSupplier(btn.dataset.id)));
    updateDateTime();
}

function renderOrdersView() {
    const activeOrders = orders.filter(o => o.status !== 'voided');
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">📜 Transaction History</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Cashier</th><th>Action</th></tr></thead><tbody>${activeOrders.length === 0 ? '<tr><td colspan="7">No transactions yet</td>' : activeOrders.map(order => `<tr><td>${order.id}</td><td>${new Date(order.date).toLocaleString()}</td><td>${order.customerName}</td><td>${order.items.length}</td><td>${formatCurrency(order.total)}</td><td>${order.cashier}</td><td><button class="btn btn-sm view-order" data-id="${order.id}">View</button>${isAdmin() ? ` <button class="btn btn-sm btn-danger void-order" data-id="${order.id}">Void</button>` : ''}</td></tr>`).join('')}</tbody>}</table></div>
    `;
    document.querySelectorAll('.view-order').forEach(btn => btn.addEventListener('click', () => { const order = orders.find(o => o.id === btn.dataset.id); if (order) showReceipt(order); }));
    document.querySelectorAll('.void-order').forEach(btn => btn.addEventListener('click', () => showVoidModal(btn.dataset.id)));
    updateDateTime();
}

function renderReturnsView() {
    if (!isManager()) { showToast('Manager access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">🔄 Returns & Refunds</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Return ID</th><th>Order ID</th><th>Date</th><th>Items</th><th>Refund Amount</th><th>Reason</th><th>Processed By</th></tr></thead><tbody>${returns.length === 0 ? '<tr><td colspan="7">No returns yet</td>' : returns.map(ret => `<td><td>${ret.id}</td><td>${ret.orderId}</td><td>${new Date(ret.date).toLocaleDateString()}</td><td>${ret.items.length}</td><td>${formatCurrency(ret.total)}</td><td>${ret.reason}</td><td>${ret.processedBy}</td></tr>`).join('')}</tbody>}</table></div>
    `;
    updateDateTime();
}

function renderVoidsView() {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">🚫 Voided Transactions</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Void ID</th><th>Order ID</th><th>Date</th><th>Voided By</th><th>Amount</th><th>Reason</th></tr></thead><tbody>${voids.length === 0 ? '<tr><td colspan="6">No voided transactions</td>' : voids.map(v => `<tr><td>${v.id}</td><td>${v.orderId}</td><td>${new Date(v.voidDate).toLocaleString()}</td><td>${v.voidedBy}</td><td>${formatCurrency(v.totalVoided)}</td><td>${v.reason}</td></tr>`).join('')}</tbody>}</table></div>
    `;
    updateDateTime();
}

function renderCustomersView() {
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">👥 Customer Management</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="search-bar"><button class="btn btn-primary" id="addCustomerBtn">+ Add Customer</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Name</th><th>Phone</th><th>Total Spent</th><th>Points</th><th>Tier</th><th>Visits</th><th>Action</th></tr></thead><tbody>${customers.map(c => `<tr><td>${c.name}</td><td>${c.phone || '-'}</td><td>${isAdmin() ? formatCurrency(c.totalSpent || 0) : '••••••'}</td><td>${c.points || 0}</td><td><span class="badge badge-${c.tier === 'Platinum' ? 'success' : (c.tier === 'Gold' ? 'warning' : 'info')}">${c.tier || 'Bronze'}</span></td><td>${c.visits || 0}</td><td><button class="btn btn-sm edit-customer" data-id="${c.id}">Edit</button></td></tr>`).join('')}</tbody>}70</div>
    `;
    document.getElementById('addCustomerBtn')?.addEventListener('click', () => showCustomerModal());
    document.querySelectorAll('.edit-customer').forEach(btn => btn.addEventListener('click', () => showCustomerModal(customers.find(c => c.id === btn.dataset.id))));
    updateDateTime();
}

function renderLoyaltyView() {
    const topCustomers = [...customers].sort((a, b) => b.points - a.points).slice(0, 5);
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">⭐ Loyalty Program</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">Total Points Issued</div><div class="stat-value">${customers.reduce((sum, c) => sum + (c.points || 0), 0)}</div></div>
            <div class="stat-card"><div class="stat-title">Loyalty Customers</div><div class="stat-value">${customers.filter(c => c.id !== 'c1').length}</div></div>
            <div class="stat-card"><div class="stat-title">Platinum Members</div><div class="stat-value">${customers.filter(c => c.tier === 'Platinum').length}</div></div>
        </div>
        <div class="summary-card"><div class="summary-title">🏆 Top Customers</div>${topCustomers.map(c => `<div class="summary-row"><span>${c.name}:</span><span>${c.points} points (${c.tier})</span></div>`).join('')}</div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Tier</th><th>Min Spend</th><th>Points Rate</th><th>Benefits</th></tr></thead><tbody>
            <tr><td>🏆 Platinum</td><td>MWK 500,000+</td><td>1 point per MWK 5,000</td><td>10% discount, Priority service</td></tr>
            <tr><td>🥇 Gold</td><td>MWK 200,000+</td><td>1 point per MWK 5,000</td><td>7% discount</td></tr>
            <tr><td>🥈 Silver</td><td>MWK 50,000+</td><td>1 point per MWK 5,000</td><td>5% discount</td></tr>
            <tr><td>🥉 Bronze</td><td>MWK 0+</td><td>1 point per MWK 5,000</td><td>Standard</td></tr>
        </tbody>}70</div>
    `;
    updateDateTime();
}

function renderReportsView() {
    const totalRevenue = orders.filter(o => o.status !== 'voided').reduce((sum, o) => sum + o.total, 0);
    const totalVAT = orders.filter(o => o.status !== 'voided').reduce((sum, o) => sum + (o.vat || 0), 0);
    const isAdminUser = isAdmin();
    
    const topProducts = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            topProducts[item.name] = (topProducts[item.name] || 0) + item.quantity;
        });
    });
    const topSelling = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">📊 Advanced Analytics</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">Total Revenue</div><div class="stat-value ${!isAdminUser ? 'stat-value-blur' : ''}">${isAdminUser ? formatCurrency(totalRevenue) : '••••••'}</div></div>
            <div class="stat-card"><div class="stat-title">Total VAT Collected</div><div class="stat-value ${!isAdminUser ? 'stat-value-blur' : ''}">${isAdminUser ? formatCurrency(totalVAT) : '••••••'}</div></div>
            <div class="stat-card"><div class="stat-title">Total Orders</div><div class="stat-value">${orders.filter(o => o.status !== 'voided').length}</div></div>
        </div>
        <div class="summary-card"><div class="summary-title">🏆 Top Selling Products</div>${topSelling.map(([name, qty]) => `<div class="summary-row"><span>${name}:</span><span>${qty} sold</span></div>`).join('')}</div>
        <div class="summary-card"><div class="summary-title">⚠️ Low Stock Items</div>${products.filter(p => p.stock <= p.reorderLevel).map(p => `<div class="summary-row"><span class="stock-low">${p.name}:</span><span>${p.stock} left</span></div>`).join('') || '<div>All stock levels OK</div>'}</div>
        ${!isAdminUser ? '<div class="stat-card" style="text-align:center; padding:0.5rem; background:var(--warning); color:white;">🔒 Financial data is hidden for privacy. Only Admin can view figures.</div>' : ''}
    `;
    updateDateTime();
}

function renderDailySummaryView() {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); renderDashboard(); return; }
    const summary = getDailySummary();
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">📊 Daily Sales Summary</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="summary-card">
            <div class="summary-title">📅 ${summary.date}</div>
            <div class="summary-row"><span>Total Sales (Gross):</span><span>${formatCurrency(summary.totalSales)}</span></div>
            <div class="summary-row"><span>Voided Amount:</span><span class="stock-low">-${formatCurrency(summary.totalVoided)}</span></div>
            <div class="summary-row"><span>Net Sales:</span><span><strong>${formatCurrency(summary.netSales)}</strong></span></div>
            <div class="summary-row"><span>VAT Collected:</span><span>${formatCurrency(summary.totalVAT)}</span></div>
            <div class="summary-row"><span>Transactions:</span><span>${summary.transactionCount}</span></div>
            <div class="summary-row"><span>Voids:</span><span class="stock-low">${summary.voidCount}</span></div>
        </div>
        <div class="summary-card">
            <div class="summary-title">💳 Payment Methods</div>
            ${Object.entries(summary.paymentBreakdown).map(([method, amount]) => `<div class="summary-row"><span>${method.toUpperCase()}:</span><span>${formatCurrency(amount)}</span></div>`).join('')}
        </div>
        <div class="summary-card">
            <div class="summary-title">📈 Category Sales</div>
            ${Object.entries(summary.categorySales).map(([cat, amount]) => `<div class="summary-row"><span>${cat}:</span><span>${formatCurrency(amount)}</span></div>`).join('')}
        </div>
        <div class="summary-card">
            <div class="summary-title">🏆 Top Products</div>
            ${summary.topProducts.map(([name, qty]) => `<div class="summary-row"><span>${name}:</span><span>${qty} sold</span></div>`).join('')}
        </div>
    `;
    updateDateTime();
}

function renderStaffView() {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); renderDashboard(); return; }
    const users = getUsers();
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">👔 Staff Management</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="search-bar"><button class="btn btn-primary" id="addStaffBtn">+ Add Staff</button></div>
        <div class="staff-grid">${users.map(user => `
            <div class="staff-card">
                <span class="material-icons" style="font-size:1.5rem;">${user.role === 'admin' ? 'admin_panel_settings' : 'badge'}</span>
                <div class="staff-name">${user.name}</div>
                <div class="staff-role">${user.role.toUpperCase()}</div>
                <div style="font-size:0.7rem;">Username: ${user.username}</div>
                <div style="font-size:0.7rem;">Email: ${user.email || '-'}</div>
                <div style="font-size:0.7rem;">Phone: ${user.phone || '-'}</div>
                ${user.role !== 'admin' ? `<div class="form-actions" style="margin-top:0.5rem;"><button class="btn btn-sm btn-primary edit-staff" data-id="${user.id}">Edit</button><button class="btn btn-sm btn-danger delete-staff" data-id="${user.id}">Delete</button></div>` : '<p style="margin-top:0.5rem; color:var(--primary); font-size:0.7rem;">Administrator</p>'}
            </div>
        `).join('')}</div>
    `;
    document.getElementById('addStaffBtn')?.addEventListener('click', () => showStaffModal());
    document.querySelectorAll('.edit-staff').forEach(btn => btn.addEventListener('click', () => showStaffModal(users.find(u => u.id === btn.dataset.id))));
    document.querySelectorAll('.delete-staff').forEach(btn => btn.addEventListener('click', () => deleteStaff(btn.dataset.id)));
    updateDateTime();
}

function renderAuditView() {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">📋 Audit Trail</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Details</th></tr></thead><tbody>${auditLog.slice(0, 100).map(log => `<tr><td>${new Date(log.timestamp).toLocaleString()}</td><td>${log.user}</td><td>${log.role}</td><td>${log.action}</td><td>${log.details}</td></tr>`).join('')}</tbody>}70</div>
    `;
    updateDateTime();
}

function renderTaxSettingsView() {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">💰 Tax Settings</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">Current VAT Rate</div><div class="stat-value">${(taxSettings.vatRate * 100).toFixed(1)}%</div></div>
            <div class="stat-card"><div class="stat-title">VAT Registration Number</div><div class="stat-value" style="font-size:0.8rem;">${TAX_CONFIG.VAT_NUMBER}</div></div>
            <div class="stat-card"><div class="stat-title">Total VAT Collected</div><div class="stat-value">${formatCurrency(orders.reduce((sum, o) => sum + (o.vat || 0), 0))}</div></div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">Tax Information</div>
                <div style="font-size:0.7rem;">VAT Rate: 16.5% (Standard)</div>
                <div style="font-size:0.7rem;">Withholding Tax: 3%</div>
                <div style="font-size:0.7rem;">Corporate Tax: 30%</div>
                <div style="font-size:0.7rem;">Currency: Malawi Kwacha (MWK)</div>
            </div>
            <div class="stat-card"><div class="stat-title">Update VAT Rate</div>
                <input type="number" id="vatRateInput" step="0.1" min="0" max="100" value="${(taxSettings.vatRate * 100).toFixed(1)}" style="margin-bottom:0.5rem;">
                <button class="btn btn-primary" id="updateVatBtn">Update VAT Rate</button>
            </div>
        </div>
    `;
    document.getElementById('updateVatBtn')?.addEventListener('click', () => {
        const newRate = parseFloat(document.getElementById('vatRateInput').value) / 100;
        if (!isNaN(newRate) && newRate >= 0 && newRate <= 1) {
            taxSettings.vatRate = newRate;
            saveTaxSettings();
            addAuditLog('UPDATE_VAT', `VAT rate updated to ${(newRate * 100).toFixed(1)}%`);
            showToast(`VAT rate updated to ${(newRate * 100).toFixed(1)}%`, 'success');
        } else showToast('Invalid rate!', 'error');
    });
    updateDateTime();
}

function renderStoresView() {
    if (!isAdmin()) { showToast('Admin access required!', 'error'); renderDashboard(); return; }
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">🏪 Multi-Store Management</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="search-bar"><button class="btn btn-primary" id="addStoreBtn">+ Add Store</button></div>
        <div class="staff-grid">${stores.map(store => `
            <div class="staff-card">
                <span class="material-icons" style="font-size:1.5rem;">store</span>
                <div class="staff-name">${store.name}</div>
                <div style="font-size:0.7rem;">Manager: ${store.manager || '-'}</div>
                <div style="font-size:0.7rem;">Phone: ${store.phone || '-'}</div>
                <div style="font-size:0.7rem;">Address: ${store.address || '-'}</div>
                <div class="form-actions" style="margin-top:0.5rem;"><button class="btn btn-sm btn-primary set-store" data-id="${store.id}">Select Store</button></div>
            </div>
        `).join('')}</div>
    `;
    document.getElementById('addStoreBtn')?.addEventListener('click', () => showStoreModal());
    document.querySelectorAll('.set-store').forEach(btn => btn.addEventListener('click', () => {
        currentStore = stores.find(s => s.id === btn.dataset.id);
        document.getElementById('storeName').innerText = currentStore.name;
        addAuditLog('SWITCH_STORE', `Switched to ${currentStore.name}`);
        showToast(`Switched to ${currentStore.name}`, 'success');
        renderCurrentView();
    }));
    updateDateTime();
}

function renderSettingsView() {
    document.getElementById('mainContent').innerHTML = `
        <div class="header-bar"><h1 class="page-title">⚙️ System Settings</h1><div class="datetime" id="datetimeDisplay"></div></div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">System Version</div><div class="stat-value" style="font-size:0.9rem;">v3.0 - Enterprise</div></div>
            <div class="stat-card"><div class="stat-title">Currency</div><div class="stat-value" style="font-size:0.9rem;">Malawi Kwacha (MWK)</div></div>
            <div class="stat-card"><div class="stat-title">VAT Rate</div><div class="stat-value" style="font-size:0.9rem;">${(taxSettings.vatRate * 100).toFixed(1)}%</div></div>
            <div class="stat-card"><div class="stat-title">Data Storage</div><div class="stat-value" style="font-size:0.9rem;">Local Storage</div></div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-title">Export Data</div><button class="btn btn-primary" id="exportDataBtn">📥 Export All Data</button><button class="btn btn-danger" id="clearDataBtn" style="margin-top:0.5rem;">⚠️ Clear All Data</button></div>
            <div class="stat-card"><div class="stat-title">Database Stats</div><div style="font-size:0.7rem;">Products: ${products.length}</div><div style="font-size:0.7rem;">Orders: ${orders.length}</div><div style="font-size:0.7rem;">Customers: ${customers.length}</div><div style="font-size:0.7rem;">Suppliers: ${suppliers.length}</div></div>
        </div>
    `;
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
        const data = { products, orders, customers, suppliers, categories, purchases, returns, stores, voids, auditLog, taxSettings, users: getUsers() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addAuditLog('EXPORT_DATA', 'Exported all system data');
        showToast('Data exported!');
    });
    document.getElementById('clearDataBtn')?.addEventListener('click', () => {
        if (confirm('⚠️ WARNING: This will erase ALL data! Are you sure?')) {
            localStorage.clear();
            addAuditLog('CLEAR_DATA', 'All system data cleared');
            location.reload();
        }
    });
    updateDateTime();
}

// ============================================
// ROUTING & INIT
// ============================================
function renderCurrentView() {
    if (!isAuthenticated()) return;
    const views = {
        dashboard: renderDashboard,
        pos: renderPOSView,
        products: renderProductsView,
        categories: renderCategoriesView,
        purchases: renderPurchasesView,
        suppliers: renderSuppliersView,
        orders: renderOrdersView,
        returns: renderReturnsView,
        voids: renderVoidsView,
        customers: renderCustomersView,
        loyalty: renderLoyaltyView,
        reports: renderReportsView,
        dailysummary: renderDailySummaryView,
        staff: renderStaffView,
        audit: renderAuditView,
        tax: renderTaxSettingsView,
        stores: renderStoresView,
        settings: renderSettingsView
    };
    if (views[currentView]) views[currentView]();
    document.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.dataset.view === currentView) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function showLoginModal() {
    const modal = createModal('🔐 Login', `
        <div class="form-group"><label>Username</label><input id="loginUsername" placeholder="Enter username" autofocus></div>
        <div class="form-group"><label>Password</label><input id="loginPassword" type="password" placeholder="Enter password"></div>
        <div id="loginError" style="color:var(--danger); font-size:0.7rem;"></div>
        <div class="form-actions"><button class="btn btn-primary" id="loginBtn">Login</button></div>
        <p style="margin-top:0.8rem; font-size:0.6rem; text-align:center;">Demo Accounts:<br>Admin: admin/admin123 | Manager: manager/manager123 | Cashier: cashier1/cash123</p>
        <p style="margin-top:0.5rem; font-size:0.55rem; text-align:center; color:var(--warning);">🔒 Financial data is only visible to Admin users</p>
    `);
    document.body.appendChild(modal);
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        if (login(username, password)) modal.remove();
        else document.getElementById('loginError').innerText = 'Invalid username or password';
    });
}

function init() {
    loadData();
    const savedUser = localStorage.getItem(STORAGE_CURRENT_USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('sidebarUserName').innerHTML = `${currentUser.name} <span class="role-badge">${currentUser.role.toUpperCase()}</span>`;
        document.getElementById('userRoleBadge').innerText = currentUser.role.toUpperCase();
        document.getElementById('storeName').innerText = currentStore?.name || 'Main Store';
        document.querySelectorAll('.admin-only').forEach(el => {
            if (currentUser.role === 'admin') el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
        renderCurrentView();
    } else {
        document.getElementById('mainContent').innerHTML = '<div class="loading-spinner"><span class="material-icons">autorenew</span><p>Welcome to POS Enterprise Pro</p></div>';
        showLoginModal();
    }
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => { currentView = btn.dataset.view; renderCurrentView(); });
    });
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('darkModeToggle')?.addEventListener('click', () => document.body.classList.toggle('dark'));
    updateDateTime();
}

init();