import { useEffect, useState } from "react";
import Image from "next/image";
import sonicRunning from "@/public/sonic_running.gif";


export default function SonicAnimation() {
    const [position, setPosition] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        const handleMove = () => {
            setPosition((prev) => {
              const next = prev + 10 * direction;
              const maxWidth = window.innerWidth;
              if (next > maxWidth) {
                setDirection(-1);
                return maxWidth;
              } else if (next < 0) {
                setDirection(1);
                return 0;
              }
                return next;
            });
          };
      
          const interval = setInterval(handleMove, 100);
          return () => clearInterval(interval);
        }, [direction]);
  
    return (
      <div
        className="fixed bottom-10 w-90"
        style={{
          transform: `translateX(${position}px) scaleX(${direction===1 ? 1 : -1})`,
          transition: "transform 1s ease-in-out",
        }}
      >
        <Image src={sonicRunning} alt="Sonic Running" width={100} height={100} unoptimized />
      </div>
    );
}
