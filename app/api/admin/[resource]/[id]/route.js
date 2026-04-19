import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, withAdminCookies } from "@/lib/admin/access";

export const runtime = "nodejs";

const RESOURCE_CONFIG = {
  users: { model: "user", idType: "int" },
  resumes: { model: "resume", idType: "int" },
  otp: { model: "otp", idType: "string" },
  ratings: { model: "rating", idType: "int" },
  jobs: { model: "job", idType: "string" },
  jobUsage: { model: "jobUsage", idType: "string" },
};

function getResourceConfig(resource) {
  return RESOURCE_CONFIG[resource] || null;
}

async function getRouteParams(context) {
  return (await context?.params) || {};
}

function parseId(id, idType) {
  const raw = decodeURIComponent(String(id || ""));
  if (idType === "int") {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed;
  }
  return raw;
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

export async function PUT(req, context) {
  try {
    const admin = await requireAdmin(req);
    if (admin.response) {
      return withAdminCookies(admin.response, admin.cookieHeaders);
    }

    const { resource, id: rawId } = await getRouteParams(context);
    const cfg = getResourceConfig(resource);
    if (!cfg) {
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Unsupported resource." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const id = parseId(rawId, cfg.idType);
    if (id === null || id === "") {
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Invalid id." }, { status: 400 }),
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

    const updated = await prisma[cfg.model].update({
      where: { id },
      data,
    });

    return withAdminCookies(NextResponse.json({ message: "Updated", item: updated }), admin.cookieHeaders);
  } catch (err) {
    return NextResponse.json(
      { error: "CRUD_UPDATE_FAILED", message: err?.message || "Failed to update record." },
      { status: 400 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    const admin = await requireAdmin(req);
    if (admin.response) {
      return withAdminCookies(admin.response, admin.cookieHeaders);
    }

    const { resource, id: rawId } = await getRouteParams(context);
    const cfg = getResourceConfig(resource);
    if (!cfg) {
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Unsupported resource." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const id = parseId(rawId, cfg.idType);
    if (id === null || id === "") {
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Invalid id." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const deleted = await prisma[cfg.model].delete({ where: { id } });

    return withAdminCookies(NextResponse.json({ message: "Deleted", item: deleted }), admin.cookieHeaders);
  } catch (err) {
    return NextResponse.json(
      { error: "CRUD_DELETE_FAILED", message: err?.message || "Failed to delete record." },
      { status: 400 }
    );
  }
}
