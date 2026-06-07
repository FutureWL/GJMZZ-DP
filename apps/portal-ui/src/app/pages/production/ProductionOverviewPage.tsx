import ReactECharts from 'echarts-for-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { alarms, workOrders } from '../../mock/data'
import { useAuth } from '../../state/auth/useAuth'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

export function ProductionOverviewPage() {
  const auth = useAuth()
  const [factoryCount, setFactoryCount] = useState<number | null>(null)
  const [factoryError, setFactoryError] = useState<string | null>(null)

  const chartText = '#D4D4D8'
  const chartSubText = '#A1A1AA'
  const chartGridLine = '#27272A'

  const oeeOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      title: {
        text: '实时 OEE',
        left: 12,
        top: 8,
        textStyle: { color: chartText, fontSize: 12, fontWeight: 600 },
      },
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          radius: '90%',
          center: ['50%', '58%'],
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [0.6, '#3B82F6'],
                [0.8, '#10B981'],
                [1, '#F59E0B'],
              ],
            },
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          pointer: { width: 3, length: '65%' },
          progress: { show: true, width: 10 },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: chartText,
            fontSize: 20,
            fontWeight: 700,
            offsetCenter: [0, '45%'],
          },
          data: [{ value: 81.2 }],
        },
      ],
    } as const
  }, [chartText])

  const trendOption = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const output = [10200, 10850, 11340, 10980, 11760, 12010, 11620]
    const yieldRate = [96.2, 97.1, 98.0, 97.6, 98.4, 98.8, 98.1]

    return {
      backgroundColor: 'transparent',
      title: {
        text: '产量与良率趋势',
        left: 12,
        top: 8,
        textStyle: { color: chartText, fontSize: 12, fontWeight: 600 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: '#0B1220',
        borderColor: '#27272A',
        textStyle: { color: chartText },
      },
      grid: { left: 12, right: 12, bottom: 12, top: 44, containLabel: true },
      legend: {
        top: 10,
        right: 12,
        textStyle: { color: chartSubText, fontSize: 11 },
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: days,
        axisLine: { lineStyle: { color: chartGridLine } },
        axisLabel: { color: chartSubText, fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          name: '产量',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: chartGridLine } },
          axisLabel: { color: chartSubText, fontSize: 11 },
          nameTextStyle: { color: chartSubText, fontSize: 11 },
        },
        {
          type: 'value',
          name: '良率',
          min: 95,
          max: 100,
          axisLine: { show: false },
          splitLine: { show: false },
          axisLabel: { formatter: '{value}%', color: chartSubText, fontSize: 11 },
          nameTextStyle: { color: chartSubText, fontSize: 11 },
        },
      ],
      series: [
        {
          name: '产量',
          type: 'line',
          smooth: true,
          data: output,
          lineStyle: { width: 2, color: '#3B82F6' },
          itemStyle: { color: '#3B82F6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59,130,246,0.35)' },
                { offset: 1, color: 'rgba(59,130,246,0.0)' },
              ],
            },
          },
        },
        {
          name: '良率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: yieldRate,
          lineStyle: { width: 2, color: '#10B981' },
          itemStyle: { color: '#10B981' },
        },
      ],
    } as const
  }, [chartGridLine, chartSubText, chartText])

  const equipOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      title: {
        text: '设备运行状态',
        left: 12,
        top: 8,
        textStyle: { color: chartText, fontSize: 12, fontWeight: 600 },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0B1220',
        borderColor: '#27272A',
        textStyle: { color: chartText },
      },
      legend: {
        orient: 'vertical',
        right: 12,
        top: 44,
        textStyle: { color: chartSubText, fontSize: 11 },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['42%', '58%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 10, borderColor: '#18181B', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              formatter: '{b}\n{d}%',
              color: chartText,
              fontSize: 12,
              fontWeight: 600,
            },
          },
          labelLine: { show: false },
          data: [
            { value: 65, name: '运行中', itemStyle: { color: '#10B981' } },
            { value: 20, name: '待机', itemStyle: { color: '#3B82F6' } },
            { value: 10, name: '故障', itemStyle: { color: '#EF4444' } },
            { value: 5, name: '调机', itemStyle: { color: '#F59E0B' } },
          ],
        },
      ],
    } as const
  }, [chartSubText, chartText])

  useEffect(() => {
    if (!auth.token) return
    fetch('/api/factories', {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return (await res.json()) as unknown
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid response')
        }
        setFactoryCount(data.length)
        setFactoryError(null)
      })
      .catch((e) => {
        setFactoryCount(null)
        setFactoryError(e instanceof Error ? e.message : 'Request failed')
      })
  }, [auth.token])

  return (
    <div>
      <PageHeader title="工厂总览" description="生产域：摘要 + 异常优先（示例数据）" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>工厂（API）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">
              {factoryCount ?? '--'}
            </div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">
              {factoryError ? `请求失败：${factoryError}` : '来自 factory-api /factories'}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>产量（今日）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">12,480</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">达成率 93%（占位）</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>良率</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">98.6%</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">PPM 320（占位）</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>OEE</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">81.2%</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">A/P/Q 分解占位</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>严重告警</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-end justify-between gap-3">
              <div className="text-3xl font-semibold text-[var(--color-text-primary)]">1</div>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/production/alarms">
                进入告警中心
              </Link>
            </div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未关闭告警 2（占位）</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>OEE 综合效率</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-[220px]">
              <ReactECharts option={oeeOption} style={{ height: '220px', width: '100%' }} />
            </div>
          </CardBody>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>近 7 天趋势</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-[220px]">
              <ReactECharts option={trendOption} style={{ height: '220px', width: '100%' }} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>设备状态</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="h-[220px]">
              <ReactECharts option={equipOption} style={{ height: '220px', width: '100%' }} />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最新告警</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {alarms.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{a.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {a.equipment} · {a.line} · {a.startAt}
                    </div>
                  </div>
                  <Badge tone={a.severity === 'critical' ? 'error' : a.severity === 'medium' ? 'warning' : 'neutral'}>
                    {a.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>在制工单</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {workOrders.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{w.id}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {w.product} · {w.line} · {w.progress}%
                    </div>
                  </div>
                  <Link
                    className="text-sm text-[var(--color-primary)] hover:underline"
                    to={`/production/workorders/${encodeURIComponent(w.id)}`}
                  >
                    查看
                  </Link>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
