import _groupBy from "lodash.groupby";
import stats from "./stats-https.json" assert { type: "json" };

const { true: success, false: errors } = _groupBy(stats.results, (r) => !("error" in r));

groupByStatus(success);
groupByErrors(errors);

function groupByStatus(results = {}) {
  const domainsByStatus = _groupBy(results, "status");
  console.log("\n\n# SUCCESS(ish)");
  for (const [code, domains] of Object.entries(domainsByStatus)) {
    console.log(code);
    for (const res of domains) {
      console.log(`  - [${res.status}/${res.statusText}] ${res.domain} -- ${res.url}`);
    }
  }
}

function groupByErrors(results={}) {
  const hasErrors = results.map(res => {
    res.error = res.error.split("\n").at(0).trim();
    return res;
  });
  const errorsByCode = _groupBy(hasErrors, "error");
  console.log("\n\n# ERRORS");
  for (const [code, domains] of Object.entries(errorsByCode)) {
    console.log(`- ${code.replace(/^page.goto:/, "").trim()}`);
    for (const { domain } of domains) {
      console.log(`  - ${domain}`);
    }
  }
}
