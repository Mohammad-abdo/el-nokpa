import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getallBranches } from "../api/api";

const VendorsList = () => {
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
    <section className="vendors-list py-80">
      <div className="container container-lg">
        <div className="flex-between flex-wrap gap-8 mb-40">
          <span className="text-neutral-600 fw-medium px-40 py-12 rounded-pill border border-neutral-100">
            Showing {Math.min(limit, branches.length)} of {branches.length}{" "}
            branches
          </span>
        </div>

        <div className="row gy-4 vendor-card-wrapper d-flex align-items-center justify-content-center">
          {branches.slice(0, limit).map((branch, index) => (
            <div key={index} className="col-xxl-4 col-lg-6 col-sm-6">
              <div className="vendor-card text-center px-16 pb-24">
                <div>
                  <img
                    src="assets/images/logo/logo.png"
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

        {/* زرار عرض المزيد */}
        {branches.length > limit && (
          <div className="text-center mt-40">
            <button
              onClick={() => setLimit(limit + 6)} // 👈 كل مرة يضيف 6 فروع كمان
              className="btn btn-main rounded-pill px-32 py-12"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default VendorsList;
