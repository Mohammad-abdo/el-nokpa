import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getallBranches } from "../api/api";

const TopVendorsOne = () => {
  const [branches, setBranches] = useState([]);
  const [limit, setLimit] = useState(6);

  useEffect(() => {
    getBranches();
  }, []);

  const getBranches = async () => {
    try {
      const res = await getallBranches();
      setBranches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="top-vendors py-80">
      <div className="container container-lg">
        <div className="section-heading">
          <div className="flex-between flex-wrap gap-8">
            <h5 className="mb-0">Our Top Branches</h5>
            <Link
              to="/shop"
              className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
            >
              All Branches
            </Link>
          </div>
        </div>
        <div className="row gy-4 vendor-card-wrapper flex-center">
          {branches.slice(0, limit).map((branch, index) => (
            <div key={index} className="col-xxl-3 col-lg-4 col-sm-6">
              <div className="vendor-card text-center px-16 pb-24">
                <div>
                  <img
                    src={branch.logo || "assets/images/thumbs/vendor-logo1.png"}
                    alt={branch.name}
                    className="vendor-card__logo m-12"
                  />
                  <h6 className="title mt-32">
                    <Link to={`/branch/${branch.id}`}>{branch.name}</Link>
                  </h6>
                  <span className="text-heading text-sm d-block">
                    {branch.address}
                  </span>
                  <Link
                    to={`/branch/${branch.id}`}
                    className="bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopVendorsOne;
