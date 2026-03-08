import { Suspense } from "react"
import LoginPage from "./login-form"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <LoginPage />
    </Suspense>
  )
}