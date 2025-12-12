const { dbRun, dbGet } = require("../database");

module.exports = {
    saveAddress: async (req, res) => {
        try {
            const {
                region,
                province,
                city,
                barangay,
                street,
                user_id
            } = req.body;

            // Check if user already has an address
            const existingAddress = await dbGet(
                `SELECT * FROM user_addresses WHERE user_id = ? LIMIT 1`,
                [user_id]
            );

            // ======================================================
            // IF ADDRESS EXISTS → UPDATE
            // ======================================================
            const sql = `
                UPDATE user_addresses
                SET region = ?,
                    province = ?,
                    city = ?,
                    barangay = ?,
                    street = ?
                WHERE user_id = ?`;

            if (existingAddress) {
                await dbRun(sql,
                    [
                        region,
                        province,
                        city,
                        barangay,
                        street,
                        user_id
                    ]
                );

                return res.json({
                    message: "Address updated successfully!",
                    updated: true
                });
            }

            // ======================================================
            // IF NO ADDRESS EXISTS → INSERT NEW
            // ======================================================
            const sql1 = `
                INSERT INTO user_addresses 
                (user_id, region, province, city, barangay, street)
                VALUES (?, ?, ?, ?, ?, ?)
             `;

            await dbRun(sql1,
                [
                    user_id,
                    region,
                    province,
                    city,
                    barangay,
                    street
                ]
            );

            return res.json({
                message: "Address saved successfully!",
                inserted: true
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to save address" });
        }
    }
};