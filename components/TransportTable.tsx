'use client';

import { useState } from "react";

export default function TransportTable({
  suppliers,
  recipients,
}: {
  suppliers: number;
  recipients: number;
}) {
  const [costs, setCosts] = useState<number[][]>(
    Array.from({ length: suppliers }, () => Array(recipients).fill(0))
  );
  const [supply, setSupply] = useState<number[]>(Array(suppliers).fill(0));
  const [purchasePrices, setPurchasePrices] = useState<number[]>(Array(suppliers).fill(0));
  const [demand, setDemand] = useState<number[]>(Array(recipients).fill(0));
  const [sellingPrices, setSellingPrices] = useState<number[]>(Array(recipients).fill(0));

  const handleCostChange = (i: number, j: number, value: number) => {
    const updated = [...costs];
    updated[i][j] = value;
    setCosts(updated);
  };

  return (
    <div className="overflow-auto mt-6">
      <table className="table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-400 p-2"></th>
            {[...Array(recipients)].map((_, j) => (
              <th key={j} className="border border-gray-400 p-2 text-center">
                Odbiorca {j + 1}
              </th>
            ))}
            <th className="border border-gray-400 p-2">Podaż</th>
            <th className="border border-gray-400 p-2">Cena zakupu</th>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold text-center">Popyt</td>
            {demand.map((val, j) => (
              <td key={j} className="border border-gray-400 p-1">
                <input
                  type="number"
                  className="w-20 p-1 border rounded text-center"
                  value={val}
                  onChange={(e) =>
                    setDemand((prev) =>
                      prev.map((v, idx) => (idx === j ? +e.target.value : v))
                    )
                  }
                />
              </td>
            ))}
            <td className="border border-gray-400"></td>
            <td className="border border-gray-400"></td>
          </tr>
        </thead>
        <tbody>
          {[...Array(suppliers)].map((_, i) => (
            <tr key={i}>
              <td className="border border-gray-400 p-2 font-bold text-center">
                Dostawca {i + 1}
              </td>
              {[...Array(recipients)].map((_, j) => (
                <td key={j} className="border border-gray-400 p-1">
                  <input
                    type="number"
                    className="w-20 p-1 border rounded text-center bg-orange-300"
                    value={costs[i][j]}
                    onChange={(e) => handleCostChange(i, j, +e.target.value)}
                  />
                </td>
              ))}
              <td className="border border-gray-400 p-1">
                <input
                  type="number"
                  className="w-20 p-1 border rounded text-center"
                  value={supply[i]}
                  onChange={(e) =>
                    setSupply((prev) =>
                      prev.map((v, idx) => (idx === i ? +e.target.value : v))
                    )
                  }
                />
              </td>
              <td className="border border-gray-400 p-1">
                <input
                  type="number"
                  className="w-20 p-1 border rounded text-center"
                  value={purchasePrices[i]}
                  onChange={(e) =>
                    setPurchasePrices((prev) =>
                      prev.map((v, idx) => (idx === i ? +e.target.value : v))
                    )
                  }
                />
              </td>
            </tr>
          ))}
          <tr>
            <td className="border border-gray-400 p-2 font-bold text-center">
              Cena sprzedaży
            </td>
            {[...Array(recipients)].map((_, j) => (
              <td key={j} className="border border-gray-400 p-1">
                <input
                  type="number"
                  className="w-20 p-1 border rounded text-center"
                  value={sellingPrices[j]}
                  onChange={(e) =>
                    setSellingPrices((prev) =>
                      prev.map((v, idx) => (idx === j ? +e.target.value : v))
                    )
                  }
                />
              </td>
            ))}
            <td className="border border-gray-400"></td>
            <td className="border border-gray-400"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
