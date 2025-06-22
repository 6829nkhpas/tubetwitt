import { Router } from "express";
import { resgister_user,logout_user } from "../controllers/user_controler.js";
import { upload } from "../middlewares/multer.fileupload.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  resgister_user
);
//secured routes
router.route("/logout").post(verifyJWT, logout_user);

export default router;
