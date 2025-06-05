const mongoose = require("mongoose");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { findByIdAndDelete } = require("../models/Note");
const Note = require("../models/Note");

const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.find().select("-password").lean();
  if (!allUsers.length > 0) {
    return res.status(400).json({ message: "No user found" });
  }
  res.json(allUsers);
});

//create new user
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "duplicate username" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    password: hashPassword,
    roles,
  });
  if (!newUser) {
    return res.status(400).json({ message: "Invalid user data" });
  }

  res.status(201).json({ message: `new user ${username} created` });
});

//update user
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(400).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  const saveUser = await user.save();
  if (saveUser) {
    res.status(200).json({ message: "user successfully updated" });
  } else {
    res.status(400).json({ message: "invalid user data" });
  }
});

//delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "user id is required" });

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: "user has assigned note" });
  }

  const user = await User.findById(id).exec();
  if (!user) return res.status(400).json({ message: "user not found" });

  const result = await user.deleteOne();

  const reply = `username ${result.username} with this id ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
