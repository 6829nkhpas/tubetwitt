import { Asynchandler } from "../utils/Asynchandler.js";
import { User } from "../models/user_model.js";
import {Apierror} from "../utils/errorResponse.js";

const resgister_user = Asynchandler(async (req, res) => {
   const {fullName,email,password,username}= req.body;
   if(
    [fullName,email,username,password].some((field) => field.trim() === "")
   )
   {
    throw new Apierror(400, ["All fields are required"]);
   }
   
})
export{
    resgister_user
}