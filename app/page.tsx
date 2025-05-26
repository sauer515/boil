'use client';

import { useState } from "react";
import EventForm from "../components/EventForm";
import EventGraph from "../components/EventGraph";
import EventTab from "../components/EventTab";
import ThemeToggle from "../components/ThemeToggle";
import ResultTab from "../components/ResultTab";
import SonicAnimation from "@/components/SonicAnimation";

type EventData = {
  name: string;
  duration: number;
  predecessors?: string;
};

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [sonicRunning, setSonicRunning] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('graph');

  const addEvent = (event: EventData) => {
    setEvents([...events, event]);
    console.log("Dodane zdarzenie:", event);
  };

  const handleGenerate = () => {
    setShowResults(true);
    setSonicRunning(false);
    setViewMode('table');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">Krytyczna ścieżka</h1>
        <ThemeToggle />
      </div>
      <EventForm onAddEvent={addEvent} onGenerateGraph={handleGenerate} />

      {!showResults && <EventTab events={events} />}

      {sonicRunning && <SonicAnimation/>}

      {showResults && events.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-center space-x-2 mb-4 border-b pb-2">
             <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              Tabela CPM
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 rounded ${viewMode === 'graph' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              Graf zdarzeń
            </button>

          </div>
          {viewMode === 'table' && <ResultTab events={events} />}
          {viewMode === 'graph' && (
            <div className=" background-gray-100 dark:bg-gray-800 p-4 rounded shadow"> {/* Dodano tło i padding dla grafu */}
              <h2 className="text-xl font-bold mb-2 text-center">Graf zdarzeń</h2>
              <EventGraph events={events} />
              
              <div className='mt-2>'>
                Legenda: złote zdarzenia to zdarzenia krytyczne, a niebieskie to pozostałe zdarzenia.
              </div>
            </div>
          )}
        </div>
      )}
       {showResults && events.length === 0 && (
         <p className="text-red-500 dark:text-yellow-500 mt-4 text-center">Nie dodano żadnych zdarzeń do wygenerowania wyników.</p>
       )}
    </div>
  );
}
