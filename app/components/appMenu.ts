export type AppMenuItem = {
  href: string
  label: string
  icon: string
}

export const APP_MENU: AppMenuItem[] = [
  { href: "/", icon: "🏠", label: "TOP" },
  { href: "/select-mode", icon: "📝", label: "学習を始める" },
  { href: "/game", icon: "🎮", label: "ゲーム" },
  { href: "/contents", icon: "📚", label: "教材一覧" },
  { href: "/mypage", icon: "👤", label: "マイページ" },
  { href: "/plans", icon: "💳", label: "プラン" },
]
