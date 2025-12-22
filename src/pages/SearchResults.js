import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate
import axios from "axios";
import gsap from "gsap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/SearchResults.css";
import product1 from "../assets/img/product1.jpg"; // Ảnh mặc định

function SearchResults() {
  const [searchResults, setSearchResults] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const productsPerPage = 10; // Số sản phẩm trên mỗi trang

  // State cho popup chi tiết sản phẩm
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("S"); // Size mặc định là S
  const [quantity, setQuantity] = useState(1);
  const popupRef = useRef(null);

  // Colors for product options (giống CategoryPage.js)
  const productColors = [
    { id: "color1", name: "Xanh lá", code: "#06D6A0" },
    { id: "color2", name: "Đỏ gạch", code: "#BC4749" },
    { id: "color3", name: "Xanh dương", code: "#1A759F" },
    { id: "color4", name: "Vàng nghệ", code: "#FCBF49" },
  ];

  // Extract the keyword from the URL
  const query = new URLSearchParams(location.search);
  const keyword = query.get("keyword") || "";

  // Fetch categories and search results
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tải danh mục để hiển thị trong header
        const catRes = await axios.get(
          "http://localhost:5000/api/list-categories"
        );
        setCategories(catRes.data);

        // Tải kết quả tìm kiếm
        if (keyword) {
          const params = new URLSearchParams();
          params.append("keyword", keyword);
          const response = await axios.get(
            `http://localhost:5000/api/products/search?${params.toString()}`
          );
          setSearchResults(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword]);

  // Handle popup open/close
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

  // Handle click outside popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closeProductDetails();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sort products
  const getSortedProducts = () => {
    const productsCopy = [...searchResults];

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

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = product1;
  };

  // Pagination
  const sortedProducts = getSortedProducts();
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const currentProducts = sortedProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  // Hàm xử lý khi nhấp vào sản phẩm để chuyển đến trang chi tiết ProductDetail.js
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setSelectedColor(productColors[0].name); // Màu mặc định đầu tiên
    setSelectedSize("S"); // Size mặc định
    setQuantity(1);
    setShowProductDetails(true);
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Close popup
  const closeProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
  };

  // Sort options
  const sortOptions = [
    { value: "default", label: "Mặc định" },
    { value: "price-asc", label: "Giá tăng dần" },
    { value: "price-desc", label: "Giá giảm dần" },
    { value: "name-asc", label: "Tên A-Z" },
    { value: "name-desc", label: "Tên Z-A" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "newest", label: "Mới nhất" },
  ];

  // Format price
  const formatPrice = (price) => {
    return Number(price).toLocaleString() + "₫";
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, color, size, quantity) => {
    // Create a temporary image element for animation
    const productImage = document.createElement("img");
    productImage.src = product.ImageURL ? `/${product.ImageURL}` : product1;
    productImage.style.position = "fixed"; // Use fixed positioning for better control
    productImage.style.width = "50px";
    productImage.style.height = "50px";
    productImage.style.zIndex = "1000";
    productImage.style.pointerEvents = "none"; // Prevent interaction with the image
    document.body.appendChild(productImage);

    // Get the position of the "Add to Cart" button and cart icon
    const addButton = document.querySelector(".add-to-cart-btn");
    const cartIcon = document.querySelector(".cart-button .fa-cart-shopping");

    if (!addButton || !cartIcon) {
      console.error("Add button or cart icon not found!");
      document.body.removeChild(productImage);
      return;
    }

    const addButtonRect = addButton.getBoundingClientRect();
    const cartIconRect = cartIcon.getBoundingClientRect();

    // Set initial position using fixed positioning
    productImage.style.left = `${
      addButtonRect.left + addButtonRect.width / 2 - 25
    }px`;
    productImage.style.top = `${
      addButtonRect.top + addButtonRect.height / 2 - 25
    }px`;

    // GSAP animation
    gsap.to(productImage, {
      x: cartIconRect.left - addButtonRect.left + cartIconRect.width / 2 - 25,
      y: cartIconRect.top - addButtonRect.top + cartIconRect.height / 2 - 200,
      scale: 0.3,
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(productImage);
        closeProductDetails(); // Close popup after animation
      },
    });

    // Update cart in localStorage
    const cartItem = {
      id: `${product.ProductID}-${color}-${size}`,
      productId: product.ProductID,
      image: product.ImageURL ? `/${product.ImageURL}` : product1,
      name: product.ProductName,
      color,
      size,
      quantity,
      price: product.Price,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = existingCart.findIndex(
      (item) => item.id === cartItem.id
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    // Dispatch custom event to notify Header of cart update
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div>
      <Header categories={categories} />

      <div className="category-page-container">
        <div className="category-header">
          <h1 className="category-page-title">
            Kết quả tìm kiếm cho "{keyword}"
          </h1>

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
              <div
                key={product.ProductID}
                className="category-product-item"
                onClick={() => handleProductClick(product.ProductID)}
                style={{ cursor: "pointer" }}
              >
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
                    {formatPrice(product.Price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products">Không tìm thấy sản phẩm phù hợp!</div>
        )}

        {/* Pagination */}
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
                  {formatPrice(selectedProduct.Price)}
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

                <button
                  className="add-to-cart-btn"
                  onClick={() =>
                    addToCart(
                      selectedProduct,
                      selectedColor,
                      selectedSize,
                      quantity
                    )
                  }
                >
                  Thêm vào giỏ
                </button>

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

export default SearchResults;
