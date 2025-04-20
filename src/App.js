import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Stores from "./pages/Stores";
import CategoryPage from "./pages/CategoryPage";
import Account from "./pages/Account";
import SearchResults from "./pages/SearchResults";

import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/:tab" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
