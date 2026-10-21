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

// Use ATLASDB_URL only if it's set and not the placeholder with '<username>'
const hasValidAtlasUrl = Boolean(process.env.ATLASDB_URL && !process.env.ATLASDB_URL.includes("<username>"));
const dbUrl = hasValidAtlasUrl ? process.env.ATLASDB_URL : "mongodb://localhost:27017/stayhive";

async function connectDb() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
        console.log("connected to Db");
    }
}
connectDb().catch((err) => console.log("DB initial connection note:", err.message));

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(process.cwd(), 'public')));

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (err) {
        console.error("Database connection error:", err.message);
        return res.status(500).send(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 60px auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center;">
                <h2 style="color: #fe424d;">⚠️ MongoDB Atlas Connection Needed</h2>
                <p style="color: #444; font-size: 16px; line-height: 1.5;">StayHive requires a MongoDB database connection to load listings.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left; margin: 20px 0;">
                    <b>To resolve this in Vercel:</b>
                    <ol style="margin-top: 10px; color: #555; padding-left: 20px;">
                        <li>Open your <b>Vercel Project Dashboard</b></li>
                        <li>Navigate to <b>Settings &rarr; Environment Variables</b></li>
                        <li>Add <code>ATLASDB_URL</code> with your MongoDB Atlas connection string</li>
                        <li>Redeploy your project</li>
                    </ol>
                </div>
                <small style="color: #888;">Error details: ${err.message}</small>
            </div>
        `);
    }
});

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
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`server is listening to port ${port}`);
    });
}

module.exports = app;
