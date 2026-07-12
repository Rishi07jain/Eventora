// contains authentication related stuff

import express from 'express'
import {registerUser , loginUser , verifyOtp} from '../controllers/authController.js'   // we imported 2 functions from this file , and used it below. So basically whenever user does a post request on /register , it runs the function inside authController ie registerUser

const router = express.Router()

// does the registration of users
router.post('/register' , registerUser) // we make authController.js file inside controller folder , which contains the logic regarding authentication
router.post('/login' , loginUser)
router.post('/verify-otp' , verifyOtp)

export default router;