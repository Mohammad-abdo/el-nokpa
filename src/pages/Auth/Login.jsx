import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  authLogin,
  syncLocalCartWithServer,
  syncLocalWishlistWithServer,
} from "../../api/api";
import Cookies from "universal-cookie";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authLogin({
        email,
        password,
      });

      console.log(res.data.token);

      if (res?.data?.token) {
        cookies.set("token", res?.data?.token);
        cookies.set("userId", res?.data?.user?.id);

        try {
          await syncLocalCartWithServer();
          await syncLocalWishlistWithServer();
        } catch (syncError) {
          console.error("Error syncing local data:", syncError);
        }

        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Welcome back 👋",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid email or password.",
          confirmButtonText: "OK",
        });
        setError("Invalid email or password.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Invalid email or password.";
      Swal.fire({
        icon: "error",
        title: "Login Error",
        text: errorMessage,
        confirmButtonText: "OK",
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth auth-eyewear py-80 py-md-0 min-vh-100 d-flex align-items-center">
      <div className="container container-lg position-relative w-100">
        <div className="row g-40 align-items-center">
          <div className="col-xl-7 col-lg-7">
            <div className="auth-eyewear__content">
              <span className="auth-eyewear__badge">متجر النخبة الإلكتروني</span>
              <h1 className="auth-eyewear__title">
                سجّل الدخول لاستكشاف مجموعتنا المميزة من المنتجات
              </h1>
              <p className="auth-eyewear__subtitle">
                أدر منتجاتك المفضلة، راجع طلباتك، وتتبع مشترياتك بسهولة.
              </p>
              <div className="auth-eyewear__glass-card shadow-sm">
                <div className="auth-eyewear__glass-main">
                  <span className="auth-eyewear__glass-icon ph ph-shopping-cart" />
                  <div className="auth-eyewear__glass-copy">
                    <span className="auth-eyewear__glass-heading">
                      تجربة تسوق مميزة
                    </span>
                    <span className="auth-eyewear__glass-text">
                      منتجات عالية الجودة مع ضمان الجودة والرضا التام
                    </span>
                  </div>
                </div>
                <span className="auth-eyewear__glass-pill">جديد</span>
              </div>
              <div className="auth-eyewear__features">
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-star" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      منتجات مميزة
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      تسوق مجموعات عصرية من أفضل المنتجات والماركات.
                    </p>
                  </div>
                </div>
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-lightning" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      طلب سريع وسهل
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      أضف المنتجات إلى سلة التسوق وأكمل طلبك بسهولة.
                    </p>
                  </div>
                </div>
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-lock" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      ضمان الجودة
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      استبدال فوري للمنتجات التالفة خلال 30 يومًا دون أي تكلفة إضافية.
                    </p>
                  </div>
                </div>
              </div>
              <div className="auth-eyewear__assurance">
                <span>ليس لديك حساب؟</span>
                <Link to="/register" className="auth-eyewear__assurance-link">
                  انضم إلى متجر النخبة
                </Link>
              </div>
            </div>
          </div>
          <div className="col-xl-5 col-lg-5">
            <div className="auth-eyewear__card">
              <div className="auth-eyewear__card-header text-center">
                <span className="auth-eyewear__card-badge">
                  <img src="assets/images/logo/logo.png" alt="" width={100} />
                </span>
                <h2 className="auth-eyewear__card-title">تسجيل الدخول</h2>
                <p className="auth-eyewear__card-text">
                  أدخل بياناتك للوصول إلى طلباتك ومنتجاتك المفضلة.
                </p>
              </div>
              <form onSubmit={handleLogin} className="auth-eyewear__form">
                <div className="auth-eyewear__field">
                  <label htmlFor="Email" className="auth-eyewear__label">
                    البريد الإلكتروني<span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="common-input auth-eyewear__input"
                    id="Email"
                    placeholder="example@email.com"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-eyewear__field">
                  <label htmlFor="password" className="auth-eyewear__label">
                    كلمة المرور
                  </label>
                  <div className="auth-eyewear__password">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="common-input auth-eyewear__input pe-48"
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eyewear__password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span
                        className={`ph ${
                          showPassword ? "ph-eye" : "ph-eye-slash"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {error && <div className="auth-eyewear__error">{error}</div>}
                <div className="auth-eyewear__form-meta">
                  <div className="form-check common-check w-50 mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                    />
                    <label
                      className="form-check-label mx-20"
                      htmlFor="remember"
                    >
                      تذكرني
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="auth-eyewear__meta-link"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <button
                  type="submit"
                  className="btn btn-main py-18 w-100"
                  disabled={loading}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </button>
              </form>
              <div className="auth-eyewear__card-footer">
                <span className="ph ph-handbag" />
                <p className="mb-0">
                  عروض أسبوعية حصرية مع خصم إضافي 15% للأعضاء.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
