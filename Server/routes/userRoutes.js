import express, { Router } from 'express'
import { getPublishedImages, getUserDetails, loginUser, registerUser } from '../controllers/userController.js'
import { protect } from '../middlewares/auth.js'

const userRouter = Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/userdata', protect, getUserDetails)
userRouter.get('/published-images', getPublishedImages)

export default userRouter;