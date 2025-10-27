"use client";

import Image from "next/image";
import landingImg_1 from "@/assets/images/landingImg_1.png"; // dùng alias @ thay vì ../../

const BackgroundImage = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src={landingImg_1}
        alt="Landing background"
        fill
        priority
        className="object-cover object-center blur-[1.5px]"
      />
      {/* Nếu muốn thêm overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-pink-200/20 to-orange-200/20"></div> */}
    </div>
  );
};

export default BackgroundImage;
