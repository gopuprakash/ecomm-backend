const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


/* const cloudinaryUploadImg = (fileToUpload) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(fileToUpload, (error, result) => {
      if (error) {
        console.error(`error: ${error}`);
        reject(error);
      } else {
        console.log(`result: ${result}`);
        resolve(
          {
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id,
          },
          {
            resource_type: "auto",
          }
        );
      }
    });
  });
}; */

const cloudinaryUploadImg = async (fileToUpload) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true, 
    };

    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(fileToUpload, options);
      //console.log(result);
      return {
        url: result.secure_url,
        asset_id: result.asset_id,
        public_id: result.public_id,
      };
    } catch (error) {
      throw error;
    }
};


const cloudinaryDeleteImg = async (fileToDelete) => {
  try {
    // Upload the image
    const result = await cloudinary.uploader.destroy(fileToDelete);
    //console.log(result);
    return {
      url: result.secure_url,
      asset_id: result.asset_id,
      public_id: result.public_id,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };
