const Image = require("./../models/image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary")

const uploadImageController = async (req, res) => {
  try {
    // check if file is missing in req object
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required please upload an image",
      });
    }

    // upload to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    // store the url and public id along with the uploaded user id
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });

    await newlyUploadedImage.save();

    res.status(201).json({
      success: true,
      message: "Image uploaded successful",
      image: newlyUploadedImage,
    });

    // delete the file from local storage

    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.log("Error in UploadImage ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong please try again",
    });
  }
};

const fetchImageController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page-1)*limit
    const sortBy = req.query.sortBy || "createdAt"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1
    const totalImages = await Image.countDocuments()
    const totalPages = Math.ceil(totalImages/limit)

    const sortObj = {}
    sortObj[sortBy] = sortOrder

    const images = await Image.find().sort(sortObj).limit(limit)
    if(images){
        res.status(200).json({
            success:true,
            currentPage:page,
            totalPages:totalPages,
            totalImages:totalImages,
            data:images
        })
    }
  } catch (error) {
    console.log("Error in fetching ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong please try again",
    });
  }
};

const deleteImageController = async (req,res)=>{
  try{
    const getCurrentIdOfImageToBeDelete = req.params.id;
    const userId = req.userInfo.userId

    const image = await Image.findById(getCurrentIdOfImageToBeDelete);
    if(!image){
      return res.status(404).json({
        success:false,
        message:"Image not Found"
      })
    }
    // who is trying to delete this image

    if(image.uploadedBy.toString() !== userId){
      return res.status(403).json({
        success:false,
        message:"your are not authorized to delete this image"
      })
    }

    // delete this image first in cludinary
    await cloudinary.uploader.destroy(image.publicId)

    // delete image from mongodb database
    await Image.findByIdAndDelete(getCurrentIdOfImageToBeDelete)

    res.status(200).json({
      success:true,
      message:"Image delete Successfully"
    })



  }catch(error){
    console.log("Error in Deleting ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong please try again",
    });
  }
}

module.exports = {
  uploadImageController,
  fetchImageController,
  deleteImageController
};
