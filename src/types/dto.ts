// Product DTOs
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

// Category DTOs
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
  imageURL?: string
}

export interface CategoryListResponse {
  categories: CategoryDto[]
  totalCount: number
}

export interface CategoryCreateRequest {
  categoryName: string
}

// Order DTOs
export interface OrderCreateDTO {
  userId: number
  orderDate: Date
  totalAmount: number
  status: string
}

export interface OrderUpdateDTO {
  totalAmount: number
  status: string
}

export interface OrderResponseDTO {
  orderId: number
  userId?: number
  orderDate: Date
  totalAmount: number
  status: string
  orderDetails?: OrderDetailResponseDTO[]
  customerName?: string
}

// Order Detail DTOs
export interface OrderDetailCreateDTO {
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
}

export interface OrderDetailUpdateDTO {
  quantity: number
  unitPrice: number
}

export interface OrderDetailResponseDTO {
  orderDetailId: number
  orderId: number
  productId: number
  productName?: string
  quantity: number
  unitPrice: number
}
