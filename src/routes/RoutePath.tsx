export const RoutePath = {
  // Auth routes
  LOGIN: "/login",

  // Protected routes
  DASHBOARD: "/",
  PRODUCTS: "/products",
  ORDERS: "/orders",

  // Fallback
  NOT_FOUND: "*",
} as const

export type RoutePathType = (typeof RoutePath)[keyof typeof RoutePath]
