import  mongoose  from "mongoose";

const groupSchema =new mongoose.Schema ({
    admin:Object, //the admin of the group, and has privilege to remove members, etc
    group_name:String, //group name
    //unique group id generated automatically/ used to join
    group_id:{
        type:String,
        unique:true
    },
    users:Array, //stores all the user's email id
});

export const Groups = mongoose.model('group' , groupSchema);

