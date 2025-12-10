const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");


/* =============================
   LOGIN & SIGNUP ROUTES
============================= */

router.post('/adminLogin', authController.adminLogin);
router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/checkEmail", authController.checkEmail);

module.exports = router;