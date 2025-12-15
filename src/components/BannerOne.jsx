import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { getAllSliders } from "../api/api";

const BannerOne = () => {
  const [sliders, setSliders] = useState([]);

  const getSliders = async () => {
    try {
      const res = await getAllSliders();
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      const activeSliders = data.filter((s) => s.is_active);
      setSliders(activeSliders);
    } catch (error) {
      console.error("Error fetching sliders:", error);
    }
  };

  useEffect(() => {
    getSliders();
  }, []);

  // ✅ Default fallback image
  const defaultImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREhkF5-7gGqFHAlOrKxwOxLpfH4scBD0qcFQ&s";

  function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-next slick-arrow flex-center rounded-circle bg-white shadow text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-right" />
      </button>
    );
  }

  function SamplePrevArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white shadow text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-left" />
      </button>
    );
  }

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div className="banner py-5">
      <div className="container container-lg">
        <div className="banner-item rounded-24 overflow-hidden position-relative arrow-center shadow-lg bg-primary-50">
          {/* scroll down icon */}
          <a
            href="#featureSection"
            className="scroll-down w-84 h-84 text-center flex-center bg-main-600 rounded-circle border border-5 text-white border-white position-absolute start-50 translate-middle-x bottom-0 hover-bg-main-800 z-10"
          >
            <span className="icon line-height-0">
              <i className="ph ph-caret-double-down" />
            </span>
          </a>

          {/* decorative background */}
          {/* <img
            src=""
            alt=""
            className="banner-img position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1 object-fit-cover rounded-24"
          /> */}

          <div className="banner-slider position-relative">
            {sliders.length > 0 ? (
              <Slider {...settings}>
                {sliders.map((slide) => (
                  <div key={slide.id} className="banner-slider__item">
                    <div className="banner-slider__inner flex-between align-items-center position-relative ">
                      {/* left content */}
                      <div className="banner-item__content text-dark pe-md-5">
                        <h1 className="banner-item__title fw-bold mb-4">
                          اكتشف الوضوح والأناقة مع{" "}
                          <span className="text-main-600">النخبة</span>
                        </h1>
                        <p className="mb-4 text-gray-600 text-lg">
                          متجر إلكتروني شامل يقدم أفضل المنتجات بجودة عالية وأسعار منافسة.
                        </p>
                        <Link
                          to="/shop"
                          className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8 px-4 py-2"
                        >
                          استكشف المجموعة{" "}
                          <span className="icon text-xl d-flex">
                            <i className="ph ph-shopping-cart-simple" />
                          </span>
                        </Link>
                      </div>

                      {/* right image */}
                      <div className="banner-item__thumb flex-center">
                        <img
                          src={slide.image || defaultImage}
                          alt="النخبة"
                          className="rounded-16 shadow object-fit-cover"
                          style={{
                            width: "550px",
                            height: "30ء0px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="text-center py-5">
                <img
                  src={defaultImage}
                  alt="default banner"
                  className="rounded-16 shadow object-fit-cover mb-4"
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                  }}
                />
                <h4 className="text-gray-600">لم يتم العثور على لافتات نشطة</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerOne;
