import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Clock, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

export function TimestampPage() {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000))
  const [timestampInput, setTimestampInput] = useState("")
  const [dateInput, setDateInput] = useState("")
  const [convertedDate, setConvertedDate] = useState("")
  const [convertedTimestamp, setConvertedTimestamp] = useState("")
  const { copy } = useCopy()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCopy = async (value: string, field: string) => {
    const success = await copy(value)
    if (success) {
      setCopiedField(field)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const timestampToDate = () => {
    if (!timestampInput.trim()) return
    const ts = parseInt(timestampInput)
    if (isNaN(ts)) {
      setConvertedDate("无效的时间戳")
      return
    }
    // Auto-detect seconds vs milliseconds
    const date = ts > 9999999999 ? new Date(ts) : new Date(ts * 1000)
    setConvertedDate(formatDate(date))
  }

  const dateToTimestamp = () => {
    if (!dateInput.trim()) return
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) {
      setConvertedTimestamp("无效的日期格式")
      return
    }
    setConvertedTimestamp(Math.floor(date.getTime() / 1000).toString())
  }

  const formatDate = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  const useCurrentTimestamp = () => {
    setTimestampInput(currentTimestamp.toString())
  }

  const useCurrentDate = () => {
    setDateInput(formatDate(new Date()))
  }

  const currentDate = formatDate(new Date(currentTimestamp * 1000))
  const currentMs = currentTimestamp * 1000

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Clock className="size-6" />}
        title="时间戳转换"
        description="Unix 时间戳与日期互转"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">当前时间</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>秒级时间戳</Label>
              <div className="flex gap-2">
                <Input value={currentTimestamp} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(currentTimestamp.toString(), "currentTs")}
                >
                  {copiedField === "currentTs" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>毫秒级时间戳</Label>
              <div className="flex gap-2">
                <Input value={currentMs} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(currentMs.toString(), "currentMs")}
                >
                  {copiedField === "currentMs" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>当前日期时间</Label>
            <div className="flex gap-2">
              <Input value={currentDate} readOnly className="font-mono" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(currentDate, "currentDate")}
              >
                {copiedField === "currentDate" ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">时间戳 → 日期</CardTitle>
            <CardDescription>将时间戳转换为日期格式</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>输入时间戳</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="1234567890"
                  value={timestampInput}
                  onChange={(e) => setTimestampInput(e.target.value)}
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={useCurrentTimestamp}>
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>
            <Button onClick={timestampToDate} className="w-full">转换</Button>
            {convertedDate && (
              <div className="space-y-2">
                <Label>转换结果</Label>
                <div className="flex gap-2">
                  <Input value={convertedDate} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(convertedDate, "convertedDate")}
                  >
                    {copiedField === "convertedDate" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">日期 → 时间戳</CardTitle>
            <CardDescription>将日期转换为时间戳</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>输入日期</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="2024-01-01 00:00:00"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={useCurrentDate}>
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>
            <Button onClick={dateToTimestamp} className="w-full">转换</Button>
            {convertedTimestamp && (
              <div className="space-y-2">
                <Label>转换结果</Label>
                <div className="flex gap-2">
                  <Input value={convertedTimestamp} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(convertedTimestamp, "convertedTs")}
                  >
                    {copiedField === "convertedTs" ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
