import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    cookieHeader = req.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const token = cookies.token;
    if(!token){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }   
    const payload = verify(token, process.env.JWT_SECRET); 

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {username: true, email: true},
    }); 
    if(!user){
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
