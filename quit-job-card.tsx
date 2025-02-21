"use client"

import React from 'react'
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import type { HTMLMotionProps } from "framer-motion"

const emojis = ["😐", "😠", "😡", "🤬", "💥"]

interface Square {
  checked: boolean
  date: string
  clicks: number
}

// 添加 JSX 元素的類型
type DivProps = React.HTMLAttributes<HTMLDivElement>
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
type SpanProps = React.HTMLAttributes<HTMLSpanElement>

// 修改 motion.button 的類型
interface MotionButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode
}

const createInitialSquares = (size: number) => {
  return Array(size)
    .fill(null)
    .map(() => ({
      checked: false,
      date: "",
      clicks: 0,
    }))
}

export default function QuitJobCard() {
  const [checkedSquares, setCheckedSquares] = useState<Square[]>(() => createInitialSquares(16))
  const [gridSize, setGridSize] = useState<number>(16)
  const [showDialog, setShowDialog] = useState(false)
  const [crackLevel, setCrackLevel] = useState(0)
  const [lastClickTime, setLastClickTime] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    try {
      const savedState = localStorage.getItem("quitJobCardState")
      if (savedState) {
        const { checkedSquares: savedSquares, gridSize: savedGridSize } = JSON.parse(savedState)
        setCheckedSquares(savedSquares)
        setGridSize(savedGridSize)
      }
    } catch (error) {
      console.error("Error loading saved state:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("quitJobCardState", JSON.stringify({ checkedSquares, gridSize }))
    } catch (error) {
      console.error("Error saving state:", error)
    }
  }, [checkedSquares, gridSize])

  const getSurroundingIndexes = (index: number) => {
    const rowSize = Math.sqrt(gridSize)
    const row = Math.floor(index / rowSize)
    const col = index % rowSize
    return [
      index - rowSize - 1,
      index - rowSize,
      index - rowSize + 1,
      index - 1,
      index + 1,
      index + rowSize - 1,
      index + rowSize,
      index + rowSize + 1,
    ].filter((i) => {
      const iRow = Math.floor(i / rowSize)
      const iCol = i % rowSize
      return i >= 0 && i < gridSize && Math.abs(iRow - row) <= 1 && Math.abs(iCol - col) <= 1
    })
  }

  const toggleSquare = (index: number): void => {
    const now = Date.now()
    const lastClick = lastClickTime[index] || 0
    const isQuickClick = now - lastClick < 1000

    setLastClickTime(prev => ({
      ...prev,
      [index]: now
    }))

    setCheckedSquares((prev: Square[]) => {
      const newSquares = [...prev]
      const currentDate = new Date().toLocaleDateString()
      
      // 如果不是連續點擊，重置點擊次數
      const newClicks = !isQuickClick ? 1 : (newSquares[index].clicks || 0) + 1
      
      // 更新當前格子
      newSquares[index] = {
        checked: true,
        date: currentDate,
        clicks: newClicks,
      }

      // 如果達到 5 次點擊，影響周圍格子（加入動畫延遲）
      if (newClicks === 5) {
        setTimeout(() => {
          setCheckedSquares(prev => {
            const explosionSquares = [...prev]
            const surroundingIndexes = getSurroundingIndexes(index)
            surroundingIndexes.forEach((i) => {
              if (i >= 0 && i < explosionSquares.length) {
                explosionSquares[i] = {
                  ...explosionSquares[i],
                  checked: true,
                  date: currentDate,
                  clicks: 0,
                }
              }
            })
            return explosionSquares
          })
        }, 200) // 等待水波效果達到頂點後再爆發
      }

      return newSquares
    })

    setCrackLevel((prev: number) => Math.min(prev + 1, gridSize))
  }

  const changeGridSize = (size: number): void => {
    setGridSize(size)
    setCheckedSquares(createInitialSquares(size))
    setCrackLevel(0)
  }

  const clearAllChecks = () => {
    setCheckedSquares(createInitialSquares(gridSize))
    setCrackLevel(0)
  }

  const checkedCount = checkedSquares.filter((square: Square) => square?.checked).length
  const emojiIndex = Math.min(Math.floor(checkedCount / (gridSize / 5)), 4)
  const allChecked = checkedCount === gridSize

  useEffect(() => {
    if (allChecked) {
      setShowDialog(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [allChecked])

  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.textContent = `
      @keyframes wave {
        0% {
          transform: translate3d(0,0,0) scale(1);
        }
        50% {
          transform: translate3d(0,-2px,0) scale(1.01);
        }
        100% {
          transform: translate3d(0,0,0) scale(1);
        }
      }
    `
    document.head.appendChild(styleSheet)
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-200 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
          style={{
            transform: `scaleX(${checkedCount / gridSize})`,
            transformOrigin: "left",
            transition: "transform 0.5s ease-out",
          }}
        />
        <h2 className="text-3xl font-bold text-center mb-4 text-red-600">職場怒氣集點卡</h2>
        <p className="text-center mb-4 text-gray-700">每當你想掀桌子的時候，在格子上打個勾！</p>
        <div className="text-center mb-4">
          <span className="text-6xl animate-bounce inline-block">{emojis[emojiIndex]}</span>
        </div>
        <div
          className={`grid gap-2 mb-4 ${
            gridSize === 25 ? "grid-cols-5" : gridSize === 16 ? "grid-cols-4" : "grid-cols-3"
          }`}
        >
          {Array(gridSize)
            .fill(null)
            .map((_, index) => {
              const square = checkedSquares[index] || { checked: false, date: "", clicks: 0 }
              return (
                <motion.button
                  key={index}
                  className={`aspect-square rounded-md border-2 relative overflow-hidden ${
                    square.checked ? "bg-red-500 border-red-600" : "bg-white border-gray-300"
                  } transition-colors duration-200 ease-in-out hover:bg-red-100`}
                  onClick={() => toggleSquare(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="absolute top-1 left-1 text-xs opacity-50">{index + 1}</span>
                  {square.checked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                      <span className="text-white text-2xl">✓</span>
                      <span className="absolute bottom-1 right-1 text-xs text-white opacity-75">
                        {square.date}
                      </span>
                    </div>
                  )}
                  {square.clicks > 0 && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-red-600 z-10"
                      initial={{ height: `${((square.clicks - 1) / 5) * 100}%` }}
                      animate={{ 
                        height: `${(square.clicks / 5) * 100}%`,
                        opacity: Date.now() - (lastClickTime[index] || 0) < 1000 ? 1 : 0
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        animation: Date.now() - (lastClickTime[index] || 0) < 1000 ? 'wave 1s ease-in-out infinite' : 'none',
                      }}
                    />
                  )}
                </motion.button>
              )
            })}
        </div>
        <p className="text-center font-semibold text-lg mb-4">
          怒氣值: {checkedCount} / {gridSize}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <button
            onClick={() => changeGridSize(9)}
            className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
          >
            3x3
          </button>
          <button
            onClick={() => changeGridSize(16)}
            className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
          >
            4x4
          </button>
          <button
            onClick={() => changeGridSize(25)}
            className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
          >
            5x5
          </button>
          <button
            onClick={clearAllChecks}
            className="px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm"
          >
            清空
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg p-8 text-center max-w-md w-full mx-4">
              <h3 className="text-3xl font-bold mb-4 text-red-600">🎉 恭喜達成極限！ 🎉</h3>
              <p className="text-xl mb-4">你的忍耐已經到達頂點！是時候大喊：</p>
              <p className="text-4xl font-bold text-purple-600 mb-6 animate-pulse">"我不幹了！"</p>
              <p className="mb-6">記住，生活中還有很多美好的事情等著你去發現。也許是時候開始新的冒險了！</p>
              <div className="flex justify-center space-x-4">
                <button
                  className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-lg font-semibold"
                  onClick={() => {
                    setCheckedSquares(createInitialSquares(gridSize))
                    setShowDialog(false)
                    setCrackLevel(0)
                  }}
                >
                  再忍忍看
                </button>
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-lg font-semibold"
                >
                  我要離職！
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

