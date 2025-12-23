const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.get("/get", cartController.getCart);
router.post("/update", cartController.updateCart);
router.post("/remove", cartController.removeItem);
router.post("/checkout", cartController.checkout);

module.exports = router;
