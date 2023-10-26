const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWSECRET, { expiresIn: "1d"} );
}

module.exports = { generateToken };