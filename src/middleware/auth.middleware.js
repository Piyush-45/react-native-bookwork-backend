import User from "../models/user.js";
import jwt from "jsonwebtoken"
const protectRoute = async (req, res, next) => {
    try {
        // ✅ 1. Get token from the "Authorization" header
        const token = req.header("Authorization").replace("Bearer ", "");

        // 🚫 If no token is provided, deny access
        if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

        // ✅ 2. Verify token using JWT_SECRET from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ 3. Find the user in the database using the userId from the decoded token
        const user = await User.findById(decoded.userId).select("-password");

        // 🚫 If user not found (maybe user was deleted or token is forged), deny access
        if (!user) return res.status(401).json({ message: "Token is not valid" });

        // ✅ 4. Attach user to request object so you can access it later in the route
        req.user = user;

        // ✅ 5. Call next() to move to the next middleware or route handler
        next();
    } catch (error) {
        // 🛑 If any error happens (invalid token, expired token, etc.), respond with 401
        console.error(error);
        res.status(401).json({ message: "Auth failed" });
    }
};

export default protectRoute