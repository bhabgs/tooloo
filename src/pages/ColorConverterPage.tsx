import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Palette } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface ColorValues {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export function ColorConverterPage() {
  const [colors, setColors] = useState<ColorValues>({
    hex: "#3b82f6",
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 }
  })
  const { copy } = useCopy()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const updateFromHex = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setColors({ hex, rgb, hsl })
    }
  }

  const updateFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b)
    const hsl = rgbToHsl(r, g, b)
    setColors({ hex, rgb: { r, g, b }, hsl })
  }

  const updateFromHsl = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setColors({ hex, rgb, hsl: { h, s, l } })
  }

  const handleCopy = async (value: string, field: string) => {
    const success = await copy(value)
    if (success) {
      setCopiedField(field)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const hexString = colors.hex.toUpperCase()
  const rgbString = `rgb(${colors.rgb.r}, ${colors.rgb.g}, ${colors.rgb.b})`
  const hslString = `hsl(${colors.hsl.h}, ${colors.hsl.s}%, ${colors.hsl.l}%)`

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Palette className="size-6" />}
        title="颜色转换"
        description="HEX、RGB、HSL 颜色格式转换"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">颜色预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-lg border shadow-inner"
              style={{ backgroundColor: colors.hex }}
            />
            <input
              type="color"
              value={colors.hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-16 h-16 cursor-pointer rounded border-0"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">HEX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={colors.hex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="font-mono"
                placeholder="#000000"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(hexString, "hex")}
              >
                {copiedField === "hex" ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{hexString}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">RGB</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">R</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={colors.rgb.r}
                  onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, colors.rgb.g, colors.rgb.b)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">G</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={colors.rgb.g}
                  onChange={(e) => updateFromRgb(colors.rgb.r, parseInt(e.target.value) || 0, colors.rgb.b)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">B</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={colors.rgb.b}
                  onChange={(e) => updateFromRgb(colors.rgb.r, colors.rgb.g, parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-sm text-muted-foreground font-mono flex-1">{rgbString}</p>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(rgbString, "rgb")}
              >
                {copiedField === "rgb" ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">HSL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">H</Label>
                <Input
                  type="number"
                  min={0}
                  max={360}
                  value={colors.hsl.h}
                  onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, colors.hsl.s, colors.hsl.l)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">S%</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={colors.hsl.s}
                  onChange={(e) => updateFromHsl(colors.hsl.h, parseInt(e.target.value) || 0, colors.hsl.l)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">L%</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={colors.hsl.l}
                  onChange={(e) => updateFromHsl(colors.hsl.h, colors.hsl.s, parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-sm text-muted-foreground font-mono flex-1">{hslString}</p>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(hslString, "hsl")}
              >
                {copiedField === "hsl" ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
