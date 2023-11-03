export class Server {
  name: string;
  searchUrl: string;
  constructor(opts: { name: string; searchUrl: string }) {
    this.name = opts.name;
    this.searchUrl = opts.searchUrl;
  }

  async doRequest() {
    const latencyStart = performance.now();
    const request = await fetch(this.searchUrl, {
      keepalive: true,
      headers: {
        "User-Agent": window.navigator.userAgent,
      },
      method: "GET",
      cache: "no-cache",
      mode: "cors",
    });
    if (!request.ok) return 0;
    return performance.now() - latencyStart;
  }
}
