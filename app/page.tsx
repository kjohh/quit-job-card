"use client"

import ErrorBoundary from '../components/ErrorBoundary'
import QuitJobCard from '../quit-job-card'

export default function SyntheticV0PageForDeployment() {
  return (
    <ErrorBoundary>
      <QuitJobCard />
    </ErrorBoundary>
  )
}