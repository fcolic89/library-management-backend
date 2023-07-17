const jwt = require('jsonwebtoken');
const privateKey = process.env.PRIVATE_KEY || 'supersecretandsuperprivatekey';

function authentication(req, res, next){
    // Authorization: Bearer <token>
    let auth = req.header('Authorization');
    if(!auth) return res.status(401).send('Access denied. No token provided!');

    let token = auth.split(" ")[1];
    if(!token) return res.status(401).send('Access denied. No token provided!');
    
    try{
        let decoded = jwt.verify(token, privateKey);
        req.user = decoded;
        next();
    }catch(err){
        res.status(400).send('Invalid token!');
    }
}

function authorization(roles){
    return async (req, res, next) => {
        if(!roles.includes(req.user.role)) return res.status(401).send('Access denied. User does not have permission for this resource!');
        next();
    }
}
module.exports = {
    authentication,
    authorization
}
