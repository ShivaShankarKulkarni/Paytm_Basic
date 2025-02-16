const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: "1"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, "shiva2001");

        req.userId = decoded.userId;

        next();
    } catch (err) {
        return res.status(403).json({Message: "token missing", err});
    }
};

module.exports = {
    authMiddleware
}