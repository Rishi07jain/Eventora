// Note , your syntax about importing modules will not be same as the video , as you have changed the type to "module"
// instead of commonjs in package.json file

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import bookingRoutes from './routes/bookings.js'
import eventRoutes from './routes/events.js'

dotenv.config()  // reads a secret file in your project called .env, extracts the key-value pairs it finds there, and injects them into your Node.js application's environment.
// we want to add this line before any code , as we want that .env file ka all data is loaded up so that the code below can refer the values present in .env file if any


const app = express()

app.use(cors())
//web browsers have a built-in security feature called the Same-Origin Policy. This policy stops a frontend website running on one domain (like http://localhost:3000 or https://myfrontend.com) from making API requests to a backend running on a different domain (like http://localhost:5000 or https://myapi.com).
// If you try to fetch data across different domains without setting up CORS, the browser will block the request and throw a nasty red error in your developer console:

app.use(express.json());

// Routes
app.use('/api/auth' , authRoutes);
//imagine a user opens your app frontend or Postman and hits POST http://localhost:8080/api/auth/register
// Because the URL starts with /api/auth, it looks at its route middleware hook: app.use('/api/auth', authRoutes);

app.use('/api/events', eventRoutes)
app.use('/api/bookings' , bookingRoutes)

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to MongoDB")
})
.catch((error) => {
    console.log("Error connecting to MongoDB :" , error)
})

const port = process.env.port || 8080;  // this is to initialise the 'port' , if we have stored port value in .env file

app.listen(port , ()=>{
    console.log(`Server is now running on port ${port} `)
}); 