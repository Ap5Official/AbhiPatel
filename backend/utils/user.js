import { errorHandler } from "./error.js";
import jwt from 'jsonwebtoken';

        

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
     console.log(token)
    if(!token)
    {
        //console.log("hello");
        return next(errorHandler(401, "You are not authenticated!"));
    }
    //console.log("hello");
        jwt.verify(token,'first_token', (err, user) => {
        if(err)
            return next(errorHandler(403, "Token is not valid!"));
        req.user = user;
        next();
    });
};