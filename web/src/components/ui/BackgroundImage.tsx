"use client";

import Image from "next/image";
import bg1 from "@/assets/images/bg1.jpg"

const BackgroundImage = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src={bg1}
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
