import { Link, Outlet } from "react-router-dom"
import { Wrench } from "lucide-react"

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[960px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Wrench className="size-5" />
            <span>Tooloo</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              首页
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[960px] mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="max-w-[960px] mx-auto px-4 text-center text-sm text-muted-foreground">
          Tooloo - 网页实用工具大全
        </div>
      </footer>
    </div>
  )
}
