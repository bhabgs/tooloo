import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageDown, Upload, Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface ImageInfo {
  file: File
  preview: string
  width: number
  height: number
}

interface CompressedImage {
  blob: Blob
  url: string
  width: number
  height: number
}

export function ImageCompressPage() {
  const [originalImage, setOriginalImage] = useState<ImageInfo | null>(null)
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null)
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setOriginalImage({
          file,
          preview: event.target?.result as string,
          width: img.width,
          height: img.height
        })
        setCompressedImage(null)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const compressImage = async () => {
    if (!originalImage) return

    setLoading(true)
    try {
      const img = new Image()
      img.src = originalImage.preview

      await new Promise((resolve) => {
        img.onload = resolve
      })

      // Calculate new dimensions
      let newWidth = img.width
      let newHeight = img.height

      if (newWidth > maxWidth) {
        const ratio = maxWidth / newWidth
        newWidth = maxWidth
        newHeight = Math.round(img.height * ratio)
      }

      // Create canvas and draw image
      const canvas = document.createElement("canvas")
      canvas.width = newWidth
      canvas.height = newHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context not available")

      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      // Compress to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error("Compression failed"))
          },
          "image/jpeg",
          quality / 100
        )
      })

      // Revoke previous URL
      if (compressedImage?.url) {
        URL.revokeObjectURL(compressedImage.url)
      }

      setCompressedImage({
        blob,
        url: URL.createObjectURL(blob),
        width: newWidth,
        height: newHeight
      })

      toast.success("压缩完成")
    } catch {
      toast.error("压缩失败")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!compressedImage) return

    const link = document.createElement("a")
    link.download = `compressed_${originalImage?.file.name || "image"}.jpg`
    link.href = compressedImage.url
    link.click()
    toast.success("已下载压缩后的图片")
  }

  const handleClear = () => {
    if (compressedImage?.url) {
      URL.revokeObjectURL(compressedImage.url)
    }
    setOriginalImage(null)
    setCompressedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const compressionRatio = originalImage && compressedImage
    ? ((1 - compressedImage.blob.size / originalImage.file.size) * 100).toFixed(1)
    : null

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const input = fileInputRef.current
      if (input) {
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ImageDown className="size-6" />}
        title="图片压缩"
        description="在线压缩图片，调整质量和尺寸"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择图片</CardTitle>
          <CardDescription>支持 JPG、PNG、WebP 等常见格式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              点击或拖拽图片到此处
            </p>
          </div>

          {originalImage && (
            <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">{originalImage.file.name}</p>
                <p className="text-muted-foreground">
                  {originalImage.width} x {originalImage.height} | {formatFileSize(originalImage.file.size)}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {originalImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">压缩设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>图片质量</Label>
                  <span className="text-sm text-muted-foreground">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">
                  质量越低，文件越小，但图片可能出现模糊
                </p>
              </div>

              <div className="space-y-3">
                <Label>最大宽度 (px)</Label>
                <Input
                  type="number"
                  min={100}
                  max={4096}
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1920)}
                />
                <p className="text-xs text-muted-foreground">
                  超过此宽度的图片会等比缩小
                </p>
              </div>
            </div>

            <Button onClick={compressImage} disabled={loading} className="w-full">
              {loading ? "压缩中..." : "开始压缩"}
            </Button>
          </CardContent>
        </Card>
      )}

      {compressedImage && originalImage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">压缩结果</CardTitle>
                <CardDescription>
                  压缩率: {compressionRatio}% | 节省: {formatFileSize(originalImage.file.size - compressedImage.blob.size)}
                </CardDescription>
              </div>
              <Button onClick={handleDownload}>
                <Download className="size-4" />
                下载
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-1">原始大小</p>
                <p className="font-medium">{formatFileSize(originalImage.file.size)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {originalImage.width} x {originalImage.height}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-1">压缩后大小</p>
                <p className="font-medium text-green-600">{formatFileSize(compressedImage.blob.size)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {compressedImage.width} x {compressedImage.height}
                </p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <img
                src={compressedImage.url}
                alt="Compressed"
                className="max-w-full max-h-[400px] object-contain mx-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
