const { dbRun, dbGet } = require("../database");

module.exports = {

    // ======================================================
    // SAVE / UPDATE ADDRESS (SECURE)
    // ======================================================
    saveAddress: async (req, res) => {
        try {
            // 🔐 user_id ONLY from session
            const user_id = req.session.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const {
                region,
                province,
                city,
                barangay,
                street
            } = req.body;

            // Check if user already has an address
            const existingAddress = await dbGet(
                `SELECT id FROM user_addresses WHERE user_id = ? LIMIT 1`,
                [user_id]
            );

            // IF ADDRESS EXISTS → UPDATE
            if (existingAddress) {
                const updateSql = `
                    UPDATE user_addresses
                    SET region = ?,
                        province = ?,
                        city = ?,
                        barangay = ?,
                        street = ?
                    WHERE user_id = ?
                `;

                await dbRun(updateSql, [
                    region,
                    province,
                    city,
                    barangay,
                    street,
                    user_id
                ]);

                return res.json({
                    message: "Address updated successfully!",
                    updated: true
                });
            }

            // IF NO ADDRESS EXISTS → INSERT
            const insertSql = `
                INSERT INTO user_addresses 
                (user_id, region, province, city, barangay, street)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            await dbRun(insertSql, [
                user_id,
                region,
                province,
                city,
                barangay,
                street
            ]);

            return res.json({
                message: "Address saved successfully!",
                inserted: true
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to save address" });
        }
    },

    // ======================================================
    // GET USER ADDRESS (SECURE)
    // ======================================================
    getAddress: async (req, res) => {
        try {
            // 🔐 user_id ONLY from session
            const user_id = req.session.user?.id;

            if (!user_id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const address = await dbGet(
                `SELECT 
                    region,
                    province,
                    city,
                    barangay,
                    street
                 FROM user_addresses
                 WHERE user_id = ?
                 LIMIT 1`,
                [user_id]
            );

            // No address yet
            if (!address) {
                return res.json({ address: null });
            }

            return res.json({ address });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to retrieve address" });
        }
    }
};