'use client';

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function TransportForm({ onSubmit }: { onSubmit: (suppliers: number, recipients: number) => void }) {
  const { theme, setTheme } = useTheme();
  const [suppliers, setSuppliers] = useState(0);
  const [recipients, setRecipients] = useState(0);

  return (
    <div className="flex gap-6 justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded shadow-md">
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Ilość dostawców</label>
          <input
            type="number"
            min={1}
            className="border rounded p-2 w-100 border-blue-500"
            value={suppliers}
            onChange={(e) => setSuppliers(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Ilość odbiorców</label>
          <input
            type="number"
            min={1}
            className="border rounded p-2 w-100 border-blue-500"
            value={recipients}
            onChange={(e) => setRecipients(Number(e.target.value))}
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => onSubmit(suppliers, recipients)}
        >
          Gotowe
        </button>
      </div>
        <div className="hidden md:block">
            <Image
            src={theme === "dark" ? "/shadow-transport.png" : "/sonic-transport.png"}
            alt="Transport"
            width={theme === "dark" ? 150 : 175}
            height={theme === "dark" ? 150 : 175}
            className="rounded-lg"
            />
        </div>
    </div>
  );
}
