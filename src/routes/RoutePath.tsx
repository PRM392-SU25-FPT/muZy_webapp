export const RoutePath = {
  // Auth routes
  LOGIN: "/login",

  // Protected routes
  DASHBOARD: "/",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  STORE_LOCATIONS: "/store-locations",
  ORDERS: "/orders",

  // Fallback
  NOT_FOUND: "*",
} as const

export type RoutePathType = (typeof RoutePath)[keyof typeof RoutePath]
