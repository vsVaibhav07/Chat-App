import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
    
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        if (!fullName || !username || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        } else if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profilePhoto = gender === "male" ? "https://media.istockphoto.com/id/1934800957/vector/man-empty-avatar-vector-photo-placeholder-for-social-networks-resumes-forums-and-dating.jpg?s=612x612&w=0&k=20&c=uegpkq9-EgMlLR2MjUOgYV5Ev4hftQ_X4CONfDInjE8=" : "https://media.istockphoto.com/id/1327592664/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-woman.jpg?s=612x612&w=0&k=20&c=6SzxAmNr9PZtHIeVZa0l6RbcRpjTnyeno0fW9B5Y6Uk=";
        await User.create({
            fullName,
            username,
            password: hashedPassword,
            profilePhoto,
            gender
        })
        return res.status(201).json({ message: "User registered successfully", success: true });

    } catch (error) {
        console.error("Error in user registration:", error);
        return res.status(500).json({ message: "Internal server error" });

    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials", success: false });
        }
        const tokenData = {
            userId: user._id,
        }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        return res.status(200).cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, samesite: 'strict' }).json({ message: "Login successful", success: true, user: { id: user._id, username: user.username, fullName: user.fullName, profilePhoto: user.profilePhoto } });
    } catch (error) {
        console.error("Error in user login:", error);
        return res.status(500).json({ message: "Internal server error" });

    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: 'strict' });
        return res.status(200).json({ message: "Logged out successful", success: true });

    } catch (error) {
        console.error("Error in user logout:", error);
        return res.status(500).json({ message: "Internal server error", success: false });

    }
}

export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        return res.status(200).json({ message: "Other users fetched successfully", success: true, otherUsers });
    } catch (error) {
            console.error("Error fetching other users:", error);
            return res.status(500).json({ message: "Internal server error", success: false });
        }
    }