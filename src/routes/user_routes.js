import { Router } from "express";
import { resgister_user } from "../controllers/user_controler.js";
import { upload } from "../middlewares/multer.fileupload.js";
const router = Router();

router
  .route("/")
  .post(
    upload.multi[
      ({ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 })
    ],
    resgister_user
  );

export default router;
