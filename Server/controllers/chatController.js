import { Chat } from "../models/chat.js";

// API for creating new chat
export const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatData = {
            userId,
            userName: req.user.name,
            name: "New Chat",
            messages: [],
        }
        await Chat.create(chatData);
        return res.json({success: true, message: "Chat created successfully!"});
    } catch (error) {
        return res.json({success: false, message: "Creating chat failed!", error: error.message});
    }
}

// API to get all chats of a user
export const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({userId}).sort({updatedAt: -1});      
        return res.json({success: true, chats});
    } catch (error) {
        return res.json({success: false, message: "Fetching user chats failed!", error: error.message});
    }
}

// API to delete a chat
export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const {chatId} = req.body;
        await Chat.deleteOne({_id: chatId, userId})
        return res.json({success: true, message: "Chat deleted successfully!"});
    } catch (error) {
        return res.json({success: false, message: "Deleting chat failed!", error: error.message});
    }
}