import React from "react";
import { Handle, Position } from "reactflow";

interface EventNodeProps {
  data: {
    name: string;
    duration: number;
    earlyStart?: number;
    earlyFinish?: number;
    lateStart?: number;
    lateFinish?: number;
    timeReserve?: number;
  };
}

export default function EventNode({ data }: EventNodeProps) {
  return (
    <div className={`border-2 border-black rounded-lg shadow-md p-2 text-center text-sm w-32
                    ${data.timeReserve === 0 ? "bg-yellow-400 text-black font-bold" : "bg-white"}`}>
      <Handle type="target" position={Position.Left} />                  
      <table className="w-full border-collapse border border-gray-600">
        <tbody>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 p-1">{data.earlyStart ?? "?"}</td>
            <td className="border border-gray-600 p-1">{data.duration}d</td>
            <td className="border border-gray-600 p-1">{data.earlyFinish ?? "?"}</td>
          </tr>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 p-1" colSpan={3}>
              {data.name}
            </td>
          </tr>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 p-1">{data.lateStart ?? "?"}</td>
            <td className="border border-gray-600 p-1">{data.timeReserve ?? "?"}</td>
            <td className="border border-gray-600 p-1">{data.lateFinish ?? "?"}</td>
          </tr>
        </tbody>
      </table>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
