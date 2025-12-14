import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { getCountdown } from "../helper/Countdown";
import { getAllOffers } from "../api/api";

const SampleNextArrow = memo(function SampleNextArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={` ${className} slick-next slick-arrow flex-center rounded-circle border border-gray-200 bg-white shadow hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
    >
      <i className="ph ph-caret-right" />
    </button>
  );
});

const SamplePrevArrow = memo(function SamplePrevArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} slick-prev slick-arrow flex-center rounded-circle border border-gray-200 bg-white shadow hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
    >
      <i className="ph ph-caret-left" />
    </button>
  );
});

const FlashSalesOne = () => {
  const [offers, setOffers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(getCountdown());

  const getOffers = async () => {
    try {
      const response = await getAllOffers();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      const activeOffers = data.filter((offer) => offer.is_active);
      setOffers(activeOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  useEffect(() => {
    getOffers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [{ breakpoint: 991, settings: { slidesToShow: 1 } }],
  };

  const defaultImage =
    "https://static.wixstatic.com/media/cb97ef_a198a74b96874649b48a853faa64b5c3~mv2.jpg/v1/fill/w_938,h_668,al_t,q_85,usm_2.00_1.00_0.00,enc_avif,quality_auto/cb97ef_a198a74b96874649b48a853faa64b5c3~mv2.jpg";

  return (
    <section className="flash-sales pt-80">
      <div className="container container-lg">
        <div className="section-heading mb-4">
          <div className="flex-between flex-wrap gap-8">
            <h5 className="mb-10 text-main-600 fw-bold">عروض النخبة اليوم</h5>
            <div className="flex-align gap-16 mr-point">
              <Link
                to="/shop"
                className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
              >
                عرض جميع العروض
              </Link>
            </div>
          </div>
        </div>

        <div className="flash-sales__slider arrow-style-two p-3">
          {offers.length > 0 ? (
            <Slider {...settings}>
              {offers.map((offer) => {
                const image = offer.image || defaultImage;
                return (
                  <div key={offer.id}>
                    <div
                      className="flash-sales-item rounded-16 overflow-hidden bg-white shadow-lg hover-shadow-xl transition-3 position-relative"
                      style={{
                        border: "1px solid #eee",
                      }}
                    >
                      {/* image */}
                      <div
                        className="flash-sales-item__image"
                        style={{
                          width: "100%",
                          height: "230px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={image}
                          alt={offer.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.05)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      </div>

                      {/* content */}
                      <div className="p-4 text-center">
                        <h6 className="fw-bold text-dark mb-2">
                          {offer.title || "عرض خاص"}
                        </h6>

                        {offer.start_date && offer.end_date ? (
                          <div className="countdown mb-3">
                            <ul className="countdown-list flex-align justify-content-center gap-2">
                              <li className="text-sm fw-medium bg-main-50 text-main-700 rounded px-2 py-1">
                                {timeLeft.days}d
                              </li>
                              <li className="text-sm fw-medium bg-main-50 text-main-700 rounded px-2 py-1">
                                {timeLeft.hours}h
                              </li>
                              <li className="text-sm fw-medium bg-main-50 text-main-700 rounded px-2 py-1">
                                {timeLeft.minutes}m
                              </li>
                              <li className="text-sm fw-medium bg-main-50 text-main-700 rounded px-2 py-1">
                                {timeLeft.seconds}s
                              </li>
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            متاح لفترة محدودة
                          </p>
                        )}

                        <Link
                          to="/shop"
                          className="btn btn-main rounded-pill px-4 py-2 mt-2"
                        >
                          تسوق الآن
                          <i className="ph ph-arrow-right ms-2"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          ) : (
            <p className="text-center py-5 text-gray-500">
              لم يتم العثور على عروض نشطة
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlashSalesOne;
