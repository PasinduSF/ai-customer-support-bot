async function fetchWithRetry(
  url: string,
  options: any = {},
  retries = 2,
  backoff = 500
) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, backoff * (i + 1)));
    }
  }
}
