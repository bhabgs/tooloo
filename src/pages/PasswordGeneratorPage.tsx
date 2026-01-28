import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { KeyRound, RefreshCw, Copy, Check, Trash2 } from "lucide-react"
import { useCopy } from "@/hooks/useCopy"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
}

const SIMILAR_CHARS = "il1Lo0O"
const AMBIGUOUS_CHARS = "{}[]()/\\'\"`~,;:.<>"

function generatePassword(options: PasswordOptions): string {
  let chars = ""

  if (options.uppercase) chars += CHARS.uppercase
  if (options.lowercase) chars += CHARS.lowercase
  if (options.numbers) chars += CHARS.numbers
  if (options.symbols) chars += CHARS.symbols

  if (!chars) chars = CHARS.lowercase

  if (options.excludeSimilar) {
    chars = chars.split("").filter(c => !SIMILAR_CHARS.includes(c)).join("")
  }

  if (options.excludeAmbiguous) {
    chars = chars.split("").filter(c => !AMBIGUOUS_CHARS.includes(c)).join("")
  }

  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)

  return Array.from(array, x => chars[x % chars.length]).join("")
}

function calculateStrength(password: string): { score: number; label: string; color: string } {
  let score = 0

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 2) return { score: 1, label: "弱", color: "bg-red-500" }
  if (score <= 4) return { score: 2, label: "中", color: "bg-yellow-500" }
  if (score <= 5) return { score: 3, label: "强", color: "bg-blue-500" }
  return { score: 4, label: "很强", color: "bg-green-500" }
}

export function PasswordGeneratorPage() {
  const [passwords, setPasswords] = useState<string[]>([])
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })
  const [count, setCount] = useState(5)
  const { copy } = useCopy()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generate = useCallback(() => {
    const newPasswords = Array.from({ length: count }, () => generatePassword(options))
    setPasswords(newPasswords)
  }, [options, count])

  const handleCopy = async (password: string, index: number) => {
    const success = await copy(password)
    if (success) {
      setCopiedIndex(index)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  const handleCopyAll = async () => {
    const success = await copy(passwords.join("\n"))
    if (success) {
      toast.success("已复制全部密码")
    }
  }

  const handleClear = () => {
    setPasswords([])
  }

  const OptionCheckbox = ({
    label,
    checked,
    onChange
  }: {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
  }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-input"
      />
      <span className="text-sm">{label}</span>
    </label>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<KeyRound className="size-6" />}
        title="密码生成器"
        description="生成安全随机密码，支持自定义规则"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">生成选项</CardTitle>
          <CardDescription>设置密码长度和字符类型</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>密码长度</Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {options.length}
              </span>
            </div>
            <Slider
              value={[options.length]}
              onValueChange={([value]) => setOptions({ ...options, length: value })}
              min={4}
              max={64}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>字符类型</Label>
            <div className="grid grid-cols-2 gap-3">
              <OptionCheckbox
                label="大写字母 (A-Z)"
                checked={options.uppercase}
                onChange={(checked) => setOptions({ ...options, uppercase: checked })}
              />
              <OptionCheckbox
                label="小写字母 (a-z)"
                checked={options.lowercase}
                onChange={(checked) => setOptions({ ...options, lowercase: checked })}
              />
              <OptionCheckbox
                label="数字 (0-9)"
                checked={options.numbers}
                onChange={(checked) => setOptions({ ...options, numbers: checked })}
              />
              <OptionCheckbox
                label="符号 (!@#$%...)"
                checked={options.symbols}
                onChange={(checked) => setOptions({ ...options, symbols: checked })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>排除字符</Label>
            <div className="grid grid-cols-2 gap-3">
              <OptionCheckbox
                label="排除相似字符 (il1Lo0O)"
                checked={options.excludeSimilar}
                onChange={(checked) => setOptions({ ...options, excludeSimilar: checked })}
              />
              <OptionCheckbox
                label="排除歧义符号"
                checked={options.excludeAmbiguous}
                onChange={(checked) => setOptions({ ...options, excludeAmbiguous: checked })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>生成数量</Label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              min={1}
              max={20}
              className="w-24"
            />
          </div>

          <Button onClick={generate} className="w-full">
            <RefreshCw className="size-4" />
            生成密码
          </Button>
        </CardContent>
      </Card>

      {passwords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">生成结果</CardTitle>
                <CardDescription>点击复制密码</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <Copy className="size-4" />
                  复制全部
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Trash2 className="size-4" />
                  清空
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {passwords.map((password, index) => {
                const strength = calculateStrength(password)
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => handleCopy(password, index)}
                  >
                    <div className="flex-1 font-mono text-sm break-all">
                      {password}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 h-4 rounded-sm ${
                              level <= strength.score ? strength.color : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{strength.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedIndex === index ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
