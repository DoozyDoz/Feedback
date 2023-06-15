const SignupRequest = require('../models/SignupRequest')
const User = require('../models/User')

const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getAllRequests = async (req, res) => {
  const requests = await SignupRequest.find().sort('createdAt')
  res.status(StatusCodes.OK).json({ requests, count: requests.length })
}

const getRequest = async (req, res) => {
  const {
    user: { userId },
    params: { id: requestId },
  } = req

  const request = await SignupRequest.findOne({
    _id: requestId,
    sentBy: userId,
  })
  if (!request) {
    throw new NotFoundError(`No signup request with id ${requestId}`)
  }
  res.status(StatusCodes.OK).json({ request })
}

const createRequest = async (req, res) => {
  req.body.sentBy = req.user.userId
  const request = await SignupRequest.create(req.body)
  res.status(StatusCodes.CREATED).json({ request })
}


const preRegister = async (req, res) => {
  const user = await User.create({ ...req.body })
  const signupRequest = await SignupRequest.create({ sentBy: user })
  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'signup request sent to admin for approval' })
}

const updateRequest = async (req, res) => {
  const {
    body: { approved, sentBy },

    user: { userId },
    params: { id: requestId },
  } = req

  if (approved === '') {
    throw new BadRequestError('Approval status fields cannot be empty')
  }


  if (approved == 'approved') {
    const user = await User.findOne({
      _id: sentBy,
    }).updateOne({ approved: true })
    if (!user) {
      throw new NotFoundError(`No user with id ${sentBy}`)
    }
  } else if (approved === 'declined') {
    const user = await User.findOne({
      _id: sentBy,
    }).updateOne({ approved: false })
    if (!user) {
      throw new NotFoundError(`No user with id ${sentBy}`)
    }
  }

  const request = await SignupRequest.findByIdAndUpdate(
    { _id: requestId, sentBy: userId },
    req.body,
    { new: true, runValidators: true }
  )

  if (!request) {
    throw new NotFoundError(`No request with id ${requestId}`)
  }
  res.status(StatusCodes.OK).json({ request })
}

const deleteRequest = async (req, res) => {
  const {
    user: { userId },
    params: { id: requestId },
  } = req

  const request = await SignupRequest.findByIdAndRemove({
    _id: requestId,
    sentBy: userId,
  })
  if (!request) {
    throw new NotFoundError(`No request with id ${requestId}`)
  }
  res.status(StatusCodes.OK).send()
}

module.exports = {
  createRequest,
  deleteRequest,
  getAllRequests,
  updateRequest,
  getRequest,
}
