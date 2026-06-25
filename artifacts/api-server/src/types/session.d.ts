declare module "express" {
  interface Request {
    session: import("cookie-session").CookieSessionObject | null;
  }
}
