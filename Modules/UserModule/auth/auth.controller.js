import dotenv from "dotenv";
import User from "../../../DataBase/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config();

// Signup a new user steps: 
// 1. Check if the user already exists in the database
// 2. Hash the password
// 3. Create a new user in the database

// @desc    Signup a new user
// @route   POST /auth/signup
// @access  Public

export const signup = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    recoveryEmail,
    DOB,
    mobileNumber,
    role,
  } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 5);
    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      recoveryEmail,
      DOB,
      mobileNumber,
      role,
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

// Signin a user steps:
// 1. Check if the user exists in the database
// 2. Compare the password
// 3. Generate a JWT token and send it in the response

// @desc    Signin a user
// @route   POST /auth/signin
// @access  Public

export const signin = async (req, res, next) => {
  const { login, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { email: login },
        { recoveryEmail: login },
        { mobileNumber: login },
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not defined. Make sure you have set it in your .env file"
      );
      return res.status(500).json({ message: "Internal server error" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await User.updateOne({ _id: user._id }, { $set: { status: "online" } });

    res.status(200).json({ message: "User signed in successfully", token });
  } catch (error) {
    next(error);
  }
};

// updateAccount function steps:
// 1. Check if the email or mobile number already exists in the database
// 2. Update the user account

// @desc    Update the user account
// @route   PUT /auth/update
// @access  Private

export const updateAccount = async (req, res, next) => {
  const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } =
    req.body;
  const userId = req.user._id;

  try {
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res
          .status(400)
          .json({ message: "Mobile number already exists" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, mobileNumber, recoveryEmail, DOB, lastName, firstName },
      { new: true }
    ).select("-password");

    res
      .status(200)
      .json({ message: "Account updated successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// deleteAccount function steps:
// 1. Find the user by id
// 2. Delete the user account

// @desc    Delete the user account
// @route   DELETE /auth/delete
// @access  Private

export const deleteAccount = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// getAccountData function steps:
// 1. Get the user id from the request
// 2. Find the user by id
// 3. Send the user data in the response

// @desc    Get the user account data
// @route   GET /auth/myData
// @access  Private

export const getAccountData = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// getProfileData function steps:
// 1. Get the user id from the request
// 2. Find the user by id
// 3. Send the user data in the response

// @desc    Get the user profile data
// @route   GET /auth/profile/:userId
// @access  Private

export const getProfileData = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// updatePassword function steps:
// 1. Get the user id from the request
// 2. Find the user by id
// 3. Compare the old password
// 4. Hash the new password
// 5. Update the user password

// @desc    Update the user password
// @route   PUT /auth/update-password
// @access  Private

export const updatePassword = async (req, res, next) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 5);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// forgetPassword function steps:
// 1. Find the user by email
// 2. Generate an OTP
// 3. Store the OTP in the otpStore object
// 4. Send the OTP to the user's email

// @desc    Forget password
// @route   POST /auth/forget-password
// @access  Public

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomBytes(3).toString("hex");
    otpStore[email] = otp;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    next(error);
  }
};

// resetPassword function steps:
// 1. Compare the OTP
// 2. Hash the new password
// 3. Update the user password
// 4. Delete the OTP from the otpStore object

// @desc    Reset password
// @route   POST /auth/reset-password
// @access  Public

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 5);
    await User.updateOne({ email }, { password: hashedNewPassword });

    delete otpStore[email];

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// getAccountsByRecoveryEmail function steps:
// 1. Get the recovery email from the query
// 2. Find the users by recovery email
// 3. Send the users in the response

// @desc    Get accounts by recovery email
// @route   GET /auth/accounts-by-recovery-email
// @access  Private

export const getAccountsByRecoveryEmail = async (req, res, next) => {
  const { recoveryEmail } = req.query;

  try {
    const users = await User.find({ recoveryEmail });

    if (users.length === 0) {
      return res.status(404).json({
        message: "No accounts found with the specified recovery email",
      });
    }

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};
