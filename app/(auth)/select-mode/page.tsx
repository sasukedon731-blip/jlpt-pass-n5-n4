import { Suspense } from "react"
import SelectModeClient from "./SelectModeClient"

export default function SelectModePage() {
  return (
    <Suspense fallback={null}>
      <SelectModeClient />
    </Suspense>
  )
}
