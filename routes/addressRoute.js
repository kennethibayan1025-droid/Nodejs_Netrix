const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

router.post("/save", addressController.saveAddress);

module.exports = router;