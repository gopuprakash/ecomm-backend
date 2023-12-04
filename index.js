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
const prodCatRouter = require("./routes/prodCategoryRoute");
const blogCatRouter = require("./routes/blogCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const enqRouter = require("./routes/enqRoute");
const colorRouter = require("./routes/colorRoute");
const couponRouter = require("./routes/couponRoute");
const addressRouter = require("./routes/addressRoute");
const uploadRouter = require("./routes/uploadRoute");
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
//Define Prod Category API root
app.use('/api/prodcategory', prodCatRouter);
//Define blog Category API root
app.use('/api/blogcategory', blogCatRouter);
//Define brand API root
app.use('/api/brand', brandRouter); 
//Define enquiry API root
app.use("/api/enquiry", enqRouter);
//Define color API root
app.use('/api/color', colorRouter); 
//Define coupon API root
app.use('/api/coupon', couponRouter); 
//Define address API root
app.use('/api/address', addressRouter);

app.use('/api/image', uploadRouter);

//middlewares
app.use(notFound)
app.use(errorHandler)

// Server Setup
app.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
})

