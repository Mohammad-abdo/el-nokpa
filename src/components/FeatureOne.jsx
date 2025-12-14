import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { getAllCategories } from "../api/api";

const FeatureOne = () => {
  const [categories, setCategories] = useState([]);

  // ✅ نستخدم useEffect مرة واحدة فقط
  useEffect(() => {
    getAllCategor();
  }, []);

  const getAllCategor = async () => {
    try {
      const res = await getAllCategories();

      // ✅ تأكيد أن الداتا مصفوفة
      const data = Array.isArray(res.data) ? res.data : res.data.data;

      // ✅ تصفية التصنيفات الرئيسية فقط
      const mainCategories = data.filter((cat) => cat.parent_id === null);

      setCategories(mainCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ✅ السهم التالي
  const SampleNextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-right" />
      </button>
    );
  };

  // ✅ السهم السابق
  const SamplePrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-left" />
      </button>
    );
  };

  // ✅ إعدادات السلايدر
  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="feature" id="featureSection">
      <div className="container container-lg">
        <div className="position-relative arrow-center">
          <div className="feature-item-wrapper">
            {categories.length > 0 ? (
              <Slider {...settings}>
                {categories.map((category) => (
                  <div className="feature-item text-center" key={category.id}>
                    <div className="feature-item__thumb rounded-circle">
                      <Link
                        to={`/shop?category=${category.slug}`}
                        className="w-100 h-100 flex-center"
                      >
                        <img
                          src={
                            category.image ||
                            "https://via.placeholder.com/100x100?text=No+Image"
                          }
                          alt={category.name}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      </Link>
                    </div>
                    <div className="feature-item__content mt-16">
                      <h6 className="text-lg mb-8">
                        <Link
                          to={`/shop?category=${category.slug}`}
                          className="text-inherit"
                        >
                          {category.name}
                        </Link>
                      </h6>
                      <span className="text-sm text-gray-400">
                        {category.products_count}+ Products
                      </span>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <p className="text-center w-100 py-5">No categories found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureOne;
