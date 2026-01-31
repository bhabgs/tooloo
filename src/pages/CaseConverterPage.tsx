import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Trash2, CaseSensitive } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "constant"

interface CaseOption {
  type: CaseType
  label: string
  description: string
}

const caseOptions: CaseOption[] = [
  { type: "upper", label: "大写", description: "HELLO WORLD" },
  { type: "lower", label: "小写", description: "hello world" },
  { type: "title", label: "首字母大写", description: "Hello World" },
  { type: "sentence", label: "句首大写", description: "Hello world" },
  { type: "camel", label: "驼峰命名", description: "helloWorld" },
  { type: "pascal", label: "帕斯卡命名", description: "HelloWorld" },
  { type: "snake", label: "下划线命名", description: "hello_world" },
  { type: "kebab", label: "短横线命名", description: "hello-world" },
  { type: "constant", label: "常量命名", description: "HELLO_WORLD" },
]

function convertCase(text: string, type: CaseType): string {
  // 先将文本拆分成单词
  const words = text
    .replace(/([a-z])([A-Z])/g, "$1 $2") // 驼峰拆分
    .replace(/[_-]/g, " ") // 下划线和短横线转空格
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  switch (type) {
    case "upper":
      return text.toUpperCase()
    case "lower":
      return text.toLowerCase()
    case "title":
      return text
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase())
    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase())
    case "camel":
      return words
        .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join("")
    case "pascal":
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
    case "snake":
      return words.join("_")
    case "kebab":
      return words.join("-")
    case "constant":
      return words.join("_").toUpperCase()
    default:
      return text
  }
}

export function CaseConverterPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [selectedType, setSelectedType] = useState<CaseType>("camel")
  const { copy } = useCopy()
  const [copied, setCopied] = useState(false)

  const handleConvert = (type: CaseType) => {
    if (!input.trim()) {
      toast.error("请输入文本")
      return
    }
    setSelectedType(type)
    setOutput(convertCase(input, type))
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

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CaseSensitive className="size-6" />}
        title="大小写转换"
        description="转换文本为各种命名格式：驼峰、下划线、大写等"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入文本</CardTitle>
          <CardDescription>输入需要转换的文本</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="输入文本，例如：hello world 或 helloWorld..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />

          <div className="flex flex-wrap gap-2">
            {caseOptions.map((option) => (
              <Button
                key={option.type}
                variant={selectedType === option.type ? "default" : "outline"}
                size="sm"
                onClick={() => handleConvert(option.type)}
                className="flex-col h-auto py-2"
              >
                <span>{option.label}</span>
                <span className="text-xs opacity-70 font-mono">{option.description}</span>
              </Button>
            ))}
          </div>

          <Button variant="ghost" onClick={handleClear} size="sm">
            <Trash2 className="size-4 mr-1" />
            清空
          </Button>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">转换结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={output}
                readOnly
                className="min-h-[100px] font-mono text-sm pr-12"
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
