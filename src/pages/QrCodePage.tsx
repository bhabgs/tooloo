import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Download } from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode"
import { PageHeader } from "@/components/PageHeader"

export function QrCodePage() {
  const [text, setText] = useState("https://example.com")
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQR()
  }, [text, size, errorLevel])

  const generateQR = async () => {
    if (!text.trim()) {
      setQrDataUrl("")
      return
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      })
      setQrDataUrl(dataUrl)
    } catch {
      toast.error("生成二维码失败")
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement("a")
    link.download = "qrcode.png"
    link.href = qrDataUrl
    link.click()
    toast.success("已下载二维码")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<QrCode className="size-6" />}
        title="二维码生成"
        description="生成自定义二维码"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">输入内容</CardTitle>
            <CardDescription>输入 URL、文本或其他内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>内容</Label>
              <Textarea
                placeholder="输入 URL 或文本..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>尺寸</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={128}
                  max={1024}
                  step={64}
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value) || 256)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">{size} x {size} px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>容错级别</Label>
              <Tabs value={errorLevel} onValueChange={(v) => setErrorLevel(v as "L" | "M" | "Q" | "H")}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="L">L (7%)</TabsTrigger>
                  <TabsTrigger value="M">M (15%)</TabsTrigger>
                  <TabsTrigger value="Q">Q (25%)</TabsTrigger>
                  <TabsTrigger value="H">H (30%)</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                容错级别越高，二维码越复杂但可被部分遮挡
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">预览</CardTitle>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!qrDataUrl}>
                <Download className="size-4" />
                下载 PNG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4 bg-white rounded-lg border min-h-[300px]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="max-w-full"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <p className="text-muted-foreground">请输入内容生成二维码</p>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
