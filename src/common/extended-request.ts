import { Request } from 'express';

export interface CaslFilterContext {
  subject: string;
  filter: Record<string, any>;
  hasNoRestrictions: boolean;
}

export interface AuthenticatedRequest extends Request {
  caslFilter?: CaslFilterContext;
}
