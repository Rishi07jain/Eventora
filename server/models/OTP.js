import mongoose from "mongoose";

const optSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        // Pro-tip: It's highly recommended to remove 'unique: true' from here 
        // so users can request a new OTP if their first one expires!
    },
    otp : {
        type: String,
        required: true
    },
    action : {
        type : String,
        enum : ['account_verification' , 'event_booking'] ,  
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now,
        expires : 300    // OTP expires after 5 mins
    }
});

//  Correct ES Modules Default Export (and fixed the schema variable typo!)
const OTP = mongoose.model('OTP', optSchema);
export default OTP;