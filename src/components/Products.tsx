"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import type { ProductDto, ProductFilterRequest } from "../types/dto"
import ProductModal from "./ProductModal"
import Pagination from "./Pagination"
import { getImageDisplaySrc } from "../utils/imageUtils"
import { useProducts } from "../hooks/useProducts"
import { useCategories } from "../hooks/useCategories"

const Products: React.FC = () => {
  const {
    products,
    totalCount,
    totalPages,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts()

  const { categories, fetchCategories } = useCategories()

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductDto | undefined>()

  // Filter states
  const [filters, setFilters] = useState<ProductFilterRequest>({
    sortBy: "productName",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: 10,
  })

  // Memoize the filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => filters,
    [
      filters.sortBy,
      filters.sortOrder,
      filters.pageNumber,
      filters.pageSize,
      filters.searchTerm,
      filters.category,
      filters.minPrice,
      filters.maxPrice,
    ],
  )

  // Load data only once on component mount and when filters change
  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        await fetchProducts(memoizedFilters)
      } catch (error) {
        console.error("Error loading products:", error)
      }
    }

    if (isMounted) loadData()
    return () => {
      isMounted = false
    }
    // Remove fetchProducts from deps (call it directly)
  }, [memoizedFilters])


  useEffect(() => {
    let isMounted = true
    const loadCategories = async () => {
      try {
        await fetchCategories()
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
    if (isMounted) loadCategories()
    return () => { isMounted = false }
    // Don't add fetchCategories to deps
  }, [])  

  const handleFilterChange = useCallback((newFilters: Partial<ProductFilterRequest>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      pageNumber: newFilters.pageNumber || 1,
    }))
  }, [])

  const handlePageChange = useCallback((newPageNumber: number) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      pageNumber: newPageNumber,
    }))
  }, [])

  const handleCreateProduct = useCallback(
    async (productData: any) => {
      try {
        await createProduct(productData)
        // Refresh products after creation
        await fetchProducts(memoizedFilters)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo sản phẩm"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error creating product:", error)
      }
    },
    [createProduct, fetchProducts, memoizedFilters],
  )

  const handleUpdateProduct = useCallback(
    async (productData: any) => {
      try {
        if (editingProduct) {
          await updateProduct(editingProduct.productID, productData)
          // Refresh products after update
          await fetchProducts(memoizedFilters)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật sản phẩm"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error updating product:", error)
      }
    },
    [editingProduct, updateProduct, fetchProducts, memoizedFilters],
  )

  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        try {
          await deleteProduct(productId)
          // Refresh products after deletion
          await fetchProducts(memoizedFilters)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa sản phẩm"
          alert(`Lỗi: ${errorMessage}`)
          console.error("Error deleting product:", error)
        }
      }
    },
    [deleteProduct, fetchProducts, memoizedFilters],
  )

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }, [])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản lý Hàng hóa</h1>
        <p>Quản lý kho hàng nhạc cụ ({totalCount} sản phẩm)</p>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-retry-btn" onClick={() => fetchProducts(memoizedFilters)}>
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => {
            setEditingProduct(undefined)
            setIsProductModalOpen(true)
          }}
        >
          <span>➕</span>
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.searchTerm || ""}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            value={filters.category || ""}
            onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.categoryID} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-")
              handleFilterChange({ sortBy, sortOrder: sortOrder as "asc" | "desc" })
            }}
            className="filter-select"
          >
            <option value="productName-asc">Tên A-Z</option>
            <option value="productName-desc">Tên Z-A</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
          </select>
        </div>

        <div className="filters-row">
          <div className="price-filter">
            <input
              type="number"
              placeholder="Giá từ"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handleFilterChange({ minPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined })
              }
              className="price-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Giá đến"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handleFilterChange({ maxPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined })
              }
              className="price-input"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Mô tả ngắn</th>
                <th>Giá bán</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productID}>
                  <td>
                    <div className="product-image">
                      <img
                        src={getImageDisplaySrc(product.imageBase64, product.imageName) || "/placeholder.svg"}
                        alt={product.productName}
                        className="table-image"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="product-info">
                      <span className="product-name">{product.productName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.categoryName}</span>
                  </td>
                  <td>
                    <span className="description-text">{product.briefDescription}</span>
                  </td>
                  <td className="price">{formatPrice(product.price)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        title="Chỉnh sửa"
                        onClick={() => {
                          setEditingProduct(product)
                          setIsProductModalOpen(true)
                        }}
                      >
                        ✏️
                      </button>
                      <button className="btn-delete" title="Xóa" onClick={() => handleDeleteProduct(product.productID)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && products.length === 0 && (
          <div className="no-results">
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination currentPage={filters.pageNumber} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
        product={editingProduct}
        categories={categories}
      />
    </div>
  )
}

export default Products
