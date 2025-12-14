import React, { useCallback, useEffect, useState } from "react";
import query from "jquery";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  authLogout,
  getAllCategories,
  getCartCount,
  getWishlistCount,
} from "../api/api";
import Cookies from "universal-cookie";

const HeaderOne = () => {
  const [Categories, setCategory] = useState([]);
  const navigate = useNavigate();
  const [subCategory, setSubCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const cookie = new Cookies();
  const token = cookie.get("token");
  useEffect(() => {
    getCategories();
  }, []);
  const getCategories = async () => {
    try {
      const response = await getAllCategories();
      console.log(response);

      setCategory(response.data);
    } catch (error) {}
  };

  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.onscroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false);
      } else if (window.pageYOffset > 150) {
        setScroll(true);
      }
      return () => (window.onscroll = null);
    };
    const selectElement = query(".js-example-basic-single");
    selectElement.select2();

    return () => {
      if (selectElement.data("select2")) {
        selectElement.select2("destroy");
      }
    };
  }, []);
  // update wishlist count
  const [wishlistCount, setWishlistCount] = useState(0);

  const loadWishlistCount = useCallback(async () => {
    try {
      const count = await getWishlistCount();
      setWishlistCount(count);
    } catch (error) {
      console.error("Failed to load wishlist count:", error);
      setWishlistCount(0);
    }
  }, [token]);

  useEffect(() => {
    loadWishlistCount();
  }, [loadWishlistCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      loadWishlistCount();
    };
    window.addEventListener("local-wishlist-changed", handler);
    return () => {
      window.removeEventListener("local-wishlist-changed", handler);
    };
  }, [loadWishlistCount]);

  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    try {
      const count = await getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error("Failed to load cart count:", error);
      setCartCount(0);
    }
  }, [token]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      loadCartCount();
    };
    window.addEventListener("local-cart-changed", handler);
    return () => {
      window.removeEventListener("local-cart-changed", handler);
    };
  }, [loadCartCount]);
  // Set the default language
  const [selectedLanguage, setSelectedLanguage] = useState("Eng");
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // Set the default currency
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  // Mobile menu support
  const [menuActive, setMenuActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const handleMenuClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const handleMenuToggle = () => {
    setMenuActive(!menuActive);
  };

  // Search control support
  const [activeSearch, setActiveSearch] = useState(false);
  const handleSearchToggle = () => {
    setActiveSearch(!activeSearch);
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategorySelect = (event) => {
    setSelectedCategoryId(event.target.value);
  };

  const navigateToCategory = (categoryId) => {
    const params = new URLSearchParams();
    params.set("category", categoryId);
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    navigate(`/shop?${params.toString()}`);
    setSelectedCategoryId(String(categoryId));
    setActiveCategory(false);
    setActiveIndexCat(null);
    setMenuActive(false);
    setActiveSearch(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (selectedCategoryId && selectedCategoryId !== "all") {
      params.set("category", selectedCategoryId);
    }
    const target = params.toString() ? `/shop?${params.toString()}` : "/shop";
    navigate(target);
    setActiveSearch(false);
  };

  // category control support
  const [activeCategory, setActiveCategory] = useState(false);
  const handleCategoryToggle = () => {
    setActiveCategory(!activeCategory);
  };
  const [activeIndexCat, setActiveIndexCat] = useState(null);
  const handleCatClick = (index) => {
    setActiveIndexCat(activeIndexCat === index ? null : index);
  };
  const handleLogout = async () => {
    try {
      await authLogout();

      navigate("/");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="overlay" />
      <div
        className={`side-overlay ${(menuActive || activeCategory) && "show"}`}
      />
      {/* ==================== Search Box Start Here ==================== */}
      <form
        action="#"
        className={`search-box ${activeSearch && "active"}`}
        onSubmit={handleSearchSubmit}
      >
        <button
          onClick={handleSearchToggle}
          type="button"
          className="search-box__close position-absolute inset-block-start-0 inset-inline-end-0 m-16 w-48 h-48 border border-gray-100 rounded-circle flex-center text-white hover-text-gray-800 hover-bg-white text-2xl transition-1"
        >
          <i className="ph ph-x" />
        </button>
        <div className="container">
          <div className="position-relative">
            <input
              type="text"
              className="form-control py-16 px-24 text-xl rounded-pill pe-64"
              placeholder="Search for a product or brand"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <button
              type="submit"
              className="w-48 h-48 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
            >
              <i className="ph ph-magnifying-glass" />
            </button>
          </div>
        </div>
      </form>
      {/* ==================== Search Box End Here ==================== */}
      {/* ==================== Mobile Menu Start Here ==================== */}
      <div
        className={`mobile-menu scroll-sm d-lg-none d-block ${
          menuActive && "active"
        }`}
      >
        <button
          onClick={() => {
            handleMenuToggle();
            setActiveIndex(null);
          }}
          type="button"
          className="close-button"
        >
          <i className="ph ph-x" />{" "}
        </button>
        <div className="mobile-menu__inner">
          <Link to="/" className="mobile-menu__logo">
            <img src="assets/images/logo/logo.png" alt="Logo" />
          </Link>
          <div className="mobile-menu__menu">
            {/* Nav Menu Start */}
            <ul className="nav-menu flex-align nav-menu--mobile">
              {/* Home Menu */}
              <li
                onClick={() => handleMenuClick(0)}
                className={`on-hover-item nav-menu__item  ${
                  activeIndex === 0 ? "d-block" : ""
                }`}
              >
                <Link to="/" className="nav-menu__link">
                  Home
                </Link>
              </li>

              {/* Shop Menu */}
              <li
                onClick={() => handleMenuClick(1)}
                className={`on-hover-item nav-menu__item ${
                  activeIndex === 1 ? "d-block" : ""
                }`}
              >
                <Link to="/shop" className="nav-menu__link">
                  Shop
                </Link>
              </li>

              {/* Pages Menu */}
              <li
                onClick={() => handleMenuClick(2)}
                className={`on-hover-item nav-menu__item ${
                  activeIndex === 2 ? "d-block" : ""
                }`}
              >
                <Link to="/vendor" className="nav-menu__link">
                  Branches
                </Link>
              </li>

              {/* Contact Us Menu */}
              <li className="nav-menu__item">
                <Link
                  to="/contact"
                  className="nav-menu__link"
                  onClick={() => setActiveIndex(null)}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
            {/* Nav Menu End */}
          </div>
        </div>
      </div>
      {/* ==================== Mobile Menu End Here ==================== */}
      {/* ======================= Middle Top Start ========================= */}
      <div className="header-top bg-main-600 flex-between">
        <div className="container container-lg">
          <div className="flex-between flex-wrap gap-8">
            <ul className="flex-align flex-wrap d-none d-md-flex">
              <li className="border-right-item">
                <Link
                  to="#"
                  className="text-white text-sm hover-text-decoration-underline"
                >
                  About us
                </Link>
              </li>
              <li className="border-right-item">
                <Link
                  to="#"
                  className="text-white text-sm hover-text-decoration-underline"
                >
                  Free Delivery
                </Link>
              </li>
              <li className="border-right-item">
                <Link
                  to="#"
                  className="text-white text-sm hover-text-decoration-underline"
                >
                  Returns Policy
                </Link>
              </li>
            </ul>
            <ul className="header-top__right flex-align flex-wrap">
              <li className="on-hover-item border-right-item border-right-item-sm-space has-submenu arrow-white">
                <Link to="#" className="text-white text-sm py-8">
                  Help Center
                </Link>
                <ul className="on-hover-dropdown common-dropdown common-dropdown--sm max-h-200 scroll-sm px-0 py-8">
                  <li className="nav-submenu__item">
                    <Link
                      to="#"
                      className="nav-submenu__link hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0"
                    >
                      <span className="text-sm d-flex">
                        <i className="ph ph-headset" />
                      </span>
                      Call Center
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="on-hover-item border-right-item border-right-item-sm-space has-submenu arrow-white">
                {/* Display the selected language here */}
                <Link to="#" className="selected-text text-white text-sm py-8">
                  {selectedLanguage}
                </Link>
                <ul className="selectable-text-list on-hover-dropdown common-dropdown common-dropdown--sm max-h-200 scroll-sm px-0 py-8">
                  <li>
                    <Link
                      to="#"
                      className="hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0"
                      onClick={() => handleLanguageChange("English")}
                    >
                      <img
                        src="assets/images/thumbs/flag1.png"
                        alt=""
                        className="w-16 h-12 rounded-4 border border-gray-100"
                      />
                      English
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="hover-bg-gray-100 text-gray-500 text-xs py-6 px-16 flex-align gap-8 rounded-0"
                      onClick={() => handleLanguageChange("Spanish")}
                    >
                      <img
                        src="assets/images/thumbs/flag2.png"
                        alt=""
                        className="w-16 h-12 rounded-4 border border-gray-100"
                      />
                      العربية
                    </Link>
                  </li>
                </ul>
              </li>
              {/* momo */}
              {token ? (
                <li className="border-right-item d-flex">
                  <Link
                    to="/account"
                    className="text-white text-sm py-8 flex-align gap-6"
                  >
                    <span className="icon text-md d-flex">
                      {" "}
                      <i className="ph ph-user-circle" />{" "}
                    </span>
                    <span className="hover-text-decoration-underline">
                      My Account
                    </span>
                  </Link>
                  <button
                    className="text-white mx-4 text-sm py-8 flex-align gap-6 rounded-pill border-3 border-white"
                    onClick={handleLogout}
                  >
                    / logout
                  </button>
                </li>
              ) : (
                <li className="border-right-item d-flex">
                  <Link
                    to="/login"
                    className="text-white text-sm py-8 flex-align gap-6"
                  >
                    <span className="hover-text-decoration-underline">
                      login
                    </span>
                  </Link>

                  <Link
                    to="/register"
                    className="text-white text-sm py-8 flex-align gap-6"
                  >
                    <span className="hover-text-decoration-underline">
                      / register
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* ======================= Middle Top End ========================= */}
      {/* ======================= Middle Header Start ========================= */}
      <header className="header-middle bg-color-one border-bottom border-gray-100">
        <div className="container container-lg">
          <nav className="header-inner flex-between">
            {/* Logo Start */}
            <div className="logo">
              <Link to="/" className="link">
                <img src="assets/images/logo/logo.png" alt="Logo" />
              </Link>
            </div>
            {/* Logo End  */}
            {/* form location Start */}
            <form
              action="#"
              className="flex-align flex-wrap form-location-wrapper"
              onSubmit={handleSearchSubmit}
            >
              <div className="search-category d-flex h-48 select-border-end-0 radius-end-0 search-form d-sm-flex d-none">
                <select
                  value={selectedCategoryId}
                  className="js-example-basic-single border border-gray-200 border-end-0"
                  name="state"
                  onChange={handleCategorySelect}
                >
                  <option value="all">All Categories</option>
                  {Categories.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.name}
                    </option>
                  ))}
                  {/* <option value={1}>Grocery</option> */}
                </select>
                <div className="search-form__wrapper position-relative">
                  <input
                    type="text"
                    className="search-form__input common-input py-13 ps-16 pe-18 rounded-end-pill pe-44"
                    placeholder="Search for a product or brand"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                  />
                  <button
                    type="submit"
                    className="w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
                  >
                    <i className="ph ph-magnifying-glass" />
                  </button>
                </div>
              </div>
              <div className="location-box bg-white flex-align gap-8 py-6 px-16 rounded-pill border border-gray-100">
                <span className="text-gray-900 text-xl d-xs-flex d-none">
                  <i className="ph ph-map-pin" />
                </span>
                <div className="line-height-1">
                  <span className="text-gray-600 text-xs">Your Location</span>
                  <div className="line-height-1">
                    <select
                      defaultValue={1}
                      className="js-example-basic-single border border-gray-200 border-end-0"
                      name="state"
                    >
                      <option value={1}>Alabama</option>
                      <option value={1}>Alaska</option>
                      <option value={1}>Arizona</option>
                      <option value={1}>Delaware</option>
                      <option value={1}>Florida</option>
                      <option value={1}>Georgia</option>
                      <option value={1}>Hawaii</option>
                      <option value={1}>Indiana</option>
                      <option value={1}>Marzland</option>
                      <option value={1}>Nevada</option>
                      <option value={1}>New Jersey</option>
                      <option value={1}>New Mexico</option>
                      <option value={1}>New York</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
            {/* form location start */}
            {/* Header Middle Right start */}
            <div className="header-right flex-align d-lg-block d-none">
              <div className="flex-align flex-wrap gap-12">
                <button
                  type="button"
                  className="search-icon flex-align d-lg-none d-flex gap-4 item-hover"
                >
                  <span className="text-2xl text-gray-700 d-flex position-relative item-hover__text">
                    <i className="ph ph-magnifying-glass" />
                  </span>
                </button>
                <Link to="/wishlist" className="flex-align gap-4 item-hover">
                  <span className="text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text">
                    <i className="ph ph-heart" />
                    <span className="w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4">
                      {wishlistCount}
                    </span>
                  </span>
                  <span className="text-md text-gray-500 item-hover__text d-none d-lg-flex"></span>
                </Link>
                <Link to="/cart" className="flex-align gap-4 item-hover">
                  <span className="text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text">
                    <i className="ph ph-shopping-cart-simple" />
                    <span className="w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4">
                      {cartCount}
                    </span>
                  </span>
                  <span className="text-md text-gray-500 item-hover__text d-none d-lg-flex"></span>
                </Link>
              </div>
            </div>
            {/* Header Middle Right End  */}
          </nav>
        </div>
      </header>
      {/* ======================= Middle Header End ========================= */}
      {/* ==================== Header Start Here ==================== */}
      <header
        className={`header bg-white border-bottom border-gray-100 ${
          scroll && "fixed-header"
        }`}
      >
        <div className="container container-lg">
          <nav className="header-inner d-flex justify-content-between gap-8">
            <div className="flex-align menu-category-wrapper">
              {/* Category Dropdown Start */}
              <div className="category on-hover-item">
                <button
                  onClick={handleCategoryToggle}
                  type="button"
                  className="category__button flex-align gap-8 fw-medium p-16 border-end border-start border-gray-100 text-heading"
                >
                  <span className="icon text-2xl d-xs-flex d-none">
                    <i className="ph ph-dots-nine" />
                  </span>
                  <span className="d-sm-flex d-none">All</span> Categories
                  <span className="arrow-icon text-xl d-flex">
                    <i className="ph ph-caret-down" />
                  </span>
                </button>

                <div
                  className={`responsive-dropdown cat on-hover-dropdown common-dropdown nav-submenu p-0 submenus-submenu-wrapper ${
                    activeCategory ? "active" : ""
                  }`}
                >
                  <ul className="scroll-sm p-0 py-8 w-300 max-h-400 overflow-y-auto">
                    {Categories.map((cat, index) => (
                      <li
                        key={cat.id}
                        onClick={() => handleCatClick(index)}
                        className={`has-submenus-submenu ${
                          activeIndexCat === index ? "active" : ""
                        }`}
                      >
                        <Link
                          to="#"
                          className="text-gray-500 text-15 py-12 px-16 flex-align gap-8 rounded-0"
                          onClick={(event) => {
                            event.preventDefault();
                            navigateToCategory(cat.id);
                          }}
                        >
                          <span className="text-xl d-flex">
                            <i className="ph ph-tag" />
                          </span>
                          <span>{cat.name}</span>
                          {cat.children && cat.children.length > 0 && (
                            <span className="icon text-md d-flex ms-auto">
                              <i className="ph ph-caret-right" />
                            </span>
                          )}
                        </Link>

                        {/* Subcategories */}
                        {cat.children && cat.children.length > 0 && (
                          <div
                            className={`submenus-submenu py-16 ${
                              activeIndexCat === index ? "open" : ""
                            }`}
                          >
                            <h6 className="text-lg px-16 submenus-submenu__title">
                              {cat.name}
                            </h6>
                            <ul className="submenus-submenu__list max-h-300 overflow-y-auto scroll-sm">
                              {cat.children.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    to="#"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      navigateToCategory(sub.id);
                                    }}
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Category Dropdown End  */}
              {/* Menu Start  */}
              <div className="header-menu d-lg-block d-none">
                {/* Nav Menu Start */}
                <ul className="nav-menu flex-align ">
                  <li className="on-hover-item nav-menu__item has-submenu">
                    <li className="nav-menu__item">
                      <NavLink to="/" className="nav-menu__link">
                        Home
                      </NavLink>
                    </li>
                  </li>
                  <li className="nav-menu__item">
                    <NavLink to="/shop" className="nav-menu__link">
                      Shop
                    </NavLink>
                  </li>

                  <li className="nav-menu__item">
                    <NavLink
                      to="/vendor"
                      className={(navData) =>
                        navData.isActive
                          ? "nav-menu__link activePage"
                          : "nav-menu__link"
                      }
                    >
                      Branches
                    </NavLink>
                  </li>

                  <li className="nav-menu__item">
                    <NavLink
                      to="/contact"
                      className={(navData) =>
                        navData.isActive
                          ? "nav-menu__link activePage"
                          : "nav-menu__link"
                      }
                    >
                      Contact Us
                    </NavLink>
                  </li>
                </ul>
                {/* Nav Menu End */}
              </div>
              {/* Menu End  */}
            </div>
            {/* Header Right start */}
            <div className="header-right flex-align">
              <Link
                to="/tel:01234567890"
                className="bg-main-600 text-white p-12 h-100 hover-bg-main-800 flex-align gap-8 text-lg d-lg-flex d-none"
              >
                <div className="d-flex text-32">
                  <i className="ph ph-phone-call" />
                </div>
                01- 234 567 890
              </Link>
              <div className="me-16 d-lg-none d-block">
                <div className="flex-align flex-wrap gap-12">
                  <button
                    onClick={handleSearchToggle}
                    type="button"
                    className="search-icon flex-align d-lg-none d-flex gap-4 item-hover"
                  >
                    <span className="text-2xl text-gray-700 d-flex position-relative item-hover__text">
                      <i className="ph ph-magnifying-glass" />
                    </span>
                  </button>
                  <Link to="/wishlist" className="flex-align gap-4 item-hover">
                    <span className="text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text">
                      <i className="ph ph-heart" />
                      <span className="w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4">
                        2
                      </span>
                    </span>
                    <span className="text-md text-gray-500 item-hover__text d-none d-lg-flex">
                      Wishlist
                    </span>
                  </Link>
                  <Link to="/cart" className="flex-align gap-4 item-hover">
                    <span className="text-2xl text-gray-700 d-flex position-relative me-6 mt-6 item-hover__text">
                      <i className="ph ph-shopping-cart-simple" />
                      <span className="w-16 h-16 flex-center rounded-circle bg-main-600 text-white text-xs position-absolute top-n6 end-n4">
                        2
                      </span>
                    </span>
                    <span className="text-md text-gray-500 item-hover__text d-none d-lg-flex">
                      Cart
                    </span>
                  </Link>
                </div>
              </div>
              <button
                onClick={handleMenuToggle}
                type="button"
                className="toggle-mobileMenu d-lg-none ms-3n text-gray-800 text-4xl d-flex"
              >
                {" "}
                <i className="ph ph-list" />{" "}
              </button>
            </div>
            {/* Header Right End  */}
          </nav>
        </div>
      </header>
      {/* ==================== Header End Here ==================== */}
    </>
  );
};

export default HeaderOne;
