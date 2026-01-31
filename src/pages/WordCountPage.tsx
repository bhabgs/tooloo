import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

interface Stats {
  characters: number
  charactersNoSpace: number
  words: number
  lines: number
  paragraphs: number
  sentences: number
  chineseChars: number
  englishWords: number
}

export function WordCountPage() {
  const [text, setText] = useState("")

  const stats = useMemo<Stats>(() => {
    const characters = text.length
    const charactersNoSpace = text.replace(/\s/g, "").length
    const lines = text ? text.split("\n").length : 0
    const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    const sentences = text ? (text.match(/[.!?。！？]+/g) || []).length : 0

    // 中文字符
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length

    // 英文单词
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length

    // 总词数（中文按字算，英文按单词算）
    const words = chineseChars + englishWords

    return {
      characters,
      charactersNoSpace,
      words,
      lines,
      paragraphs,
      sentences,
      chineseChars,
      englishWords
    }
  }, [text])

  const statItems = [
    { label: "总字符数", value: stats.characters },
    { label: "字符数（不含空格）", value: stats.charactersNoSpace },
    { label: "总词数", value: stats.words },
    { label: "中文字数", value: stats.chineseChars },
    { label: "英文单词", value: stats.englishWords },
    { label: "行数", value: stats.lines },
    { label: "段落数", value: stats.paragraphs },
    { label: "句子数", value: stats.sentences },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText className="size-6" />}
        title="字数统计"
        description="统计文本的字符数、单词数、行数等信息"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">输入文本</CardTitle>
              <CardDescription>输入或粘贴需要统计的文本</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="在这里输入或粘贴文本..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">统计结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {statItems.map((item) => (
                  <div key={item.label} className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{item.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
