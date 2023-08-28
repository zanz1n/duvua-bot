CREATE TYPE "welcometype" AS ENUM ('MESSAGE', 'IMAGE', 'EMBED');

CREATE TABLE "guilds" (
    "id" BIGINT PRIMARY KEY,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prefix" VARCHAR(4) NOT NULL DEFAULT '-',
    "strictMusic" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "welcome" (
    "id" BIGINT PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "channelId" BIGINT,
    "message" VARCHAR(255) NOT NULL DEFAULT 'Seja Bem Vind@ ao servidor {{USER}}',
    "type" "welcometype" NOT NULL DEFAULT 'MESSAGE'
);

ALTER TABLE "welcome"
ADD CONSTRAINT "welcome_id_fkey" FOREIGN KEY ("id") REFERENCES "guilds"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
