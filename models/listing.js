const mongoose = require('mongoose') ;
const Schema = mongoose.Schema ;
const Review = require("./review.js");

const ListingSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    description:String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://images.trvl-media.com/lodging/1000000/480000/470900/470820/c63ef6c6.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
            set: (v)=> v===""? "https://images.trvl-media.com/lodging/1000000/480000/470900/470820/c63ef6c6.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" : v 
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [ 
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ]
});

ListingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
});

const Listing =  mongoose.model("Listing" , ListingSchema) ;
module.exports = Listing ;