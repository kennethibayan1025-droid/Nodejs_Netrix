const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

router.post("/save", addressController.saveAddress);
router.get("/get", addressController.getAddress);

module.exports = router;