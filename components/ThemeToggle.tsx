// filepath: components/ThemeToggle.tsx
'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button" 
import Image  from 'next/image'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      className="w-20 h-20 p-0 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Image  src="shadow.svg" alt="icon" width={50} height={50} className="h-15 w-15" />
      ) : 
      ( 
        <Image src="sonic.svg" alt="icon" width={50} height={50} className="h-15 w-15" />
      ) }
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}