const User = require("./../models/user")
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")

const registerUser = async (req,res)=>{
    try{
        const {username,email,password,role} = req.body

        // check if the user already exists in our database 
        const checkExistingUser = await User.findOne({$or:[{username},{email}]})
        if(checkExistingUser){
            return res.status(400).json({
                success:false,
                message:"User is already exists either with same user name or same email"
            })
        }

        // hash user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        // create a new user and save in database

        const newlyCreatedUser = new User({
            username,
            email,
            password:hashedPassword,
            role:role || "user"
        })

        await newlyCreatedUser.save()

        if(newlyCreatedUser){
            res.status(201).json({
                success:true,
                message:"user registered successfully"
            })
        }else{
            res.status(400).json({
                success:true,
                message:"unable to register user"
            }) 
        }
    }catch(e){
        console.log(e)
        res.status(500).json({
            success:false,
            message:"some error occured"
        })
    }
}

const loginUser = async(req,res)=>{
    try{
        const {username,password} = req.body
        // find if the current user is exists in database or not
        const user = await User.findOne({username})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid username or password"
            })
        }
        // if the password is correct or not
        const isPasswordMatch = await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Invalid username or password"
            })
        }
        // create user token
        const accessToken = jwt.sign({
            userId : user._id,
            username: user.username,
            role:user.role
        },process.env.JWT_SECRET_KEY,{
            expiresIn:"15m"
        })

        res.status(200).json({
            success:true,
            message:"Logged in successful",
            accessToken
        })


    }catch(e){
        console.log(e)
        res.status(500).json({
            success:false,
            message:"some error occured"
        })
    }
}

const changePassword = async (req,res)=>{
    try{
        const userId = req.userInfo.userId

        // extract old and new password
        const {oldPassword,newPassword} = req.body

        // find the current logged in user
        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found!"
            })
        }

        // check if the old password is correct

        const isPasswordMatch = await bcrypt.compare(oldPassword,user.password);

        if(!isPasswordMatch){
            return res.status(400).json({
                 success:false,
                message:"Old Password is not correct please try again!"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const newHashedPassword = await bcrypt.hash(newPassword,salt)

        user.password = newHashedPassword
        await user.save()

        res.status(200).json({
            success:true,
            message:"password change successfully"
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"some error occured"
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    changePassword
}