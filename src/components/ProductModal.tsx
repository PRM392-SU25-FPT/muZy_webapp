"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { ProductDto, ProductCreateRequest, ProductUpdateRequest, CategoryDto } from "../types/dto"
import { validateImageFile, getImageDisplaySrc, compressImage } from "../utils/ImageUtils"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: ProductCreateRequest | ProductUpdateRequest) => void
  product?: ProductDto
  categories: CategoryDto[]
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState<ProductCreateRequest>({
    productName: "",
    briefDescription: "",
    fullDescription: "",
    technicalSpecifications: "",
    price: 0,
    imageBase64: "",
    imageName: "",
    categoryID: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        briefDescription: product.briefDescription || "",
        fullDescription: product.fullDescription || "",
        technicalSpecifications: product.technicalSpecifications || "",
        price: product.price,
        imageBase64: product.imageBase64 || "",
        imageName: product.imageName || "",
        categoryID: product.categoryID,
      })
      setImagePreview(getImageDisplaySrc(product.imageBase64, product.imageName))
    } else {
      setFormData({
        productName: "",
        briefDescription: "",
        fullDescription: "",
        technicalSpecifications: "",
        price: 0,
        imageBase64: "",
        imageName: "",
        categoryID: undefined,
      })
      setImagePreview("")
    }
    setErrors({})
  }, [product, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.productName.trim()) {
      newErrors.productName = "Tên sản phẩm là bắt buộc"
    } else if (formData.productName.length > 100) {
      newErrors.productName = "Tên sản phẩm không được vượt quá 100 ký tự"
    }

    if (formData.briefDescription && formData.briefDescription.length > 255) {
      newErrors.briefDescription = "Mô tả ngắn không được vượt quá 255 ký tự"
    }

    if (formData.price <= 0) {
      newErrors.price = "Giá phải lớn hơn 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, image: validation.error! }))
      return
    }

    setIsUploadingImage(true)
    setErrors((prev) => ({ ...prev, image: "" }))

    try {
      // Compress image before converting to base64
      const compressedBase64 = await compressImage(file, 800, 0.8)

      setFormData((prev) => ({
        ...prev,
        imageBase64: compressedBase64,
        imageName: file.name,
      }))
      setImagePreview(compressedBase64)
    } catch (error) {
      console.error("Error processing image:", error)
      setErrors((prev) => ({ ...prev, image: "Lỗi khi xử lý hình ảnh" }))
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageBase64: "",
      imageName: "",
    }))
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? Number.parseFloat(value) || 0
          : name === "categoryID"
            ? value
              ? Number.parseInt(value)
              : undefined
            : value,
    }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="productName">Tên sản phẩm *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className={errors.productName ? "error" : ""}
                maxLength={100}
              />
              {errors.productName && <span className="error-text">{errors.productName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="categoryID">Danh mục</label>
              <select id="categoryID" name="categoryID" value={formData.categoryID || ""} onChange={handleChange}>
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.categoryID} value={category.categoryID}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Giá *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? "error" : ""}
                min="0"
                step="0.01"
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Hình ảnh sản phẩm</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="image-input"
                  disabled={isUploadingImage}
                />
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="preview-image" />
                      <div className="image-overlay">
                        <button
                          type="button"
                          className="btn-change-image"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? "⏳" : "📷"}
                        </button>
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={handleRemoveImage}
                          disabled={isUploadingImage}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="image-placeholder" onClick={() => fileInputRef.current?.click()}>
                      {isUploadingImage ? (
                        <div className="uploading">
                          <div className="spinner">⏳</div>
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon">📷</div>
                          <span>Nhấn để chọn hình ảnh</span>
                          <small>JPEG, PNG, GIF, WebP (tối đa 5MB)</small>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {formData.imageName && (
                  <div className="image-info">
                    <small>📎 {formData.imageName}</small>
                  </div>
                )}
              </div>
              {errors.image && <span className="error-text">{errors.image}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="briefDescription">Mô tả ngắn</label>
            <textarea
              id="briefDescription"
              name="briefDescription"
              value={formData.briefDescription}
              onChange={handleChange}
              className={errors.briefDescription ? "error" : ""}
              maxLength={255}
              rows={2}
            />
            {errors.briefDescription && <span className="error-text">{errors.briefDescription}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fullDescription">Mô tả đầy đủ</label>
            <textarea
              id="fullDescription"
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="technicalSpecifications">Thông số kỹ thuật</label>
            <textarea
              id="technicalSpecifications"
              name="technicalSpecifications"
              value={formData.technicalSpecifications}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isUploadingImage}>
              {product ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal
