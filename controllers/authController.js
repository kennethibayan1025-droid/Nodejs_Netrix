/* =============================
   VARIABLES
============================= */
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { dbGet, dbRun } = require("../database");

/* =============================
   BCRYPT FUNCTIONS
============================= */
async function hashPassword(password){
    if (!password) {
        throw new Error("Password cannot be empty");
    }
    return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(inputPassword, storedHash) {
    if (!inputPassword || !storedHash) return false;
    return await bcrypt.compare(inputPassword, storedHash);
}

/* =============================
   HELPER FUNCTIONS
============================= */
async function checkEmailExists(email) {
    const sql = `SELECT 1 FROM users WHERE email = ? LIMIT 1`;
    const user = await dbGet(sql, [email]);
    return !!user;
}

function toTitleCase(name) {
    if (!name || typeof name !== "string") return "";
    return name
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/* =============================
   CONTROLLERS
============================= */
/* CHECK EMAIL AVAILABILITY */
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const exists = await checkEmailExists(email);

        return res.status(200).json({
            available: !exists
        });

    } catch (err) {
        console.error("checkEmail:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

/* =============================
   LOGIN
============================= */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Validate
        if (!email || !password) {
            res.redirect("/login?error=Email+or+Password+is+required");
        }

        // 2️⃣ Get user
        const sql = `
            SELECT user_id, fullname, password 
            FROM users 
            WHERE email = ?
            LIMIT 1
        `;
        const user = await dbGet(sql, [email]);

        if (!user) {
            res.redirect("/login?error=Invalid+email+or+password");
        }

        // 3️⃣ Compare password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            res.redirect("/login?error=Invalid+email+or+password");
        }

        // 4️⃣ Create session
        req.session.user = {
            id: user.user_id,
            fullname: user.fullname,
            email
        };

        res.redirect("/");

    } catch (err) {
        console.error("login:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

/* =============================
   SIGNUP
============================= */
exports.signup = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        // 1️⃣ Validate
        if (!firstname || !lastname || !email || !password) {
            res.redirect("/signup?error=All+field+are+required");
        }

        let fullname = firstname + " " + lastname;
        fullname = toTitleCase(fullname);

        // 2️⃣ Check if email exists
        if (await checkEmailExists(email)) {
            res.redirect("/login?error=Email+already+exists");
        }

        // 3️⃣ Hash password
        const hashedPassword = await hashPassword(password);

        // 4️⃣ Insert user
        const sql = `
            INSERT INTO users (fullname, email, password)
            VALUES (?, ?, ?)
        `;
        await dbRun(sql, [fullname, email, hashedPassword]);

        res.redirect("/login");

    } catch (err) {
        console.error("signup:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


/* =============================
   LOGIN FOR ADMINS
============================= */
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.redirect("/login?error=All+field+are+required");
        }

        const admin = await dbGet(
            "SELECT * FROM admins WHERE email = ?",
            [email]
        );

        if (!admin || !(await comparePassword(password, admin.password))) {
            res.redirect("/login?error=Invalid+email+or+password");
        }

        // Store admin in session
        req.session.admin = {
            id: admin.admin_id,
            fullname: admin.fullname,
            email: admin.email,
            role: "admin"
        };

        // Redirect to admin dashboard
        res.redirect("/admin");

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};
