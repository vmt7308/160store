import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/Stores.css";
import axios from "axios";

function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch store data
  useEffect(() => {
    const fetchStores = async () => {
      try {
        // In a real app, this would be an API call
        const response = await axios.get("http://localhost:5000/api/stores");
        setStores(response.data);
        setFilteredStores(response.data);

        // Extract unique provinces from store data
        const uniqueProvinces = [
          ...new Set(
            response.data.map((store) => {
              const addressParts = store.Address.split(", ");
              return addressParts[addressParts.length - 1];
            })
          ),
        ];
        setProvinces(uniqueProvinces);
      } catch (error) {
        console.error("Error fetching store data:", error);
        // Use sample data for demonstration
        const sampleData = [
          {
            id: 1,
            name: "160STORE ĐÀ NẴNG - LÊ DUẨN",
            address: "332 Đ. Lê Duẩn, Tân Chính, Thanh Khê, Đà Nẵng, Vietnam",
            phone: "0287 100 6789",
            hours: "8:30 - 22:00",
            province: "Đà Nẵng",
            district: "Thanh Khê",
            status: "open",
            isNew: true,
            image: "https://placehold.co/300x200/333/FFF?text=160STORE+DA+NANG",
          },
          {
            id: 2,
            name: "160STORE ĐẮK LẮK - BUÔN MA THUỘT",
            address:
              "14 Phan Chu Trinh, Thắng Lợi, Buôn Ma Thuột, Đắk Lắk, Vietnam",
            phone: "0287 100 6789",
            hours: "8:30 - 22:00",
            province: "Đắk Lắk",
            district: "Buôn Ma Thuột",
            status: "open",
            isNew: false,
            image: "https://placehold.co/300x200/333/FFF?text=160STORE+DAK+LAK",
          },
          {
            id: 3,
            name: "160STORE LONG AN - TÂN AN",
            address: "290 Đ. Hùng Vương, Phường 3, Tân An, Long An",
            phone: "0287 100 6789",
            hours: "8:30 - 22:00",
            province: "Long An",
            district: "Tân An",
            status: "open",
            isNew: false,
            image: "https://placehold.co/300x200/333/FFF?text=160STORE+LONG+AN",
          },
        ];
        setStores(sampleData);
        setFilteredStores(sampleData);

        // Extract unique provinces
        const uniqueProvinces = [
          ...new Set(sampleData.map((store) => store.province)),
        ];
        setProvinces(uniqueProvinces);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Update districts when province changes
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

  // Filter stores based on selections
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedProvince, selectedDistrict, stores]);

  return (
    <div className="stores-page">
      <Header />

      {/* Banner */}
      <div className="stores-banner">
        <div className="banner-content"></div>
      </div>

      {/* Store Benefits */}
      <div className="store-benefits">
        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fa-solid fa-box-check"></i>
          </div>
          <div className="benefit-text">
            <h3>ĐỔI TRẢ TRONG 15 NGÀY</h3>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fa-solid fa-shield-check"></i>
          </div>
          <div className="benefit-text">
            <h3>BẢO HÀNH TRONG 30 NGÀY</h3>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fa-solid fa-copyright"></i>
          </div>
          <div className="benefit-text">
            <h3>PHÂN PHỐI ĐỘC QUYỀN</h3>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fa-solid fa-headset"></i>
          </div>
          <div className="benefit-text">
            <h3>HOTLINE - 028 7100 6789</h3>
          </div>
        </div>
      </div>

      {/* Store Filters */}
      <div className="store-filters">
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

      {/* Store Listings */}
      <div className="store-listings">
        {loading ? (
          <div className="loading">Đang tải danh sách cửa hàng...</div>
        ) : filteredStores.length > 0 ? (
          <div className="store-grid">
            {filteredStores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-image">
                  <img src={store.image} alt={store.name} />
                  {store.isNew && <span className="new-badge">New</span>}
                </div>
                <div className="store-info">
                  <h3>{store.name}</h3>
                  <p className="store-address">
                    <i className="fa-solid fa-location-dot"></i> {store.address}
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
                    <button className="view-map-btn">
                      <i className="fa-solid fa-map-location-dot"></i> Xem bản
                      đồ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
