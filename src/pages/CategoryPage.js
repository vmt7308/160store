import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/CategoryPage.css";
import product1 from "../assets/img/product1.jpg"; // Ảnh mặc định

function CategoryPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(0);
  const [categories, setCategories] = useState([]);

  // Move all hooks to the top level before any conditional returns
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const popupRef = useRef(null);

  const productsPerPage = 10; // Số sản phẩm trên mỗi trang

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Tải tất cả danh mục để đưa vào header
        const catRes = await axios.get(
          "http://localhost:5000/api/list-categories"
        );
        setCategories(catRes.data);

        // Tìm danh mục hiện tại theo ID từ URL
        const foundCategory = catRes.data.find(
          (cat) => getCategorySectionId(cat.CategoryName) === categoryId
        );

        if (foundCategory) {
          setCategory(foundCategory);

          // Tải sản phẩm của danh mục
          const productsRes = await axios.get(
            `http://localhost:5000/api/list-products?categoryId=${foundCategory.CategoryID}`
          );
          setProducts(productsRes.data);
        } else {
          console.error("Không tìm thấy danh mục với ID:", categoryId);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  // Move the useEffect for popup handling to top level
  useEffect(() => {
    if (showProductDetails) {
      document.body.classList.add("popup-open");

      // ESC key listener
      const handleEscKey = (e) => {
        if (e.key === "Escape") {
          closeProductDetails();
        }
      };

      document.addEventListener("keydown", handleEscKey);

      return () => {
        document.body.classList.remove("popup-open");
        document.removeEventListener("keydown", handleEscKey);
      };
    } else {
      document.body.classList.remove("popup-open");
    }
  }, [showProductDetails]);

  // Chuyển đổi tên danh mục thành ID cho URL
  const getCategorySectionId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]/g, "");
  };

  // Sắp xếp sản phẩm dựa trên tùy chọn
  const getSortedProducts = () => {
    if (!products) return [];

    const productsCopy = [...products];

    switch (sortOption) {
      case "price-asc":
        return productsCopy.sort(
          (a, b) => parseFloat(a.Price) - parseFloat(b.Price)
        );
      case "price-desc":
        return productsCopy.sort(
          (a, b) => parseFloat(b.Price) - parseFloat(a.Price)
        );
      case "name-asc":
        return productsCopy.sort((a, b) =>
          a.ProductName.localeCompare(b.ProductName)
        );
      case "name-desc":
        return productsCopy.sort((a, b) =>
          b.ProductName.localeCompare(a.ProductName)
        );
      case "oldest":
        return productsCopy.sort(
          (a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt)
        );
      case "newest":
        return productsCopy.sort(
          (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
        );
      default:
        return productsCopy;
    }
  };

  // Xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = product1; // Thay thế bằng ảnh mặc định
  };

  // Tính toán tổng số trang
  const sortedProducts = getSortedProducts();
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  // Lấy sản phẩm cho trang hiện tại
  const currentProducts = sortedProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  // Chuyển đến trang tiếp theo
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  // Chuyển đến trang trước
  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  // Chuyển đến trang cụ thể
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Add this function to handle quick view button click
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setSelectedColor(product.Color || "Xanh lá");
    setSelectedSize(product.Size || "S");
    setQuantity(1);
    setShowProductDetails(true);
  };

  // Hàm tăng số lượng
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Hàm giảm số lượng
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Add this function to close the popup
  const closeProductDetails = () => {
    setShowProductDetails(false);
  };

  // Tùy chọn sắp xếp
  const sortOptions = [
    { value: "default", label: "Mặc định" },
    { value: "price-asc", label: "Giá tăng dần" },
    { value: "price-desc", label: "Giá giảm dần" },
    { value: "name-asc", label: "Tên A-Z" },
    { value: "name-desc", label: "Tên Z-A" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "newest", label: "Mới nhất" },
  ];

  // Colors for product options
  const productColors = [
    { id: "color1", name: "Xanh lá", code: "#06D6A0" },
    { id: "color2", name: "Đỏ gạch", code: "#BC4749" },
    { id: "color3", name: "Xanh dương", code: "#1A759F" },
    { id: "color4", name: "Vàng nghệ", code: "#FCBF49" },
  ];

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!category) {
    return <div className="not-found">Không tìm thấy danh mục</div>;
  }

  return (
    <div>
      <Header categories={categories} />

      <div className="category-page-container">
        <div className="category-header">
          <h1 className="category-page-title">{category.CategoryName}</h1>

          <div className="sort-container">
            <label htmlFor="sort-select">Sắp xếp theo:</label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentProducts.length > 0 ? (
          <div className="category-products-grid">
            {currentProducts.map((product) => (
              <div key={product.ProductID} className="category-product-item">
                <div className="category-product-image-container">
                  <img
                    src={product.ImageURL || product1}
                    alt={product.ProductName}
                    className="category-product-image"
                    onError={handleImageError}
                  />
                  <button
                    className="category-quick-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickView(product);
                    }}
                  >
                    <span>🔍</span>
                  </button>
                </div>
                <div className="category-product-info">
                  <h3 className="category-product-name">
                    {product.ProductName}
                  </h3>
                  <p className="category-product-price">
                    {Number(product.Price).toLocaleString()}₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">
            Không có sản phẩm trong danh mục này
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="category-pagination">
            <button className="category-pagination-nav" onClick={prevPage}>
              &#10094;
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={`category-pagination-number ${
                  index === currentPage ? "active" : ""
                }`}
                onClick={() => goToPage(index)}
              >
                {index + 1}
              </button>
            ))}

            <button className="category-pagination-nav" onClick={nextPage}>
              &#10095;
            </button>
          </div>
        )}
      </div>

      {/* Product Details Popup */}
      {showProductDetails && selectedProduct && (
        <div className="product-details-overlay" onClick={closeProductDetails}>
          <div
            className="product-details-popup"
            ref={popupRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-popup" onClick={closeProductDetails}>
              ×
            </button>
            <div className="product-details-content">
              <div className="product-details-image">
                <img
                  src={selectedProduct.ImageURL || product1}
                  alt={selectedProduct.ProductName}
                  onError={handleImageError}
                />
              </div>
              <div className="product-details-info">
                <h2>{selectedProduct.ProductName}</h2>
                <p className="product-details-price">
                  {Number(selectedProduct.Price).toLocaleString()}₫
                </p>
                <p className="product-details-sku">
                  SKU:{" "}
                  {selectedProduct.SKU || `SEID${selectedProduct.ProductID}-01`}
                </p>

                <div className="product-details-options">
                  <div className="color-option">
                    <p>Màu sắc: {selectedColor}</p>
                    <div className="color-selector">
                      {productColors.map((color) => (
                        <div
                          key={color.id}
                          className={`color-circle ${
                            selectedColor === color.name ? "selected" : ""
                          }`}
                          style={{ backgroundColor: color.code }}
                          onClick={() => setSelectedColor(color.name)}
                        >
                          {selectedColor === color.name && (
                            <span className="checkmark">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="size-option">
                    <p>Kích thước: {selectedSize}</p>
                    <div className="size-selector">
                      {["S", "M", "L", "XL"].map((size) => (
                        <div
                          key={size}
                          className={`size-box ${
                            selectedSize === size ? "selected" : ""
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="quantity-selector">
                  <button
                    className="quantity-btn decrease"
                    onClick={decreaseQuantity}
                  >
                    −
                  </button>
                  <input type="text" value={quantity} readOnly />
                  <button
                    className="quantity-btn increase"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>

                <button className="add-to-cart-btn">Thêm vào giỏ</button>

                <div className="product-details-description">
                  <p>
                    {selectedProduct.Descriptions ||
                      "Sản phẩm thời trang cao cấp, thiết kế hiện đại với chất liệu vải cao cấp, form dáng thoải mái. Phù hợp cho nhiều dịp khác nhau."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default CategoryPage;
