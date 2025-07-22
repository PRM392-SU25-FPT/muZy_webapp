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

// Pagination types
export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// Product API Response types
export interface ProductsApiResponse {
  products: import("../types/dto").ProductDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface ProductApiResponse {
  product: import("../types/dto").ProductDto
}

// Category API Response types
export interface CategoriesApiResponse {
  categories: import("../types/dto").CategoryDto[]
  totalCount: number
}

export interface CategoryApiResponse {
  category: import("../types/dto").CategoryDto
}

// Cart API Response types
export interface CartApiResponse {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  imageBase64?: string
  total: number
}

// Order API Response types
export interface OrdersApiResponse {
  orders: import("../types/dto").OrderResponseDTO[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface OrderApiResponse {
  order: import("../types/dto").OrderResponseDTO
}

// Auth API Response types
export interface AuthApiResponse {
  user: User
  token: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
}

// Price range response
export interface PriceRangeApiResponse {
  minPrice: number
  maxPrice: number
}

// Generic success response
export interface SuccessResponse {
  message: string
  success: boolean
}

// Error response type
export interface ApiError {
  message: string
  status?: number
  code?: string
}
