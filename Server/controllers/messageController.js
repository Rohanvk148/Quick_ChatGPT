import imagekit from "../configs/imageKit.js";
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import axios from 'axios';
import openai from "../configs/openAI.js";

// Text based Ai chat controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if(req.user.credits < 1)
            return res.json({success:false, message:"Not enough credits to generate image. Please purchase more credits."})
        const { chatId, prompt} = req.body;
        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({
            isImage: false,
            role: "user",
            content: prompt,
            timestamp: Date.now()
        })
        const {choices} = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        const reply = {...choices[0].message, timestamp: Date.now(), isImage: false};
        res.json({success:true, reply})
        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({_id: userId}, {$inc: {credits: -1}})
        
    } catch (error) {
        res.json({success:false, error:error.message})
    }
}

// Image based Ai chat controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if(req.user.credits < 2)
            return res.json({success:false, message:"Not enough credits to generate image. Please purchase more credits."})
        const { chatId, prompt, isPublished} = req.body;
        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({
            isImage: false,     //because message is text prompt for image generation
            role: "user",
            content: prompt,
            timestamp: Date.now()
        });
        
        // Encode the prompt 
        const encodedprompt = encodeURIComponent(prompt);
        // construct imagekit AI generation URL
        const generatedImageURL = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedprompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;
        // fetch the generated image from imagekit AI
        const aiImageResponse = await axios.get(generatedImageURL, {responseType: 'arraybuffer'})
        // convert image data to base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, 'binary').toString('base64')}`
        // upload to imagekit media library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        })
        const reply = {role: "assistant", content: uploadResponse.url, timestamp: Date.now(), isImage: true, isPublished: isPublished};
        res.json({success:true, reply})
        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({_id: userId}, {$inc: {credits: -2}})

    } catch (error) {
        res.json({success:false, error:error.message})
    }
}