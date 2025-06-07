import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },

    fullname:{
     type:String,
        required:true,
        trim:true,
        index:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,
        required:true
    },
    coverImages:{
        type:String
    },
    watchHistory:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    password:{
        type:String,
        required:[true,"please enter the password"]
    },
    refreshToken:{
        type:String 
    }
    
},
{
    timestamps:true
}
)
export const user = mongoose.model("User", userSchema)