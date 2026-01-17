import express, { Router } from 'express'
import { getUserDetails, loginUser, registerUser } from '../controllers/userController.js'
import { protect } from '../middlewares/auth.js'

const userRouter = Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/userdata', protect, getUserDetails)

export default userRouter;