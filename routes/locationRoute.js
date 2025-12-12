const express = require("express");
const router = express.Router();
const controller = require("../controllers/locationController");

router.get("/regions", controller.getRegions);
router.get("/provinces/:regionCode", controller.getProvinces);
router.get("/cities/:provinceCode", controller.getCities);
router.get("/barangays/:cityCode", controller.getBarangays);

module.exports = router;