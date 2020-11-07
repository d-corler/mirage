import _ from "lodash";
import ora from "ora";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { promisify } from "util";
import rimraf from "rimraf";
import { promises } from "fs";
import lnk from "lnk";

import pkg from "../package.json";

// Constants
const MANIFEST_VERSION = 2;

// Path shortcuts
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = resolve(__dirname, "../");
const __dist = resolve(__root, "dist");

// Prettify name by capitalizing him
const capitalizedName = _.capitalize(pkg.name);

const spinner = ora();

// Manifest content
const manifestContent = {
  manifest_version: MANIFEST_VERSION,
  name: capitalizedName,
  description: pkg.description,
  version: pkg.version,
  homepage_url: pkg.homepage,
  browser_action: {
    default_title: capitalizedName,
    default_popup: "popup/index.html",
  },
  background: {
    scripts: ["background/index.js"],
  },
};

if (process.argv.includes("--develop")) {
  spinner.warn(
    "Generate development manifest with security issues, DO NOT USE in production !"
  );
  manifestContent.content_security_policy =
    "script-src 'self' http://localhost:35729; object-src 'self'";
}

// Delete dist folder (if exist)
await promisify(rimraf)(__dist);

// Create dist folder
await promises.mkdir(__dist);

spinner.succeed("Destination folder cleaned").start("Writing manifest...");

// Write manifest
await promises.writeFile(
  resolve(__dist, "manifest.json"),
  JSON.stringify(manifestContent),
  {
    encoding: "utf-8",
    flag: "w",
  }
);

spinner.succeed("Manifest written").start("Creating shortcuts...");

// Create shortcuts
await Promise.all([
  lnk([resolve(__root, "packages/popup/public")], __dist, {
    rename: "popup",
    force: true,
  }),
  lnk([resolve(__root, "packages/background/lib")], __dist, {
    rename: "background",
    force: true,
  }),
]);

spinner.succeed("Shortcuts created");
