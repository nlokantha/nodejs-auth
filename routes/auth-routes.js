const express = require("express")
const {registerUser,loginUser,changePassword} = require("./../controllers/auth-controller")
const router = express.Router();

const authMeddleware = require("../middleware/auth-middleware")


router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/change-password",authMeddleware,changePassword)




module.exports = router