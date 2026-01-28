import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { KeyRound, Trash2, Copy, Check, AlertCircle } from "lucide-react"
import { useCopy } from "@/hooks/useCopy"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface JwtParts {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function decodeBase64Url(str: string): string {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  // Add padding if needed
  const padding = base64.length % 4
  if (padding) {
    base64 += "=".repeat(4 - padding)
  }
  return atob(base64)
}

function parseJwt(token: string): JwtParts | null {
  try {
    const parts = token.trim().split(".")
    if (parts.length !== 3) return null

    const header = JSON.parse(decodeBase64Url(parts[0]))
    const payload = JSON.parse(decodeBase64Url(parts[1]))
    const signature = parts[2]

    return { header, payload, signature }
  } catch {
    return null
  }
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

function isExpired(exp: number): boolean {
  return Date.now() > exp * 1000
}

const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

export function JwtParserPage() {
  const [token, setToken] = useState("")
  const { copy } = useCopy()
  const [copiedPart, setCopiedPart] = useState<string | null>(null)

  const parsed = useMemo(() => {
    if (!token.trim()) return null
    return parseJwt(token)
  }, [token])

  const handleCopyPart = async (content: string, part: string) => {
    const success = await copy(JSON.stringify(content, null, 2))
    if (success) {
      setCopiedPart(part)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedPart(null), 2000)
    }
  }

  const handleClear = () => {
    setToken("")
  }

  const handleLoadSample = () => {
    setToken(sampleJwt)
  }

  const tokenStatus = useMemo(() => {
    if (!parsed) return null

    const exp = parsed.payload.exp as number | undefined
    if (!exp) return { status: "unknown", message: "无过期时间" }

    if (isExpired(exp)) {
      return { status: "expired", message: "已过期" }
    }

    const remainingMs = exp * 1000 - Date.now()
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (remainingDays > 0) {
      return { status: "valid", message: `${remainingDays} 天 ${remainingHours} 小时后过期` }
    } else if (remainingHours > 0) {
      return { status: "valid", message: `${remainingHours} 小时后过期` }
    } else {
      return { status: "warning", message: "即将过期" }
    }
  }, [parsed])

  const renderValue = (key: string, value: unknown): React.ReactNode => {
    // Timestamp fields
    if ((key === "exp" || key === "iat" || key === "nbf") && typeof value === "number") {
      const isExp = key === "exp"
      const expired = isExp && isExpired(value)
      return (
        <div className="space-y-1">
          <span className={expired ? "text-red-500" : ""}>{value}</span>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(value)}
            {expired && <span className="text-red-500 ml-2">(已过期)</span>}
          </p>
        </div>
      )
    }

    if (typeof value === "object") {
      return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
    }

    return String(value)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<KeyRound className="size-6" />}
        title="JWT 解析"
        description="解析 JWT Token，查看 Header 和 Payload"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">输入 JWT</CardTitle>
              <CardDescription>粘贴 JWT Token 进行解析</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLoadSample}>
                示例
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="size-4" />
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="min-h-[100px] font-mono text-sm"
          />

          {token && !parsed && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>无效的 JWT 格式</AlertDescription>
            </Alert>
          )}

          {tokenStatus && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  tokenStatus.status === "expired"
                    ? "destructive"
                    : tokenStatus.status === "warning"
                    ? "secondary"
                    : "default"
                }
              >
                {tokenStatus.message}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {parsed && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Header</CardTitle>
                  <CardDescription>算法和类型信息</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPart(parsed.header as unknown as string, "header")}
                >
                  {copiedPart === "header" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  复制
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(parsed.header).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <td className="px-4 py-2 font-medium bg-muted/50 w-1/3">{key}</td>
                        <td className="px-4 py-2 font-mono">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Payload</CardTitle>
                  <CardDescription>Token 载荷数据</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPart(parsed.payload as unknown as string, "payload")}
                >
                  {copiedPart === "payload" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  复制
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(parsed.payload).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <td className="px-4 py-2 font-medium bg-muted/50 w-1/3 align-top">{key}</td>
                        <td className="px-4 py-2 font-mono">{renderValue(key, value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signature</CardTitle>
              <CardDescription>签名部分（无法解密，仅用于验证）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted font-mono text-sm break-all">
                {parsed.signature}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">常用字段说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">iss</p>
                  <p className="text-muted-foreground">签发者</p>
                </div>
                <div>
                  <p className="font-medium">sub</p>
                  <p className="text-muted-foreground">主题/用户ID</p>
                </div>
                <div>
                  <p className="font-medium">aud</p>
                  <p className="text-muted-foreground">接收方</p>
                </div>
                <div>
                  <p className="font-medium">exp</p>
                  <p className="text-muted-foreground">过期时间</p>
                </div>
                <div>
                  <p className="font-medium">iat</p>
                  <p className="text-muted-foreground">签发时间</p>
                </div>
                <div>
                  <p className="font-medium">nbf</p>
                  <p className="text-muted-foreground">生效时间</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
