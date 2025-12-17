const { dbGet, dbRun, dbAll } = require("../database");

/**
 * ADD TO CART
 * POST /cart/add
 * body: { productId }
 */
exports.addToCart = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const productId = Number(req.body.productId);

        if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
        }

        if (!productId || isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
        }

        /* 1️⃣ Check if product exists */
        const product = await dbGet(
        "SELECT product_id FROM products WHERE product_id = ?",
        [productId]
        );

        if (!product) {
        return res.status(404).json({ error: "Product not found" });
        }

        /* 2️⃣ Get or create cart */
        let cart = await dbGet(
        "SELECT cart_id FROM carts WHERE user_id = ?",
        [userId]
        );

        let cartId;

        if (!cart) {
        const result = await dbRun(
            "INSERT INTO carts (user_id) VALUES (?)",
            [userId]
        );
        cartId = result.id;
        } else {
        cartId = cart.cart_id;
        }

        /* 3️⃣ Check if product already in cart */
        const cartItem = await dbGet(
        `SELECT cart_item_id, quantity
        FROM cart_items
        WHERE cart_id = ? AND product_id = ?`,
        [cartId, productId]
        );

        if (cartItem) {
        /* 4️⃣ Update quantity */
        await dbRun(
            `UPDATE cart_items
            SET quantity = quantity + 1
            WHERE cart_item_id = ?`,
            [cartItem.cart_item_id]
        );
        } else {
        /* 5️⃣ Insert new item */
        await dbRun(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
            VALUES (?, ?, 1)`,
            [cartId, productId]
        );
        }

        res.json({ success: true, message: "Added to cart" });

    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


exports.getCart = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const sql = `
        SELECT
            p.product_id,
            p.product_name,
            p.product_price,
            p.category,
            p.product_img,
            ci.quantity,
            ci.cart_item_id,
            (p.product_price * ci.quantity) AS subtotal
        FROM carts c
        JOIN cart_items ci ON c.cart_id = ci.cart_id
        JOIN products p ON ci.product_id = p.product_id
        WHERE c.user_id = ? ORDER BY ci.cart_item_id DESC;
        `;

        const cartItems = await dbAll(sql, [userId]);

        res.json(cartItems);
    } catch (err) {
        console.error("Cart error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


exports.updateCart = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { cartItemId, change } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        /* Get user's cart */
        const cart = await dbGet(
            "SELECT cart_id FROM carts WHERE user_id = ?",
            [userId]
        );

        if (!cart) {
          return res.status(404).json({ error: "Cart not found" });
        }

        /* Get cart item (scoped to cart) */
        const item = await dbGet(
            `SELECT cart_item_id, quantity
            FROM cart_items
            WHERE cart_item_id = ?
            AND cart_id = ?`,
            [cartItemId, cart.cart_id]
        );

        if (!item) {
          return res.status(404).json({ error: "Item not found" });
        }

        /* Decide update vs delete */
        if (item.quantity + change <= 0) {
            await dbRun(
                `DELETE FROM cart_items
                WHERE cart_item_id = ?
                AND cart_id = ?`,
                [cartItemId, cart.cart_id]
            );
        } else {
            await dbRun(
                `UPDATE cart_items
                SET quantity = quantity + ?
                WHERE cart_item_id = ?
                AND cart_id = ?`,
                [change, cartItemId, cart.cart_id]
            );
        }

        res.json({ success: true });

    } catch (err) {
        console.error("Update cart error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


exports.removeItem = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { cartItemId } = req.body;

        const cart = await dbGet(
            "SELECT cart_id FROM carts WHERE user_id = ?",
            [userId]
        );

        await dbRun(
            `DELETE FROM cart_items
            WHERE cart_item_id = ?
            AND cart_id = ?`,
            [cartItemId, cart.cart_id]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("Update cart error:", err);
        res.status(500).json({ error: "Server error" });
    }
};