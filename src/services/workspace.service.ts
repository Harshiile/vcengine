// POST   /workspaces   —   Create workspace
// GET   /workspace/{id}   —   Get workspace details
// PUT   /workspace/{id}   —   Update workspace details
// PUT   /workspace/{id}   —   Update the workspace
// DELETE   /workspace/{id}   —   Delete the workspace
// POST   /workspace/branch/{id}   —   Create a branch on workspace
// GET   /workspace/branches/{id}   —   Get all branches of workspace
// POST   /workspace/permission/{id}/{user}   —   Set the permission for user
// GET   /workspace/permission/{id}   —   Get all permissions of workspace

// POST   /workspace/invite/{id}   —   Invite Collaborator

export class WorkspaceService {
  async createWorkspace() {}
  async getWorkspace(id: string) {}
  async updateWorkspace(id: string) {}
  async deleteWorkspace(id: string) {}
  async addPermission() {}
  async getPermissions(id: string) {}
  async createBranch(id: string) {}
  async getBranches(id: string) {}
}
