"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { CategoryDto } from "../types/dto"
import CategoryModal from "./CategoryModal"
import { useCategories } from "../hooks/useCategories"

const Categories: React.FC = () => {
  const { categories, totalCount, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory } =
    useCategories()

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | undefined>()

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

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

  const handleCreateCategory = useCallback(
    async (categoryData: any) => {
      try {
        await createCategory(categoryData)
        // Refresh categories after creation
        await fetchCategories()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo danh mục"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error creating category:", error)
      }
    },
    [createCategory, fetchCategories],
  )

  const handleUpdateCategory = useCallback(
    async (categoryData: any) => {
      try {
        if (editingCategory) {
          await updateCategory(editingCategory.categoryID, categoryData)
          // Refresh categories after update
          await fetchCategories()
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật danh mục"
        alert(`Lỗi: ${errorMessage}`)
        console.error("Error updating category:", error)
      }
    },
    [editingCategory, updateCategory, fetchCategories],
  )

  const handleDeleteCategory = useCallback(
    async (categoryId: number) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm trong danh mục sẽ bị ảnh hưởng.")) {
        try {
          await deleteCategory(categoryId)
          // Refresh categories after deletion
          await fetchCategories()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa danh mục"
          alert(`Lỗi: ${errorMessage}`)
          console.error("Error deleting category:", error)
        }
      }
    },
    [deleteCategory, fetchCategories],
  )

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản lý Danh mục</h1>
        <p>Quản lý danh mục sản phẩm ({totalCount} danh mục)</p>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-retry-btn" onClick={() => fetchCategories()}>
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="page-actions">
        <button
          className="btn-primary"
          onClick={() => {
            setEditingCategory(undefined)
            setIsCategoryModalOpen(true)
          }}
        >
          <span>➕</span>
          Thêm danh mục mới
        </button>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      {/* Categories Table */}
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
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Số lượng sản phẩm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.categoryID}>
                  <td>
                    <span className="category-id">#{category.categoryID}</span>
                  </td>
                  <td>
                    <div className="category-info">
                      <span className="category-name">{category.categoryName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="product-count">{category.productCount} sản phẩm</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        title="Chỉnh sửa"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsCategoryModalOpen(true)
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        title="Xóa"
                        onClick={() => handleDeleteCategory(category.categoryID)}
                        disabled={category.productCount > 0}
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

        {!loading && filteredCategories.length === 0 && (
          <div className="no-results">
            <p>{searchTerm ? `Không tìm thấy danh mục nào với từ khóa "${searchTerm}"` : "Chưa có danh mục nào"}</p>
          </div>
        )}
      </div>

      {/* Categories Grid View (Alternative) */}
      <div className="categories-section">
        <h2>Danh sách danh mục</h2>
        <div className="categories-grid">
          {filteredCategories.map((category) => (
            <div key={category.categoryID} className="category-card">
              <div className="category-info">
                <h3>{category.categoryName}</h3>
                <p>{category.productCount} sản phẩm</p>
              </div>
              <div className="category-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingCategory(category)
                    setIsCategoryModalOpen(true)
                  }}
                  title="Chỉnh sửa"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteCategory(category.categoryID)}
                  disabled={category.productCount > 0}
                  title={category.productCount > 0 ? "Không thể xóa danh mục có sản phẩm" : "Xóa danh mục"}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
        category={editingCategory}
      />
    </div>
  )
}

export default Categories
