import  mongoose  from "mongoose";

const userSchema =new mongoose.Schema ({
    firstName:String,
    lastName:String,
    gender:String,
    email:String,
    Age:Number,
    DOB: Date,
    isOnline:Boolean,
    contacts:Array,
    password:String,
    groups:Array,
    googleId:String
});

export const Users = mongoose.model('user' , userSchema);

