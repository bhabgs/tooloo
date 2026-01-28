import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scissors, Upload, Download, Trash2, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { removeBackground } from "@imgly/background-removal"
import { PageHeader } from "@/components/PageHeader"

interface ImageData {
  file: File
  preview: string
}

export function BackgroundRemovalPage() {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
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
      setOriginalImage({
        file,
        preview: event.target?.result as string
      })
      setResultImage(null)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!originalImage) return

    setLoading(true)
    setProgress(0)
    setError("")

    try {
      const blob = await removeBackground(originalImage.preview, {
        progress: (_key, current, total) => {
          if (total > 0) {
            setProgress(Math.round((current / total) * 100))
          }
        }
      })

      const url = URL.createObjectURL(blob)
      setResultImage(url)
      toast.success("抠图完成")
    } catch (err) {
      setError("抠图处理失败，请尝试其他图片")
      toast.error("处理失败")
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (!resultImage) return

    const link = document.createElement("a")
    link.download = `removed_bg_${originalImage?.file.name || "image"}.png`
    link.href = resultImage
    link.click()
    toast.success("已下载抠图结果")
  }

  const handleClear = () => {
    if (resultImage) {
      URL.revokeObjectURL(resultImage)
    }
    setOriginalImage(null)
    setResultImage(null)
    setError("")
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
        icon={<Scissors className="size-6" />}
        title="AI 抠图"
        description="智能移除图片背景，纯浏览器端 AI 处理"
      />

      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>
          首次使用需要下载 AI 模型（约 180MB），请耐心等待。所有处理均在本地完成，图片不会上传到服务器。
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择图片</CardTitle>
          <CardDescription>支持 JPG、PNG、WebP 等常见格式，建议图片小于 4MB</CardDescription>
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
            <div className="flex items-center justify-between">
              <span className="text-sm truncate flex-1">{originalImage.file.name}</span>
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
            <CardTitle className="text-lg">处理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={processImage}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {progress > 0 ? `处理中 ${progress}%` : "加载模型中..."}
                </>
              ) : (
                <>
                  <Scissors className="size-4" />
                  开始抠图
                </>
              )}
            </Button>

            {loading && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {(originalImage || resultImage) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">预览对比</CardTitle>
              {resultImage && (
                <Button onClick={handleDownload}>
                  <Download className="size-4" />
                  下载 PNG
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {originalImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">原图</p>
                  <div className="border rounded-lg overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]">
                    <img
                      src={originalImage.preview}
                      alt="Original"
                      className="max-w-full max-h-[300px] object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              {resultImage ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">抠图结果</p>
                  <div className="border rounded-lg overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]">
                    <img
                      src={resultImage}
                      alt="Result"
                      className="max-w-full max-h-[300px] object-contain mx-auto"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">抠图结果</p>
                  <div className="border rounded-lg h-[300px] flex items-center justify-center bg-muted">
                    <p className="text-sm text-muted-foreground">点击"开始抠图"处理</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
