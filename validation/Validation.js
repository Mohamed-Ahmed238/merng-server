const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')
const { AuthenticationError } = require('apollo-server')

module.exports.rgitserValidation = (
  username,
  password,
  confirmPassword,
  email
) => {
  const errors = {}
  if (username.trim() === '') {
    errors.username = 'Username is empty'
  }
  if (email.trim() === '') {
    errors.email = 'Email is empty'
  } else {
    const regEx = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
    if (!email.match(regEx)) {
      errors.email = "This email is't valid"
    }
  }
  if (password === '') {
    errors.password = 'Password is empty'
  } else if (password !== confirmPassword) {
    errors.password = "The two passwords doesn't match"
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  }
}

module.exports.loginValidation = (username, password) => {
  const errors = {}
  if (username.trim() === '') {
    errors.username = 'The username is empty'
  }
  if (password.trim() === '') {
    errors.password = 'The password is empty'
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  }
}

module.exports.authCheck = (req) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split('Bearer ')[1]
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY)
        return user
      } catch (err) {
        throw new AuthenticationError('Invalid/Expired token')
      }
    } else {
      throw new AuthenticationError('The token must be Bearer [token]')
    }
  } else {
    throw new AuthenticationError('Authorization header must be provided')
  }
}
