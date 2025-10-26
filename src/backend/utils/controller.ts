import { Request, Response } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export const handle = async (req: Request, res: Response, func: Function) => {
  try {
    const result = validationResult(req).formatWith(({ msg }: ValidationError) => msg);

    if (!result.isEmpty()){
      return res.status(400).json({ errors: result.mapped() });
    }

    return await func();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default {
  handle,
};