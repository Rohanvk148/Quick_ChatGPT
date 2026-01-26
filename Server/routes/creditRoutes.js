import express, { Router } from 'express'
import { getPlans, purchasePlan } from '../controllers/creditController'
import { protect } from '../middlewares/auth'

const creditRouter = Router()

creditRouter.get('/plan', getPlans)
creditRouter.post('/purchase', protect, purchasePlan)

export default creditRouter