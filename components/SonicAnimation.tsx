import { useEffect, useState } from "react";
import Image from "next/image";
import sonicRunning from "@/public/sonic_running.gif";
import { useTheme } from "next-themes";
import shadowRunning from "@/public/shadow_running.gif";

export default function SonicAnimation() {
    const [position, setPosition] = useState(0);
    const [direction, setDirection] = useState(1);
    const { theme } = useTheme();

    useEffect(() => {
        const handleMove = () => {
            setPosition((prev) => {
              const maxWidth = window.innerWidth-150; // Adjust for the width of the image
              const next = prev + 10 * direction;
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
        className="bottom-10 w-90"
        style={{
          transform: `translateX(${position}px) scaleX(${direction===1 ? 1 : -1})`,
          transition: "transform 0.5s linear",
        }}
      >
        {theme === "dark" ? 
        <Image src={shadowRunning} alt="Sonic Running" width={150} height={150} unoptimized />
        :
        <Image src={sonicRunning} alt="Sonic Running" width={100} height={100} unoptimized className="invert" />
        }
        
      </div>
    );
}
