import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Regex, Trash2, Copy, Check } from "lucide-react"
import { useCopy } from "@/hooks/useCopy"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface MatchResult {
  match: string
  index: number
  groups: string[]
}

const commonPatterns = [
  { name: "邮箱", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { name: "手机号", pattern: "1[3-9]\\d{9}" },
  { name: "URL", pattern: "https?://[\\w\\-._~:/?#[\\]@!$&'()*+,;=%]+" },
  { name: "IP地址", pattern: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}" },
  { name: "日期", pattern: "\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}" },
  { name: "中文字符", pattern: "[\\u4e00-\\u9fa5]+" },
  { name: "HTML标签", pattern: "<[^>]+>" },
  { name: "数字", pattern: "-?\\d+\\.?\\d*" }
]

export function RegexTesterPage() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [testText, setTestText] = useState("")
  const [error, setError] = useState("")
  const { copied, copy } = useCopy()

  const { matches, highlightedText } = useMemo(() => {
    if (!pattern || !testText) {
      return { matches: [], highlightedText: testText }
    }

    try {
      const regex = new RegExp(pattern, flags)
      setError("")

      const results: MatchResult[] = []
      let match: RegExpExecArray | null

      if (flags.includes("g")) {
        while ((match = regex.exec(testText)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      } else {
        match = regex.exec(testText)
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }

      // Create highlighted text
      const parts: { text: string; isMatch: boolean }[] = []
      let lastIndex = 0

      for (const result of results) {
        if (result.index > lastIndex) {
          parts.push({ text: testText.slice(lastIndex, result.index), isMatch: false })
        }
        parts.push({ text: result.match, isMatch: true })
        lastIndex = result.index + result.match.length
      }

      if (lastIndex < testText.length) {
        parts.push({ text: testText.slice(lastIndex), isMatch: false })
      }

      return { matches: results, highlightedText: parts }
    } catch (err) {
      setError((err as Error).message)
      return { matches: [], highlightedText: [] }
    }
  }, [pattern, flags, testText])

  const handleClear = () => {
    setPattern("")
    setTestText("")
    setError("")
  }

  const handleCopyPattern = async () => {
    if (!pattern) return
    const fullPattern = `/${pattern}/${flags}`
    const success = await copy(fullPattern)
    if (success) {
      toast.success("已复制正则表达式")
    }
  }

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""))
    } else {
      setFlags(flags + flag)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Regex className="size-6" />}
        title="正则表达式测试"
        description="实时测试正则表达式，高亮匹配结果"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">正则表达式</CardTitle>
              <CardDescription>输入正则表达式模式</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="size-4" />
              清空
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1 border rounded-md px-3 bg-muted/50">
              <span className="text-muted-foreground">/</span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                className="border-0 bg-transparent px-0 focus-visible:ring-0 font-mono"
              />
              <span className="text-muted-foreground">/</span>
              <span className="text-primary font-mono">{flags}</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyPattern}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm">修饰符:</Label>
            {[
              { flag: "g", label: "全局 (g)" },
              { flag: "i", label: "忽略大小写 (i)" },
              { flag: "m", label: "多行 (m)" },
              { flag: "s", label: "单行 (s)" }
            ].map(({ flag, label }) => (
              <Badge
                key={flag}
                variant={flags.includes(flag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFlag(flag)}
              >
                {label}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Label className="text-sm w-full">常用模式:</Label>
            {commonPatterns.map((p) => (
              <Badge
                key={p.name}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setPattern(p.pattern)}
              >
                {p.name}
              </Badge>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">测试文本</CardTitle>
          <CardDescription>输入要测试的文本内容</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="输入测试文本..."
            className="min-h-[150px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {testText && pattern && !error && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">匹配结果</CardTitle>
              <CardDescription>
                找到 {matches.length} 个匹配
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted font-mono text-sm whitespace-pre-wrap break-all">
                {Array.isArray(highlightedText) && highlightedText.map((part, index) => (
                  <span
                    key={index}
                    className={part.isMatch ? "bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded" : ""}
                  >
                    {part.text}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">匹配详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">#</th>
                        <th className="px-4 py-2 text-left font-medium">匹配内容</th>
                        <th className="px-4 py-2 text-left font-medium">位置</th>
                        <th className="px-4 py-2 text-left font-medium">捕获组</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-2 font-mono break-all">{match.match}</td>
                          <td className="px-4 py-2 text-muted-foreground">{match.index}</td>
                          <td className="px-4 py-2 font-mono">
                            {match.groups.length > 0
                              ? match.groups.map((g, i) => (
                                  <Badge key={i} variant="outline" className="mr-1">
                                    ${i + 1}: {g}
                                  </Badge>
                                ))
                              : <span className="text-muted-foreground">-</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
