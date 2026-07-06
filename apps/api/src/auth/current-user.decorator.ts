import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthedRequest, AuthUser } from "./supabase-auth.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    return context.switchToHttp().getRequest<AuthedRequest>().user;
  },
);
