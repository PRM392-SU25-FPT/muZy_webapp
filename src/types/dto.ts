// Product DTOs - Updated to match API spec
export interface ProductDto {
  productID: number
  productName: string
  briefDescription?: string
  fullDescription?: string
  technicalSpecifications?: string
  price: number
  imageBase64?: string
  categoryID?: number
  categoryName?: string
}

export interface ProductListResponse {
  products: ProductDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface ProductFilterRequest {
  sortBy?: string
  sortOrder?: "asc" | "desc"
  category?: string
  minPrice?: number
  maxPrice?: number
  searchTerm?: string
  pageNumber: number
  pageSize: number
}

export interface ProductCreateRequest {
  productName: string
  briefDescription?: string
  fullDescription?: string
  technicalSpecifications?: string
  price: number
  imageBase64?: string
  categoryID?: number
}

export interface ProductUpdateRequest {
  productName: string
  briefDescription?: string
  fullDescription?: string
  technicalSpecifications?: string
  price: number
  imageBase64?: string
  categoryID?: number
}

// Category DTOs - Updated to match API spec
export interface CategoryDto {
  categoryID: number
  categoryName: string
  productCount: number
}

export interface CategoryDetailDto {
  categoryID: number
  categoryName: string
  productCount: number
  products: CategoryProductDto[]
}

export interface CategoryProductDto {
  productID: number
  productName: string
  briefDescription?: string
  price: number
  imageBase64?: string
}

export interface CategoryListResponse {
  categories: CategoryDto[]
  totalCount: number
}

export interface CategoryCreateRequest {
  categoryName: string
}

// Store Location DTOs - Updated to match API spec (LocationDTO)
export interface StoreLocationDto {
  locationID: number
  latitude: number
  longitude: number
  address: string
}

export interface StoreLocationCreateRequest {
  latitude: number
  longitude: number
  address: string
}

export interface StoreLocationUpdateRequest {
  locationID: number
  latitude: number
  longitude: number
  address: string
}

export interface StoreLocationListResponse {
  locations: StoreLocationDto[]
  totalCount: number
}

// Order DTOs - Updated to match API spec
export interface OrderCreateDTO {
  userId: number
  cartId: number
  orderDate: Date
  billingAddress: string
}

export interface OrderUpdateDTO {
  status: OrderStatus
}

export interface OrderResponseDTO {
  orderId: number
  userId?: number
  cartId?: number
  paymentMethod?: string
  orderDate: Date
  totalAmount: number
  billingAddress?: string
  orderDetails?: OrderDetailResponseDTO[]
  status: OrderStatus
}

// Order Detail DTOs - Updated to match API spec
export interface OrderDetailResponseDTO {
  productId: number
  quantity: number
  unitPrice: number
}

// Order Status - Updated to match API spec
export interface OrderStatus {
  orderStatusID: number
  status: OrderStatusEnum
  description?: string
  updatedAt: Date
}

export enum OrderStatusEnum {
  Pending = 1,
  Confirmed = 2,
  Shipped = 3,
  Delivered = 4,
}
