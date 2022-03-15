const Post = require('../../models/Posts')

exports.Query = {
  getPosts: async () => {
    try {
      const posts = Post.find()
      return (await posts).reverse()
    } catch (error) {
      throw new Error(error)
    }
  },
  getPost: async (_, { postId }) => {
    try {
      const post = await Post.findById(postId)
      if (post) {
        return post
      } else {
        throw new Error('Post Not found')
      }
    } catch (err) {
      throw new Error(error)
    }
  },
}
