require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

// Middleware
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://localhost:3000',
  'https://posfrontend-eta.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pos_system',
    waitForConnections: true,
    connectionLimit: 10,
});

// Helper: generate unique ID
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Helper: audit log
async function addAuditLog(user, action, details, store = 'Main Store') {
    if (!user || !user.id) return;
    const id = generateId('audit');
    await pool.query(
        `INSERT INTO audit_logs (id, user_name, user_id, role, action, details, store)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, user.name || user.username, user.id, user.role, action, details, store]
    ).catch(err => console.error('Audit log error:', err));
}

// JWT Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
};

const isManager = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager')
        return res.status(403).json({ error: 'Manager or Admin only' });
    next();
};

// ==================== AUTH ====================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, username: user.username } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== PRODUCTS ====================
app.get('/api/products', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', verifyToken, isManager, async (req, res) => {
    const { name, price, cost, category, stock, sku, icon, reorderLevel, taxRate, brand, store } = req.body;
    try {
        const id = generateId('p');
        await pool.query(
            `INSERT INTO products (id, name, price, cost, category, stock, sku, icon, reorder_level, tax_rate, brand)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, price, cost, category, stock || 0, sku, icon || 'inventory_2', reorderLevel || 20, taxRate || 0.165, brand]
        );
        await addAuditLog(req.user, 'ADD_PRODUCT', `Added product: ${name}`, store);
        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', verifyToken, isManager, async (req, res) => {
    const { name, price, cost, category, stock, sku, icon, reorderLevel, taxRate, brand, store } = req.body;
    try {
        await pool.query(
            `UPDATE products SET name=?, price=?, cost=?, category=?, stock=?, sku=?, icon=?, reorder_level=?, tax_rate=?, brand=?
             WHERE id=?`,
            [name, price, cost, category, stock, sku, icon, reorderLevel, taxRate, brand, req.params.id]
        );
        await addAuditLog(req.user, 'UPDATE_PRODUCT', `Updated product: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', verifyToken, isAdmin, async (req, res) => {
    const { store } = req.body;
    try {
        const [product] = await pool.query('SELECT name FROM products WHERE id = ?', [req.params.id]);
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (product.length) await addAuditLog(req.user, 'DELETE_PRODUCT', `Deleted product: ${product[0].name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== CATEGORIES ====================
app.get('/api/categories', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', verifyToken, isAdmin, async (req, res) => {
    const { name, description, color, icon, store } = req.body;
    try {
        const id = generateId('cat');
        await pool.query(`INSERT INTO categories (id, name, description, color, icon) VALUES (?, ?, ?, ?, ?)`, [id, name, description, color, icon]);
        await addAuditLog(req.user, 'ADD_CATEGORY', `Added category: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/categories/:id', verifyToken, isAdmin, async (req, res) => {
    const { name, description, color, icon, store } = req.body;
    try {
        await pool.query(`UPDATE categories SET name=?, description=?, color=?, icon=? WHERE id=?`, [name, description, color, icon, req.params.id]);
        await addAuditLog(req.user, 'UPDATE_CATEGORY', `Updated category: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', verifyToken, isAdmin, async (req, res) => {
    const { store } = req.body;
    try {
        const [cat] = await pool.query('SELECT name FROM categories WHERE id = ?', [req.params.id]);
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        if (cat.length) await addAuditLog(req.user, 'DELETE_CATEGORY', `Deleted category: ${cat[0].name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM customers ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', verifyToken, async (req, res) => {
    const { name, email, phone, address, store } = req.body;
    try {
        const id = generateId('c');
        await pool.query(
            `INSERT INTO customers (id, name, email, phone, address, points, total_spent, tier, visits)
             VALUES (?, ?, ?, ?, ?, 0, 0, 'Bronze', 0)`,
            [id, name, email, phone, address]
        );
        await addAuditLog(req.user, 'ADD_CUSTOMER', `Added customer: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/customers/:id', verifyToken, async (req, res) => {
    const { name, email, phone, address, store } = req.body;
    try {
        await pool.query(`UPDATE customers SET name=?, email=?, phone=?, address=? WHERE id=?`, [name, email, phone, address, req.params.id]);
        await addAuditLog(req.user, 'UPDATE_CUSTOMER', `Updated customer: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== SUPPLIERS ====================
app.get('/api/suppliers', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/suppliers', verifyToken, isManager, async (req, res) => {
    const { name, contact, email, phone, address, category, paymentTerms, rating, store } = req.body;
    try {
        const id = generateId('s');
        await pool.query(
            `INSERT INTO suppliers (id, name, contact, email, phone, address, category, payment_terms, rating)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, contact, email, phone, address, category, paymentTerms, rating]
        );
        await addAuditLog(req.user, 'ADD_SUPPLIER', `Added supplier: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/suppliers/:id', verifyToken, isManager, async (req, res) => {
    const { name, contact, email, phone, address, category, paymentTerms, rating, store } = req.body;
    try {
        await pool.query(
            `UPDATE suppliers SET name=?, contact=?, email=?, phone=?, address=?, category=?, payment_terms=?, rating=?
             WHERE id=?`,
            [name, contact, email, phone, address, category, paymentTerms, rating, req.params.id]
        );
        await addAuditLog(req.user, 'UPDATE_SUPPLIER', `Updated supplier: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/suppliers/:id', verifyToken, isAdmin, async (req, res) => {
    const { store } = req.body;
    try {
        const [sup] = await pool.query('SELECT name FROM suppliers WHERE id = ?', [req.params.id]);
        await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        if (sup.length) await addAuditLog(req.user, 'DELETE_SUPPLIER', `Deleted supplier: ${sup[0].name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== ORDERS (SALE) ====================
app.post('/api/orders', verifyToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { cart, subtotal, discount, discountPercent, vat, vatRate, total, paid, change,
                customerId, customerName, paymentMethod, storeName, vatNumber } = req.body;
        const orderId = generateId('ORD');
        await connection.query(
            `INSERT INTO orders (id, subtotal, discount, discount_percent, vat, vat_rate, total, paid, change_amount,
             cashier_id, cashier_name, customer_id, customer_name, payment_method, store_name, vat_number, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
            [orderId, subtotal, discount, discountPercent, vat, vatRate, total, paid, change,
             req.user.id, req.user.name, customerId, customerName, paymentMethod, storeName, vatNumber]
        );
        for (const item of cart) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.id, item.name, item.quantity, item.price, item.subtotal]
            );
            await connection.query(`UPDATE products SET stock = stock - ?, sales = COALESCE(sales, 0) + ? WHERE id = ?`, [item.quantity, item.quantity, item.id]);
        }
        if (customerId && customerId !== 'c1') {
            await connection.query(
                `UPDATE customers SET total_spent = total_spent + ?, points = FLOOR(total_spent / 5000), visits = visits + 1, last_visit = NOW()
                 WHERE id = ?`,
                [total, customerId]
            );
            await connection.query(
                `UPDATE customers SET tier = CASE
                    WHEN total_spent >= 500000 THEN 'Platinum'
                    WHEN total_spent >= 200000 THEN 'Gold'
                    WHEN total_spent >= 50000 THEN 'Silver'
                    ELSE 'Bronze'
                END WHERE id = ?`, [customerId]
            );
        }
        // Create kitchen docket
        const docketNumber = `DKT-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`;
        const docketId = generateId('dkt');
        await connection.query(
            `INSERT INTO dockets (id, docket_number, order_id, items, total, customer_name, cashier, status, store)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [docketId, docketNumber, orderId, JSON.stringify(cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, subtotal: i.subtotal }))), total, customerName, req.user.name, storeName]
        );
        await connection.commit();
        await addAuditLog(req.user, 'SALE_COMPLETED', `Order ${orderId} - Total ${Math.round(total)} MWK`, storeName);
        res.json({ success: true, orderId, docketNumber });
    } catch (err) {
        await connection.rollback();
        console.error('Order error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.get('/api/orders', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
        for (let order of rows) {
            const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            order.items = items;
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== VOIDS ====================
app.post('/api/voids', verifyToken, isAdmin, async (req, res) => {
    const { orderId, reason, store } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orderRows.length === 0) throw new Error('Order not found');
        const order = orderRows[0];
        if (order.status === 'voided') throw new Error('Already voided');
        const voidId = generateId('void');
        await connection.query(
            `INSERT INTO voids (id, order_id, original_order, voided_by, voided_by_id, reason, total_voided)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [voidId, orderId, JSON.stringify(order), req.user.name, req.user.id, reason, order.total]
        );
        await connection.query(`UPDATE orders SET status = 'voided', voided_by = ?, voided_date = NOW(), void_reason = ? WHERE id = ?`, [req.user.name, reason, orderId]);
        const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        for (const item of items) {
            await connection.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [item.quantity, item.product_id]);
        }
        await connection.query(`UPDATE dockets SET status = 'voided' WHERE order_id = ?`, [orderId]);
        await connection.commit();
        await addAuditLog(req.user, 'VOID_TRANSACTION', `Voided order ${orderId} - Reason: ${reason}`, store);
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.get('/api/voids', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM voids ORDER BY void_date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== DOCKETS ====================
app.get('/api/dockets', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM dockets ORDER BY docket_date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/dockets/:id/status', verifyToken, isManager, async (req, res) => {
    const { status, store } = req.body;
    try {
        await pool.query('UPDATE dockets SET status = ? WHERE id = ?', [status, req.params.id]);
        const [docket] = await pool.query('SELECT docket_number FROM dockets WHERE id = ?', [req.params.id]);
        await addAuditLog(req.user, 'UPDATE_DOCKET', `Docket ${docket[0]?.docket_number} status changed to ${status}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== PURCHASES ====================
app.get('/api/purchases', verifyToken, isManager, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM purchases ORDER BY purchase_date DESC');
        for (let po of rows) {
            const [items] = await pool.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [po.id]);
            po.items = items;
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/purchases', verifyToken, isManager, async (req, res) => {
    const { supplierId, supplierName, items, expectedDelivery, store } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const poId = generateId('PO');
        const total = items.reduce((sum, i) => sum + (i.cost * i.quantity), 0);
        await connection.query(
            `INSERT INTO purchases (id, supplier_id, supplier_name, total, status, created_by, expected_delivery)
             VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
            [poId, supplierId, supplierName, total, req.user.name, expectedDelivery]
        );
        for (const item of items) {
            await connection.query(
                `INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, cost)
                 VALUES (?, ?, ?, ?, ?)`,
                [poId, item.productId, item.productName, item.quantity, item.cost]
            );
        }
        await connection.commit();
        await addAuditLog(req.user, 'CREATE_PO', `Created PO ${poId} for ${supplierName}`, store);
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.post('/api/purchases/:id/receive', verifyToken, isManager, async (req, res) => {
    const { store } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [poRows] = await connection.query('SELECT * FROM purchases WHERE id = ?', [req.params.id]);
        if (poRows.length === 0) throw new Error('PO not found');
        const po = poRows[0];
        if (po.status !== 'pending') throw new Error('Already received');
        const [items] = await connection.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [req.params.id]);
        for (const item of items) {
            await connection.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [item.quantity, item.product_id]);
        }
        await connection.query(`UPDATE purchases SET status = 'received', received_date = NOW() WHERE id = ?`, [req.params.id]);
        await connection.commit();
        await addAuditLog(req.user, 'RECEIVE_PO', `Received PO ${req.params.id}`, store);
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// ==================== RETURNS ====================
app.post('/api/returns', verifyToken, isManager, async (req, res) => {
    const { orderId, items, reason, store } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const returnId = generateId('RET');
        const total = items.reduce((sum, i) => sum + i.refundAmount, 0);
        await connection.query(
            `INSERT INTO returns (id, order_id, items, total, reason, status, processed_by)
             VALUES (?, ?, ?, ?, ?, 'approved', ?)`,
            [returnId, orderId, JSON.stringify(items), total, reason, req.user.name]
        );
        for (const item of items) {
            await connection.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [item.quantity, item.productId]);
        }
        await connection.commit();
        await addAuditLog(req.user, 'CREATE_RETURN', `Return processed for order ${orderId} - Amount ${Math.round(total)} MWK`, store);
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.get('/api/returns', verifyToken, isManager, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM returns ORDER BY return_date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== STORES ====================
app.get('/api/stores', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stores ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/stores', verifyToken, isAdmin, async (req, res) => {
    const { name, address, phone, manager, store } = req.body;
    try {
        const id = generateId('store');
        await pool.query(`INSERT INTO stores (id, name, address, phone, manager, status) VALUES (?, ?, ?, ?, ?, 'active')`, [id, name, address, phone, manager]);
        await addAuditLog(req.user, 'ADD_STORE', `Added store: ${name}`, store || name);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/stores/:id', verifyToken, isAdmin, async (req, res) => {
    const { name, address, phone, manager, store } = req.body;
    try {
        await pool.query(`UPDATE stores SET name=?, address=?, phone=?, manager=? WHERE id=?`, [name, address, phone, manager, req.params.id]);
        await addAuditLog(req.user, 'UPDATE_STORE', `Updated store: ${name}`, store || name);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== USERS (STAFF) ====================
app.get('/api/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, name, role, email, phone, created_at FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', verifyToken, isAdmin, async (req, res) => {
    const { username, password, name, role, email, phone, store } = req.body;
    try {
        const id = generateId('u');
        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users (id, username, password, name, role, email, phone)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, username, hashed, name, role, email, phone]
        );
        await addAuditLog(req.user, 'CREATE_STAFF', `Created staff: ${name} (${role})`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
    const { name, role, email, phone, password, store } = req.body;
    try {
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await pool.query(`UPDATE users SET name=?, role=?, email=?, phone=?, password=? WHERE id=?`, [name, role, email, phone, hashed, req.params.id]);
        } else {
            await pool.query(`UPDATE users SET name=?, role=?, email=?, phone=? WHERE id=?`, [name, role, email, phone, req.params.id]);
        }
        await addAuditLog(req.user, 'UPDATE_STAFF', `Updated staff: ${name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
    const { store } = req.body;
    if (req.user.id === req.params.id) return res.status(400).json({ error: 'Cannot delete own account' });
    try {
        const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [req.params.id]);
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (user.length) await addAuditLog(req.user, 'DELETE_STAFF', `Deleted staff: ${user[0].name}`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== AUDIT LOGS ====================
app.get('/api/audit', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY log_time DESC LIMIT 500');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== TAX SETTINGS ====================
app.get('/api/tax', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT vat_rate, enabled FROM tax_settings WHERE id = 1');
        if (rows.length === 0) {
            await pool.query(`INSERT INTO tax_settings (id, vat_rate, enabled) VALUES (1, 0.165, 1)`);
            res.json({ vat_rate: 0.165, enabled: true });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tax', verifyToken, isAdmin, async (req, res) => {
    const { vatRate, enabled, store } = req.body;
    try {
        await pool.query(`UPDATE tax_settings SET vat_rate = ?, enabled = ? WHERE id = 1`, [vatRate, enabled]);
        await addAuditLog(req.user, 'UPDATE_VAT', `VAT rate updated to ${(vatRate * 100).toFixed(1)}%`, store);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== SALES SUMMARY WITH DATE RANGE ====================
app.get('/api/reports/sales-summary', verifyToken, isAdmin, async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'Start and end dates required' });
    try {
        const [rows] = await pool.query(
            `SELECT 
                COALESCE(SUM(total), 0) as totalSales,
                COALESCE(SUM(vat), 0) as totalVAT,
                COUNT(*) as transactionCount
             FROM orders 
             WHERE DATE(order_date) BETWEEN ? AND ? AND status != 'voided'`,
            [start, end]
        );
        const [voidRows] = await pool.query(
            `SELECT COALESCE(SUM(total_voided), 0) as totalVoided, COUNT(*) as voidCount
             FROM voids WHERE DATE(void_date) BETWEEN ? AND ?`,
            [start, end]
        );
        const [paymentBreakdown] = await pool.query(
            `SELECT payment_method, SUM(total) as amount 
             FROM orders 
             WHERE DATE(order_date) BETWEEN ? AND ? AND status != 'voided' 
             GROUP BY payment_method`,
            [start, end]
        );
        res.json({
            totalSales: rows[0].totalSales,
            totalVAT: rows[0].totalVAT,
            totalVoided: voidRows[0].totalVoided,
            netSales: rows[0].totalSales - voidRows[0].totalVoided,
            transactionCount: rows[0].transactionCount,
            voidCount: voidRows[0].voidCount,
            paymentBreakdown: paymentBreakdown || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 POS Backend running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});