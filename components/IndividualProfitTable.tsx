'use client';

import { TransportData, calculateProfits } from '@/app/utils/middlemanCalculations';

type Props = {
  data: TransportData;
};

export default function IndividualProfitTable({ data }: Props) {
  const profits = calculateProfits(data);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Zysk jednostkowy dróg</h3>
      <div className="overflow-auto">
        <table className="table-auto border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2"></th>
              {[...Array(data.recipients)].map((_, j) => (
                <th key={j} className="border border-gray-400 p-2 text-center">
                  Odbiorca {j + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(data.suppliers)].map((_, i) => (
              <tr key={i}>
                <td className="border border-gray-400 p-2 font-bold text-center">
                  Dostawca {i + 1}
                </td>
                {[...Array(data.recipients)].map((_, j) => (
                  <td key={j} className="border border-gray-400 p-1 text-center">
                    <div className="p-2">
                      <div className="font-bold text-lg">
                        {profits[i][j].toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {data.sellingPrices[j]} - {data.purchasePrices[i]} - {data.costs[i][j]}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Wzór: cena kupna - cena sprzedaży - koszt transportu
      </div>
    </div>
  );
}