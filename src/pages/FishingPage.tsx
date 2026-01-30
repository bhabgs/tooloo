import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/PageHeader"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Fish, Play, Pause, RotateCcw, Terminal, Loader2, CheckCircle2, AlertTriangle, Maximize } from "lucide-react"

// 假装编译的日志
const fakeBuildLogs = [
  "$ npm run build",
  "> tooloo@1.0.0 build",
  "> vite build",
  "",
  "vite v7.2.4 building for production...",
  "transforming...",
  "✓ 1247 modules transformed.",
  "rendering chunks...",
  "computing gzip size...",
  "dist/index.html                  0.46 kB │ gzip:  0.30 kB",
  "dist/assets/index-DiwrgTda.css  45.89 kB │ gzip: 10.87 kB",
  "dist/assets/index-CgHlqvut.js  312.45 kB │ gzip: 98.21 kB",
  "✓ built in 4.23s",
  "",
  "$ npm run deploy",
  "> tooloo@1.0.0 deploy",
  "> gh-pages -d dist",
  "",
  "Published to https://example.github.io/tooloo/",
]

const fakeTestLogs = [
  "$ npm test",
  "> tooloo@1.0.0 test",
  "> vitest run",
  "",
  " RUN  v3.0.4 /project/tooloo",
  "",
  " ✓ src/utils/hash.test.ts (5 tests) 124ms",
  " ✓ src/utils/base64.test.ts (3 tests) 45ms",
  " ✓ src/utils/url.test.ts (4 tests) 38ms",
  " ✓ src/components/Button.test.tsx (2 tests) 89ms",
  " ✓ src/hooks/useCopy.test.ts (2 tests) 23ms",
  "",
  " Test Files  5 passed (5)",
  " Tests  16 passed (16)",
  " Start at  14:32:15",
  " Duration  1.24s",
]

const fakeInstallLogs = [
  "$ npm install",
  "",
  "added 1247 packages in 32s",
  "",
  "312 packages are looking for funding",
  "  run `npm fund` for details",
]

// 假装写代码的代码片段
const fakeCodeSnippets = [
  `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}`,
  `async function fetchUserData(userId: string) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`)
    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}`,
  `interface Config {
  apiUrl: string
  timeout: number
  retries: number
  debug: boolean
}

const defaultConfig: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  debug: process.env.NODE_ENV === 'development'
}

