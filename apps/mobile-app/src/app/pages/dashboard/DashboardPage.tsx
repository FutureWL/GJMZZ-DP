import { Bell, ChevronRight, Search, Settings, UserRound } from 'lucide-react'
import { useAuth } from '../../state/auth/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Card, CardBody } from '../../components/ui/Card'

export function DashboardPage() {
  const { user } = useAuth()

  const quickActions = [
    { label: '我的待办', count: 8, icon: '📋', color: 'bg-blue-50' },
    { label: '审批中心', count: 5, icon: '✅', color: 'bg-green-50' },
    { label: '客户管理', count: 23, icon: '👥', color: 'bg-purple-50' },
    { label: '告警中心', count: 3, icon: '⚠️', color: 'bg-red-50' },
  ]

  const recentTasks = [
    { id: 1, title: '审批采购订单 #PO-2024-001', time: '10分钟前', status: 'pending' },
    { id: 2, title: '确认客户拜访计划', time: '30分钟前', status: 'pending' },
    { id: 3, title: '审核质量问题报告', time: '1小时前', status: 'pending' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <UserRound className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {user?.name || '用户'}
                </h1>
                <p className="text-sm text-gray-500">{user?.department || '移动App'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索待办、客户、工单..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <div
              key={action.label}
              className={`${action.color} rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{action.icon}</span>
                <Badge tone="primary">{action.count}</Badge>
              </div>
              <h3 className="font-medium text-gray-900">{action.label}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Tasks */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近待办</h2>
          <button className="text-primary-600 text-sm font-medium">查看全部</button>
        </div>
        <Card>
          <CardBody className="p-0">
            {recentTasks.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer ${
                  index !== recentTasks.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{task.time}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-4 gap-1 py-2">
          <button className="flex flex-col items-center py-2 px-3 text-primary-600">
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">首页</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-primary-600">
            <span className="text-xl mb-1">📋</span>
            <span className="text-xs">待办</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-primary-600">
            <span className="text-xl mb-1">👥</span>
            <span className="text-xs">CRM</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-primary-600">
            <span className="text-xl mb-1">👤</span>
            <span className="text-xs">我的</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
