const jwt = require("jsonwebtoken");

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWSECRET, { expiresIn: "3d"} );
}

module.exports = { generateRefreshToken };