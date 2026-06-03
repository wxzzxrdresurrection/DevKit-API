-- CreateTable
CREATE TABLE "MockProject" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockEndpoint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "status" INTEGER NOT NULL DEFAULT 200,
    "response" JSONB NOT NULL,
    "delay" INTEGER NOT NULL DEFAULT 0,
    "headers" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "MockEndpoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MockEndpoint" ADD CONSTRAINT "MockEndpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MockProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
