export const environment = {
  production: false,
  /** Synced from .env — run `npm run sync-env` or restart `npm run dev` after edits */
  drodinApiKey: "drod_fca4ae78eb4152fbe219af265b43df1216f537571c38fb0a50e27ade1718cfb3",
  drodinAppId: "",
  /**
   * Real gateway (shown in UI). Browser cannot call this directly (CORS).
   * ng serve proxies /api → this host via proxy.conf.json
   */
  drodinGateway: "https://api.drodin.in",
  /**
   * SDK base URL: empty = same origin (http://127.0.0.1:5180) so /api is proxied.
   */
  drodinApiUrl: '',
};
