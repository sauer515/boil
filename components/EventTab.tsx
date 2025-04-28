// filepath: c:\Users\szcze\boil-project\components\EventTab.tsx
import React from 'react';

type EventData = {
  name: string;
  duration: number;
  predecessors?: string;
};

interface EventTabProps {
  events: EventData[];
}

const EventTab: React.FC<EventTabProps> = ({ events }) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 mb-4 border rounded-lg overflow-hidden shadow-md">
      <h2 className="text-lg font-semibold p-3 bg-gray-100 dark:bg-black border-b">Dodane zdarzenia</h2>
      <div className="max-h-60 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-black sticky top-0">
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
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{event.duration}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{event.predecessors || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventTab;