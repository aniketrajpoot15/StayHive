const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require('../models/listing.js');


const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

// index route
router.get('/',wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('./listings/index.ejs', { allListings });
}));

// new Route
router.get('/new', (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    res.render('listings/new.ejs');
});

//Show route
router.get('/:id',wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render('listings/show.ejs', { listing });
}));

// create route
router.post('/', validateListing, wrapAsync( async (req, res, next) => {
    let listingData = { ...req.body.listing };
    if (typeof listingData.image === "string") {
        listingData.image = { url: listingData.image, filename: "listingimage" };
    }
    const newListing = new Listing(listingData);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect('/listings');
}));

//edit rout
router.get('/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

//update route
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listingData = { ...req.body.listing };
    if (typeof listingData.image === "string") {
        listingData.image = { url: listingData.image, filename: "listingimage" };
    }
    await Listing.findByIdAndUpdate(id, listingData);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect('/listings');
}));

module.exports = router;