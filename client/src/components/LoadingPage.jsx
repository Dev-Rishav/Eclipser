import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/loading.json"; 

const LoadingPage = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cosmic to-stellar">
      {/* <Lottie options={defaultOptions} height={200} width={200} /> */}
      <Lottie 
        animationData={animationData}
        loop={true}
        style={{ height: 200, width: 200 }}
      />
    </div>
  );
};

export default LoadingPage;