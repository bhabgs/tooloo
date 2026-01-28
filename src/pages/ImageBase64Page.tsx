import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCopy } from "@/hooks/useCopy"
import { Copy, Check, Image, Upload, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

export function ImageBase64Page() {
  const [imageData, setImageData] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [fileSize, setFileSize] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { copied, copy } = useCopy()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }

    setFileName(file.name)
    setFileSize(formatFileSize(file.size))

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setImagePreview(result)
      setImageData(result)
    }
    reader.readAsDataURL(file)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const handleCopy = async () => {
    if (!imageData) return
    const success = await copy(imageData)
    if (success) {
      toast.success("已复制到剪贴板")
    }
  }

  const handleCopyPure = async () => {
    if (!imageData) return
    // Remove the data:image/xxx;base64, prefix
    const pureBase64 = imageData.split(",")[1]
    const success = await copy(pureBase64)
    if (success) {
      toast.success("已复制纯 Base64 到剪贴板")
    }
  }

  const handleClear = () => {
    setImageData("")
    setImagePreview("")
    setFileName("")
    setFileSize("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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
        icon={<Image className="size-6" />}
        title="图片转 Base64"
        description="将图片转换为 Base64 编码"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择图片</CardTitle>
          <CardDescription>支持 JPG、PNG、GIF、WebP 等常见格式</CardDescription>
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

          {fileName && (
            <div className="flex items-center justify-between text-sm">
              <span>{fileName}</span>
              <span className="text-muted-foreground">{fileSize}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {imagePreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">图片预览</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full max-h-[300px] object-contain rounded-lg border"
            />
          </CardContent>
        </Card>
      )}

      {imageData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Base64 编码</CardTitle>
                <CardDescription>
                  字符长度: {imageData.length.toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyPure}>
                  复制纯 Base64
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "已复制" : "复制完整"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={imageData}
              readOnly
              className="min-h-[200px] font-mono text-xs"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
