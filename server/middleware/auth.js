// we create this middleware to protect our requests , and it runs between a request being sent and it being executed

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// To check user is logged in or no
const protect = async(req,res,next) => {
    // This line of code securely extracts a logged-in user's JSON Web Token (JWT) from an incoming request's HTTP headers.
    // It first checks if an Authorization header exists and safely verifies that it begins with the standard prefix
    // "Bearer". If both checks pass, it splits the string at the space and captures just the raw security token string,
    //  discarding the word "Bearer". If the header is missing or malformed, it sets the token variable to null so your
    //  middleware can immediately block unauthorized access.
    let token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null; 

    if(token){
        try{
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if(!req.user){
                return res.status(401).json({message: 'Not authorised , user not found.'})
            }
            next();  // means here middleware ends
        }
        catch (error){
            return res.status(401).json({ message: "Not authorised , token failed. "})
        }
    }
    else{
        return res.status(401).json({message: 'Not authorised , no token.'})
    }

}

const admin = (req,res,next) =>{
    if(req.user && req.user.role === 'admin'){
        next();
    }
    else{
        return res.status(403).json({message:" Forbidden. Admin access required. "})
    }
}

export {protect,admin}