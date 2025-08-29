// POST   /issue/{id}   —   Create an issue on workspace
// GET   /issues/{id}   —   List all issues of workspace
// POST   /workspace/fork/{id}   —   Fork the workspace
// POST   /pull-request/{id}   —   Create a pull request on workspace
// GET   /pull-requests/{id}   —   List all pull requests of workspace

// POST   /pull-request/merge/{id}   —   Merge the pull request
// POST   /pull-request/reject/{id}   —   Reject the pull request

export class CollaborateService {
  async forkWorkspace(id: string) {}
  async createIssue(id: string) {}
  async getIssues(id: string) {}
  async openPullRequest(id: string) {}
  async getPullRequests(id: string) {}
}
