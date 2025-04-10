import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Stores.css";
import storesData from "../data/stores.json";
import storeBannerBG from "../assets/img/store-banner-bg.jpg";

function Stores() {
  const [stores, setStores] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 6;

  // Hàm kiểm tra xem thời gian hiện tại có nằm trong giờ làm việc của cửa hàng hay không (8:30 - 22:00)
  const checkStoreStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;
    const openingTimeInMinutes = 8 * 60 + 30; // 8:30
    const closingTimeInMinutes = 22 * 60; // 22:00

    return (
      currentTimeInMinutes >= openingTimeInMinutes &&
      currentTimeInMinutes <= closingTimeInMinutes
    );
  };

  // Tải dữ liệu lưu trữ và cập nhật trạng thái dựa trên thời gian hiện tại
  useEffect(() => {
    const isOpen = checkStoreStatus();
    const updatedStores = storesData.map((store) => ({
      ...store,
      status: isOpen ? "open" : "closed",
    }));
    setStores(updatedStores);
    setFilteredStores(updatedStores);

    const uniqueProvinces = [
      ...new Set(updatedStores.map((store) => store.province)),
    ];
    setProvinces(uniqueProvinces);
  }, []);

  // Cập nhật quận khi tỉnh thay đổi
  useEffect(() => {
    if (selectedProvince) {
      const storesInProvince = stores.filter(
        (store) => store.province === selectedProvince
      );
      const uniqueDistricts = [
        ...new Set(storesInProvince.map((store) => store.district)),
      ];
      setDistricts(uniqueDistricts);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("");
  }, [selectedProvince, stores]);

  // Lọc các cửa hàng dựa trên lựa chọn
  useEffect(() => {
    let filtered = [...stores];

    if (selectedProvince) {
      filtered = filtered.filter(
        (store) => store.province === selectedProvince
      );
    }

    if (selectedDistrict) {
      filtered = filtered.filter(
        (store) => store.district === selectedDistrict
      );
    }

    setFilteredStores(filtered);
    setCurrentPage(1);
  }, [selectedProvince, selectedDistrict, stores]);

  // Logic phân trang
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(
    indexOfFirstStore,
    indexOfLastStore
  );
  const totalPages = Math.ceil(filteredStores.length / storesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm xử lý chuyển hướng Google Maps với tên địa điểm và tọa độ
  const handleMapClick = (store) => {
    const { placeName, coordinates } = store;
    const { lat, lng } = coordinates;
    const encodedPlaceName = encodeURIComponent(placeName);
    const url = `https://www.google.com/maps/place/${encodedPlaceName}/@${lat},${lng},17z`;
    window.open(url, "_blank");
  };

  return (
    <div className="stores-page">
      <Header />

      {/* Breadcrumb */}
      <div className="store-filters">
        <h2>
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>{" "}
          / Địa chỉ cửa hàng
        </h2>

        {/* Banner */}
        <div className="stores-banner">
          <img src={storeBannerBG} alt="Banner" />
        </div>

        {/* Filter Dropdowns */}
        <div className="filter-dropdown">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province, index) => (
              <option key={index} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-dropdown">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedProvince}
          >
            <option value="">Chọn Quận/huyện</option>
            {districts.map((district, index) => (
              <option key={index} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="store-listings">
        {filteredStores.length > 0 ? (
          <>
            <div className="store-grid">
              {currentStores.map((store) => (
                <div key={store.id} className="store-card">
                  <div className="store-image">
                    <img src={store.image} alt={store.name} />
                    {store.isNew && <span className="new-badge">New</span>}
                  </div>
                  <div className="store-info">
                    <h3>{store.name}</h3>
                    <p className="store-address">
                      <i className="fa-solid fa-location-dot"></i>{" "}
                      {store.address}
                    </p>
                    <div className="store-details">
                      <div className="store-hours">
                        <i className="fa-regular fa-clock"></i> {store.hours}
                      </div>
                      <div className="store-phone">
                        <i className="fa-solid fa-phone"></i> {store.phone}
                      </div>
                    </div>
                    <div className="store-status">
                      <span className={`status-indicator ${store.status}`}>
                        {store.status === "open" ? "Đang mở" : "Đã đóng"}
                      </span>
                      <button
                        className="view-map-btn"
                        onClick={() => handleMapClick(store)}
                      >
                        <i className="fa-solid fa-arrow-right"></i> Xem bản đồ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? "active" : ""}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="no-stores">
            <p>Không tìm thấy cửa hàng phù hợp với bộ lọc.</p>
            <button
              onClick={() => {
                setSelectedProvince("");
                setSelectedDistrict("");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Stores;
