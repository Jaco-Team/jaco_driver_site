import { NextRequest, NextResponse } from "next/server";

type Environment = "production" | "development" | "other";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);

  const currentEnv = process.env.NODE_ENV as Environment;
  //const isHttps = headers.get("x-forwarded-proto")?.split(",")[0] === "https";


  const isHttps = headers.get("protocol") === "https:";
  const isLocalhost = request.headers.get("host")?.includes("localhost");

  if (currentEnv === "production" && !isHttps && !isLocalhost) {
    let pathname = '';

    if( headers.get("pathname") && headers.get("pathname").length > 0 ){
      pathname = '/' + request.headers.get("pathname");
    }

    const newUrl = new URL(`http://${headers.get("host")}${pathname}` || "");
    newUrl.protocol = "https:";
    return NextResponse.redirect(newUrl.href, 301);
  }
}