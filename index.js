// Requiring module
const express = require('express');
const dbConnect = require('./config/dbConnect');
// Creating express object
const app = express();
const dotenv = require('dotenv').config();
// Port Number
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const morgan = require("morgan");
//DB Conect
dbConnect();

//Parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

//cookie parser
app.use(cookieParser());

//morgan
app.use(morgan('dev'));

//Define User API root
app.use('/api/user', authRouter);
//Define Product API root
app.use('/api/product', productRouter);
//Define Blog API root
app.use('/api/blog', blogRouter);

//middlewares
app.use(notFound)
app.use(errorHandler)

// Server Setup
app.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
})

