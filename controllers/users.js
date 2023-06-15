const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getUser = async (req, res) => {
  const {
    params: { email: userEmail },
  } = req;

  const user = await User.findOne({
    email: userEmail,
  });
  if (!user) {
    throw new NotFoundError(`No user with email ${userEmail}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const deleteUser = async (req, res) => {
  const {
    params: { email: userEmail },
  } = req;

  const user = await User.findOneAndRemove({
    email: userEmail,
  });
  if (!user) {
    throw new NotFoundError(`No user with email ${userEmail}`);
  }
  res.status(StatusCodes.OK).send();
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
