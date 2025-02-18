const express = require("express")
const router = express.Router()
const authMiddleware = require("./../middleware/auth-middleware")

router.get("/welcome",authMiddleware,(req,res)=>{
    const {username,userId,role} = req.userInfo
    res.json({
        message:"Welcome to the Home page",
        user:{
            _id:userId,
            username,
            role
        }
    })
})

module.exports = router