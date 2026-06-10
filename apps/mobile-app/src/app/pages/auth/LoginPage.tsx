import { useAuth } from '../../state/auth/useAuth'

export function LoginPage() {
  const { signInWithSSO } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏭</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">工厂移动App</h1>
          <p className="text-gray-500 mt-2">全功能企业移动应用</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signInWithSSO()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>🔐</span>
            <span>企业 SSO 登录</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  )
}
