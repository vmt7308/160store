import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Verify from "./pages/Verify";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Stores from "./pages/Stores";
import CategoryPage from "./pages/CategoryPage";
import Account from "./pages/Account";
import SearchResults from "./pages/SearchResults";
import CheckoutSuccess from "./pages/CheckoutSuccess";

import Admin from "./pages/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/products"
          element={<Product id="1" title="Sản phẩm mới" />}
        />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/collections/:categoryId" element={<CategoryPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/:tab" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
