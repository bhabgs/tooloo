import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Trash2, FileJson, ChevronRight, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

// JSON 树节点组件
interface JsonNodeProps {
  keyName?: string
  value: unknown
  depth?: number
  isLast?: boolean
}

function JsonNode({ keyName, value, depth = 0, isLast = true }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(depth > 2)

  const getValueType = (val: unknown): string => {
    if (val === null) return "null"
    if (Array.isArray(val)) return "array"
    return typeof val
  }

  const type = getValueType(value)
  const isExpandable = type === "object" || type === "array"

  const renderValue = () => {
    if (value === null) {
      return <span className="text-orange-500">null</span>
    }
    if (type === "string") {
      return <span className="text-green-600">"{String(value)}"</span>
    }
    if (type === "number") {
      return <span className="text-blue-600">{String(value)}</span>
    }
    if (type === "boolean") {
      return <span className="text-purple-600">{String(value)}</span>
    }
    return null
  }

  const renderExpandable = () => {
    if (type === "array") {
      const arr = value as unknown[]
      if (arr.length === 0) return <span className="text-muted-foreground">[]</span>
      if (collapsed) {
        return (
          <span className="text-muted-foreground">
            [{arr.length} items]
          </span>
        )
      }
      return (
        <div className="ml-4 border-l border-border pl-2">
          {arr.map((item, index) => (
            <JsonNode
              key={index}
              keyName={String(index)}
              value={item}
              depth={depth + 1}
              isLast={index === arr.length - 1}
            />
          ))}
        </div>
      )
    }

    if (type === "object") {
      const obj = value as Record<string, unknown>
      const keys = Object.keys(obj)
      if (keys.length === 0) return <span className="text-muted-foreground">{"{}"}</span>
      if (collapsed) {
        return (
          <span className="text-muted-foreground">
            {"{"}...{keys.length} keys{"}"}
          </span>
        )
      }
      return (
        <div className="ml-4 border-l border-border pl-2">
          {keys.map((key, index) => (
            <JsonNode
              key={key}
              keyName={key}
              value={obj[key]}
              depth={depth + 1}
              isLast={index === keys.length - 1}
            />
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <div className={`py-0.5 ${!isLast ? "" : ""}`}>
      <div className="flex items-start gap-1">
        {isExpandable ? (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-0.5 hover:bg-muted rounded shrink-0 mt-0.5"
          >
            {collapsed ? (
              <ChevronRight className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <div className="flex-1 min-w-0">
          {keyName !== undefined && (
            <span className="text-red-600">"{keyName}"</span>
          )}
          {keyName !== undefined && <span className="text-foreground">: </span>}

          {isExpandable ? (
            <>
              <span
                className="text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setCollapsed(!collapsed)}
              >
                {type === "array" ? "[" : "{"}
              </span>
              {renderExpandable()}
              {!collapsed && (
                <span className="text-muted-foreground">
                  {type === "array" ? "]" : "}"}
                </span>
              )}
            </>
          ) : (
            renderValue()
          )}
        </div>
      </div>
    </div>
  )
}

// JSON 可视化组件
interface JsonViewerProps {
  data: unknown
}

function JsonViewer({ data }: JsonViewerProps) {
  return (
    <div className="p-4 rounded-lg bg-muted overflow-auto text-sm font-mono max-h-[500px]">
      <JsonNode value={data} />
    </div>
  )
}

export function JsonFormatterPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [parsedJson, setParsedJson] = useState<unknown>(null)
  const [error, setError] = useState("")
  const [indentSize, setIndentSize] = useState<"2" | "4">("2")
  const [viewMode, setViewMode] = useState<"format" | "tree">("format")
  const { copied, copy } = useCopy()

  const parseAndFormat = useCallback(() => {
    setError("")
    if (!input.trim()) {
      setError("请输入 JSON 数据")
      return
    }
    try {
      const parsed = JSON.parse(input)
      setParsedJson(parsed)
      setOutput(JSON.stringify(parsed, null, parseInt(indentSize)))
    } catch {
      setError("JSON 格式错误，请检查输入")
      setParsedJson(null)
    }
  }, [input, indentSize])

  const formatJson = () => {
    parseAndFormat()
  }

  const minifyJson = () => {
    setError("")
    if (!input.trim()) {
      setError("请输入 JSON 数据")
      return
    }
    try {
      const parsed = JSON.parse(input)
      setParsedJson(parsed)
      setOutput(JSON.stringify(parsed))
    } catch {
      setError("JSON 格式错误，请检查输入")
      setParsedJson(null)
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
    setParsedJson(null)
    setError("")
  }

  // 统计 JSON 信息
  const getJsonStats = (data: unknown): { keys: number; depth: number; size: string } => {
    let keys = 0
    let maxDepth = 0

    const traverse = (obj: unknown, depth: number) => {
      if (depth > maxDepth) maxDepth = depth
      if (obj === null || typeof obj !== "object") return

      if (Array.isArray(obj)) {
        obj.forEach((item) => traverse(item, depth + 1))
      } else {
        const entries = Object.keys(obj as Record<string, unknown>)
        keys += entries.length
        entries.forEach((key) => traverse((obj as Record<string, unknown>)[key], depth + 1))
      }
    }

    traverse(data, 0)
    const size = new Blob([JSON.stringify(data)]).size
    const sizeStr = size < 1024 ? `${size} B` : `${(size / 1024).toFixed(2)} KB`

    return { keys, depth: maxDepth, size: sizeStr }
  }

  const stats = parsedJson ? getJsonStats(parsedJson) : null

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileJson className="size-6" />}
        title="JSON 格式化"
        description="格式化、压缩、校验、可视化 JSON 数据"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入</CardTitle>
          <CardDescription>粘贴或输入需要处理的 JSON 数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='{"key": "value"}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>缩进:</Label>
              <Tabs value={indentSize} onValueChange={(v) => setIndentSize(v as "2" | "4")}>
                <TabsList>
                  <TabsTrigger value="2">2 空格</TabsTrigger>
                  <TabsTrigger value="4">4 空格</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex gap-2">
              <Button onClick={formatJson}>格式化</Button>
              <Button variant="outline" onClick={minifyJson}>压缩</Button>
              <Button variant="ghost" onClick={handleClear}>
                <Trash2 className="size-4" />
                清空
              </Button>
            </div>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">输出结果</CardTitle>
                {stats && (
                  <CardDescription>
                    {stats.keys} 个键 · 深度 {stats.depth} 层 · {stats.size}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "format" | "tree")}>
                  <TabsList>
                    <TabsTrigger value="format">格式化</TabsTrigger>
                    <TabsTrigger value="tree">可视化</TabsTrigger>
                  </TabsList>
                </Tabs>
                {viewMode === "format" && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "format" ? (
              <pre className="p-4 rounded-lg bg-muted overflow-auto text-sm font-mono whitespace-pre-wrap break-all max-h-[500px]">
                {output}
              </pre>
            ) : (
              <JsonViewer data={parsedJson} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
