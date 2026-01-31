import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface CronParts {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

const cronPresets = [
  { label: "每分钟", value: "* * * * *" },
  { label: "每小时", value: "0 * * * *" },
  { label: "每天零点", value: "0 0 * * *" },
  { label: "每天早上9点", value: "0 9 * * *" },
  { label: "每周一早上9点", value: "0 9 * * 1" },
  { label: "每月1号零点", value: "0 0 1 * *" },
  { label: "工作日早上9点", value: "0 9 * * 1-5" },
  { label: "每5分钟", value: "*/5 * * * *" },
  { label: "每30分钟", value: "*/30 * * * *" },
  { label: "每天凌晨3点", value: "0 3 * * *" },
]

const dayNames = ["日", "一", "二", "三", "四", "五", "六"]
const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

function parseCronPart(part: string, min: number, max: number): number[] {
  const results: number[] = []

  if (part === "*") {
    for (let i = min; i <= max; i++) results.push(i)
    return results
  }

  const segments = part.split(",")
  for (const segment of segments) {
    // 处理步长 */n 或 m-n/s
    if (segment.includes("/")) {
      const [range, stepStr] = segment.split("/")
      const step = parseInt(stepStr)
      let start = min, end = max

      if (range !== "*") {
        if (range.includes("-")) {
          [start, end] = range.split("-").map(Number)
        } else {
          start = parseInt(range)
        }
      }

      for (let i = start; i <= end; i += step) {
        results.push(i)
      }
    }
    // 处理范围 m-n
    else if (segment.includes("-")) {
      const [start, end] = segment.split("-").map(Number)
      for (let i = start; i <= end; i++) {
        results.push(i)
      }
    }
    // 单个值
    else {
      results.push(parseInt(segment))
    }
  }

  return [...new Set(results)].sort((a, b) => a - b)
}

function describeCronPart(part: string, type: "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek"): string {
  if (part === "*") {
    switch (type) {
      case "minute": return "每分钟"
      case "hour": return "每小时"
      case "dayOfMonth": return "每天"
      case "month": return "每月"
      case "dayOfWeek": return "每天"
    }
  }

  if (part.startsWith("*/")) {
    const step = part.slice(2)
    switch (type) {
      case "minute": return `每 ${step} 分钟`
      case "hour": return `每 ${step} 小时`
      case "dayOfMonth": return `每 ${step} 天`
      case "month": return `每 ${step} 月`
      case "dayOfWeek": return `每 ${step} 天`
    }
  }

  if (type === "dayOfWeek") {
    const days = parseCronPart(part, 0, 6)
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) {
      return "工作日"
    }
    return `周${days.map(d => dayNames[d]).join("、")}`
  }

  if (type === "month") {
    const months = parseCronPart(part, 1, 12)
    return months.map(m => monthNames[m - 1]).join("、")
  }

  return part
}

function getNextExecutions(cronStr: string, count: number = 5): Date[] {
  const parts = cronStr.trim().split(/\s+/)
  if (parts.length !== 5) return []

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  const minutes = parseCronPart(minute, 0, 59)
  const hours = parseCronPart(hour, 0, 23)
  const days = parseCronPart(dayOfMonth, 1, 31)
  const months = parseCronPart(month, 1, 12)
  const weekdays = parseCronPart(dayOfWeek, 0, 6)

  const results: Date[] = []
  const now = new Date()
  const current = new Date(now)

  // 最多检查未来1年
  const maxDate = new Date(now)
  maxDate.setFullYear(maxDate.getFullYear() + 1)

  while (results.length < count && current < maxDate) {
    current.setMinutes(current.getMinutes() + 1)
    current.setSeconds(0)
    current.setMilliseconds(0)

    if (
      minutes.includes(current.getMinutes()) &&
      hours.includes(current.getHours()) &&
      (dayOfMonth === "*" || days.includes(current.getDate())) &&
      months.includes(current.getMonth() + 1) &&
      (dayOfWeek === "*" || weekdays.includes(current.getDay()))
    ) {
      results.push(new Date(current))
    }
  }

  return results
}

