import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

interface UnitCategory {
  name: string
  id: string
  units: { id: string; name: string; ratio: number }[]
  baseUnit: string
}

const unitCategories: UnitCategory[] = [
  {
    name: "长度",
    id: "length",
    baseUnit: "m",
    units: [
      { id: "km", name: "千米 (km)", ratio: 1000 },
      { id: "m", name: "米 (m)", ratio: 1 },
      { id: "dm", name: "分米 (dm)", ratio: 0.1 },
      { id: "cm", name: "厘米 (cm)", ratio: 0.01 },
      { id: "mm", name: "毫米 (mm)", ratio: 0.001 },
      { id: "um", name: "微米 (μm)", ratio: 0.000001 },
      { id: "mi", name: "英里 (mi)", ratio: 1609.344 },
      { id: "yd", name: "码 (yd)", ratio: 0.9144 },
      { id: "ft", name: "英尺 (ft)", ratio: 0.3048 },
      { id: "in", name: "英寸 (in)", ratio: 0.0254 },
      { id: "nmi", name: "海里 (nmi)", ratio: 1852 },
      { id: "li", name: "里", ratio: 500 },
      { id: "zhang", name: "丈", ratio: 10 / 3 },
      { id: "chi", name: "尺", ratio: 1 / 3 },
      { id: "cun", name: "寸", ratio: 1 / 30 },
    ],
  },
  {
    name: "面积",
    id: "area",
    baseUnit: "m2",
    units: [
      { id: "km2", name: "平方千米 (km²)", ratio: 1000000 },
      { id: "ha", name: "公顷 (ha)", ratio: 10000 },
      { id: "m2", name: "平方米 (m²)", ratio: 1 },
      { id: "dm2", name: "平方分米 (dm²)", ratio: 0.01 },
      { id: "cm2", name: "平方厘米 (cm²)", ratio: 0.0001 },
      { id: "mm2", name: "平方毫米 (mm²)", ratio: 0.000001 },
      { id: "acre", name: "英亩 (acre)", ratio: 4046.8564224 },
      { id: "sqft", name: "平方英尺 (ft²)", ratio: 0.09290304 },
      { id: "mu", name: "亩", ratio: 666.6666667 },
    ],
  },
  {
    name: "体积",
    id: "volume",
    baseUnit: "l",
    units: [
      { id: "m3", name: "立方米 (m³)", ratio: 1000 },
      { id: "l", name: "升 (L)", ratio: 1 },
      { id: "ml", name: "毫升 (mL)", ratio: 0.001 },
      { id: "gal", name: "加仑 (US gal)", ratio: 3.785411784 },
      { id: "qt", name: "夸脱 (qt)", ratio: 0.946352946 },
      { id: "pt", name: "品脱 (pt)", ratio: 0.473176473 },
      { id: "cup", name: "杯", ratio: 0.2365882365 },
      { id: "floz", name: "液体盎司 (fl oz)", ratio: 0.0295735295625 },
      { id: "tbsp", name: "汤匙 (tbsp)", ratio: 0.01478676478125 },
      { id: "tsp", name: "茶匙 (tsp)", ratio: 0.00492892159375 },
    ],
  },
  {
    name: "重量",
    id: "weight",
    baseUnit: "kg",
    units: [
      { id: "t", name: "吨 (t)", ratio: 1000 },
      { id: "kg", name: "千克 (kg)", ratio: 1 },
      { id: "g", name: "克 (g)", ratio: 0.001 },
      { id: "mg", name: "毫克 (mg)", ratio: 0.000001 },
      { id: "lb", name: "磅 (lb)", ratio: 0.45359237 },
      { id: "oz", name: "盎司 (oz)", ratio: 0.028349523125 },
      { id: "jin", name: "斤", ratio: 0.5 },
      { id: "liang", name: "两", ratio: 0.05 },
    ],
  },
  {
    name: "温度",
    id: "temperature",
    baseUnit: "c",
    units: [
      { id: "c", name: "摄氏度 (°C)", ratio: 1 },
      { id: "f", name: "华氏度 (°F)", ratio: 1 },
      { id: "k", name: "开尔文 (K)", ratio: 1 },
    ],
  },
  {
    name: "速度",
    id: "speed",
    baseUnit: "mps",
    units: [
      { id: "mps", name: "米/秒 (m/s)", ratio: 1 },
      { id: "kmph", name: "千米/时 (km/h)", ratio: 1 / 3.6 },
      { id: "mph", name: "英里/时 (mph)", ratio: 0.44704 },
      { id: "knot", name: "节 (kn)", ratio: 0.514444 },
      { id: "mach", name: "马赫", ratio: 340.3 },
    ],
  },
  {
    name: "时间",
    id: "time",
    baseUnit: "s",
    units: [
      { id: "y", name: "年", ratio: 31536000 },
      { id: "mo", name: "月", ratio: 2592000 },
      { id: "w", name: "周", ratio: 604800 },
      { id: "d", name: "天", ratio: 86400 },
      { id: "h", name: "小时", ratio: 3600 },
      { id: "min", name: "分钟", ratio: 60 },
      { id: "s", name: "秒", ratio: 1 },
      { id: "ms", name: "毫秒", ratio: 0.001 },
      { id: "us", name: "微秒", ratio: 0.000001 },
    ],
  },
  {
    name: "数据存储",
    id: "data",
    baseUnit: "b",
    units: [
      { id: "tb", name: "TB", ratio: 1099511627776 },
      { id: "gb", name: "GB", ratio: 1073741824 },
      { id: "mb", name: "MB", ratio: 1048576 },
      { id: "kb", name: "KB", ratio: 1024 },
      { id: "b", name: "Byte", ratio: 1 },
      { id: "bit", name: "bit", ratio: 0.125 },
    ],
  },
]

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number
  switch (from) {
    case "f":
      celsius = (value - 32) * 5 / 9
      break
    case "k":
      celsius = value - 273.15
      break
    default:
      celsius = value
  }

  switch (to) {
    case "f":
      return celsius * 9 / 5 + 32
    case "k":
      return celsius + 273.15
    default:
      return celsius
  }
}

