import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout({ withSidebar = false }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-8">
        {withSidebar && <Sidebar />}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
