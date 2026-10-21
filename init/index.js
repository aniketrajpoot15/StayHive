if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://localhost:27017/stayhive";

main()
    .then(() => {
        console.log("connected to Db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Review.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6acb9efcf2ae75045d495584",
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();
