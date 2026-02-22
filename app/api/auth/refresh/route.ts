import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log("Proxy refresh cookie:", refreshToken);

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401 }
    );
  }

  const backendRes = await fetch(
    "https://admin.devp2.iris26.variableq.com/auth/refresh/",
    {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    }
  );

  const data = await backendRes.json();
  console.log("Backend refresh status:", backendRes.status);
  console.log("Backend refresh body:", data);

  const response = NextResponse.json(data, {
    status: backendRes.status,
  });

  const setCookie = backendRes.headers.get("set-cookie");

  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}