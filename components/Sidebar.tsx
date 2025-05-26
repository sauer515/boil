'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-gray-200 dark:bg-gray-900 text-black dark:text-white p-4">
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/" className="hover:underline">Ścieżka krytyczna</Link>
        </li>
        <li>
          <Link href="/middleman" className="hover:underline">Pośrednik</Link>
        </li>
      </ul>
    </aside>
  );
}
