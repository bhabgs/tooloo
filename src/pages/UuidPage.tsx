import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Trash2, Lock, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

function generateUUID(): string {
  return crypto.randomUUID()
}

function generateNanoID(length: number = 21): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => alphabet[byte % alphabet.length]).join("")
}

export function UuidPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(5)
  const [format, setFormat] = useState<"standard" | "uppercase" | "nohyphen">("standard")
  const [type, setType] = useState<"uuid" | "nanoid">("uuid")
  const { copy } = useCopy()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const formatUUID = (uuid: string) => {
    switch (format) {
      case "uppercase":
        return uuid.toUpperCase()
      case "nohyphen":
        return uuid.replace(/-/g, "")
      default:
        return uuid
    }
  }

  const generate = () => {
    const newIds = Array.from({ length: count }, () => {
      if (type === "uuid") {
        return formatUUID(generateUUID())
      }
      return generateNanoID()
    })
    setUuids(newIds)
  }

  const handleCopy = async (value: string, index: number) => {
    const success = await copy(value)
    if (success) {
      setCopiedIndex(index)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  const handleCopyAll = async () => {
    if (uuids.length === 0) return
    const success = await copy(uuids.join("\n"))
    if (success) {
      toast.success("已复制全部到剪贴板")
    }
  }

  const handleClear = () => {
    setUuids([])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Lock className="size-6" />}
        title="UUID 生成器"
        description="生成随机 UUID/GUID 或 NanoID"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">生成配置</CardTitle>
          <CardDescription>选择生成类型和格式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Tabs value={type} onValueChange={(v) => setType(v as "uuid" | "nanoid")}>
                <TabsList className="w-full">
                  <TabsTrigger value="uuid" className="flex-1">UUID v4</TabsTrigger>
                  <TabsTrigger value="nanoid" className="flex-1">NanoID</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {type === "uuid" && (
              <div className="space-y-2">
                <Label>格式</Label>
                <Tabs value={format} onValueChange={(v) => setFormat(v as "standard" | "uppercase" | "nohyphen")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="standard" className="flex-1">标准</TabsTrigger>
                    <TabsTrigger value="uppercase" className="flex-1">大写</TabsTrigger>
                    <TabsTrigger value="nohyphen" className="flex-1">无连字符</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>生成数量</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">（最多 100 个）</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generate}>
              <RefreshCw className="size-4" />
              生成
            </Button>
            {uuids.length > 0 && (
              <>
                <Button variant="outline" onClick={handleCopyAll}>
                  <Copy className="size-4" />
                  复制全部
                </Button>
                <Button variant="ghost" onClick={handleClear}>
                  <Trash2 className="size-4" />
                  清空
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {uuids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">生成结果</CardTitle>
            <CardDescription>共 {uuids.length} 个</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={uuid} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(uuid, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
