import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
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
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 100,
  },
}, { timestamps: true });

userSchema.pre('save', async function(){
  if(this.isModified('password')){
    this.password= await bcrypt.hash(this.password, 10);
  }
});

export const User = mongoose.model('User', userSchema);
