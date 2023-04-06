import _groupBy from "lodash.groupby";
// import stats from "./stats-https.json" assert { type: "json" };

const PROTOCOL = process.env.PROTOCOL || "https";

const { default: stats } = await import(`./stats-${PROTOCOL}.json`, { assert: { type: "json" }});

const domainMap = await breachesByDomain();

function getBreachDatesByDomain(domain) {
  const breachDates = domainMap.get(domain).map(breach => new Intl.DateTimeFormat('en').format(new Date(breach.BreachDate)));
  const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  return formatter.format(breachDates);
}

const { true: success, false: errors } = _groupBy(stats.results, (r) => !("error" in r));

groupByStatus(success);
groupByErrors(errors);

function groupByStatus(results = []) {
  const domainsByStatus = _groupBy(results, "status");
  console.log(`\n\n# ${PROTOCOL.toUpperCase()} SUCCESS(ish) (${results.length})`);
  for (const [code, domains] of Object.entries(domainsByStatus)) {
    console.log("<details>");
    console.log(`<summary>${code} (${domains.length})</summary>\n`);
    for (const res of domains) {
      console.log(`  - [${res.status}/${res.statusText}] ${res.domain} -- ${res.url} (${getBreachDatesByDomain(res.domain)})`);
    }
    console.log("</details>");
  }
}

function groupByErrors(results=[]) {
  const hasErrors = results.map(res => {
    res.error = res.error.split("\n").at(0).trim();
    return res;
  });
  const errorsByCode = _groupBy(hasErrors, "error");
  console.log(`\n\n# ${PROTOCOL.toUpperCase()} ERRORS (${results.length})`);
  for (const [code, domains] of Object.entries(errorsByCode)) {
    console.log("<details>");
    console.log(`<summary>${code.replace(/^page.goto:/, "").trim()} (${domains.length})</summary>\n`);
    for (const { domain } of domains) {
      console.log(`  - ${domain} (${getBreachDatesByDomain(domain)})`);
    }
    console.log("</details>")
  }
}

async function getBreaches() {
  const breaches = await fetch("https://haveibeenpwned.com/api/v3/breaches");
  return breaches.json();
}

async function breachesByDomain() {
  const breaches = await getBreaches();
  return breaches.reduce((map, breach) => {
    const key = breach.Domain;
    if (key) {
      const arr = map.get(key) || [];
      map.set(key, arr.concat(breach));
    }
    return map;
  }, new Map());
}
