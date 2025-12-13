require('dotenv').config();
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* SERVE ALL FILES IN /public */
app.use(express.static(path.join(__dirname, "public")));

/* FAVICON */
app.use(favicon(path.join(__dirname, 'public', 'Images', 'Netrix Logo.png')));

/* ============================================================
   SESSION
============================================================ */

const session = require('express-session');
const { setEngine } = require('crypto');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60}
}));

// USE SESSION 
function isLoggedIn(req, res, next) {
    req.session.user;
    console.log(req.session.user);
    next();
}

function isAdmin(req, res, next) {
    req.session.admin;
    console.log(req.session.admin);
    next();
}


/* ============================================================
   ROUTES
============================================================ */
/* HOMEPAGE */
app.get("/", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Home.html"));
});

/* RACKETS PAGE */
app.get("/rackets", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Rackets.html"));
});

/* GRIPS PAGE */
app.get("/grips", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Grips.html"));
});

/* SHUTTLECOCKS PAGE */
app.get("/shuttlecocks", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Shuttlecocks.html"));
});

/* SHOES PAGE */
app.get("/shoes", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Shoes.html"));
});

/* BAGS PAGE */
app.get("/bags", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Bags.html"));
});

/* JERSEYS PAGE */
app.get("/jerseys", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Jerseys.html"));
});

/* CART PAGE */
app.get("/cart", isLoggedIn, (req, res) => {
    if (!req.session.user){
        res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, "public/pages/Cart.html"));
});

/* LOGIN PAGE */
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Login.html"));
});

/* SIGNUP PAGE */
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Signup.html"));
});

/* ACCOUNT PAGE */
app.get("/account", isLoggedIn, (req, res) => {
    if (!req.session.user){
        res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, "public/pages/Account.html"));
});

app.get("/address", isLoggedIn, (req, res) => {
    if (!req.session.user){
        res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, "public/pages/Address.html"));
});


/* ABOUT PAGE */
app.get("/about", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/About.html"));
});

/* CONTACT PAGE */
app.get("/contact", isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Contact.html"));
});

/* ADMIN */
app.get("/adminlogin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/Adminlogin.html"));
});

app.get("/admin", isAdmin, (req, res) => {
    if (!req.session.admin){
        res.redirect('/');
    }
    res.sendFile(path.join(__dirname, "public/pages/Admin.html"));
});

/* ============================================================
   API ROUTES
============================================================ */
app.use("/products", require("./routes/productRoute"));
app.use("/addDel", require("./routes/adminRoute"));
app.use("/auth", require("./routes/authRoute"));
app.use("/api/location", require("./routes/locationRoute"));
app.use("/api/address", require("./routes/addressRoute"));




app.get("/profileData", (req, res) => {
    if (req.session.admin) {
        // Admin is logged in
        return res.json({
            type: "admin",
            data: req.session.admin
        });
    } 
    else if (req.session.user) {
        // Normal user is logged in
        return res.json({
            type: "user",
            data: req.session.user
        });
    } 
    else {
        // Not logged in
        return res.status(401).json({ error: "Not authenticated" });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed." });

        res.clearCookie('connect.sid');  // optional but good practice
        res.json({ message: "Logged out." });
    });
});


/* ============================================================
   PORT
============================================================ */
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});