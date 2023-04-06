import fs from "node:fs/promises";
import { chromium, firefox, webkit } from 'playwright';

const PROTOCOL = "http";
const VERBOSE = true;

const breaches = await getBreaches();
const domains = await getDomains(breaches);

const stats = {
  breaches: breaches.length,
  domains: domains.length,
  results: [],
};

const browser = await firefox.launch();
let page;

let idx = 0;
for (const domain of domains/*.slice(0, 15)*/) {
  VERBOSE && console.info(`[${idx++}/${domains.length}] Fetching ${domain}`);
  try {
    page = await browser.newPage();
    const res = await page.goto(`${PROTOCOL}://${domain}`, { timeout: 10_000 });
    stats.results.push({
      domain,
      url: res.url(),
      ok: res.ok(),
      status: res.status(),
      statusText: res.statusText(),
    });
  } catch (err) {
    stats.results.push({
      domain,
      error: err.message,
    });
  }
  await page.close();
  // Log as we go since this takes for-ev-er... (or roughly 36m41.012s)
  await fs.writeFile(`stats-${PROTOCOL}.json`, JSON.stringify(stats, null, 2));
}

await browser.close();

async function getBreaches() {
  const breaches = await fetch("https://haveibeenpwned.com/api/v3/breaches");
  return breaches.json();
}

async function getDomains(breaches=[]) {
  if (!breaches.length) {
    breaches = await getBreaches();
  }
  let domains = breaches.reduce((set, breach) => set.add(breach.Domain), new Set());
  domains.delete("");
  return Array.from(domains).sort();
}
