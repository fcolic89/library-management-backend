const jwt = require('jsonwebtoken');
const { User } = require('../database/models');
const privateKey = process.env.PRIVATE_KEY || 'supersecretandsuperprivatekey';

const authentication = (req, res, next) => {
    // Authorization: Bearer <token>
    let auth = req.header('Authorization');
    if(!auth) return res.status(401).json({message: 'Access denied. No token provided!'});

    let token = auth.split(" ")[1];
    if(!token) return res.status(401).json({message: 'Access denied. No token provided!'});
    
    try{
        let decoded = jwt.verify(token, privateKey);
        req.user = decoded;
        next();
    }catch(err){
        res.status(400).json({message: 'Invalid token!'});
    }
}

const authorization = (...roles) => {
    return async (req, res, next) => {
        try{
            let user = await User.findOne({ _id: req.user.id });
            if(!user) return res.status(401).json({message: 'Access denied. User does not exist!'});

            if(!roles.includes(user.role)) return res.status(401).json({message: 'Access denied. User does not have permission for this resource!'});
            
            next();
        }catch(err){
            res.status(500).json({message: 'Could not authorize user! Error:' + err.message});
        }
    }
};
module.exports = {
    authentication,
    authorization,
}
