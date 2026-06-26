const jwt = require('jsonwebtoken');

const protect = (req,res,next)=>{
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                success: false,
                msg: "Try Login"
            })
        }

        let decoded = jwt.verify(token, process.env.JWT_SECRET || 'RestaurantSecretKey123!');
        // let user = await User.findOne({ email : decoded.email }).select("-password");
        req.user = decoded;
        next();

        } catch (error) {
            res.status(500).json({
                success: false,
                msg: error.message
            })
    }
}

module.exports = {protect}