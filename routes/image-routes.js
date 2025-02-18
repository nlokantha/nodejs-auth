const express = require("express")
const adminMiddleware = require("../middleware/admin-middleware")
const authMiddelware = require("../middleware/auth-middleware")
const uploadMiddelware = require("../middleware/upload-middleware")
const {uploadImageController,fetchImageController,deleteImageController} = require("../controllers/image-controller")


const router = express.Router()


router.post("/upload",authMiddelware,adminMiddleware,uploadMiddelware.single("image"),uploadImageController)
router.get("/get",authMiddelware,fetchImageController)
router.get("/:id",authMiddelware,adminMiddleware,deleteImageController)


module.exports = router