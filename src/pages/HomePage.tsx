import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileJson,
  Hash,
  FileText,
  Image,
  ImageDown,
  Scissors,
  Lock,
  Clock,
  Palette,
  QrCode,
  Binary,
  Calculator,
  Search,
  X,
  Files,
  GitCompare,
  Regex,
  KeyRound,
  Code,
  ShieldCheck,
  ImageIcon,
  CalendarClock,
  FileCode,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Tool {
  name: string
  description: string
  path: string
  icon: React.ReactNode
  tag?: string
  keywords?: string[]
}

interface ToolCategory {
  name: string
  id: string
  icon: React.ReactNode
  tools: Tool[]
}

const toolCategories: ToolCategory[] = [
  {
    name: "编码转换",
    id: "encoding",
    icon: <Code className="size-4" />,
    tools: [
      {
        name: "JSON 格式化",
        description: "格式化、压缩、校验 JSON 数据",
        path: "/json-formatter",
        icon: <FileJson className="size-5" />,
        tag: "常用",
        keywords: ["json", "格式化", "压缩", "校验", "美化"]
      },
      {
        name: "Base64 编解码",
        description: "Base64 编码与解码转换",
        path: "/base64",
        icon: <Binary className="size-5" />,
        keywords: ["base64", "编码", "解码", "转换"]
      },
      {
        name: "URL 编解码",
        description: "URL 编码与解码转换",
        path: "/url-codec",
        icon: <FileText className="size-5" />,
        keywords: ["url", "编码", "解码", "urlencode", "转义"]
      }
    ]
  },
  {
    name: "加密解密",
    id: "crypto",
    icon: <ShieldCheck className="size-4" />,
    tools: [
      {
        name: "哈希生成器",
        description: "MD5、SHA1、SHA256 等哈希计算",
        path: "/hash",
        icon: <Hash className="size-5" />,
        tag: "常用",
        keywords: ["hash", "哈希", "md5", "sha1", "sha256", "sha512", "加密", "摘要"]
      },
      {
        name: "UUID 生成器",
        description: "生成随机 UUID/GUID",
        path: "/uuid",
        icon: <Lock className="size-5" />,
        keywords: ["uuid", "guid", "随机", "唯一标识", "nanoid"]
      },
      {
        name: "密码生成器",
        description: "生成安全随机密码",
        path: "/password-generator",
        icon: <KeyRound className="size-5" />,
        tag: "常用",
        keywords: ["密码", "password", "生成", "随机", "安全"]
      },
      {
        name: "JWT 解析",
        description: "解析 JWT Token 内容",
        path: "/jwt-parser",
        icon: <KeyRound className="size-5" />,
        keywords: ["jwt", "token", "解析", "认证", "json web token"]
      }
    ]
  },
  {
    name: "图像工具",
    id: "image",
    icon: <ImageIcon className="size-4" />,
    tools: [
      {
        name: "图片压缩",
        description: "在线压缩图片，调整质量和尺寸",
        path: "/image-compress",
        icon: <ImageDown className="size-5" />,
        tag: "常用",
        keywords: ["图片", "压缩", "缩小", "优化", "jpg", "png", "image"]
      },
      {
        name: "AI 抠图",
        description: "智能移除图片背景",
        path: "/background-removal",
        icon: <Scissors className="size-5" />,
        tag: "AI",
        keywords: ["抠图", "背景", "移除", "透明", "ai", "智能", "remove", "background"]
      },
      {
        name: "图片转 Base64",
        description: "将图片转换为 Base64 编码",
        path: "/image-base64",
        icon: <Image className="size-5" />,
        keywords: ["图片", "base64", "转换", "编码", "image"]
      },
      {
        name: "二维码生成",
        description: "生成自定义二维码",
        path: "/qrcode",
        icon: <QrCode className="size-5" />,
        keywords: ["二维码", "qrcode", "qr", "生成", "扫码"]
      }
    ]
  },
  {
    name: "时间日期",
    id: "datetime",
    icon: <CalendarClock className="size-4" />,
    tools: [
      {
        name: "时间戳转换",
        description: "Unix 时间戳与日期互转",
        path: "/timestamp",
        icon: <Clock className="size-5" />,
        tag: "常用",
        keywords: ["时间戳", "timestamp", "unix", "日期", "时间", "转换"]
      }
    ]
  },
  {
    name: "开发工具",
    id: "devtools",
    icon: <FileCode className="size-4" />,
    tools: [
      {
        name: "颜色转换",
        description: "HEX、RGB、HSL 颜色格式转换",
        path: "/color-converter",
        icon: <Palette className="size-5" />,
        keywords: ["颜色", "color", "hex", "rgb", "hsl", "转换", "取色"]
      },
      {
        name: "进制转换",
        description: "二进制、八进制、十进制、十六进制互转",
        path: "/number-base",
        icon: <Calculator className="size-5" />,
        keywords: ["进制", "二进制", "八进制", "十进制", "十六进制", "转换", "binary", "hex"]
      },
      {
        name: "正则测试",
        description: "实时测试正则表达式",
        path: "/regex-tester",
        icon: <Regex className="size-5" />,
        tag: "常用",
        keywords: ["正则", "regex", "测试", "匹配", "表达式"]
      },
      {
        name: "文本差异",
        description: "对比两段文本的差异",
        path: "/text-diff",
        icon: <GitCompare className="size-5" />,
        keywords: ["文本", "对比", "差异", "diff", "比较"]
      }
    ]
  },
  {
    name: "文档工具",
    id: "documents",
    icon: <Files className="size-4" />,
    tools: [
      {
        name: "PDF 合并",
        description: "将多个 PDF 文件合并为一个",
        path: "/pdf-merge",
        icon: <Files className="size-5" />,
        tag: "常用",
        keywords: ["pdf", "合并", "拼接", "merge", "文档", "combine"]
      },
      {
        name: "Markdown 预览",
        description: "实时预览 Markdown 文档",
        path: "/markdown-preview",
        icon: <FileText className="size-5" />,
        keywords: ["markdown", "md", "预览", "文档", "编辑器"]
      }
    ]
  }
]

