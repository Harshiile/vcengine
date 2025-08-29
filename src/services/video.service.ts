// POST   /video/upload   —   Uploads the video
// GET   /video/stream/{id}   —   Stream the video
// GET   /video/download/{id}   —   Download the video
// POST   /video/version/{id}   —   Create new version of video
// GET   /video/versions/{id}   —   Get all versions of video
// POST   /video/review/comment/{id}   —   Reviewer can comment the video
// GET   /video/review/comment/{id}   —   List the comments on video given by reviewer

// POST   /video/upload-on/{provider}/{id}   —   Upload on third-party streaming platform

export class VideoService {
  async uploadVideo() {}
  async streamVideo() {}
  async downloadVideo() {}
  async createVersion() {}
  async getVersions() {}
  async addComment() {}
  async getComments() {}
}
