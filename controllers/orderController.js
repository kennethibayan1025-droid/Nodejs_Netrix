const { dbRun, dbAll } = require("../database");

exports.getOrders = async (req, res) => {
    try {
        const userId = req.session.user?.id;

        const orders = await dbAll(
        `SELECT 
            p.product_name,
            p.product_img,
            p.category,
            oi.quantity,
            (p.product_price * oi.quantity + 36) AS subtotal
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.user_id = ? ORDER BY oi.order_item_id ASC;
        `, [userId]);

        res.json(orders);

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


exports.clearOrders = async (req, res) => {
    try {
        const userId = req.session.user?.id;

        await dbRun(
            `DELETE FROM orders WHERE user_id = ?`,
            [userId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};