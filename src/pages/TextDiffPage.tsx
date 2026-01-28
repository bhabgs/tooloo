import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GitCompare, Trash2, ArrowLeftRight } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

interface DiffLine {
  type: "added" | "removed" | "unchanged"
  content: string
  lineNumber: { left?: number; right?: number }
}

function computeDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split("\n")
  const lines2 = text2.split("\n")

  // Simple LCS-based diff
  const m = lines1.length
  const n = lines2.length

  // Create LCS table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find diff
  const result: DiffLine[] = []
  let i = m, j = n
  const temp: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      temp.push({
        type: "unchanged",
        content: lines1[i - 1],
        lineNumber: { left: i, right: j }
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({
        type: "added",
        content: lines2[j - 1],
        lineNumber: { right: j }
      })
      j--
    } else if (i > 0) {
      temp.push({
        type: "removed",
        content: lines1[i - 1],
        lineNumber: { left: i }
      })
      i--
    }
  }

  // Reverse to get correct order
  for (let k = temp.length - 1; k >= 0; k--) {
    result.push(temp[k])
  }

  return result
}

export function TextDiffPage() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")

  const diff = useMemo(() => {
    if (!text1 && !text2) return []
    return computeDiff(text1, text2)
  }, [text1, text2])

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === "added").length
    const removed = diff.filter(d => d.type === "removed").length
    const unchanged = diff.filter(d => d.type === "unchanged").length
    return { added, removed, unchanged }
  }, [diff])

  const handleClear = () => {
    setText1("")
    setText2("")
  }

  const handleSwap = () => {
    const temp = text1
    setText1(text2)
    setText2(temp)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<GitCompare className="size-6" />}
        title="文本差异对比"
        description="对比两段文本的差异，高亮显示增删改"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">输入文本</CardTitle>
              <CardDescription>在左右两侧输入要对比的文本</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSwap}>
                <ArrowLeftRight className="size-4" />
                交换
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="size-4" />
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>原始文本</Label>
              <Textarea
                placeholder="输入原始文本..."
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>修改后文本</Label>
              <Textarea
                placeholder="输入修改后的文本..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {diff.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">对比结果</CardTitle>
                <CardDescription>
                  <span className="text-green-600">+{stats.added} 新增</span>
                  <span className="mx-2">·</span>
                  <span className="text-red-600">-{stats.removed} 删除</span>
                  <span className="mx-2">·</span>
                  <span className="text-muted-foreground">{stats.unchanged} 未变</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full text-sm font-mono">
                  <tbody>
                    {diff.map((line, index) => (
                      <tr
                        key={index}
                        className={
                          line.type === "added"
                            ? "bg-green-50 dark:bg-green-950/30"
                            : line.type === "removed"
                            ? "bg-red-50 dark:bg-red-950/30"
                            : ""
                        }
                      >
                        <td className="w-10 px-2 py-1 text-right text-muted-foreground border-r select-none">
                          {line.lineNumber.left || ""}
                        </td>
                        <td className="w-10 px-2 py-1 text-right text-muted-foreground border-r select-none">
                          {line.lineNumber.right || ""}
                        </td>
                        <td className="w-6 px-2 py-1 text-center border-r select-none">
                          {line.type === "added" && <span className="text-green-600">+</span>}
                          {line.type === "removed" && <span className="text-red-600">-</span>}
                        </td>
                        <td className="px-3 py-1 whitespace-pre-wrap break-all">
                          <span
                            className={
                              line.type === "added"
                                ? "text-green-700 dark:text-green-400"
                                : line.type === "removed"
                                ? "text-red-700 dark:text-red-400"
                                : ""
                            }
                          >
                            {line.content || " "}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
