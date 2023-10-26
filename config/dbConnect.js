const { default: mongoose } = require("mongoose")

const dbConnect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL); 
        console.log("Successfully connected to DB")
    } catch (error) {
        console.log("Error connecting to DB")
        throw new Error(error);
        
    }
}
module.exports = dbConnect;