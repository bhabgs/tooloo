import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, RefreshCw, FileText } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum"
]

const chineseWords = [
  "这是", "一段", "测试", "文本", "用于", "排版", "设计",
  "展示", "效果", "模拟", "真实", "内容", "填充", "页面",
  "布局", "样式", "字体", "段落", "标题", "正文", "显示",
  "开发", "设计师", "使用", "常见", "占位", "文字", "生成",
  "随机", "组合", "语句", "中文", "预览", "界面", "元素",
  "配置", "参数", "选项", "功能", "工具", "网页", "应用"
]

function generateLoremWord(): string {
  return loremWords[Math.floor(Math.random() * loremWords.length)]
}

function generateChineseWord(): string {
  return chineseWords[Math.floor(Math.random() * chineseWords.length)]
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateSentence(wordCount: number, lang: "latin" | "chinese"): string {
  if (lang === "chinese") {
    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
      words.push(generateChineseWord())
      if (i < wordCount - 1 && Math.random() < 0.2) {
        words.push("，")
      }
    }
    return words.join("") + "。"
  } else {
    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
      words.push(generateLoremWord())
    }
    return capitalizeFirst(words.join(" ")) + "."
  }
}

function generateParagraph(sentenceCount: number, wordsPerSentence: [number, number], lang: "latin" | "chinese"): string {
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    const wordCount = Math.floor(Math.random() * (wordsPerSentence[1] - wordsPerSentence[0] + 1)) + wordsPerSentence[0]
    sentences.push(generateSentence(wordCount, lang))
  }
  return sentences.join(lang === "chinese" ? "" : " ")
}

type GenerateMode = "words" | "sentences" | "paragraphs"

export function LoremGeneratorPage() {
  const [mode, setMode] = useState<GenerateMode>("paragraphs")
  const [count, setCount] = useState("3")
  const [lang, setLang] = useState<"latin" | "chinese">("latin")
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [output, setOutput] = useState("")
  const { copy } = useCopy()
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const num = parseInt(count)
    if (isNaN(num) || num <= 0 || num > 100) {
      toast.error("请输入 1-100 之间的数字")
      return
    }

    let result = ""

    switch (mode) {
      case "words": {
        const words: string[] = []
        if (startWithLorem && lang === "latin") {
          words.push("Lorem", "ipsum", "dolor", "sit", "amet")
        }
        while (words.length < num) {
          words.push(lang === "latin" ? generateLoremWord() : generateChineseWord())
        }
        result = lang === "chinese" ? words.slice(0, num).join("") : words.slice(0, num).join(" ")
        break
      }
      case "sentences": {
        const sentences: string[] = []
        for (let i = 0; i < num; i++) {
          const wordCount = Math.floor(Math.random() * 10) + 5
          if (i === 0 && startWithLorem && lang === "latin") {
            sentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
          } else {
            sentences.push(generateSentence(wordCount, lang))
          }
        }
        result = sentences.join(lang === "chinese" ? "" : " ")
        break
      }
      case "paragraphs": {
        const paragraphs: string[] = []
        for (let i = 0; i < num; i++) {
          const sentenceCount = Math.floor(Math.random() * 4) + 3
          if (i === 0 && startWithLorem && lang === "latin") {
            paragraphs.push(
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
              generateParagraph(sentenceCount - 1, [5, 15], lang)
            )
          } else {
            paragraphs.push(generateParagraph(sentenceCount, [5, 15], lang))
          }
        }
        result = paragraphs.join("\n\n")
        break
      }
    }

    setOutput(result)
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

  const modeLabels = {
    words: "单词",
    sentences: "句子",
    paragraphs: "段落",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText className="size-6" />}
        title="Lorem Ipsum 生成器"
        description="生成用于排版设计的占位文本"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">生成选项</CardTitle>
          <CardDescription>选择语言和生成模式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>语言</Label>
              <div className="flex gap-2">
                <Button
                  variant={lang === "latin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLang("latin")}
                >
                  拉丁文
                </Button>
                <Button
                  variant={lang === "chinese" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLang("chinese")}
                >
                  中文
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>生成单位</Label>
              <div className="flex gap-2">
                {(["words", "sentences", "paragraphs"] as GenerateMode[]).map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode(m)}
                  >
                    {modeLabels[m]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>数量</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-24"
              />
            </div>
          </div>

          {lang === "latin" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="startWithLorem"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="startWithLorem" className="text-sm">
                以 "Lorem ipsum..." 开头
              </Label>
            </div>
          )}

          <Button onClick={handleGenerate}>
            <RefreshCw className="size-4 mr-2" />
            生成文本
          </Button>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">生成结果</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4 mr-1" /> : <Copy className="size-4 mr-1" />}
                复制
              </Button>
            </div>
            <CardDescription>
              {output.length} 个字符
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              className="min-h-[200px] font-serif text-base leading-relaxed"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
