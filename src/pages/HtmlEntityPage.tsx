import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Trash2, Code, ArrowDownUp } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  " ": "&nbsp;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "€": "&euro;",
  "£": "&pound;",
  "¥": "&yen;",
  "¢": "&cent;",
  "§": "&sect;",
  "°": "&deg;",
  "±": "&plusmn;",
  "×": "&times;",
  "÷": "&divide;",
  "←": "&larr;",
  "→": "&rarr;",
  "↑": "&uarr;",
  "↓": "&darr;",
  "♠": "&spades;",
  "♣": "&clubs;",
  "♥": "&hearts;",
  "♦": "&diams;",
}

const reverseEntities: Record<string, string> = Object.fromEntries(
  Object.entries(htmlEntities).map(([k, v]) => [v, k])
)

function encodeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char)
}

function encodeHtmlFull(text: string): string {
  return text
    .split("")
    .map((char) => {
      if (htmlEntities[char]) return htmlEntities[char]
      const code = char.charCodeAt(0)
      if (code > 127) return `&#${code};`
      return char
    })
    .join("")
}

function decodeHtml(text: string): string {
  return text
    .replace(/&[a-zA-Z]+;/g, (entity) => reverseEntities[entity] || entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

export function HtmlEntityPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const { copy } = useCopy()
  const [copied, setCopied] = useState(false)

  const handleEncode = (full = false) => {
    if (!input.trim()) {
      toast.error("请输入文本")
      return
    }
    setMode("encode")
    setOutput(full ? encodeHtmlFull(input) : encodeHtml(input))
  }

  const handleDecode = () => {
    if (!input.trim()) {
      toast.error("请输入文本")
      return
    }
    setMode("decode")
    setOutput(decodeHtml(input))
  }

  const handleSwap = () => {
    setInput(output)
    setOutput("")
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
  }

  const commonEntities = [
    { char: "&", entity: "&amp;" },
    { char: "<", entity: "&lt;" },
    { char: ">", entity: "&gt;" },
    { char: '"', entity: "&quot;" },
    { char: "'", entity: "&#39;" },
    { char: " ", entity: "&nbsp;" },
    { char: "©", entity: "&copy;" },
    { char: "®", entity: "&reg;" },
    { char: "™", entity: "&trade;" },
    { char: "→", entity: "&rarr;" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Code className="size-6" />}
        title="HTML 实体编解码"
        description="HTML 特殊字符与实体编码互转"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入</CardTitle>
          <CardDescription>输入需要编码或解码的文本</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="输入文本，例如：<div>Hello</div> 或 &lt;div&gt;Hello&lt;/div&gt;"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleEncode(false)}>
              编码（基本）
            </Button>
            <Button variant="outline" onClick={() => handleEncode(true)}>
              编码（完整）
            </Button>
            <Button variant="outline" onClick={handleDecode}>
              解码
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
              <CardTitle className="text-lg">
                {mode === "encode" ? "编码结果" : "解码结果"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleSwap}>
                <ArrowDownUp className="size-4 mr-1" />
                交换输入输出
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={output}
                readOnly
                className="min-h-[120px] font-mono text-sm pr-12"
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">常用 HTML 实体</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {commonEntities.map(({ char, entity }) => (
              <div
                key={entity}
                className="flex items-center justify-between p-2 bg-muted rounded text-sm font-mono"
              >
                <span className="text-lg">{char === " " ? "␣" : char}</span>
                <span className="text-muted-foreground text-xs">{entity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
