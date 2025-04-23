"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GameInfo({ playerTurn, moveHistory, capturedPieces, boardColors }) {
  // Mapeo de piezas a emojis/símbolos
  const pieceSymbols = {
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  }

  // Convertir notación algebraica a formato más legible
  const formatMove = (move, index) => {
    const moveNumber = Math.floor(index / 2) + 1
    const isWhiteMove = index % 2 === 0

    let formattedMove = isWhiteMove ? `${moveNumber}. ` : ""
    formattedMove += move.san

    return formattedMove
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="border-2" style={{ borderColor: "var(--dark-square)" }}>
        <CardHeader className="py-2 px-4" style={{ backgroundColor: "var(--dark-square)", color: "white" }}>
          <CardTitle className="text-lg">Turno Actual</CardTitle>
        </CardHeader>
        <CardContent className="p-4" style={{ backgroundColor: "var(--light-square)" }}>
          <div className="flex items-center justify-center">
            <div
              className={`w-8 h-8 rounded-full ${playerTurn === "w" ? "bg-white" : "bg-black"} border-2 border-gray-400 flex items-center justify-center text-2xl`}
            >
              {playerTurn === "w" ? "♔" : "♚"}
            </div>
            <span className="ml-3 text-lg font-medium" style={{ color: "var(--dark-square)" }}>
              {playerTurn === "w" ? "Blancas" : "Negras"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border-2 flex-grow"
        style={{
          borderColor: "var(--dark-square)",
          backgroundColor: "var(--light-square)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <CardHeader className="py-2 px-4" style={{ backgroundColor: "var(--dark-square)", color: "white" }}>
          <CardTitle className="text-lg">Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow" style={{ height: "200px" }}>
          <ScrollArea className="h-full w-full p-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {moveHistory.map((move, index) => (
                <div
                  key={index}
                  className={`${index % 2 === 0 ? "col-start-1" : "col-start-2"} text-sm font-mono`}
                  style={{ color: "var(--dark-square)" }}
                >
                  {formatMove(move, index)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-2" style={{ borderColor: "var(--dark-square)" }}>
        <CardHeader className="py-2 px-4" style={{ backgroundColor: "var(--dark-square)", color: "white" }}>
          <CardTitle className="text-lg">Piezas Capturadas</CardTitle>
        </CardHeader>
        <CardContent className="p-4" style={{ backgroundColor: "var(--light-square)" }}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="w-6 h-6 bg-white rounded-full border flex items-center justify-center mr-2">♔</span>
              <div className="text-xl" style={{ color: "var(--dark-square)" }}>
                {capturedPieces.b.map((piece, index) => (
                  <span key={index}>{pieceSymbols[piece]}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-black text-white rounded-full border flex items-center justify-center mr-2">
                ♚
              </span>
              <div className="text-xl" style={{ color: "var(--dark-square)" }}>
                {capturedPieces.w.map((piece, index) => (
                  <span key={index}>{pieceSymbols[piece]}</span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
