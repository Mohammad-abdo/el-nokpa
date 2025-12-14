import React from "react";
import { Link } from "react-router-dom";

const FooterOne = () => {
  return (
    <footer className="footer py-120">
      <img
        src="assets/images/bg/body-bottom-bg.png"
        alt="BG"
        className="body-bottom-bg"
      />
      <div className="container container-lg">
        <div className="footer-item-wrapper d-flex align-items-start flex-wrap">
          <div className="footer-item">
            <div className="footer-item__logo">
              <Link to="/">
                <img src="assets/images/logo/logo.png" alt="النخبة" />
              </Link>
            </div>
            <p className="mb-24">
              النخبة متجر إلكتروني شامل يقدم مجموعة واسعة من المنتجات عالية الجودة
            </p>
            <div className="flex-align gap-16 mb-16">
              <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                <i className="ph-fill ph-map-pin" />
              </span>
              <span className="text-md text-gray-900 ">
                الرياض، المملكة العربية السعودية
              </span>
            </div>
            <div className="flex-align gap-16 mb-16">
              <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                <i className="ph-fill ph-phone-call" />
              </span>
              <div className="flex-align gap-16 flex-wrap">
                <Link
                  to="/tel:+966500000000"
                  className="text-md text-gray-900 hover-text-main-600"
                >
                  +966 50 000 0000
                </Link>
              </div>
            </div>
            <div className="flex-align gap-16 mb-16">
              <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                <i className="ph-fill ph-envelope" />
              </span>
              <Link
                to="/mailto:support@elnokba.com"
                className="text-md text-gray-900 hover-text-main-600"
              >
                support@elnokba.com
              </Link>
            </div>
          </div>

          <div className="footer-item">
            <h6 className="footer-item__title">معلومات المتجر</h6>
            <ul className="footer-menu">
              <li className="mb-16">
                <Link to="/about" className="text-gray-600 hover-text-main-600">
                  من نحن
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/policy"
                  className="text-gray-600 hover-text-main-600"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/returns"
                  className="text-gray-600 hover-text-main-600"
                >
                  الإرجاع والاستبدال
                </Link>
              </li>
              <li className="mb-16">
                <Link to="/terms" className="text-gray-600 hover-text-main-600">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover-text-main-600">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-item">
            <h6 className="footer-item__title">دعم العملاء</h6>
            <ul className="footer-menu">
              <li className="mb-16">
                <Link
                  to="/contact"
                  className="text-gray-600 hover-text-main-600"
                >
                  اتصل بنا
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/shipping"
                  className="text-gray-600 hover-text-main-600"
                >
                  معلومات الشحن
                </Link>
              </li>
              <li className="mb-16">
                <Link to="/help" className="text-gray-600 hover-text-main-600">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  className="text-gray-600 hover-text-main-600"
                >
                  العروض والخصومات
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-item">
            <h6 className="footer-item__title">حسابي</h6>
            <ul className="footer-menu">
              <li className="mb-16">
                <Link
                  to="/account"
                  className="text-gray-600 hover-text-main-600"
                >
                  حسابي
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/orders"
                  className="text-gray-600 hover-text-main-600"
                >
                  طلباتي
                </Link>
              </li>
              <li className="mb-16">
                <Link to="/cart" className="text-gray-600 hover-text-main-600">
                  سلة التسوق
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/wishlist"
                  className="text-gray-600 hover-text-main-600"
                >
                  قائمة الأمنيات
                </Link>
              </li>
              <li>
                <Link
                  to="/compare"
                  className="text-gray-600 hover-text-main-600"
                >
                  مقارنة المنتجات
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-item">
            <h6 className="footer-item__title"> فئات متجرنا</h6>
            <ul className="footer-menu">
              <li className="mb-16">
                <Link
                  to="/shop/electronics"
                  className="text-gray-600 hover-text-main-600"
                >
                  الإلكترونيات
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/shop/fashion"
                  className="text-gray-600 hover-text-main-600"
                >
                  الأزياء والموضة
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/shop/home"
                  className="text-gray-600 hover-text-main-600"
                >
                  المنزل والحديقة
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/shop/sports"
                  className="text-gray-600 hover-text-main-600"
                >
                  الرياضة واللياقة
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  to="/shop/beauty"
                  className="text-gray-600 hover-text-main-600"
                >
                  الجمال والعناية
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/books"
                  className="text-gray-600 hover-text-main-600"
                >
                  الكتب والوسائط
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOne;
