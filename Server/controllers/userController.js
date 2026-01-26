import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { Chat } from "../models/chat.js";

// JWT verification
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

// API to register User
export const registerUser = async (req, res) => {
    const {email, name, password} = req.body;
    try {
        const userExists = await User.findOne({email})
        if(userExists)
            return res.json({success: false, message: "user aleady exists!"});
        
        const user = await User.create({name, email, password});
        const token = generateToken(user._id)
        res.json({success: true, data: {name: user.name, email: user.email, token}});
    } catch (error) {
        console.log("error:", error);
        return res.json({success: false, message: "Registration failed!", error: error.message});
    }
}

// API to login User
export const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email})
        if(user)
        {
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch)
            {
                const matchedpasstoken = generateToken(user._id)
                return res.json({success: true, data: {name: user.name, email: user.email, token: matchedpasstoken}});
            }
            else {
                return res.json({success: false, message: "Invalid Credentials!"});
            }
        }
    } catch (error) {
        return res.json({success: false, message: "login failed!", error: error.message});
    }
}

// API to get User details
export const getUserDetails = async (req, res) => {
    try {
        const user = req.user;
        return res.json({success: true, data: {user: user}});
    } catch (error) {
        return res.json({success: false, message: "Fetching user details failed!", error: error.message});
    }
}

// API to get published images
export const getPublishedImages = async (req, res) => {
    try {
        const publishedImageMessges = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ])
        res.json({success:true, images: publishedImageMessges.reverse()})
    } catch (error) {
        res.json({success:false, message: "Fetching published images failed!", error: error.message})
    }
}