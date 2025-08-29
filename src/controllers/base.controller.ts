import { Request, Response, NextFunction } from "express";
export class BaseController {
  protected async baseRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    action: () => Promise<void>
  ) {
    try {
      const result = await action();
      res.json(result);
    } catch (error) {
      throw new Error("Catch In Base Request");
    }
  }
}
