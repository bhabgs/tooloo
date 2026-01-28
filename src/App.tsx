import { lazy, Suspense } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"

// 懒加载所有工具页面
const JsonFormatterPage = lazy(() => import("@/pages/JsonFormatterPage").then(m => ({ default: m.JsonFormatterPage })))
const Base64Page = lazy(() => import("@/pages/Base64Page").then(m => ({ default: m.Base64Page })))
const UrlCodecPage = lazy(() => import("@/pages/UrlCodecPage").then(m => ({ default: m.UrlCodecPage })))
const HashPage = lazy(() => import("@/pages/HashPage").then(m => ({ default: m.HashPage })))
const UuidPage = lazy(() => import("@/pages/UuidPage").then(m => ({ default: m.UuidPage })))
const TimestampPage = lazy(() => import("@/pages/TimestampPage").then(m => ({ default: m.TimestampPage })))
const ColorConverterPage = lazy(() => import("@/pages/ColorConverterPage").then(m => ({ default: m.ColorConverterPage })))
const NumberBasePage = lazy(() => import("@/pages/NumberBasePage").then(m => ({ default: m.NumberBasePage })))
const ImageBase64Page = lazy(() => import("@/pages/ImageBase64Page").then(m => ({ default: m.ImageBase64Page })))
const ImageCompressPage = lazy(() => import("@/pages/ImageCompressPage").then(m => ({ default: m.ImageCompressPage })))
const BackgroundRemovalPage = lazy(() => import("@/pages/BackgroundRemovalPage").then(m => ({ default: m.BackgroundRemovalPage })))
const QrCodePage = lazy(() => import("@/pages/QrCodePage").then(m => ({ default: m.QrCodePage })))
const PdfMergePage = lazy(() => import("@/pages/PdfMergePage").then(m => ({ default: m.PdfMergePage })))
const TextDiffPage = lazy(() => import("@/pages/TextDiffPage").then(m => ({ default: m.TextDiffPage })))
const RegexTesterPage = lazy(() => import("@/pages/RegexTesterPage").then(m => ({ default: m.RegexTesterPage })))
const PasswordGeneratorPage = lazy(() => import("@/pages/PasswordGeneratorPage").then(m => ({ default: m.PasswordGeneratorPage })))
const MarkdownPreviewPage = lazy(() => import("@/pages/MarkdownPreviewPage").then(m => ({ default: m.MarkdownPreviewPage })))
const JwtParserPage = lazy(() => import("@/pages/JwtParserPage").then(m => ({ default: m.JwtParserPage })))

// 加载中组件
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="json-formatter"
            element={
              <Suspense fallback={<PageLoader />}>
                <JsonFormatterPage />
              </Suspense>
            }
          />
          <Route
            path="base64"
            element={
              <Suspense fallback={<PageLoader />}>
                <Base64Page />
              </Suspense>
            }
          />
          <Route
            path="url-codec"
            element={
              <Suspense fallback={<PageLoader />}>
                <UrlCodecPage />
              </Suspense>
            }
          />
          <Route
            path="hash"
            element={
              <Suspense fallback={<PageLoader />}>
                <HashPage />
              </Suspense>
            }
          />
          <Route
            path="uuid"
            element={
              <Suspense fallback={<PageLoader />}>
                <UuidPage />
              </Suspense>
            }
          />
          <Route
            path="timestamp"
            element={
              <Suspense fallback={<PageLoader />}>
                <TimestampPage />
              </Suspense>
            }
          />
          <Route
            path="color-converter"
            element={
              <Suspense fallback={<PageLoader />}>
                <ColorConverterPage />
              </Suspense>
            }
          />
          <Route
            path="number-base"
            element={
              <Suspense fallback={<PageLoader />}>
                <NumberBasePage />
              </Suspense>
            }
          />
          <Route
            path="image-base64"
            element={
              <Suspense fallback={<PageLoader />}>
                <ImageBase64Page />
              </Suspense>
            }
          />
          <Route
            path="image-compress"
            element={
              <Suspense fallback={<PageLoader />}>
                <ImageCompressPage />
              </Suspense>
            }
          />
          <Route
            path="background-removal"
            element={
              <Suspense fallback={<PageLoader />}>
                <BackgroundRemovalPage />
              </Suspense>
            }
          />
          <Route
            path="qrcode"
            element={
              <Suspense fallback={<PageLoader />}>
                <QrCodePage />
              </Suspense>
            }
          />
          <Route
            path="pdf-merge"
            element={
              <Suspense fallback={<PageLoader />}>
                <PdfMergePage />
              </Suspense>
            }
          />
          <Route
            path="text-diff"
            element={
              <Suspense fallback={<PageLoader />}>
                <TextDiffPage />
              </Suspense>
            }
          />
          <Route
            path="regex-tester"
            element={
              <Suspense fallback={<PageLoader />}>
                <RegexTesterPage />
              </Suspense>
            }
          />
          <Route
            path="password-generator"
            element={
              <Suspense fallback={<PageLoader />}>
                <PasswordGeneratorPage />
              </Suspense>
            }
          />
          <Route
            path="markdown-preview"
            element={
              <Suspense fallback={<PageLoader />}>
                <MarkdownPreviewPage />
              </Suspense>
            }
          />
          <Route
            path="jwt-parser"
            element={
              <Suspense fallback={<PageLoader />}>
                <JwtParserPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </HashRouter>
  )
}

export default App
