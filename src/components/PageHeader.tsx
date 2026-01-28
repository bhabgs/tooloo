import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function PageHeader({ icon, title, description }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
      </div>
      <p className="text-muted-foreground ml-12">{description}</p>
    </div>
  )
}
