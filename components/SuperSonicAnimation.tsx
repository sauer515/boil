import { useEffect, useState } from "react";
import superSonic from "@/public/super_sonic.gif";
import Image from "next/image";

const SuperSonicAnimation = () => {
    const [isTransforming, setIsTransforming] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsTransforming(false);
        }, 3000);
    }
    , []);
  return (
    <div className="fixed bottom-10 left-1/4 transition-transform duration-1000">
      {isTransforming
       && <Image src={superSonic} alt="Super Sonic" width={100} height={100} unoptimized />
      }
    </div>
  )
}

export default SuperSonicAnimation