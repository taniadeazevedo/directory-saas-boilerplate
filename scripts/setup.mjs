#!/usr/bin/env node
// One-command bootstrap for buyers: copies .env.example -> .env.local if
// missing, then pushes the Prisma schema and seeds demo data.
//
// Run with: npm run setup

import { existsSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envExample = path.join(root, ".env.example");
const envLocal = path.join(root, ".env.local");

function run(command, args) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit", cwd: root, shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`\n❌ "${command} ${args.join(" ")}" failed. Fix the error above and re-run \`npm run setup\`.`);
    process.exit(result.status ?? 1);
  }
}

console.log("🚀 Setting up the Directory boilerplate...\n");

if (!existsSync(envLocal)) {
  if (!existsSync(envExample)) {
    console.error("❌ .env.example is missing — can't bootstrap .env.local.");
    process.exit(1);
  }
  copyFileSync(envExample, envLocal);
  console.log("✅ Created .env.local from .env.example — fill in DATABASE_URL and AUTH_SECRET before continuing.");
} else {
  console.log("ℹ️  .env.local already exists, leaving it untouched.");
}

run("npx", ["prisma", "db", "push"]);
run("npx", ["prisma", "db", "seed"]);

console.log(
  "\n✅ Setup complete!\n" +
    "   Run `npm run dev` and open http://localhost:3000\n" +
    "   Admin login: admin@example.com / admin1234\n" +
    "   Demo user:   demo@example.com / demo1234\n",
);
