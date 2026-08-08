import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, withAdminCookies } from "@/lib/admin/access";
import { logApiError } from "@/lib/logger";

export const runtime = "nodejs";

const RESOURCE_CONFIG = {
  users: { model: "user", idType: "int" },
  resumes: { model: "resume", idType: "int" },
  otp: { model: "otp", idType: "string" },
  ratings: { model: "rating", idType: "int" },
  order: { model: "order", idType: "int" },
  jobs: { model: "job", idType: "string" },
  jobUsage: { model: "jobUsage", idType: "string" },
  featureUsage: { model: "featureUsage", idType: "string" },
  creditHistory: { model: "creditHistory", idType: "string" },
  coupons: { model: "coupon", idType: "int" },
  couponUsages: { model: "couponUsage", idType: "int" },
  tokens: { model: "token", idType: "string" },
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

function logAdminApiError(action, details = {}) {
  logApiError(`[ADMIN_API:${action}]`, details);
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
      logAdminApiError("UPDATE_UNSUPPORTED_RESOURCE", { resource, rawId });
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Unsupported resource." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const id = parseId(rawId, cfg.idType);
    if (id === null || id === "") {
      logAdminApiError("UPDATE_INVALID_ID", { resource, rawId, idType: cfg.idType });
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Invalid id." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const body = await req.json();
    const data = normalizePayload(body);

    if (!data) {
      logAdminApiError("UPDATE_INVALID_PAYLOAD", { resource, id });
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
    logAdminApiError("UPDATE_FAILED", {
      message: err?.message || "Unknown error",
      stack: err?.stack || null,
    });
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
      logAdminApiError("DELETE_UNSUPPORTED_RESOURCE", { resource, rawId });
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Unsupported resource." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const id = parseId(rawId, cfg.idType);
    if (id === null || id === "") {
      logAdminApiError("DELETE_INVALID_ID", { resource, rawId, idType: cfg.idType });
      return withAdminCookies(
        NextResponse.json({ error: "BAD_REQUEST", message: "Invalid id." }, { status: 400 }),
        admin.cookieHeaders
      );
    }

    const deleted = await prisma[cfg.model].delete({ where: { id } });

    return withAdminCookies(NextResponse.json({ message: "Deleted", item: deleted }), admin.cookieHeaders);
  } catch (err) {
    logAdminApiError("DELETE_FAILED", {
      message: err?.message || "Unknown error",
      stack: err?.stack || null,
    });
    return NextResponse.json(
      { error: "CRUD_DELETE_FAILED", message: err?.message || "Failed to delete record." },
      { status: 400 }
    );
  }
}
