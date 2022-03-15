const { SECRET_KEY } = require('../../config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/Users')
const Post = require('../../models/Posts')
const { UserInputError, AuthenticationError } = require('apollo-server')
const {
  rgitserValidation,
  loginValidation,
  authCheck,
} = require('../../validation/Validation')

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  )
}

exports.Mutation = {
  register: async (
    _,
    { registerInput: { username, password, confirmPassword, email } }
  ) => {
    const { errors, valid } = rgitserValidation(
      username,
      password,
      confirmPassword,
      email
    )

    if (!valid) {
      throw new UserInputError('There is an error exist', { errors })
    }

    password = await bcrypt.hash(password, 12)

    const user = await User.findOne({ username })
    if (user) {
      throw new UserInputError('This username is already exist', {
        errors: {
          username: 'This username is already token',
        },
      })
    }

    const newUser = new User({
      username,
      password,
      email,
      createdAt: new Date().toISOString(),
    })

    const res = await newUser.save()

    const token = generateToken(res)

    return { ...res._doc, id: res._id, token }
  },
  login: async (_, { username, password }) => {
    const { errors, valid } = loginValidation(username, password)

    if (!valid) {
      throw new UserInputError('There is an error exists', { errors })
    }

    const user = await User.findOne({ username })
    if (!user) {
      errors.username = 'Wrong credintials'
      throw new UserInputError('Wrong credintials', { errors })
    }

    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
      throw new UserInputError('Wrong credintials', {
        errors: {
          password: 'Wrong credintials',
        },
      })
    }

    const token = generateToken(user)

    return {
      ...user._doc,
      id: user._id,
      token,
    }
  },
  createPost: async (_, { body }, { req }) => {
    const user = authCheck(req)

    if (body.trim() === '') {
      throw new UserInputError('Empty body')
    }
    const newPost = new Post({
      body,
      username: user.username,
      createdAt: new Date().toISOString(),
      user: user.id,
    })

    const post = await newPost.save()

    return post
  },
  deletePost: async (_, { postId }, { req }) => {
    const user = authCheck(req)

    try {
      const post = await Post.findById(postId)
      if (post.username === user.username) {
        await post.delete()
        return 'The post is deleted'
      } else {
        throw new Error("You aren't allawed to delete this message")
      }
    } catch (err) {
      throw new Error('there is an error' + err)
    }
  },
  createComment: async (_, { postId, body }, { req }) => {
    const { username } = authCheck(req)

    if (body.trim() === '') {
      throw new UserInputError('Empty Comment', {
        errors: {
          body: "The comment mustn't be empty",
        },
      })
    }

    const post = await Post.findById(postId)

    if (post) {
      post.comments.unshift({
        body,
        username,
        createdAt: new Date().toISOString(),
      })

      await post.save()
      return post
    } else throw UserInputError('Post not found')
  },
  deleteComment: async (_, { postId, commentId }, { req }) => {
    const { username } = authCheck(req)

    const post = await Post.findById(postId)

    if (post) {
      const commentIndex = post.comments.findIndex(
        (comment) => comment.id === commentId
      )

      if (post.comments[commentIndex].username === username) {
        post.comments.splice(commentIndex, 1)
        post.save()
        return post
      } else throw new AuthenticationError('Not Allowed to delete this comment')
    } else throw new UserInputError("this post isn't exist")
  },
  likePost: async (_, { postId }, { req }) => {
    const { username } = authCheck(req)
    const post = await Post.findById(postId)

    if (post) {
      if (post.likes.find((like) => like.username === username)) {
        //like is exist and need to remove it
        post.likes = post.likes.filter((like) => like.username !== username)
      } else {
        //like isn't exist and we want to add it
        post.likes.push({
          username,
          createdAt: new Date().toISOString(),
        })
      }
      await post.save()
      return post
    } else throw new AuthenticationError('post not found')
  },
}
