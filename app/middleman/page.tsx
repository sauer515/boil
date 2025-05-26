'use client';

import { useState } from "react";
import TransportForm from "@/components/TransportForm"
import TransportTable from "@/components/TransportTable";
import ThemeToggle from "@/components/ThemeToggle";

export default function TransportPage() {
  const [suppliers, setSuppliers] = useState(0);
  const [recipients, setRecipients] = useState(0);
  const [tableVisible, setTableVisible] = useState(false);

  const handleSubmit = (s: number, r: number) => {
    setSuppliers(s);
    setRecipients(r);
    setTableVisible(true);
  };

  const resetForm = () => {
    setSuppliers(0);
    setRecipients(0);
    setTableVisible(false);
  };

  return (
    <div className="p-6">
      <div className='flex items-center justify-between mb-4'>
        <h1 className="text-2xl font-bold mb-4">Metoda Pośrednika</h1>
        <ThemeToggle />
      </div>
      {!tableVisible ? (
        <TransportForm onSubmit={handleSubmit} />
      ) : (
        <>
          <TransportTable suppliers={suppliers} recipients={recipients} />
          <div className="mt-4">
            <button
              onClick={resetForm}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Zacznij od nowa
            </button>
          </div>
        </>
      )}
    </div>
  );
}
