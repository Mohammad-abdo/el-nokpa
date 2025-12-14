import React from "react";
import { Link } from "react-router-dom";

const OfferOne = () => {
  return (
    <section
      className="offer-section py-80 my-40"
      style={{ backgroundColor: "#f5f7fa" }}
    >
      <div className="container container-lg">
        <div className="row gy-4 align-items-stretch">
          {/* النظارات الطبية */}
          <div className="col-md-6">
            <div
              className="offer-card rounded-16 p-32 position-relative text-start h-100 shadow-sm"
              style={{
                background:
                  "linear-gradient(120deg, #ffffff 60%, #eaf0fa 100%)",
                border: "1px solid #e0e7f1",
              }}
            >
              <div className="d-flex flex-column justify-content-between h-100">
                <div>
                  <h3
                    className="fw-bold mb-3"
                    style={{ color: "#002b5c", lineHeight: "1.4" }}
                  >
                    Stylish prescription glasses with precision lenses
                  </h3>
                  <p
                    className="text-secondary mb-4"
                    style={{ fontSize: "15px" }}
                  >
                    Choose from our modern range of prescription glasses that
                    combine comfort and quality. Explore the collection
                  </p>
                  <Link
                    to="/shop"
                    className="btn px-10 py-4 rounded-pill fw-medium"
                    style={{
                      backgroundColor: "#002b5c",
                      color: "#fff",
                      transition: "0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0b3d91")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#002b5c")
                    }
                  >
                    Explore the collection
                  </Link>
                </div>
                <div className="text-center mt-4">
                  <img
                    src="assets/images/bolivar/eyeglasses-clean.png"
                    alt="نظارات طبية بوليفار"
                    className="img-fluid rounded-12"
                    style={{
                      maxHeight: "240px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* النظارات الشمسية */}
          <div className="col-md-6">
            <div
              className="offer-card rounded-16 p-32 position-relative text-start h-100 shadow-sm"
              style={{
                background:
                  "linear-gradient(120deg, #002b5c 70%, #1a3b6b 100%)",
                color: "#fff",
              }}
            >
              <div className="d-flex flex-column justify-content-between h-100">
                <div>
                  <h3
                    className="fw-bold mb-3 text-white"
                    style={{ lineHeight: "1.4" }}
                  >
                    Sunglasses that express your refined taste
                  </h3>
                  <p
                    className="mb-4"
                    style={{ color: "#dbe4f0", fontSize: "15px" }}
                  >
                    Protect your eyes in style with the latest sunglasses
                    collection from Bolivar. Shop now
                  </p>
                  <Link
                    to="/shop"
                    className="btn px-10   text-primary  p-4 rounded-pill bg-white fw-medium"
                    style={{
                      transition: "0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e5ebf4")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ddd")
                    }
                  >
                    تسوّق الآن
                  </Link>
                </div>
                <div className="text-center mt-4">
                  <img
                    src="assets/images/Llogo/logo.png"
                    alt="نظارات شمسية بوليفار"
                    className="img-fluid rounded-12"
                    style={{
                      maxHeight: "240px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferOne;
