import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiRes = await fetch(
      "https://admin.devp2.iris26.variableq.com/auth/login/",
      {
        method: "POST",
        body: new URLSearchParams(body),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    
    const setCookie = apiRes.headers.get("set-cookie");

    if (!apiRes.ok) {
      return NextResponse.json({ message: "Login failed" }, { status: 400 });
    }
     
    const response = NextResponse.json({ success: true });
// console.log(setCookie);

    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
