const axios = require("axios");

// PSGC Base URL
const BASE_URL = "https://psgc.gitlab.io/api";

module.exports = {
    // Get all regions
    getRegions: async (req, res) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/regions/`);
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch regions" });
        }
    },

    // Get provinces by region code
    getProvinces: async (req, res) => {
        try {
            const { regionCode } = req.params;
            const { data } = await axios.get(`${BASE_URL}/regions/${regionCode}/provinces/`);
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch provinces" });
        }
    },

    // Get municipalities/cities by province code
    getCities: async (req, res) => {
        try {
            const { provinceCode } = req.params;

            // NCR FIX — Region 13 has no provinces
            if (provinceCode === "130000000") {
                const { data } = await axios.get(`${BASE_URL}/regions/${provinceCode}/cities-municipalities/`);
                return res.json(data);
            }

            // Normal regions with provinces
            const { data } = await axios.get(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
            res.json(data);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch cities/municipalities" });
        }
    },


    // Get barangays by city/municipality code
    getBarangays: async (req, res) => {
        try {
            const { cityCode } = req.params;
            const { data } = await axios.get(`${BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch barangays" });
        }
    }
};