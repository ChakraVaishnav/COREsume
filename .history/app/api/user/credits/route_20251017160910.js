import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verify(token, process.env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { creds: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ credits: user.creds });
}
