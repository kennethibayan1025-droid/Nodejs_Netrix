const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { dbRun, dbGet } = require("../database");

function sanitizeFileName(name) {
    return name
        .replace(/&/g, "_")        // replace &
}

/* =============================
   MULTER STORAGE (DYNAMIC)
============================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.body.productCategory;
        const uploadPath = path.join("public", "ImagesProd", category);
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const productName = req.body.productName;

        if (!productName) {
            return cb(new Error("Product name is required"));
        }

        const safeName = sanitizeFileName(productName);

        // Keep original extension (png, jpg, etc.)
        const ext = path.extname(file.originalname);

        cb(null, `${safeName}${ext}`);
    }
});

/* =============================
   FILE FILTER
============================= */
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

/* =============================
   EXPORT MIDDLEWARE
============================= */
exports.uploadProductImage = upload.single("productImage");

/* =============================
   ADD PRODUCT
============================= */
exports.addProduct = async (req, res) => {
    try {
        const { productName, productPrice, productCategory } = req.body;

        if (!req.file) {
            return res.status(400).send("Image required");
        }

        // Path saved in DB
        const imagePath = req.file.filename;

        const sql = 
        `INSERT INTO products (product_name, product_price, category, product_img)
        VALUES (?, ?, ?, ?)`;
        const params = [productName, productPrice, productCategory, imagePath];

        await dbRun(sql, params);

        res.redirect("/admin");

    } catch (err) {
        console.error(err);
        res.status(500).send("Upload failed");
    }
};

/* =============================
   DELETE PRODUCT
============================= */
exports.delProduct = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).send("Id required");
        }

        const sql = `DELETE FROM products WHERE product_id = ?`;

        await dbRun(sql, [id]);

    }
    catch (err) {
        console.error(err);
        res.status(500).send("Deletion failed");
    }

};