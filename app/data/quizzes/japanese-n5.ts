import type { Quiz } from "@/app/data/types"

export const japaneseN5Quiz: Quiz = {
  id: "japanese-n5",
  title: "日本語検定 N5",
  description: "N5教材の箱です。問題はあとから追加できます。",
  sections: [
    { id: "moji-goi", label: "文字・語彙" },
    { id: "bunpo", label: "文法" },
    { id: "reading", label: "読解" },
    { id: "listening", label: "聴解" },
  ],
  questions: [
    {
      id: 1,
      sectionId: "moji-goi",
      question: "これはN5教材のプレースホルダー問題です。あとで本番問題に差し替えてください。",
      choices: ["準備OK", "未設定", "あとで追加", "箱だけ作成済み"],
      correctIndex: 3,
      explanation: "この教材は箱だけ先に用意しています。questions 配列に本番問題を追加してください。",
    },
    {
      id: 2,
      sectionId: "bunpo",
      question: "N5文法問題の追加先はどこですか。",
      choices: ["app/data/quizzes/japanese-n5.ts", "public/audio", "app/layout.tsx", "package.json"],
      correctIndex: 0,
      explanation: "N5の問題追加先は app/data/quizzes/japanese-n5.ts です。",
    },
    {
      id: 3,
      sectionId: "reading",
      question: "この教材は何のために入っていますか。",
      choices: ["完成版として使うため", "N5の箱を先に作るため", "N2に変換するため", "画像だけ置くため"],
      correctIndex: 1,
      explanation: "あとで問題を増やせるように、N5の箱を先に作っています。",
    },
    {
      id: 4,
      sectionId: "listening",
      question: "あとで音声問題を追加したい場合も、この教材に足していけばOKです。",
      choices: ["はい", "いいえ", "どちらでもない", "音声は不可"],
      correctIndex: 0,
      explanation: "listening セクションに listeningText と音声ファイルを追加すれば拡張できます。",
      listeningText: "プレースホルダーです。あとで音声問題を追加できます。",
    },
  ],
}
