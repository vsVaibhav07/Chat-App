import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const createAssistant = async () => {
    try {
        const existingAi = await User.findOne({ username: "assistant" });

        if (!existingAi) {
            const hashedPassword = await bcrypt.hash(process.env.AI_PASSWORD, 10)
            const AiUser = new User({
                fullName: "Ai Assistant",
                username: "assistant",
                password: hashedPassword,
                profilePhoto: 'assistant_img.webp',
                gender: "male",
                bio: "I'm your smart AI assistant 🤖 ready to help!"

            })
            await AiUser.save();
        }

    } catch (error) {
        console.log('Server problem in creating AI Assistant!')
    }
}
export default createAssistant