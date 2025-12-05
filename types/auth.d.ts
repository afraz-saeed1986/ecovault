declare module "auth" {
  import type { NextRequest, NextResponse } from "next/server";
  import type { AuthConfig } from "@auth/core";

  export function Auth(config: AuthConfig): {
    handlers: {
      GET(req: NextRequest): Promise<NextResponse>;
      POST(req: NextRequest): Promise<NextResponse>;
    };
    signIn: (provider?: string, options?: any) => Promise<any>;
    signOut: (options?: any) => Promise<any>;
    auth: () => Promise<any>;
  };
}
