const express = require("express")
const router = express.Router()
const adminMiddleware = require("../middleware/admin-middleware")
const authMiddelware = require("../middleware/auth-middleware")

router.get("/welcome",authMiddelware,adminMiddleware,(req,res)=>{
    res.json({
        message:"Welcome to the Admin Page"
    })
})

module.exports = router