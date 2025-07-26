// Product DTOs - Updated to match API spec
export interface ProductDto {
  productID: number
  productName: string
  briefDescription?: string
  fullDescription?: string
  technicalSpecifications?: string
  price: number
  imageBase64?: string
  imageName?: string
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
  imageName?: string
  categoryID?: number
}

export interface ProductUpdateRequest {
  productName: string
  briefDescription?: string
  fullDescription?: string
  technicalSpecifications?: string
  price: number
  imageBase64?: string
  imageName?: string
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

// Order DTOs - Updated to match new API spec
export interface OrderResponseDTO {
  orderId: number
  userId?: number
  cartId?: number
  paymentMethod: string
  orderDate: Date
  totalAmount: number
  billingAddress: string
  orderDetails?: OrderDetailResponseDTO[]
  paymentLink?: string
  currentStatus?: OrderStatusEnum
  currentStatusDescription?: string
  customerName?: string
}

export interface OrderCreateDTO {
  userId: number
  cartId: number
  orderDate: Date
  billingAddress: string
}

export interface OrderUpdateDTO {
  status: OrderStatusEnum
  description?: string
}

// Order Detail DTOs - Updated to match API spec
export interface OrderDetailResponseDTO {
  productId: number
  quantity: number
  unitPrice: number
  productName?: string
}

// Order Status DTOs - New based on your API
export interface OrderStatusResponseDto {
  orderStatusID: number
  orderID: number
  status: OrderStatusEnum
  description: string
  updatedAt: Date
}

export interface CreateOrderStatusRequestDto {
  orderID: number
  status: OrderStatusEnum
  description: string
}

export interface UpdateOrderStatusRequestDto {
  status: OrderStatusEnum
  description: string
}

// Order Status Enum - Updated to match your enum
export enum OrderStatusEnum {
  Pending = 1,
  Confirmed = 2,
  Delivering = 3,
  Delivered = 4,
}

// Helper function to get status label
export const getOrderStatusLabel = (status: OrderStatusEnum): string => {
  const statusLabels = {
    [OrderStatusEnum.Pending]: "Chờ xử lý",
    [OrderStatusEnum.Confirmed]: "Đã xác nhận",
    [OrderStatusEnum.Delivering]: "Đang giao hàng",
    [OrderStatusEnum.Delivered]: "Đã giao hàng",
  }
  return statusLabels[status] || "Không xác định"
}

// Helper function to get status color class
export const getOrderStatusClass = (status: OrderStatusEnum): string => {
  const statusClasses = {
    [OrderStatusEnum.Pending]: "status-pending",
    [OrderStatusEnum.Confirmed]: "status-confirmed",
    [OrderStatusEnum.Delivering]: "status-delivering",
    [OrderStatusEnum.Delivered]: "status-delivered",
  }
  return statusClasses[status] || "status-unknown"
}
export interface OrderListResponse {
  items: OrderResponseDTO[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface PagedResultDTO<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}
export interface OrderResponseDTO {
  orderId: number
  userId?: number
  cartId?: number
  paymentMethod: string
  orderDate: string | Date
  totalAmount: number
  billingAddress: string
  orderDetails?: OrderDetailResponseDTO[]
  paymentLink?: string
  currentStatus?: OrderStatusEnum
  currentStatusDescription?: string
  customerName?: string
}

export interface OrderDetailResponseDTO {
  productId: number
  productName?: string
  quantity: number
  unitPrice: number
}

export interface OrderCreateDTO {
  userId: number
  cartId: number
  orderDate: Date
  billingAddress: string
}

export interface OrderUpdateDTO {
  status: OrderStatusEnum
  description?: string
}

// Order List Response - Update to match your C# API structure
export interface OrderListResponse {
  items: OrderResponseDTO[] // or it might be "orders" instead of "items"
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// Update the CreateOrderStatusRequestDto to match C# API
export interface CreateOrderStatusRequestDto {
  orderID: number // Match C# property name (capital O and I)
  status: OrderStatusEnum
  description: string
}

export interface UpdateOrderStatusRequestDto {
  Status: OrderStatusEnum // Changed from status to Status
  Description: string // Changed from description to Description
}

