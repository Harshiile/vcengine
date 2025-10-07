import { Request, Response, NextFunction } from "express";

export class BaseController {
  protected async baseRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    action: () => Promise<any>
  ) {
    try {
      const result = await action();
      res.json({ success: true, result });
    } catch (err) {
      next(err);
    }
  }
}
