import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Dices, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

function generateRandomNumbers(min: number, max: number, count: number, unique: boolean): number[] {
  const results: number[] = []
  const range = max - min + 1

  if (unique && count > range) {
    toast.error(`无法从 ${range} 个数中选出 ${count} 个不重复的数`)
    return []
  }

  if (unique) {
    const pool = Array.from({ length: range }, (_, i) => min + i)
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      results.push(pool.splice(idx, 1)[0])
    }
  } else {
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * range) + min)
    }
  }

  return results
}

function generateRandomFloats(min: number, max: number, count: number, precision: number): number[] {
  const results: number[] = []
  for (let i = 0; i < count; i++) {
    const value = Math.random() * (max - min) + min
    results.push(Number(value.toFixed(precision)))
  }
  return results
}

export function RandomGeneratorPage() {
  const [mode, setMode] = useState<"integer" | "float" | "list">("integer")

  // 整数模式
  const [intMin, setIntMin] = useState("1")
  const [intMax, setIntMax] = useState("100")
  const [intCount, setIntCount] = useState("1")
  const [intUnique, setIntUnique] = useState(false)

  // 小数模式
  const [floatMin, setFloatMin] = useState("0")
  const [floatMax, setFloatMax] = useState("1")
  const [floatCount, setFloatCount] = useState("1")
  const [floatPrecision, setFloatPrecision] = useState("2")

  // 列表抽取模式
  const [listInput, setListInput] = useState("")
  const [listCount, setListCount] = useState("1")
  const [listUnique, setListUnique] = useState(true)

  const [result, setResult] = useState<string[]>([])
  const { copy } = useCopy()
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    let newResult: string[] = []

    switch (mode) {
      case "integer": {
        const min = parseInt(intMin)
        const max = parseInt(intMax)
        const count = parseInt(intCount)
        if (isNaN(min) || isNaN(max) || isNaN(count)) {
          toast.error("请输入有效的数字")
          return
        }
        if (min > max) {
          toast.error("最小值不能大于最大值")
          return
        }
        if (count <= 0 || count > 10000) {
          toast.error("数量应在 1-10000 之间")
          return
        }
        newResult = generateRandomNumbers(min, max, count, intUnique).map(String)
        break
      }
      case "float": {
        const min = parseFloat(floatMin)
        const max = parseFloat(floatMax)
        const count = parseInt(floatCount)
        const precision = parseInt(floatPrecision)
        if (isNaN(min) || isNaN(max) || isNaN(count) || isNaN(precision)) {
          toast.error("请输入有效的数字")
          return
        }
        if (min > max) {
          toast.error("最小值不能大于最大值")
          return
        }
        newResult = generateRandomFloats(min, max, count, precision).map(String)
        break
      }
      case "list": {
        const items = listInput.split("\n").map(s => s.trim()).filter(Boolean)
        const count = parseInt(listCount)
        if (items.length === 0) {
          toast.error("请输入列表项")
          return
        }
        if (isNaN(count) || count <= 0) {
          toast.error("请输入有效的抽取数量")
          return
        }
        if (listUnique && count > items.length) {
          toast.error(`无法从 ${items.length} 项中选出 ${count} 个不重复的项`)
          return
        }

        if (listUnique) {
          const pool = [...items]
          newResult = []
          for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * pool.length)
            newResult.push(pool.splice(idx, 1)[0])
          }
        } else {
          newResult = Array.from({ length: count }, () => items[Math.floor(Math.random() * items.length)])
        }
        break
      }
    }

    setResult(newResult)
  }

  const handleCopy = async () => {
    if (result.length === 0) return
    const success = await copy(result.join("\n"))
    if (success) {
      setCopied(true)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Dices className="size-6" />}
        title="随机数生成器"
        description="生成随机整数、小数或从列表中随机抽取"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">生成模式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant={mode === "integer" ? "default" : "outline"}
              onClick={() => setMode("integer")}
            >
              随机整数
            </Button>
            <Button
              variant={mode === "float" ? "default" : "outline"}
              onClick={() => setMode("float")}
            >
              随机小数
            </Button>
            <Button
              variant={mode === "list" ? "default" : "outline"}
              onClick={() => setMode("list")}
            >
              列表抽取
            </Button>
          </div>

          {mode === "integer" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>最小值</Label>
                <Input
                  type="number"
                  value={intMin}
                  onChange={(e) => setIntMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>最大值</Label>
                <Input
                  type="number"
                  value={intMax}
                  onChange={(e) => setIntMax(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>生成数量</Label>
                <Input
                  type="number"
                  value={intCount}
                  onChange={(e) => setIntCount(e.target.value)}
                />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="intUnique"
                    checked={intUnique}
                    onCheckedChange={(v: boolean) => setIntUnique(!!v)}
                  />
                  <Label htmlFor="intUnique">不重复</Label>
                </div>
              </div>
            </div>
          )}

          {mode === "float" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>最小值</Label>
                <Input
                  type="number"
                  step="any"
                  value={floatMin}
                  onChange={(e) => setFloatMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>最大值</Label>
                <Input
                  type="number"
                  step="any"
                  value={floatMax}
                  onChange={(e) => setFloatMax(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>生成数量</Label>
                <Input
                  type="number"
                  value={floatCount}
                  onChange={(e) => setFloatCount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>小数位数</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={floatPrecision}
                  onChange={(e) => setFloatPrecision(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode === "list" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>列表项（每行一个）</Label>
                <Textarea
                  placeholder="选项1&#10;选项2&#10;选项3&#10;..."
                  value={listInput}
                  onChange={(e) => setListInput(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex gap-4 items-center">
                <div className="space-y-2">
                  <Label>抽取数量</Label>
                  <Input
                    type="number"
                    value={listCount}
                    onChange={(e) => setListCount(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="listUnique"
                    checked={listUnique}
                    onCheckedChange={(v: boolean) => setListUnique(!!v)}
                  />
                  <Label htmlFor="listUnique">不重复抽取</Label>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleGenerate}>
            <RefreshCw className="size-4 mr-2" />
            生成
          </Button>
        </CardContent>
      </Card>

      {result.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">生成结果</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4 mr-1" /> : <Copy className="size-4 mr-1" />}
                复制
              </Button>
            </div>
            <CardDescription>共生成 {result.length} 个结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-md font-mono text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
