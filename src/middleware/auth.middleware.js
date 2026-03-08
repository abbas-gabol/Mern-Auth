import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }


    const user = await User.findById(payload.id).select("tokenVersion");
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    req.user = payload; 
    next();
  } catch (error) {
    next(error);
  }
};

export { authMiddleware };