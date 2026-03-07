import {User} from '../model/user.model.js';

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
  });
} catch (error) {
  next(error);
  }
};
export {registerUser};
