const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

/* =============================
   PRODUCT ROUTES
============================= */

// Add product (with image upload)
router.post(
    "/add",
    adminController.uploadProductImage,
    adminController.addProduct
);

router.delete(
    "/del:id",
    adminController.delProduct
);

module.exports = router;