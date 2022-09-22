import React from "react";
import { FaAngleDoubleUp } from "react-icons/fa";

function FollowingPage(props) {
  console.log(window.scrollY);

  const handleScroll = (e) => {
    if (!window.scrollY) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="upBtnBox">
      <button onClick={handleScroll}>
        <FaAngleDoubleUp />
      </button>
    </div>
  );
}

export default FollowingPage;
