import User from '../models/User.js'
import OTP from '../models/OTP.js'
import bcrypt from 'bcryptjs'
import { sendOtpEmail } from '../utils/email.js'
import jwt from 'jsonwebtoken'


const generateToken = (id, role) => {
    return jwt.sign({id , role} , process.env.JWT_SECRET, {expiresIn : '7d'})
}

// Register user function
// Why did we write it as exports.registerUser and not normally -> function registerUser?
// A normal function is private and stuck inside its own file. Adding exports. makes the function public 
// so other files (like your routes) can import and use it.

export const registerUser = async (req, res)=>{
    const {name , email , password} = req.body;

    try {
        let userExists = await User.findOne({email})
        if(userExists){
            return res.status(400).json({error:"User already exists"})
        }

        // Hashing the entered password
        const salt = await bcrypt.genSalt(10);  // It generates a unique, random string of characters called a "salt". The number 10 tells the computer how many rounds of hashing to perform (10 is the industry standard
        const hashedPassword = await bcrypt.hash(password,salt)  // It takes the user's real password, mixes it with the unique salt you just generated, and runs it through a complex mathematical blender.

        const user = await User.create({
            name, 
            email, 
            password: hashedPassword, 
            role: 'user', 
            isVerified: false
        });

        // Generating otp
        const otp = Math.floor(100000+ Math.random() * 900000).toString();
        console.log(`OTP for ${email}: ${otp}`)
        await OTP.create({email, otp , action: 'account_verification'})

        await sendOtpEmail(email,otp, 'account_verification')

        res.status(201).json ({
            message: 'User registered successfully. Please check your email to verify.',
            email : user.email
        })

    } catch (error){
        res.status(400).json({error: error.message});
    }
};


// Similarly , we write code for login user

export const loginUser = async (req,res) =>{
    const {email, password} = req.body

    try {
        let user = await User.findOne({email})

        if(!user){
            return res.status(400).json({error : 'Invalid credentials'})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({error : 'Invalid credentials'})
        }


        // to check whether otp is verified
        if(!user.isVerified && user.role === 'user'){
            const otp = Math.floor(100000+ Math.random() * 900000).toString();
            await OTP.deleteMany({email, action: 'account_verification'}) // remove the old OTPs
            await OTP.create({email, otp , action: 'account_verification'})
            await sendOtpEmail(email,otp, 'account_verification')
            return res.status(400).json({
                error : 'Account is not verified. A new OTP has been sent to your email.'
            })
        }

        res.json({
            message: 'Login successful',
            _id : user._id,
            name : user.name,
            email : user.email,
            role: user.role,
            token: generateToken(user._id , user.role)
        })
    } catch (error) {
        res.status(500).json({error: error.message});
    }

}

export const verifyOtp = async(req,res) => {
    const {email , otp} = req.body;
    try {
        const otpRecord = await OTP.findOne({email , otp , action: 'account_verification'});

        if(!otpRecord){
            return res.status(400).json({error: 'Invalid or expired OTP'})
        }

        // 'const user = '  is done to save the user
        const user = await User.findOneAndUpdate({email}, {isVerified: true}, {new: true});    // if otp gets verified , then find the email and update isVerified to 'true'
        await OTP.deleteMany({email , action: 'account_verification'});   // remove used OTPs if OTP gets verified
        res.json(
            {
                message: 'Account verified successfully. You can now log in.' ,
                _id : user._id,
                name : user.name,
                email : user.email,
                role : user.role,
                token : generateToken(user._id , user.role)
            }
        )
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}