// components/EventNode.tsx
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
  const isCritical = data.timeReserve === 0;
  
  return (
    <div className={`pixel-node rounded-lg p-2 min-w-[150px] ${isCritical ? 'bg-red-100' : 'bg-blue-100'}`}>
      <div className="pixel-node-container p-2 rounded-lg">
        <div className="font-bold text-center">{data.name}</div>
        <div className="text-xs grid grid-cols-2 gap-1 mt-2">
          <div>Czas: {data.duration}</div>
          <div>ES: {data.earlyStart}</div>
          <div>EF: {data.earlyFinish}</div>
          <div>LS: {data.lateStart}</div>
          <div>LF: {data.lateFinish}</div>
          <div>Zapas: {data.timeReserve}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-pink-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-3 !h-3" />
    </div>
  );
}