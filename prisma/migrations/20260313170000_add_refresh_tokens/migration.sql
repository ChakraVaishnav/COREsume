-- Add refresh-token persistence fields for rotating sessions
ALTER TABLE "User"
ADD COLUMN "refreshTokenHash" TEXT,
ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);
