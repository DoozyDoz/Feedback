const User = require('../models/User');
const Token = require('../models/Token');

const SignupRequest = require('../models/SignupRequest');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const crypto = require('crypto');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils');

// required object like
// {
//     "name":"sempala3",
//     "email":"sempala3@gmail.com",
//     "password":"12345678"
// }
const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  // const origin = 'https://server.cirrocloudug.com/Admin';
  const origin = 'http://localhost:3000';

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify account',
  });
};

// required object like
// {
//     "email":"sempala2@gmail.com",
//     "verificationToken":"e6ba699b8c4e8becae52b5fa0274ad25e653eeab915b0395aa9a4dd47f1fec0c41cf74f4d4e18943"
// }
const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};

const preRegister = async (req, res) => {
  const user = await User.create({ ...req.body });
  const signupRequest = await SignupRequest.create({ sentBy: user });
  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'signup request sent to admin for approval' });
};

// required object like
// {
//     "name":"sempala3",
//     "email":"sempala@gmail.com",
//     "password":"123456789"
// }
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log(1);
    throw new BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email });
  if (!user) {
    console.log(email, 2);
    throw new UnauthenticatedError('Invalid Credentials_email');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    console.log(3);
    throw new UnauthenticatedError('Invalid Credentials_pass');
  }

  if (!user.isVerified) {
    console.log(4);
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }

  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = '';
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({
    res,
    user: tokenUser,
    refreshToken,
  });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

module.exports = {
  register,
  login,
  preRegister,
  verifyEmail,
};
