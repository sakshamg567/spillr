import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req,res,next) =>{
    try{
        const authHeader = req.headers.authorization;
        const JWT_SECRET = process.env.JWT_SECRET;


        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message:"No token provided"});
        }

        const token =authHeader.split(" ")[1];

        const decoded = jwt.verify(token,JWT_SECRET);

        req.user = { id: decoded.id };

        next();
    }catch(err){
        console.error(err);
        res.status(401).json({ message: "Invalid or expired token"})  
    }
}