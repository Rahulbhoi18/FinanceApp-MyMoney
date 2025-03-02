const userRouter = require("./user")
const transactionRouter = require("./transaction")
const express = require("express")
const router = express.Router();

router.use("/user" , userRouter)
router.use("/transactions" , transactionRouter)
module.exports = router
