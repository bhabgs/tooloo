import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Download, Trash2, GripVertical, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PDFDocument } from "pdf-lib"
import { PageHeader } from "@/components/PageHeader"

interface PdfFile {
  id: string
  file: File
  pageCount: number
}

export function PdfMergePage() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([])
  const [loading, setLoading] = useState(false)
  const [merging, setMerging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    const newFiles: PdfFile[] = []

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        toast.error(`${file.name} 不是 PDF 文件`)
        continue
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pageCount = pdf.getPageCount()

        newFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          pageCount
        })
      } catch {
        toast.error(`${file.name} 读取失败`)
      }
    }

    setPdfFiles((prev) => [...prev, ...newFiles])
    setLoading(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const clearAll = () => {
    setPdfFiles([])
  }

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) {
      toast.error("请至少添加 2 个 PDF 文件")
      return
    }

    setMerging(true)
    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "merged.pdf"
      link.click()

      URL.revokeObjectURL(url)
      toast.success("PDF 合并完成")
    } catch {
      toast.error("合并失败，请检查 PDF 文件")
    } finally {
      setMerging(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...pdfFiles]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    setPdfFiles(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const input = fileInputRef.current
      if (input) {
        const dt = new DataTransfer()
        Array.from(files).forEach((f) => dt.items.add(f))
        input.files = dt.files
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }

  const handleDragOverZone = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText className="size-6" />}
        title="PDF 合并"
        description="将多个 PDF 文件合并为一个，支持拖拽排序"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">添加 PDF 文件</CardTitle>
          <CardDescription>支持同时选择多个文件，拖拽可调整顺序</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOverZone}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {loading ? (
              <Loader2 className="size-8 mx-auto mb-2 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {loading ? "正在读取..." : "点击或拖拽 PDF 文件到此处"}
            </p>
          </div>

          {pdfFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{pdfFiles.length} 个文件，共 {totalPages} 页</span>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="size-4" />
                  清空
                </Button>
              </div>

              <div className="space-y-2">
                {pdfFiles.map((pdfFile, index) => (
                  <div
                    key={pdfFile.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors ${
                      draggedIndex === index ? "opacity-50 border-primary" : ""
                    }`}
                  >
                    <GripVertical className="size-4 text-muted-foreground cursor-grab shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <FileText className="size-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pdfFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pdfFile.pageCount} 页 · {formatFileSize(pdfFile.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeFile(pdfFile.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="size-4" />
                继续添加
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {pdfFiles.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">合并</CardTitle>
            <CardDescription>
              按上方顺序合并为一个 PDF 文件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={mergePdfs} disabled={merging} className="w-full">
              {merging ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  合并中...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  合并并下载
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
