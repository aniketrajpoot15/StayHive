if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Use ATLASDB_URL only if it's set and not a placeholder
const hasValidAtlasUrl = Boolean(process.env.ATLASDB_URL && !process.env.ATLASDB_URL.includes("<username>"));
const dbUrl = hasValidAtlasUrl ? process.env.ATLASDB_URL : "mongodb://localhost:27017/stayhive";

// Database connection with retry logic
let dbConnected = false;
async function connectDb() {
    if (mongoose.connection.readyState >= 1) {
        dbConnected = true;
        return;
    }
    try {
        await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
        dbConnected = true;
        console.log("connected to Db");
    } catch (err) {
        dbConnected = false;
        console.error("DB connection failed:", err.message);
        throw err;
    }
}
// Attempt initial connection (non-blocking)
connectDb().catch(() => {});

// Views and static files — use __dirname for Vercel serverless compatibility
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (err) {
        console.error("Database connection error:", err.message);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html><head><title>StayHive - Setup Required</title></head>
            <body style="font-family: Arial, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
                <div style="max-width: 600px; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center;">
                    <h1 style="color: #fe424d; font-size: 28px;">🏡 StayHive</h1>
                    <h2 style="color: #333; font-size: 20px;">Database Connection Required</h2>
                    <p style="color: #666; line-height: 1.6;">StayHive needs a MongoDB Atlas database to serve listings.</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: left; margin: 20px 0;">
                        <b>Setup Steps:</b>
                        <ol style="color: #555; padding-left: 20px; margin-top: 10px;">
                            <li>Create a free cluster at <a href="https://mongodb.com/cloud/atlas" target="_blank">MongoDB Atlas</a></li>
                            <li>In Vercel: <b>Settings → Environment Variables</b></li>
                            <li>Add <code style="background:#e9ecef;padding:2px 6px;border-radius:4px;">ATLASDB_URL</code> with your connection string</li>
                            <li>Click <b>Redeploy</b></li>
                        </ol>
                    </div>
                    <p style="color: #999; font-size: 13px;">Error: ${err.message}</p>
                </div>
            </body></html>
        `);
    }
});

// Session configuration
const sessionOptions = {
    secret: process.env.SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// Use MongoDB session store only when we have a valid Atlas URL
if (hasValidAtlasUrl) {
    const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET || "mysupersecretcode",
        },
        touchAfter: 24 * 3600,
    });
    store.on("error", function (e) {
        console.log("SESSION STORE ERROR", e);
    });
    sessionOptions.store = store;
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.all("*splat", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

const port = process.env.PORT || 8080;
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`server is listening to port ${port}`);
    });
}

module.exports = app;
