'use client';

import { useState } from "react";
import EventForm from "../components/EventForm";
import EventGraph from "../components/EventGraph";
import SonicAnimation from "@/components/SonicAnimation";

type EventData = {
  name: string;
  duration: number;
  predecessors?: string;
};

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [sonicRunning, setSonicRunning] = useState(true);

  const addEvent = (event: EventData) => {
    setEvents([...events, event]);
    console.log("Dodane zdarzenie:", event);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Krytyczna ścieżka</h1>
      <EventForm onAddEvent={addEvent} onGenerateGraph={() => {setShowGraph(true); setSonicRunning(false)}} />

      {sonicRunning && <SonicAnimation/>}

      {showGraph && events.length > 0 && (
        <div className=" background-gray-100">
          <h2 className="text-xl font-bold mb-2">Graf zdarzeń</h2>
          <EventGraph events={events} />
        </div>
      )}
    </div>
  );
}
