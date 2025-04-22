import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import product1 from "../assets/img/product1.jpg";
import "../assets/css/ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("Xanh lá");
  const [selectedSize, setSelectedSize] = useState("S");
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 5;

  // Color options
  const productColors = [
    { id: "color1", name: "Xanh lá", code: "#06D6A0" },
    { id: "color2", name: "Đỏ gạch", code: "#BC4749" },
    { id: "color3", name: "Xanh dương", code: "#1A759F" },
    { id: "color4", name: "Vàng nghệ", code: "#FCBF49" },
  ];

  // Fetch product and related products
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRes = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        const productData = productRes.data;
        setProduct(productData);

        // Fetch related products
        const relatedRes = await axios.get(
          `http://localhost:5000/api/list-products?categoryId=${productData.CategoryID}`
        );
        // Exclude the current product from related products
        const filteredRelated = relatedRes.data.filter(
          (p) => p.ProductID !== parseInt(id)
        );
        setRelatedProducts(filteredRelated);
      } catch (error) {
        console.error("Lỗi tải dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = product1;
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

  // Add to cart
  const addToCart = (product, color, size, quantity) => {
    const productImage = document.createElement("img");
    productImage.src = product.ImageURL ? `/${product.ImageURL}` : product1;
    productImage.style.position = "fixed";
    productImage.style.width = "50px";
    productImage.style.height = "50px";
    productImage.style.zIndex = "1000";
    productImage.style.pointerEvents = "none";
    document.body.appendChild(productImage);

    const addButton = document.querySelector(".add-to-cart-btn");
    const cartIcon = document.querySelector(".cart-button .fa-cart-shopping");

    if (!addButton || !cartIcon) {
      console.error("Add button or cart icon not found!");
      document.body.removeChild(productImage);
      return;
    }

    const addButtonRect = addButton.getBoundingClientRect();
    const cartIconRect = cartIcon.getBoundingClientRect();

    productImage.style.left = `${
      addButtonRect.left + addButtonRect.width / 2 - 25
    }px`;
    productImage.style.top = `${
      addButtonRect.top + addButtonRect.height / 2 - 25
    }px`;

    gsap.to(productImage, {
      x: cartIconRect.left - addButtonRect.left + cartIconRect.width / 2 - 25,
      y: cartIconRect.top - addButtonRect.top + cartIconRect.height / 2 - 25,
      scale: 0.3,
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(productImage);
      },
    });

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
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Pagination for related products
  const totalPages = Math.ceil(relatedProducts.length / productsPerPage);
  const startIndex = currentPage * productsPerPage;
  const displayedRelatedProducts = relatedProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle product click for related products
  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Sản phẩm không tồn tại!</div>;
  }

  return (
    <div className="product-detail-page">
      <Header />
      <main className="product-detail-container">
        <div className="product-details-content">
          <div className="product-details-image">
            <img
              src={product.ImageURL ? `/${product.ImageURL}` : product1}
              alt={product.ProductName}
              onError={handleImageError}
            />
          </div>
          <div className="product-details-info">
            <h2>Tên sản phẩm: {product.ProductName}</h2>
            <p className="product-details-price">
              Giá tiền: {Number(product.Price).toLocaleString()}₫
            </p>
            <p className="product-details-sku">
              Mã sản phẩm - SKU: {product.SKU || `SEID${product.ProductID}-01`}
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
              <p>Số lượng:</p>
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
                addToCart(product, selectedColor, selectedSize, quantity)
              }
            >
              Thêm vào giỏ
            </button>
            <div className="product-details-description">
              <p>
                Mô tả sản phẩm:{" "}
                {product.Descriptions ||
                  "Sản phẩm thời trang cao cấp, thiết kế hiện đại với chất liệu vải cao cấp, form dáng thoải mái. Phù hợp cho nhiều dịp khác nhau."}
              </p>
            </div>
          </div>
        </div>
        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-products-title">Sản Phẩm Liên Quan</h2>
            <div className="related-products-grid">
              {displayedRelatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.ProductID}
                  className="related-product-item"
                  onClick={() =>
                    handleRelatedProductClick(relatedProduct.ProductID)
                  }
                >
                  <div className="related-product-image-container">
                    <img
                      src={
                        relatedProduct.ImageURL
                          ? `/${relatedProduct.ImageURL}`
                          : product1
                      }
                      alt={relatedProduct.ProductName}
                      className="related-product-image"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="related-product-info">
                    <h3 className="related-product-name">
                      {relatedProduct.ProductName}
                    </h3>
                    <p className="related-product-price">
                      {Number(relatedProduct.Price).toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {relatedProducts.length > productsPerPage && (
              <div className="related-products-pagination">
                <span className="pagination-nav prev-page" onClick={prevPage}>
                  &#10094;
                </span>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentPage ? "active" : ""}`}
                    onClick={() => goToPage(index)}
                  ></span>
                ))}
                <span className="pagination-nav next-page" onClick={nextPage}>
                  &#10095;
                </span>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ProductDetail;
