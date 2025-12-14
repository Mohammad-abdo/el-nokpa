import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import HomePageOne from "./pages/HomePageOne";
import HomePageTwo from "./pages/HomePageTwo";
import HomePageThree from "./pages/HomePageThree";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPageOne from "./pages/ProductDetailsPageOne";
import ProductDetailsPageTwo from "./pages/ProductDetailsPageTwo";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import ContactPage from "./pages/ContactPage";
import PhosphorIconInit from "./helper/PhosphorIconInit";
import VendorPage from "./pages/VendorPage";
import VendorDetailsPage from "./pages/VendorDetailsPage";
import VendorTwoPage from "./pages/VendorTwoPage";
import VendorTwoDetailsPage from "./pages/VendorTwoDetailsPage";
import BecomeSellerPage from "./pages/BecomeSellerPage";
import WishlistPage from "./pages/WishlistPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import Cookies from "universal-cookie";
function App() {
  const cookies = new Cookies();
  const token = cookies.get("token");

  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <PhosphorIconInit />

      <Routes>
        <Route
          exact
          path="/login"
          element={token ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          exact
          path="/register"
          element={token ? <Navigate to="/" replace /> : <Register />}
        />
        <Route
          exact
          path="/forgot-password"
          element={token ? <Navigate to="/" replace /> : <ForgotPassword />}
        />
        <Route exact path="/" element={<HomePageOne />} />
        <Route exact path="/shop" element={<ShopPage />} />
        <Route
          exact
          path="/product-details/:id?"
          element={<ProductDetailsPageOne />}
        />
        <Route
          exact
          path="/product-details-two"
          element={<ProductDetailsPageTwo />}
        />
        <Route exact path="/become-seller" element={<BecomeSellerPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route exact path="/contact" element={<ContactPage />} />
        <Route exact path="/vendor" element={<VendorPage />} />
        <Route
          exact
          path="/vendor-two-details"
          element={<VendorTwoDetailsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
