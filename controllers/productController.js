const { dbAll, dbRun, dbGet } = require("../database");

/* =============================
   GET ALL PRODUCT
============================= */
exports.getProducts = async (req, res) => {
    try {
        const { search, sort, order, category } = req.query;

        let sql = `
            SELECT * FROM products
            WHERE 1 = 1
        `;
        const params = [];

        // SEARCH
        if (search) {
            sql += " AND product_name LIKE ?";
            params.push(`%${search}%`);
        }

        // CATEGORY FILTER
        if (category) {
            sql += " AND category = ?";
            params.push(category);
        }

        // SORTING
        if (sort) {
            const allowedSort = ["product_name", "product_price"];
            const allowedOrder = ["ASC", "DESC"];

            if (allowedSort.includes(sort)) {
                sql += ` ORDER BY ${sort} ${
                    allowedOrder.includes(order) ? order : "ASC"
                }`;
            }
        }

        const products = await dbAll(sql, params);
        res.json(products);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


/* =============================
   GET SINGLE PRODUCT
============================= */
exports.getProduct = async (req, res) => {
    try {
        const id = req.params.id;

        const sql = "SELECT * FROM products WHERE product_id = ?";

        const product = await dbGet(sql, [id]);

        res.json(product);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}