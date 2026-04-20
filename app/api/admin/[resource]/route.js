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

const RESOURCE_SEARCH_CONFIG = {
  users: {
    strings: ["username", "email"],
    numbers: ["id", "creds", "jobsInDb", "totalJobsSearched"],
    booleans: ["unlimited"],
  },
  resumes: {
    numbers: ["id", "userId"],
  },
  otp: {
    strings: ["id", "email", "code"],
  },
  ratings: {
    strings: ["comment", "template"],
    numbers: ["id", "userId", "score"],
  },
  jobs: {
    strings: [
      "id",
      "searchId",
      "jobTitle",
      "companyName",
      "jobDescription",
      "experienceRequired",
      "location",
      "salary",
      "jobLink",
      "postedDate",
      "source",
      "fitLabel",
      "reasoning",
      "aiSummary",
      "whyItMatches",
      "tier",
    ],
    numbers: ["userId", "matchScore"],
    stringArrays: ["skillsRequired", "missingSkills", "strengths", "resumeImprovements"],
  },
  jobUsage: {
    strings: ["id", "date", "tier"],
    numbers: ["userId", "searchCount", "jobsFetched", "credits", "creditsUsed"],
  },
};

function getResourceConfig(resource) {
  return RESOURCE_CONFIG[resource] || null;
}

async function getRouteParams(context) {
  return (await context?.params) || {};
}

function buildSearchWhere(resource, rawQuery) {
  const query = String(rawQuery || "").trim();
  if (!query) return undefined;

  const cfg = RESOURCE_SEARCH_CONFIG[resource];
  if (!cfg) return undefined;

  const filters = [];
  const numericQuery = Number(query);
  const hasNumericQuery = Number.isFinite(numericQuery);
  const lowerQuery = query.toLowerCase();
  const hasBooleanQuery = lowerQuery === "true" || lowerQuery === "false";

  for (const field of cfg.strings || []) {
    filters.push({
      [field]: {
        contains: query,
        mode: "insensitive",
      },
    });
  }

  if (hasNumericQuery) {
    for (const field of cfg.numbers || []) {
      filters.push({ [field]: numericQuery });
    }
  }

  if (hasBooleanQuery) {
    for (const field of cfg.booleans || []) {
      filters.push({ [field]: lowerQuery === "true" });
    }
  }

  for (const field of cfg.stringArrays || []) {
    filters.push({ [field]: { has: query } });
  }

  return filters.length ? { OR: filters } : undefined;
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
    const takeRaw = Number.parseInt(searchParams.get("take") || "50", 10);
    const offsetRaw = Number.parseInt(searchParams.get("offset") || "0", 10);
    const query = searchParams.get("q") || "";
    const take = Number.isFinite(takeRaw) ? Math.min(200, Math.max(1, takeRaw)) : 50;
    const offset = Number.isFinite(offsetRaw) ? Math.max(0, offsetRaw) : 0;
    const where = buildSearchWhere(resource, query);

    const model = prisma[cfg.model];
    const [items, total] = await Promise.all([
      model.findMany({
        where,
        take,
        skip: offset,
        orderBy: cfg.orderBy,
      }),
      model.count({ where }),
    ]);

    const nextOffset = offset + items.length;
    const hasMore = nextOffset < total;

    return withAdminCookies(
      NextResponse.json({
        resource,
        total,
        count: items.length,
        offset,
        take,
        query: String(query).trim(),
        nextOffset,
        hasMore,
        items,
      }),
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
