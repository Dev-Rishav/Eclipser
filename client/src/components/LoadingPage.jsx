import React from "react";
import Lottie from "react-lottie";
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
      <Lottie options={defaultOptions} height={200} width={200} />
    </div>
  );
};

export default LoadingPage;