function describeCron(cronStr: string): string {
  const parts = cronStr.trim().split(/\s+/)
  if (parts.length !== 5) return "无效的 Cron 表达式"

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  const descriptions: string[] = []

  // 时间描述
  if (minute === "*" && hour === "*") {
    descriptions.push("每分钟")
  } else if (minute === "0" && hour === "*") {
    descriptions.push("每小时整点")
  } else if (minute.startsWith("*/")) {
    descriptions.push(`每 ${minute.slice(2)} 分钟`)
  } else if (hour === "*") {
    descriptions.push(`每小时的第 ${minute} 分钟`)
  } else if (minute === "0") {
    descriptions.push(`${hour} 点整`)
  } else {
    descriptions.push(`${hour}:${minute.padStart(2, "0")}`)
  }

  // 日期描述
  if (dayOfWeek !== "*") {
    descriptions.push(describeCronPart(dayOfWeek, "dayOfWeek"))
  } else if (dayOfMonth !== "*") {
    descriptions.push(`每月 ${dayOfMonth} 号`)
  }

  if (month !== "*") {
    descriptions.push(describeCronPart(month, "month"))
  }

  return descriptions.join("，")
}

export function CronParserPage() {
  const [cronExpression, setCronExpression] = useState("0 9 * * 1-5")
  const { copy } = useCopy()
  const [copied, setCopied] = useState(false)

  const parts = useMemo<CronParts | null>(() => {
    const p = cronExpression.trim().split(/\s+/)
    if (p.length !== 5) return null
    return {
      minute: p[0],
      hour: p[1],
      dayOfMonth: p[2],
      month: p[3],
      dayOfWeek: p[4],
    }
  }, [cronExpression])

  const description = useMemo(() => describeCron(cronExpression), [cronExpression])
  const nextExecutions = useMemo(() => getNextExecutions(cronExpression, 5), [cronExpression])
  const isValid = parts !== null

  const handleCopy = async () => {
    const success = await copy(cronExpression)
    if (success) {
      setCopied(true)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePartChange = (field: keyof CronParts, value: string) => {
    if (!parts) return
    const newParts = { ...parts, [field]: value }
    setCronExpression(
      `${newParts.minute} ${newParts.hour} ${newParts.dayOfMonth} ${newParts.month} ${newParts.dayOfWeek}`
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Clock className="size-6" />}
        title="Cron 表达式解析"
        description="解析和生成 Cron 时间表达式，查看下次执行时间"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cron 表达式</CardTitle>
          <CardDescription>输入标准5字段 Cron 表达式（分 时 日 月 周）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              className="font-mono text-lg"
              placeholder="* * * * *"
            />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>

          {!isValid && cronExpression.trim() && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                无效的 Cron 表达式，请输入5个字段（分钟 小时 日 月 星期）
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            {cronPresets.map((preset) => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => setCronExpression(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isValid && parts && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">字段编辑</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">分钟 (0-59)</Label>
                  <Input
                    value={parts.minute}
                    onChange={(e) => handlePartChange("minute", e.target.value)}
                    className="font-mono text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">小时 (0-23)</Label>
                  <Input
                    value={parts.hour}
                    onChange={(e) => handlePartChange("hour", e.target.value)}
                    className="font-mono text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">日期 (1-31)</Label>
                  <Input
                    value={parts.dayOfMonth}
                    onChange={(e) => handlePartChange("dayOfMonth", e.target.value)}
                    className="font-mono text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">月份 (1-12)</Label>
                  <Input
                    value={parts.month}
                    onChange={(e) => handlePartChange("month", e.target.value)}
                    className="font-mono text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">星期 (0-6)</Label>
                  <Input
                    value={parts.dayOfWeek}
                    onChange={(e) => handlePartChange("dayOfWeek", e.target.value)}
                    className="font-mono text-center"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">解析结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-lg font-medium text-primary">{description}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">接下来5次执行时间</Label>
                <div className="space-y-1">
                  {nextExecutions.map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded text-sm font-mono"
                    >
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span>
                        {date.toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          weekday: "short",
                        })}
                        {" "}
                        {date.toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">语法说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p><code className="bg-muted px-1 rounded">*</code> 表示每个时间单位</p>
                <p><code className="bg-muted px-1 rounded">*/n</code> 表示每隔 n 个时间单位</p>
                <p><code className="bg-muted px-1 rounded">m-n</code> 表示从 m 到 n 的范围</p>
                <p><code className="bg-muted px-1 rounded">m,n,o</code> 表示指定的多个值</p>
                <p>星期：0 = 周日，1-6 = 周一至周六</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
