'use client'

import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}