export function UnitConverterPage() {
  const [activeTab, setActiveTab] = useState("length")
  const [value, setValue] = useState("")
  const [fromUnit, setFromUnit] = useState("")
  const [toUnit, setToUnit] = useState("")

  const currentCategory = useMemo(
    () => unitCategories.find((c) => c.id === activeTab),
    [activeTab]
  )

  // 初始化单位选择
  useMemo(() => {
    if (currentCategory && currentCategory.units.length >= 2) {
      setFromUnit(currentCategory.units[0].id)
      setToUnit(currentCategory.units[1].id)
    }
  }, [currentCategory])

  const result = useMemo(() => {
    if (!value || !fromUnit || !toUnit || !currentCategory) return ""
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return ""

    // 温度特殊处理
    if (activeTab === "temperature") {
      const converted = convertTemperature(numValue, fromUnit, toUnit)
      return converted.toFixed(6).replace(/\.?0+$/, "")
    }

    const fromRatio = currentCategory.units.find((u) => u.id === fromUnit)?.ratio || 1
    const toRatio = currentCategory.units.find((u) => u.id === toUnit)?.ratio || 1
    const baseValue = numValue * fromRatio
    const converted = baseValue / toRatio

    return converted.toFixed(10).replace(/\.?0+$/, "")
  }, [value, fromUnit, toUnit, currentCategory, activeTab])

  const handleSwap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Scale className="size-6" />}
        title="单位转换器"
        description="长度、面积、体积、重量、温度等多种单位转换"
      />

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap h-auto gap-1">
              {unitCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-sm">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {unitCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
                  <div className="space-y-2">
                    <Label>从</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择单位" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="输入数值"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  <button
                    onClick={handleSwap}
                    className="p-2 rounded-full hover:bg-muted transition-colors self-center"
                    title="交换单位"
                  >
                    ⇄
                  </button>

                  <div className="space-y-2">
                    <Label>到</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择单位" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      value={result}
                      readOnly
                      className="font-mono bg-muted"
                      placeholder="结果"
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
