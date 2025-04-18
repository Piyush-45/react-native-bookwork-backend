import { Router } from 'express'
import User from '../models/user.js';
import jwt from "jsonwebtoken"
import bcrypt from 'bcryptjs';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" })
}

const router = Router()

router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "password should be at least 6 characters long" })

        }

        if (username.length < 3) {
            return res.status(400).json({ message: "username should be at least 3 character long" })
        }

        // ! check if user already exists
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ message: "email already exists" })
        }

        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            return res.status(400).json({ message: "email already exists" })
        }

        //? get random avatar 
        const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`

        // ? password is already hashed in model
        const user = new User({
            email,
            username,
            password,
            profileImage
        })

        await user.save()

        const token = generateToken(user._id)

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                profileImage: user.profileImage,
                email: user.email
            }
        })
    }
    catch (error) {
        console.log("errorr in register route", error)
        res.status(500).json({ message: "Internal server error" })
    }
})



router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Allow login with email or username
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                profileImage: user.profileImage,
                email: user.email
            }
        });

    } catch (error) {
        console.log("error in login route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;