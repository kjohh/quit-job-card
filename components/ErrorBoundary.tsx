'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">哎呀！出了點問題</h2>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            onClick={() => this.setState({ hasError: false })}
          >
            重試
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
