

 function postObjectFlattener(savedPost){
    return{
    _id: savedPost._id.toString(),
      userId: savedPost.author.userId.toString(),
      username: savedPost.author.username,
      profilePic: savedPost.author.profilePic,
      postType: savedPost.postType,
      title: savedPost.title,
      content: savedPost.content,
      tags: JSON.stringify(savedPost.tags),
      attachments: savedPost.attachments? JSON.stringify(savedPost.attachments) : "",
      codeSnippet: savedPost.codeSnippet
        ? JSON.stringify(savedPost.codeSnippet)
        : "",
      createdAt: savedPost.createdAt.toISOString(),
      updatedAt: savedPost.updatedAt.toISOString(),
}
}

module.exports = {postObjectFlattener};