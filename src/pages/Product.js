import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/css/Product.css";

function Product({ id, title }) {
  const itemsPerPage = 5;
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => console.error("❌ Lỗi lấy sản phẩm:", error));
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <section id={id} className="product-section">
      <div className="banner">
        <h2>{id.ProductName}</h2>
      </div>
      <div className="product-list">
        {products
          .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
          .map((product) => (
            <div
              className="product-card"
              key={product.ProductID}
              onClick={() => navigate(`/product/${product.ProductID}`)}
            >
              <div className="product-image">
                <img
                  src={
                    product.ImageURL
                      ? `http://localhost:5000/${product.ImageURL}`
                      : "/assets/img/default-product.jpg"
                  }
                  alt={product.ProductName || "Sản phẩm"}
                />

                <span className="product-label">
                  {product.Color || "Không có màu"}
                </span>
              </div>
              <h3>{product.ProductName || "Tên sản phẩm"}</h3>
              <p className="price">
                {product.Price !== undefined
                  ? `${product.Price.toLocaleString()} đ`
                  : "Chưa có giá"}
              </p>
              <p className="size">Size: {product.Size || "Không có size"}</p>
            </div>
          ))}
      </div>

      {/* Hiển thị phân trang nếu có nhiều hơn 1 trang */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }).map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(index)}
            ></span>
          ))}
        </div>
      )}

      {/* Nút Xem tất cả */}
      <div className="pagination view-all-container">
        <button className="view-all-btn" onClick={() => navigate("/products")}>
          Xem tất cả
        </button>
      </div>
    </section>
  );
} 

export default Product;
