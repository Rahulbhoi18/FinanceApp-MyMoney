const express = require('express')
const zod = require('zod');
const authMiddleware = require('../middlewares/auth.middleware');
const { User, Transaction } = require('../models/db');
const router = express.Router();
const moment = require('moment')
const mongoose = require('mongoose')

const addNewTransactionBody = zod.object({
    title : zod.string().max(15),
    date : zod.string().date(),
    amount : zod.number().positive(),
    category : zod.string().max(10),
    description : zod.string().min(1),
    transactionType : zod.string(0) 
})
router.post("/addTransaction" , authMiddleware , async  (req , res , next) => {
  
    const {success , data , error} = addNewTransactionBody.safeParse(req.body)
    const userId = req.userId;

    if(!success) {
        return res.json({
            msg : "Invalid inputs , Please enter valid information" , 
            errors : error.errors
        })
    }
    
    const user = await User.findById(userId)
    if(!user) {
        return res.status(404).json({
            msg : "User not found"
        })
    }
    
    const newTransaction = await Transaction.create({
        ...data , 
        user : userId
    })
    user.transactions.push(newTransaction)
    await user.save()

    return res.status(200).json({
        success: true,
        message: "Transaction added successfully",
        transaction: newTransaction,
      });
})

router.post("/getTransactions"  ,authMiddleware ,  async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    const userId = req.userId; 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const query = { user: userId };

    if (type && type !== "all") {
      query.transactionType = type;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate(),
      };
    }


    const transactions = await Transaction.find(query);

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
});

router.delete("/deleteTransaction/:transactionId" , authMiddleware , async (req , res ) => {
   
    const userId  = req.userId;
    const user = await User.findById(userId);
    if(!user){
        return res.json({
            msg : "User does not exist"
        })
    }

    const {transactionId} = req.params;
    const transaction = await Transaction.findById(new mongoose.Types.ObjectId(transactionId))
    
    if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

    if(transaction.user.toString() != userId){
        return res.status(403).json({
            msg : "Unauthorised !!!"
        })
    }

    await Transaction.findByIdAndDelete(transactionId)
    await User.findByIdAndUpdate(user , {
        $pull: {transactions : transactionId}
    })
  

    return res.status(200).json({
        success: true,
        message: "Transaction deleted successfully",
      });
    
})

const updateBody = zod.object({
  title: zod.string().optional(),
  description: zod.string().optional(),
  category: zod.string().optional(), 
  amount: zod.number().optional(),
  transactionType: zod.string().optional(),
  date: zod.string().optional(), 
});

router.put("/updateTransaction/:transactionId", authMiddleware, async (req, res) => {
  try {
    const { success, data, error } = updateBody.safeParse(req.body);
    const transactionId = req.params.transactionId; 

    if (!success) {
      return res.status(400).json({
        msg: "Enter valid inputs",
        errors: error.errors,
      });
    }

    const transactionUpdate = await Transaction.findById(transactionId);
    if (!transactionUpdate) {
      return res.status(404).json({
        msg: "No transaction found",
      });
    }


    if (data.title) transactionUpdate.title = data.title;
    if (data.description) transactionUpdate.description = data.description;
    if (data.category) transactionUpdate.category = data.category; 
    if (data.amount) transactionUpdate.amount = data.amount;
    if (data.transactionType) transactionUpdate.transactionType = data.transactionType;
    if (data.date) transactionUpdate.date = new Date(data.date); 

    await transactionUpdate.save();

    return res.status(200).json({
      msg: "Transaction updated",
      transaction: transactionUpdate, 
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

module.exports = router;