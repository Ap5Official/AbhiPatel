import mongoose, { model } from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        unique: true,
        required:true,
    },
    email:{
        type: String,
        unique: true,
        required:true,
    },
    password:{
        type: String,
        unique:false,
        required: true,
    },
    avatar:{
        type:String,
        default:"https://www.google.com/imgres?q=unknown%20user&imgurl=https%3A%2F%2Ft3.ftcdn.net%2Fjpg%2F03%2F53%2F11%2F00%2F360_F_353110097_nbpmfn9iHlxef4EDIhXB1tdTD0lcWhG9.jpg&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dunknown%2Buser&docid=6u-7pwOn1XmGlM&tbnid=yw-zUiYfv0DgAM&vet=12ahUKEwin47u7leWNAxVWcmwGHSj1I0sQM3oECB4QAA..i&w=360&h=360&hcb=2&ved=2ahUKEwin47u7leWNAxVWcmwGHSj1I0sQM3oECB4QAA",


    },
},{timestamps:true});

const User = mongoose.model('User',userSchema);

export default User;