// 获取所有工具的扁平列表
const allTools = toolCategories.flatMap(category =>
  category.tools.map(tool => ({ ...tool, category: category.name }))
)

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase()
    return allTools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.keywords?.some(kw => kw.toLowerCase().includes(query))
    )
  }, [searchQuery])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return toolCategories

    const query = searchQuery.toLowerCase()
    return toolCategories
      .map(category => ({
        ...category,
        tools: category.tools.filter(tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.keywords?.some(kw => kw.toLowerCase().includes(query))
        )
      }))
      .filter(category => category.tools.length > 0)
  }, [searchQuery])

  const isSearching = searchQuery.trim().length > 0

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="flex gap-6">
      {/* 左侧快速导航 - 仅在非搜索状态和大屏幕显示 */}
      {!isSearching && (
        <aside className="hidden lg:block w-44 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">快速导航</p>
            {toolCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-left"
              >
                {category.icon}
                <span>{category.name}</span>
                <ChevronRight className="size-3 ml-auto opacity-50" />
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* 主内容区 */}
      <div className={`flex-1 min-w-0 space-y-8 ${isSearching ? "w-full" : ""}`}>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">网页实用工具大全</h1>
          <p className="text-muted-foreground">
            无需登录，打开即用，纯前端本地处理
          </p>

          {/* 搜索框 */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索工具... (如: json、base64、时间戳)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {isSearching && (
            <p className="text-sm text-muted-foreground">
              {filteredTools?.length === 0
                ? "未找到匹配的工具"
                : `找到 ${filteredTools?.length} 个工具`}
            </p>
          )}
        </div>

        {/* 搜索结果或分类列表 */}
        {isSearching && filteredTools && filteredTools.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">搜索结果</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <Link key={tool.path} to={tool.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-muted-foreground">{tool.icon}</div>
                          <CardTitle className="text-base">{tool.name}</CardTitle>
                        </div>
                        {tool.tag && (
                          <Badge variant="secondary" className="text-xs">
                            {tool.tag}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{tool.description}</CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">{tool.category}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <section key={category.id} id={category.id} className="space-y-4 scroll-mt-20">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{category.icon}</span>
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map((tool) => (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-muted-foreground">{tool.icon}</div>
                              <CardTitle className="text-base">{tool.name}</CardTitle>
                            </div>
                            {tool.tag && (
                              <Badge variant="secondary" className="text-xs">
                                {tool.tag}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
