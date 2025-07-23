import express from "express";
import {test} from "../controllers/user.controller.js"
import { verifyToken } from "../utils/user.js";
import { updateUser,deleteUser,signOut,getUserListings,getUser} from "../controllers/user.controller.js";
import { get } from "mongoose";

const router = express.Router();

router.get('/test',test);
router.put('/update/:id',verifyToken,updateUser);
router.delete('/delete/:id',verifyToken,deleteUser);
router.get('/sign-out',signOut);
router.get('/listings/:id',verifyToken,getUserListings);
router.get('/:id',verifyToken,getUser);
export default router;