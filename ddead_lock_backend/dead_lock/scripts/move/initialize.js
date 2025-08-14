require("dotenv").config();
const { spawnSync } = require("node:child_process");
const aptosSDK = require("@aptos-labs/ts-sdk");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set in .env`);
  return v;
}

async function main() {
  const moduleAddress = requireEnv("VITE_MODULE_ADDRESS");
  const privKey = requireEnv("VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY");
  const network = process.env.VITE_APP_NETWORK || "testnet";
  const nodeUrl = aptosSDK.NetworkToNodeAPI[network];

  const func = `${moduleAddress}::deadlock::initialize`;

  const args = [
    "aptos",
    "move",
    "run-entry-function",
    "--function",
    func,
    `--private-key=${privKey}`,
    "--assume-yes",
    `--url=${nodeUrl}`,
  ];

  const res = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}

main();


