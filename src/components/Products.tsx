"use client";
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import {
  type ProductFilterRequest,
  type ProductDto,
  type CategoryDto,
  type ProductCreateRequest,
  type ProductUpdateRequest,
  type CategoryCreateRequest,
} from "../types/dto";
import ProductModal from "./ProductModal";
import CategoryModal from "./CategoryModal";
import Pagination from "./Pagination";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { getImageDisplaySrc } from "../utils/ImageUtils";

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
  } = useProducts();

  const {
    categories,
    fetchCategories,
    createCategory,
    error: categoriesError,
  } = useCategories();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    ProductDto | undefined
  >();
  const [editingCategory, setEditingCategory] = useState<
    CategoryDto | undefined
  >();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const [filters, setFilters] = useState<ProductFilterRequest>({
    sortBy: "productName",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: 10,
  });

  const handleFilterChange = useCallback(
    (newFilters: Partial<ProductFilterRequest>) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        ...newFilters,
      }));
    },
    []
  );

  const handlePageChange = useCallback((newPageNumber: number) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      pageNumber: newPageNumber,
    }));
  }, []);

  const debouncedFetchProducts = useCallback(
    debounce((filters: ProductFilterRequest) => {
      if (isFetching) return;
      setIsFetching(true);
      fetchProducts(filters)
        .catch((error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi tải dữ liệu";
          setFetchError(errorMessage);
        })
        .finally(() => setIsFetching(false));
    }, 1000),
    [fetchProducts, isFetching]
  );

  const loadData = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      setFetchError(null);
      await Promise.all([
        debouncedFetchProducts(filters),
        fetchCategories().catch((error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi tải danh mục";
          setFetchError(errorMessage);
        }),
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải dữ liệu";
      setFetchError(errorMessage);
    } finally {
      setIsFetching(false);
    }
  }, [filters, debouncedFetchProducts, fetchCategories, isFetching]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRetry = useCallback(() => {
    setFetchError(null);
    loadData();
  }, [loadData]);

  const handleCreateProduct = useCallback(
    async (productData: ProductCreateRequest) => {
      try {
        await createProduct(productData);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo sản phẩm";
        alert(`Lỗi: ${errorMessage}`);
        console.error("Error creating product:", error);
      }
    },
    [createProduct]
  );

  const handleUpdateProduct = useCallback(
    async (productData: ProductUpdateRequest) => {
      try {
        if (editingProduct) {
          await updateProduct(editingProduct.productID, productData);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật sản phẩm";
        alert(`Lỗi: ${errorMessage}`);
        console.error("Error updating product:", error);
      }
    },
    [updateProduct, editingProduct]
  );

  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        try {
          await deleteProduct(productId);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi xóa sản phẩm";
          alert(`Lỗi: ${errorMessage}`);
          console.error("Error deleting product:", error);
        }
      }
    },
    [deleteProduct]
  );

  const handleCreateCategory = useCallback(
    async (categoryData: CategoryCreateRequest) => {
      try {
        await createCategory(categoryData);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo danh mục";
        alert(`Lỗi: ${errorMessage}`);
        console.error("Error creating category:", error);
      }
    },
    [createCategory]
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sản phẩm & Danh mục</h1>
        <p>Quản lý kho hàng nhạc cụ ({totalCount} sản phẩm)</p>
      </div>

      {(fetchError || error || categoriesError) && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">
              {fetchError || error || categoriesError}
            </span>
            <button className="error-retry-btn" onClick={handleRetry}>
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => {
            setEditingProduct(undefined);
            setIsProductModalOpen(true);
          }}
        >
          <span>➕</span>
          Thêm sản phẩm mới
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            setEditingCategory(undefined);
            setIsCategoryModalOpen(true);
          }}
        >
          <span>📁</span>
          Thêm danh mục
        </button>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.searchTerm || ""}
              onChange={(e) =>
                handleFilterChange({ searchTerm: e.target.value })
              }
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            value={filters.category || ""}
            onChange={(e) =>
              handleFilterChange({ category: e.target.value || undefined })
            }
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
              const [sortBy, sortOrder] = e.target.value.split("-");
              handleFilterChange({
                sortBy,
                sortOrder: sortOrder as "asc" | "desc",
              });
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
                handleFilterChange({
                  minPrice: e.target.value
                    ? Number.parseFloat(e.target.value)
                    : undefined,
                })
              }
              className="price-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Giá đến"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handleFilterChange({
                  maxPrice: e.target.value
                    ? Number.parseFloat(e.target.value)
                    : undefined,
                })
              }
              className="price-input"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading || isFetching ? (
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
                        src={
                          getImageDisplaySrc(
                            product.imageBase64,
                            product.imageName
                          ) || "/placeholder.svg"
                        }
                        alt={product.productName}
                        className="table-image"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="product-info">
                      <span className="product-name">
                        {product.productName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">
                      {product.categoryName}
                    </span>
                  </td>
                  <td>
                    <span className="description-text">
                      {product.briefDescription}
                    </span>
                  </td>
                  <td className="price">{formatPrice(product.price)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        title="Chỉnh sửa"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        title="Xóa"
                        onClick={() => handleDeleteProduct(product.productID)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !isFetching && products.length === 0 && (
          <div className="no-results">
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={filters.pageNumber}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <div className="categories-section">
        <h2>Danh mục sản phẩm</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.categoryID} className="category-card">
              <div className="category-info">
                <h3>{category.categoryName}</h3>
                <p>{category.productCount} sản phẩm</p>
              </div>
              <div className="category-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingCategory(category);
                    setIsCategoryModalOpen(true);
                  }}
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
        product={editingProduct}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleCreateCategory}
        category={editingCategory}
      />
    </div>
  );
};

export default Products;
