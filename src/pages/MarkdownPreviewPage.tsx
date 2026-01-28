import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Copy, Check, Trash2, Download } from "lucide-react"
import { useCopy } from "@/hooks/useCopy"
import { toast } from "sonner"
import { marked } from "marked"
import { PageHeader } from "@/components/PageHeader"

const defaultMarkdown = `# Markdown 预览

这是一个 **Markdown 预览** 工具，支持实时渲染。

## 功能特性

- 实时预览
- 代码高亮
- 表格支持
- 任务列表

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## 表格

| 名称 | 描述 |
|------|------|
| React | 前端框架 |
| TypeScript | 类型系统 |

## 任务列表

- [x] 已完成
- [ ] 未完成

> 引用文本

---

[链接](https://example.com)
`

export function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [viewMode, setViewMode] = useState<"split" | "preview">("split")
  const { copied, copy } = useCopy()

  const html = useMemo(() => {
    try {
      return marked(markdown, { breaks: true, gfm: true })
    } catch {
      return "<p>Markdown 解析错误</p>"
    }
  }, [markdown])

  const handleCopy = async () => {
    const success = await copy(markdown)
    if (success) {
      toast.success("已复制 Markdown 源码")
    }
  }

  const handleCopyHtml = async () => {
    const success = await copy(html as string)
    if (success) {
      toast.success("已复制 HTML")
    }
  }

  const handleClear = () => {
    setMarkdown("")
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "document.md"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("已下载 Markdown 文件")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText className="size-6" />}
        title="Markdown 预览"
        description="实时预览 Markdown 文档，支持 GFM 语法"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg">编辑器</CardTitle>
              <CardDescription>输入 Markdown 内容</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "split" | "preview")}>
                <TabsList>
                  <TabsTrigger value="split">分栏</TabsTrigger>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                复制 MD
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyHtml}>
                <Copy className="size-4" />
                复制 HTML
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4" />
                下载
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${viewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            {viewMode === "split" && (
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="输入 Markdown..."
                className="min-h-[500px] font-mono text-sm resize-none"
              />
            )}
            <div
              className={`prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg overflow-auto ${
                viewMode === "split" ? "min-h-[500px] max-h-[500px]" : "min-h-[600px]"
              }`}
              dangerouslySetInnerHTML={{ __html: html as string }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">快捷语法参考</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">标题</p>
              <code className="text-xs bg-muted px-1 py-0.5 rounded"># H1</code>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">## H2</code>
            </div>
            <div className="space-y-1">
              <p className="font-medium">强调</p>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">**粗体**</code>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">*斜体*</code>
            </div>
            <div className="space-y-1">
              <p className="font-medium">列表</p>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">- 无序</code>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">1. 有序</code>
            </div>
            <div className="space-y-1">
              <p className="font-medium">其他</p>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">[链接](url)</code>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">`代码`</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
