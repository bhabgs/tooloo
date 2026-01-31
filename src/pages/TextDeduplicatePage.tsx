import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Trash2, ListX } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

export function TextDeduplicatePage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [stats, setStats] = useState<{ original: number; deduplicated: number; removed: number } | null>(null)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [trimLines, setTrimLines] = useState(true)
  const [ignoreEmpty, setIgnoreEmpty] = useState(true)
  const [sortLines, setSortLines] = useState(false)
  const { copy } = useCopy()
  const [copied, setCopied] = useState(false)

  const handleDeduplicate = () => {
    if (!input.trim()) {
      toast.error("请输入文本")
      return
    }

    let lines = input.split("\n")
    const originalCount = lines.length

    // 去除空行
    if (ignoreEmpty) {
      lines = lines.filter(line => line.trim() !== "")
    }

    // 处理每行
    if (trimLines) {
      lines = lines.map(line => line.trim())
    }

    // 去重
    const seen = new Set<string>()
    const uniqueLines: string[] = []

    for (const line of lines) {
      const key = ignoreCase ? line.toLowerCase() : line
      if (!seen.has(key)) {
        seen.add(key)
        uniqueLines.push(line)
      }
    }

    // 排序
    let result = sortLines ? uniqueLines.sort((a, b) => a.localeCompare(b, 'zh-CN')) : uniqueLines

    setOutput(result.join("\n"))
    setStats({
      original: originalCount,
      deduplicated: result.length,
      removed: originalCount - result.length
    })
  }

  const handleCopy = async () => {
    if (!output) return
    const success = await copy(output)
    if (success) {
      setCopied(true)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setStats(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ListX className="size-6" />}
        title="文本去重"
        description="去除文本中的重复行，支持多种选项"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入文本</CardTitle>
          <CardDescription>每行一个条目，将自动去除重复行</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="输入文本，每行一个条目..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="trimLines" checked={trimLines} onCheckedChange={(v: boolean) => setTrimLines(!!v)} />
              <Label htmlFor="trimLines" className="text-sm">去除首尾空格</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ignoreCase" checked={ignoreCase} onCheckedChange={(v: boolean) => setIgnoreCase(!!v)} />
              <Label htmlFor="ignoreCase" className="text-sm">忽略大小写</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ignoreEmpty" checked={ignoreEmpty} onCheckedChange={(v: boolean) => setIgnoreEmpty(!!v)} />
              <Label htmlFor="ignoreEmpty" className="text-sm">去除空行</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="sortLines" checked={sortLines} onCheckedChange={(v: boolean) => setSortLines(!!v)} />
              <Label htmlFor="sortLines" className="text-sm">结果排序</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDeduplicate}>
              去除重复
            </Button>
            <Button variant="ghost" onClick={handleClear}>
              <Trash2 className="size-4 mr-1" />
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">去重结果</CardTitle>
              {stats && (
                <div className="text-sm text-muted-foreground">
                  原始 {stats.original} 行 → 去重后 {stats.deduplicated} 行（移除 {stats.removed} 行）
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={output}
                readOnly
                className="min-h-[200px] font-mono text-sm pr-12"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
