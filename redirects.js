import domains from "./stats-https.json" assert { type: "json" };

for (const res of domains.results) {
  if (res.url) {
    const hostname = new URL(res.url).hostname;
    if (!hostname.endsWith(res.domain.toLowerCase())) {
      console.log(`REDIRECTED: ${res.domain} => ${res.url}`);
    }
  }
}
