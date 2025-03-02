const mongoose = require("mongoose");
const connectDb = async(req , res) => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("Mongodb connection successfull");
    }catch(error) {
        console.log( error, "Mongodb connection failed");
    }
}
module.exports = connectDb;