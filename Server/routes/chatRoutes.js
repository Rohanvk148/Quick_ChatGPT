import express, { Router } from 'express'
import { createChat, deleteChat, getUserChats } from '../controllers/chatController.js'
import { protect } from '../middlewares/auth.js'

const chatRouter = Router()

chatRouter.get('/createchat', protect, createChat)
chatRouter.get('/getuserchats', protect, getUserChats)
chatRouter.post('/deletechat', protect, deleteChat)

export default chatRouter