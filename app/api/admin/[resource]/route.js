import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, withAdminCookies } from "@/lib/admin/access";

export const runtime = "nodejs";

const RESOURCE_CONFIG = {
  users: { model: "user", idType: "int", orderBy: { id: "desc" } },
  resumes: { model: "resume", idType: "int", orderBy: { updatedAt: "desc" } },
  otp: { model: "otp", idType: "string", orderBy: { createdAt: "desc" } },
  ratings: { model: "rating", idType: "int", orderBy: { createdAt: "desc" } },
  jobs: { model: "job", idType: "string", orderBy: { createdAt: "desc" } },
  jobUsage: { model: "jobUsage", idType: "string", orderBy: { updatedAt: "desc" } },
};

function getResourceConfig(resource) {
  return RESOURCE_CONFIG[resource] || null;
}

async function getRouteParams(context) {
  return (await context?.params) || {};
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const data = payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  const safeData = { ...data };
  delete safeData.id;
  return safeData;
}

export async function GET(req, context) {
  try {
    const admin = await requireAdmin(req);
    if (admin.response) {
      return withAdminCookies(admin.response, admin.cookieHeaders);
    }

    const { resource } = await getRouteParams(context);
    const cfg = getResourceConfig(resource);
    if (!cfg) {
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Unsupported resource." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const { searchParams } = new URL(req.url);
    const takeRaw = Number.parseInt(searchParams.get("take") || "100", 10);
    const take = Number.isFinite(takeRaw) ? Math.min(500, Math.max(1, takeRaw)) : 100;

    const model = prisma[cfg.model];
    const [items, total] = await Promise.all([
      model.findMany({ take, orderBy: cfg.orderBy }),
      model.count(),
    ]);

    return withAdminCookies(
      NextResponse.json({ resource, total, count: items.length, items }),
      admin.cookieHeaders
    );
  } catch (err) {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function POST(req, context) {
  try {
    const admin = await requireAdmin(req);
    if (admin.response) {
      return withAdminCookies(admin.response, admin.cookieHeaders);
    }

    const { resource } = await getRouteParams(context);
    const cfg = getResourceConfig(resource);
    if (!cfg) {
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Unsupported resource." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const body = await req.json();
    const data = normalizePayload(body);

    if (!data) {
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Invalid payload." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const created = await prisma[cfg.model].create({ data });

    return withAdminCookies(
      NextResponse.json({ message: "Created", item: created }, { status: 201 }),
      admin.cookieHeaders
    );
  } catch (err) {
    return NextResponse.json(
      { error: "CRUD_CREATE_FAILED", message: err?.message || "Failed to create record." },
      { status: 400 }
    );
  }
}
