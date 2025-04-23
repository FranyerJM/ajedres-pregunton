import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StatsPanel({ playerStats, boardColors }) {
  // Calcular precisión (evitar división por cero)
  const calculateAccuracy = (correct, total) => {
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  // Calcular estadísticas para cada jugador
  const whiteStats = {
    total: playerStats.w.correct + playerStats.w.incorrect,
    accuracy: calculateAccuracy(playerStats.w.correct, playerStats.w.correct + playerStats.w.incorrect),
  }

  const blackStats = {
    total: playerStats.b.correct + playerStats.b.incorrect,
    accuracy: calculateAccuracy(playerStats.b.correct, playerStats.b.correct + playerStats.b.incorrect),
  }

  return (
    <Card className="border border-gray-300 mt-3" style={{ borderColor: "var(--dark-square)", opacity: 0.9 }}>
      <CardHeader className="py-1 px-3" style={{ backgroundColor: "var(--dark-square)", color: "white" }}>
        <CardTitle className="text-sm">Historial de Preguntas</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-xs" style={{ backgroundColor: "var(--light-square)" }}>
        <div className="flex justify-between gap-2">
          {/* Estadísticas de Blancas */}
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 bg-white rounded-full border flex items-center justify-center mr-1 text-xs">
                ♔
              </div>
              <span className="font-medium text-xs" style={{ color: "var(--dark-square)" }}>
                Blancas: {playerStats.w.correct}/{whiteStats.total} ({whiteStats.accuracy}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mb-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${whiteStats.accuracy}%`,
                  backgroundColor: "var(--dark-square)",
                }}
              ></div>
            </div>
          </div>

          {/* Estadísticas de Negras */}
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 bg-black text-white rounded-full border flex items-center justify-center mr-1 text-xs">
                ♚
              </div>
              <span className="font-medium text-xs" style={{ color: "var(--dark-square)" }}>
                Negras: {playerStats.b.correct}/{blackStats.total} ({blackStats.accuracy}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${blackStats.accuracy}%`,
                  backgroundColor: "var(--dark-square)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
