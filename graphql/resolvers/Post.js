exports.Post = {
  likesCount: (parent) => parent.likes.length,
  commentsCount: (parent) => parent.comments.length,
}
