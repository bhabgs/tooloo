import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Calculator, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface BaseValues {
  binary: string
  octal: string
  decimal: string
  hex: string
}

export function NumberBasePage() {
  const [values, setValues] = useState<BaseValues>({
    binary: "",
    octal: "",
    decimal: "",
    hex: ""
  })
  const [error, setError] = useState("")
  const { copy } = useCopy()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const convertFromBase = (value: string, fromBase: number) => {
    setError("")
    if (!value.trim()) {
      setValues({ binary: "", octal: "", decimal: "", hex: "" })
      return
    }

    try {
      const decimal = parseInt(value, fromBase)
      if (isNaN(decimal)) {
        throw new Error("Invalid number")
      }

      setValues({
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        decimal: decimal.toString(10),
        hex: decimal.toString(16).toUpperCase()
      })
    } catch {
      setError("输入的数值格式不正确")
    }
  }

  const handleCopy = async (value: string, field: string) => {
    if (!value) return
    const success = await copy(value)
    if (success) {
      setCopiedField(field)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const handleClear = () => {
    setValues({ binary: "", octal: "", decimal: "", hex: "" })
    setError("")
  }

  const bases = [
    { key: "binary", label: "二进制 (Binary)", base: 2, placeholder: "1010" },
    { key: "octal", label: "八进制 (Octal)", base: 8, placeholder: "12" },
    { key: "decimal", label: "十进制 (Decimal)", base: 10, placeholder: "10" },
    { key: "hex", label: "十六进制 (Hex)", base: 16, placeholder: "A" }
  ] as const

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Calculator className="size-6" />}
        title="进制转换"
        description="二进制、八进制、十进制、十六进制互转"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">进制转换</CardTitle>
              <CardDescription>在任意输入框中输入数值，其他进制会自动计算</CardDescription>
            </div>
            <Button variant="ghost" onClick={handleClear}>
              <Trash2 className="size-4" />
              清空
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bases.map(({ key, label, base, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    value={values[key]}
                    onChange={(e) => convertFromBase(e.target.value, base)}
                    placeholder={placeholder}
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(values[key], key)}
                    disabled={!values[key]}
                  >
                    {copiedField === key ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">进制说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p><strong>二进制 (Binary)</strong>: 使用 0 和 1，基数为 2</p>
              <p><strong>八进制 (Octal)</strong>: 使用 0-7，基数为 8</p>
            </div>
            <div>
              <p><strong>十进制 (Decimal)</strong>: 使用 0-9，基数为 10</p>
              <p><strong>十六进制 (Hex)</strong>: 使用 0-9 和 A-F，基数为 16</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
