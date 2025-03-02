const mongoose = require("mongoose");

const {  MONGO_URI } = require("../config");

mongoose.connect(MONGO_URI)
const userSchema = mongoose.Schema({
   username : {
    type : String ,
    required : true ,
    unique : true , 
    minLength : 6,
    maxLength : 30
   } , 
   password : {
    type : String ,
    required : true , 
    unique : true , 
    minLength : 5 , 
   } ,
   firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
    },
    lastName: {
     type: String,
     required: true,
     trim: true,
     maxLength: 50
    } , 
    transactions : {
        type : []
    }

})

const transactionSchema = mongoose.Schema({
    title : {
        type : String ,
        required : true
    } ,
    date : {
        type : Date ,
        required : true
    } ,
    amount : {
        type : Number ,
        required : true
    } ,
    category : {
        type : String ,
        required : true
    } , 
    description : {
        type : String ,
        required : true
    } , 
    transactionType : {
        type : String ,
        required : true
    } ,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }, 
    createdAt: {
        type: Date,
        default: new Date(),
    }
})
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction' , transactionSchema)
module.exports = {
    User , 
    Transaction
}