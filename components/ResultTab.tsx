import React from 'react';
import calculateCriticalPath from '../app/utils/cpm'; // Zaimportuj funkcję obliczającą CPM
import type { EventInput, EventData } from '../app/utils/cpm'; // Zaimportuj typy

interface CpmResultTabProps {
  events: EventInput[]; // Przyjmuje dane wejściowe dla CPM
}

const CpmResultTab: React.FC<CpmResultTabProps> = ({ events }) => {
  if (events.length === 0) {
    return null;
  }

  const calculatedEvents: EventData[] = calculateCriticalPath(events);

  if (calculatedEvents.length === 0) {
    return <p className="text-center text-gray-500 mt-4">Brak danych do wyświetlenia wyników CPM.</p>;
  }

  return (
    <div className="mt-6 mb-4 border rounded-lg overflow-hidden shadow-md">
      <h2 className="text-lg font-semibold p-3 bg-gray-100 dark:bg-black border-b">Wyniki analizy CPM</h2>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-black sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nazwa
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Czas trwania
              </th>
               <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poprzednicy
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ES
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EF
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LS
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LF
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rezerwa czasowa
              </th>
               <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ścieżka krytyczna
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
            {calculatedEvents.map((event, index) => (
              <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${event.timeReserve === 0 ? 'bg-red-100 dark:bg-red-900' : ''}`}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{event.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.duration}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.predecessors || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.earlyStart}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.earlyFinish}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.lateStart}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.lateFinish}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.timeReserve}</td>
                 <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">
                  {event.timeReserve === 0 ? <span className="text-red-600 dark:text-red-400">Tak</span> : 'Nie'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CpmResultTab;