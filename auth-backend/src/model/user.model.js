import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 100,
    },

    googleId: {
      type: String,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },  
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        userAgent: { type: String },                  
        ip: { type: String },                         
      },
    ],
  },
  { timestamps: true }
);



userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});


userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");

  return jwt.sign(
    { id: this._id, email: this.email, tokenVersion: this.tokenVersion },
    secret,
    { expiresIn: "15m" }
  );
};


userSchema.methods.generateRefreshToken = async function (
  rememberMe = false,
  meta = {}
) {
  const rawToken = crypto.randomBytes(64).toString("hex"); // 128-char hex string
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const ttlMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000  // 30 days
    :      24 * 60 * 60 * 1000; // 24 hours

  const expiresAt = new Date(Date.now() + ttlMs);


  this.refreshTokens = this.refreshTokens.filter((t) => t.expiresAt > new Date());

  this.refreshTokens.push({
    tokenHash,
    expiresAt,
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null,
  });

  await this.save();
  return rawToken;
};


userSchema.methods.findRefreshToken = function (rawToken) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return this.refreshTokens.find(
    (t) => t.tokenHash === tokenHash && t.expiresAt > new Date()
  ) ?? null;
};


userSchema.methods.revokeRefreshToken = async function (rawToken) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.refreshTokens = this.refreshTokens.filter(
    (t) => t.tokenHash !== tokenHash
  );
  await this.save();
};


userSchema.methods.revokeAllTokens = async function () {
  this.refreshTokens = [];
  this.tokenVersion += 1;
  await this.save();
};

userSchema.methods.generatePasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  
  await this.save();
  return resetToken;
};

userSchema.methods.verifyPasswordResetToken = function (resetToken) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  return (
    this.passwordResetToken === hashedToken &&
    this.passwordResetExpires > new Date()
  );
};

userSchema.methods.clearPasswordResetToken = async function () {
  this.passwordResetToken = null;
  this.passwordResetExpires = null;
  await this.save();
};

export const User = mongoose.model("User", userSchema);