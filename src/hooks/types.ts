// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: unknown
}

// Auth API Response types based on OpenAPI spec
export interface AuthApiResponse {
  success: boolean
  message?: string
  token?: string
  user: User
}

export interface User {
  userID: number
  username: string
  email: string
  phoneNumber?: string
  address?: string
  role: string
}

// Product API Response types
export interface ProductsApiResponse {
  products: import("../types/dto").ProductDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface ProductApiResponse extends import("../types/dto").ProductDto {}

// Category API Response types
export interface CategoriesApiResponse {
  categories: import("../types/dto").CategoryDto[]
  totalCount: number
}

export interface CategoryApiResponse extends import("../types/dto").CategoryDto {}

// Store Location API Response types
export interface StoreLocationsApiResponse extends Array<import("../types/dto").StoreLocationDto> {}

export interface StoreLocationApiResponse extends import("../types/dto").StoreLocationDto {}

// Cart API Response types based on OpenAPI spec
export interface CartApiResponse {
  cartID: number
  userID?: number
  totalPrice: number
  status: string
  cartItems: CartItem[]
  totalItems: number
}

export interface CartItem {
  cartItemID: number
  cartID?: number
  productID?: number
  productName?: string
  productImageURL?: string
  quantity: number
  price: number
  totalPrice: number
}

// Order API Response types based on OpenAPI spec
export interface OrdersApiResponse {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  items: import("../types/dto").OrderResponseDTO[]
}

export interface OrderApiResponse extends import("../types/dto").OrderResponseDTO {}

// Generic success response
export interface SuccessResponse {
  success: boolean
  message?: string
}

// Error response type
export interface ApiError {
  message: string
  status?: number
  code?: string
}
