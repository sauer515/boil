'use client';

import { Solution } from '@/app/utils/middlemanCalculations';

type Props = {
  solution: Solution;
};

export default function OptimalTransportTable({ solution }: Props) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Rozwiązanie optymalne</h3>
      <p className="mb-4 text-lg">
        <span className="font-bold">Łączny zysk: </span>
        <span className="text-green-600 dark:text-green-400 font-bold">
          {solution.totalProfit.toFixed(2)}
        </span>
      </p>
      
      <div className="overflow-auto">
        <table className="table-auto border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2 bg-gray-100 dark:bg-gray-700">Droga</th>
              <th className="border border-gray-400 p-2 bg-gray-100 dark:bg-gray-700">Przydział</th>
              <th className="border border-gray-400 p-2 bg-gray-100 dark:bg-gray-700">Zysk jednostkowy</th>
              <th className="border border-gray-400 p-2 bg-gray-100 dark:bg-gray-700">Łączny zysk drogi</th>
            </tr>
          </thead>
          <tbody>
            {solution.allocation.map((row, i) =>
              row.map((allocation, j) =>
                allocation > 0 ? (
                  <tr key={`${i}-${j}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="border border-gray-400 p-2 font-medium">
                      Dostawca {i + 1} → Odbiorca {j + 1}
                    </td>
                    <td className="border border-gray-400 p-2 text-center font-bold">
                      {allocation}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      {solution.profits[i][j].toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-600 dark:text-green-400">
                      {(allocation * solution.profits[i][j]).toFixed(2)}
                    </td>
                  </tr>
                ) : null
              )
            )}
          </tbody>
        </table>
      </div>
      
      {solution.allocation.every(row => row.every(cell => cell === 0)) && (
        <p className="text-red-500 dark:text-red-400 mt-4 text-center">
          Upsi błęd! Nie znaleziono żadnych przydziałów. Sprawdź dane wejściowe.
        </p>
      )}
    </div>
  );
}