export function createClient(config: Partial<Config> = {}) {
  const finalConfig = { ...defaultConfig, ...config }
  // Implementation details...
}`,
  `export function calculateHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}`,
  `const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const result = await submitForm(formData)
    toast.success('提交成功！')
    router.push('/dashboard')
  } catch (error) {
    toast.error('提交失败，请重试')
  } finally {
    setLoading(false)
  }
}`,
]

type Mode = "build" | "code" | "boss"

export function FishingPage() {
  const [mode, setMode] = useState<Mode>("build")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [displayedCode, setDisplayedCode] = useState("")
  const [codeIndex, setCodeIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const codeEditorRef = useRef<HTMLDivElement>(null)
  const [buildType, setBuildType] = useState<"build" | "test" | "install">("build")
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 全屏切换
  const enterFullscreen = useCallback(() => {
    const target = mode === "build" ? logContainerRef.current : codeEditorRef.current
    if (target) {
      target.requestFullscreen()
    }
  }, [mode])

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const getCurrentLogs = useCallback(() => {
    switch (buildType) {
      case "test":
        return fakeTestLogs
      case "install":
        return fakeInstallLogs
      default:
        return fakeBuildLogs
    }
  }, [buildType])

  // 假装编译效果
  useEffect(() => {
    if (mode !== "build" || !isRunning) return

    const currentLogs = getCurrentLogs()
    if (currentLogIndex >= currentLogs.length) {
      setIsRunning(false)
      setProgress(100)
      return
    }

    const timer = setTimeout(() => {
      setLogs(prev => [...prev, currentLogs[currentLogIndex]])
      setCurrentLogIndex(prev => prev + 1)
      setProgress((currentLogIndex / currentLogs.length) * 100)
    }, Math.random() * 300 + 100)

    return () => clearTimeout(timer)
  }, [mode, isRunning, currentLogIndex, getCurrentLogs])

  // 自动滚动日志
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  // 假装写代码效果
  useEffect(() => {
    if (mode !== "code" || !isRunning) return

    const currentSnippet = fakeCodeSnippets[codeIndex % fakeCodeSnippets.length]

    if (charIndex >= currentSnippet.length) {
      // 完成一段代码，等待后开始下一段
      const timer = setTimeout(() => {
        setCodeIndex(prev => prev + 1)
        setCharIndex(0)
        setDisplayedCode("")
      }, 2000)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setDisplayedCode(currentSnippet.slice(0, charIndex + 1))
      setCharIndex(prev => prev + 1)
    }, Math.random() * 80 + 20)

    return () => clearTimeout(timer)
  }, [mode, isRunning, codeIndex, charIndex])

  // 老板键 - 按 Escape 切换（非全屏时）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        setMode(prev => prev === "boss" ? "build" : "boss")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const startBuild = (type: "build" | "test" | "install") => {
    setBuildType(type)
    setLogs([])
    setCurrentLogIndex(0)
    setProgress(0)
    setIsRunning(true)
  }

  const resetBuild = () => {
    setLogs([])
    setCurrentLogIndex(0)
    setProgress(0)
    setIsRunning(false)
  }

  const toggleCodeTyping = () => {
    setIsRunning(prev => !prev)
  }

  // 老板模式 - 显示假装的工作界面
  if (mode === "boss") {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<Terminal className="size-6" />}
          title="代码审查"
          description="正在进行代码质量分析..."
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              分析中
            </CardTitle>
            <CardDescription>正在检查代码规范和潜在问题</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={67} className="h-2" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>已检查: 234/348 个文件</p>
                <p>发现问题: 3 个警告, 0 个错误</p>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <p className="text-green-500">✓ ESLint 检查通过</p>
                <p className="text-green-500">✓ TypeScript 编译成功</p>
                <p className="text-yellow-500">⚠ 3 个未使用的变量</p>
                <p className="text-muted-foreground">正在运行单元测试...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          按 <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> 返回摸鱼模式
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Fish className="size-6" />}
        title="程序员摸鱼专用"
        description="假装在认真工作的神器，支持老板键快速切换"
      />

      {/* 模式选择 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={mode === "build" ? "default" : "outline"}
          onClick={() => setMode("build")}
        >
          <Terminal className="size-4 mr-2" />
          假装编译
        </Button>
        <Button
          variant={mode === "code" ? "default" : "outline"}
          onClick={() => setMode("code")}
        >
          <Play className="size-4 mr-2" />
          假装写代码
        </Button>
        <Badge variant="secondary" className="ml-auto self-center">
          按 Esc 触发老板键
        </Badge>
      </div>

      {/* 假装编译模式 */}
      {mode === "build" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">终端模拟器</CardTitle>
            <CardDescription>看起来像是在编译部署项目</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => startBuild("build")} disabled={isRunning}>
                <Play className="size-4 mr-2" />
                npm run build
              </Button>
              <Button onClick={() => startBuild("test")} disabled={isRunning} variant="outline">
                <Play className="size-4 mr-2" />
                npm test
              </Button>
              <Button onClick={() => startBuild("install")} disabled={isRunning} variant="outline">
                <Play className="size-4 mr-2" />
                npm install
              </Button>
              <Button onClick={resetBuild} variant="ghost">
                <RotateCcw className="size-4 mr-2" />
                重置
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">进度</span>
                <span className="flex items-center gap-2">
                  {isRunning && <Loader2 className="size-3 animate-spin" />}
                  {!isRunning && progress === 100 && <CheckCircle2 className="size-3 text-green-500" />}
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div
              ref={logContainerRef}
              className={`bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-auto ${isFullscreen ? "h-screen w-screen" : "h-80"}`}
            >
              {logs.length === 0 ? (
                <p className="text-zinc-500">{isFullscreen ? "" : "点击按钮开始..."}</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`${isFullscreen ? "text-base leading-relaxed" : ""} ${log.startsWith("✓") ? "text-green-400" : log.startsWith("⚠") || log.includes("warning") ? "text-yellow-400" : ""}`}>
                    {log || "\u00A0"}
                  </div>
                ))
              )}
              {isRunning && <span className="animate-pulse">▋</span>}
            </div>

            {!isFullscreen && (
              <Button variant="outline" size="sm" onClick={enterFullscreen}>
                <Maximize className="size-4 mr-2" />
                全屏
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 假装写代码模式 */}
      {mode === "code" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">代码编辑器</CardTitle>
            <CardDescription>看起来像是在认真写代码</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={toggleCodeTyping}>
                {isRunning ? (
                  <>
                    <Pause className="size-4 mr-2" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-2" />
                    开始
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setDisplayedCode("")
                  setCharIndex(0)
                }}
                variant="outline"
              >
                <RotateCcw className="size-4 mr-2" />
                清空
              </Button>
            </div>

            <div ref={codeEditorRef} className={`bg-zinc-900 rounded-lg overflow-hidden ${isFullscreen ? "h-screen w-screen flex flex-col" : ""}`}>
              {/* 编辑器标题栏 */}
              <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2 shrink-0">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <span className="text-zinc-400 text-sm ml-2">utils.ts</span>
              </div>
              {/* 代码区域 */}
              <div className={`p-4 font-mono text-sm overflow-auto ${isFullscreen ? "flex-1 text-base leading-relaxed" : "h-80"}`}>
                <pre className="text-zinc-100 whitespace-pre-wrap">
                  {displayedCode}
                  {isRunning && <span className="animate-pulse text-blue-400">|</span>}
                </pre>
              </div>
            </div>

            {!isFullscreen && (
              <>
                <Button variant="outline" size="sm" onClick={enterFullscreen}>
                  <Maximize className="size-4 mr-2" />
                  全屏
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="size-4 text-yellow-500" />
                  温馨提示：适度摸鱼，工作要紧
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
