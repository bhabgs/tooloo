import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

export function UrlCodecPage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const { copied, copy } = useCopy()

  const handleEncode = () => {
    setError("")
    if (!input.trim()) {
      setError("请输入内容")
      return
    }
    try {
      setOutput(encodeURIComponent(input))
    } catch {
      setError("编码失败")
    }
  }

  const handleDecode = () => {
    setError("")
    if (!input.trim()) {
      setError("请输入内容")
      return
    }
    try {
      setOutput(decodeURIComponent(input))
    } catch {
      setError("解码失败，请确保输入有效的 URL 编码字符串")
    }
  }

  const handleProcess = () => {
    if (mode === "encode") {
      handleEncode()
    } else {
      handleDecode()
    }
  }

  const handleCopy = async () => {
    if (!output) return
    const success = await copy(output)
    if (success) {
      toast.success("已复制到剪贴板")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  const handleSwap = () => {
    setInput(output)
    setOutput("")
    setError("")
    setMode(mode === "encode" ? "decode" : "encode")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText className="size-6" />}
        title="URL 编解码"
        description="URL 编码与解码转换"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">操作模式</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => { setMode(v as "encode" | "decode"); setError(""); }}>
            <TabsList>
              <TabsTrigger value="encode">编码</TabsTrigger>
              <TabsTrigger value="decode">解码</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入</CardTitle>
          <CardDescription>
            {mode === "encode" ? "输入需要编码的 URL 或文本" : "输入需要解码的 URL 编码字符串"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={mode === "encode" ? "https://example.com/路径?参数=值" : "%E4%B8%AD%E6%96%87"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleProcess}>
              {mode === "encode" ? "编码" : "解码"}
            </Button>
            <Button variant="outline" onClick={handleSwap} disabled={!output}>
              交换输入输出
            </Button>
            <Button variant="ghost" onClick={handleClear}>
              <Trash2 className="size-4" />
              清空
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">输出结果</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-muted overflow-auto text-sm font-mono whitespace-pre-wrap break-all">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
