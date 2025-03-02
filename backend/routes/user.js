const express = require('express');
const zod = require("zod");

const router = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../config');
const bcrypt = require("bcrypt");
const { User } = require('../models/db');

const SignupBody = zod.object({
    username : zod.string().email(), 
    firstName : zod.string() ,
    lastName : zod.string() ,
    password : zod.string() 
})

router.post("/signup" ,async (req , res) => {
    const {success} = SignupBody.safeParse(req.body);

    if(!success) {
        return res.json({
            msg : "Invalid inputs , Please enter valid information"
        })
    }
    
    const existingUser = await User.findOne({
        username : req.body.username
    })

    if(existingUser){
        return res.json({
            msg : "User already exists , Please login "
        })
    }

    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(req.body.password , salt)

    const user = await User.create({
        username : req.body.username ,
        firstName : req.body.firstName,
        lastName : req.body.lastName ,
        password : hasedPassword
    })

    const userId = user._id;

    const token = jwt.sign({
        userId 
    } , JWT_SECRET)
    
    res.json({
        msg : "User created successfully",
        token : token
    })
})

const signinBody = zod.object({
    username : zod.string().email(),
    password : zod.string()
})

router.post("/signin" , async (req , res) => {
    const {success} = signinBody.safeParse(req.body)

    if(!success){
        return req.status(411).json({
            msg : "Please enter valid credentials"
        })
    }

    const user  = await User.findOne({
        username : req.body.username 
    })
    if(!user){
        return res.status(411).json({
            msg : "User does not exist"
        })
    }

    const isMatch = await bcrypt.compare(req.body.password , user.password)

    
    if(!isMatch){
        return res.json({
            msg : "Incorrect password"
        })
    }

    const token = await jwt.sign({
        userId : user._id
    }, JWT_SECRET)

    res.json({
        msg : `Welcome back ${user.firstName}`,
        token : token
    })
    return
})

module.exports = router;