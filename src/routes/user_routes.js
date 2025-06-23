import { Router } from "express";
import { resgister_user,
  logout_user,
  login_user,
  refreshAccessToken,
  changeCurrentPassword,
   getcurrentUser,
   getUserChannelProfile,
   updateAccountDetails,
   updateAvatar,
   updateCoverImage,
   getWatchHistory
   } from "../controllers/user_controler.js";
import { upload } from "../middlewares/multer.fileupload.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();
//unsecured routes
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  resgister_user
);
router.route("/login").post(login_user);
router.route("/refresh-token").post(refreshAccessToken);
//secured routes
router.route("/logout").post(verifyJWT, logout_user);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getcurrentUser);
router.route("/c/username").get(verifyJWT, getUserChannelProfile); 
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/watch-history").get(verifyJWT, getWatchHistory);
export default router;
