const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/get", orderController.getOrders);
router.post("/clear", orderController.clearOrders);


module.exports = router;