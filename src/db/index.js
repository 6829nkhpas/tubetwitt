import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"
const mongo="mongodb+srv://tubetwitt_user:tubetwitt123@cluster0.gjy0kx7.mongodb.net"

const connectDB = async () =>{
    try{
        const connect_instance = await mongoose.connect(`${mongo}/${DB_NAME}`)
       console.log(` mongo DB is connected ${connect_instance.connection.host}`);
       
    }
    catch(error){
        console.log("MOngoDB connection error",error);
        process.exit(1)
        
    }
}
export default connectDB;