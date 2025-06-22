import jtw from 'jsonwebtoken';
import {Asynchandler} from '../utils/Asynchandler.js';
import { Apierror } from '../utils/errorResponse.js';
import {User} from '../models/users.model.js';


export const verifyJWT = Asynchandler(async (req, _, next) => {
 
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new Apierror(401, "Access denied, token missing");
    }
    try {
        const decoded = jtw.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user= await User.findById(decoded?._id).select("-password -refreshToken");
        if (!user) {
            throw new Apierror(401, "User not found");
        }
        req.user = user;

        next();
    } catch (error) {
        throw new Apierror(401, error.message || "Invalid Access token");
    }
})