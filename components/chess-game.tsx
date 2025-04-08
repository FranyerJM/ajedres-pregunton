"use client"

import { useState, useEffect, useRef } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import MathQuestion from "./math-question"
import GameInfo from "./game-info"
import SettingsButton from "./settings-button"
import SettingsPanel from "./settings-panel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Preguntas predeterminadas en caso de que falle la carga del JSON
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "¿Cuánto es 15 + 27?",
    options: [
      { id: "A", value: 42 },
      { id: "B", value: 40 },
      { id: "C", value: 43 },
      { id: "D", value: 41 },
    ],
    correctAnswer: 42,
  },
  {
    id: 2,
    question: "¿Cuánto es 8 × 7?",
    options: [
      { id: "A", value: 54 },
      { id: "B", value: 56 },
      { id: "C", value: 58 },
      { id: "D", value: 52 },
    ],
    correctAnswer: 56,
  },
  {
    id: 3,
    question: "¿Cuánto es 45 - 18?",
    options: [
      { id: "A", value: 25 },
      { id: "B", value: 26 },
      { id: "C", value: 27 },
      { id: "D", value: 28 },
    ],
    correctAnswer: 27,
  },
  {
    id: 4,
    question: "¿Cuánto es 12 × 12?",
    options: [
      { id: "A", value: 144 },
      { id: "B", value: 124 },
      { id: "C", value: 134 },
      { id: "D", value: 154 },
    ],
    correctAnswer: 144,
  },
]

// Configuración predeterminada para la frecuencia de preguntas
const DEFAULT_FREQUENCY_SETTINGS = {
  mode: "random", // random, turns, captures, timer
  probability: 30, // Porcentaje para modo aleatorio
  turnFrequency: 2, // Cada cuántos turnos preguntar
  askWhite: true, // Preguntar a las blancas
  askBlack: true, // Preguntar a las negras
  askOnCapture: true, // Preguntar al capturar
  askOnPieceType: ["q", "r", "b", "n"], // Tipos de piezas que activan preguntas
  timerInterval: 60, // Intervalo en segundos
  pauseTimerDuringQuestion: true, // Pausar temporizador durante preguntas
  loseOnWrongAnswer: true, // Perder turno al responder incorrectamente
  showFeedback: true, // Mostrar retroalimentación
  difficulty: "all", // Dificultad: easy, medium, hard, all
}

export default function ChessGame() {
  // Estado del juego de ajedrez
  const [game, setGame] = useState(new Chess())
  const [position, setPosition] = useState(game.fen())

  // Estado para preguntas
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS)
  const [frequencySettings, setFrequencySettings] = useState(DEFAULT_FREQUENCY_SETTINGS)

  // Estado para movimientos
  const [moveHistory, setMoveHistory] = useState([])
  const [moveCount, setMoveCount] = useState(0)

  // Estado para piezas capturadas
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] })

  // Estado para configuración y feedback
  const [showSettings, setShowSettings] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")

  // Estado para guardar información antes de una pregunta
  const [lastMoveInfo, setLastMoveInfo] = useState(null)

  // Estado para el modal de fin de juego
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState("")

  // Referencias para el temporizador
  const timerRef = useRef(null)
  const [timerActive, setTimerActive] = useState(false)

  // Configuración de colores con valores por defecto
  const [boardColors, setBoardColors] = useState({
    lightSquare: "#f0d9b5", // Beige claro
    darkSquare: "#b58863", // Marrón
    border: "#c8a45c", // Dorado
    highlight: {
      from: "rgba(205, 32, 32, 0.4)", // Rojo
      to: "rgba(205, 32, 32, 0.4)", // Rojo
    },
  })

  // Cargar preguntas del archivo JSON o usar las predeterminadas si falla
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Intentar cargar el archivo JSON
        const response = await fetch("/questions.json")

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Parsear la respuesta como JSON
        const data = await response.json()

        // Verificar que los datos tengan el formato esperado
        if (data && data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions)
          console.log("Preguntas cargadas correctamente:", data.questions.length)
        } else {
          console.warn("El formato del archivo JSON no es el esperado. Usando preguntas predeterminadas.")
        }
      } catch (error) {
        console.error("Error cargando preguntas:", error)
        console.log("Usando preguntas predeterminadas")
      }
    }

    loadQuestions()
  }, [])

  // Configurar el temporizador para preguntas basadas en tiempo
  useEffect(() => {
    // Limpiar cualquier temporizador existente
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Si el modo es por tiempo y no hay una pregunta activa, iniciar el temporizador
    if (frequencySettings.mode === "timer" && !showQuestion && !gameOver) {
      setTimerActive(true)
      timerRef.current = setInterval(() => {
        const randomQuestion = getRandomQuestion()
        if (randomQuestion) {
          setCurrentQuestion(randomQuestion)
          setShowQuestion(true)

          // Pausar el temporizador durante la pregunta si está configurado así
          if (frequencySettings.pauseTimerDuringQuestion) {
            setTimerActive(false)
            clearInterval(timerRef.current)
            timerRef.current = null
          }
        }
      }, frequencySettings.timerInterval * 1000)
    }

    // Limpiar el temporizador cuando se desmonte el componente
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [
    frequencySettings.mode,
    frequencySettings.timerInterval,
    showQuestion,
    gameOver,
    frequencySettings.pauseTimerDuringQuestion,
  ])

  // Reanudar el temporizador después de responder una pregunta
  useEffect(() => {
    if (frequencySettings.mode === "timer" && !showQuestion && !timerActive && !gameOver) {
      setTimerActive(true)
      timerRef.current = setInterval(() => {
        const randomQuestion = getRandomQuestion()
        if (randomQuestion) {
          setCurrentQuestion(randomQuestion)
          setShowQuestion(true)

          if (frequencySettings.pauseTimerDuringQuestion) {
            setTimerActive(false)
            clearInterval(timerRef.current)
            timerRef.current = null
          }
        }
      }, frequencySettings.timerInterval * 1000)
    }
  }, [
    showQuestion,
    timerActive,
    gameOver,
    frequencySettings.mode,
    frequencySettings.timerInterval,
    frequencySettings.pauseTimerDuringQuestion,
  ])

  // Seleccionar una pregunta aleatoria
  const getRandomQuestion = () => {
    if (questions.length === 0) return null

    // Filtrar preguntas según la dificultad seleccionada
    const filteredQuestions = questions
    if (frequencySettings.difficulty !== "all") {
      // Aquí se implementaría la lógica para filtrar por dificultad
      // Por ahora, usamos todas las preguntas
    }

    const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
    const question = filteredQuestions[randomIndex]

    return {
      question: question.question,
      options: question.options,
      answer: question.correctAnswer,
    }
  }

  // Función para cambiar el turno en el FEN
  const changeTurnInFEN = (fen, newTurn) => {
    const fenParts = fen.split(" ")
    fenParts[1] = newTurn
    return fenParts.join(" ")
  }

  // Determinar si se debe mostrar una pregunta
  const shouldAskQuestion = (move) => {
    const currentTurn = game.turn() === "w" ? "b" : "w" // El turno que acaba de mover

    switch (frequencySettings.mode) {
      case "random":
        // Modo aleatorio: usar probabilidad
        return Math.random() * 100 < frequencySettings.probability

      case "turns":
        // Modo por turnos: verificar frecuencia y color
        const newMoveCount = moveCount + 1
        setMoveCount(newMoveCount)

        if (newMoveCount % frequencySettings.turnFrequency !== 0) return false

        // Verificar si se debe preguntar a este color
        if (currentTurn === "w" && !frequencySettings.askWhite) return false
        if (currentTurn === "b" && !frequencySettings.askBlack) return false

        return true

      case "captures":
        // Modo por capturas: verificar si hubo captura
        if (!move.captured) return false

        // Si está configurado para preguntar siempre al capturar
        if (frequencySettings.askOnCapture) return true

        // Verificar si el tipo de pieza capturada está en la lista
        return frequencySettings.askOnPieceType.includes(move.captured)

      case "timer":
        // Las preguntas por tiempo se manejan con useEffect, no aquí
        return false

      default:
        return false
    }
  }

  // Manejar el movimiento de piezas
  const onDrop = (sourceSquare, targetSquare) => {
    try {
      // Crear una copia del juego para probar el movimiento
      const gameCopy = new Chess(game.fen())

      // Intentar hacer el movimiento
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // Siempre promover a reina por simplicidad
      })

      // Si el movimiento no es válido
      if (move === null) return false

      // Verificar si el movimiento fue una captura
      if (move.captured) {
        console.log(`Captura detectada: ${move.captured} por ${move.color}`)

        // Actualizar el estado de piezas capturadas
        setCapturedPieces((prev) => {
          // El color que captura es el color del jugador que movió
          const capturingColor = move.color

          return {
            ...prev,
            [capturingColor]: [...prev[capturingColor], move.captured],
          }
        })
      }

      // Actualizar el estado del juego
      setGame(gameCopy)
      setPosition(gameCopy.fen())

      // Guardar el historial de movimientos actualizado
      const updatedMoveHistory = [...moveHistory, move]
      setMoveHistory(updatedMoveHistory)

      // Verificar si el juego ha terminado
      if (gameCopy.isGameOver()) {
        let result = ""
        if (gameCopy.isCheckmate()) {
          // Si es jaque mate, ganó el jugador que acaba de mover
          result = `¡Partida finalizada! ${move.color === "w" ? "Blancas" : "Negras"} ganan por jaque mate.`
        } else if (gameCopy.isDraw()) {
          // Determinar el tipo de tablas
          if (gameCopy.isStalemate()) {
            result = "¡Partida finalizada! Tablas por ahogado."
          } else if (gameCopy.isThreefoldRepetition()) {
            result = "¡Partida finalizada! Tablas por triple repetición."
          } else if (gameCopy.isInsufficientMaterial()) {
            result = "¡Partida finalizada! Tablas por material insuficiente."
          } else {
            result = "¡Partida finalizada! Tablas."
          }
        }

        setGameResult(result)
        setGameOver(true)

        // Detener el temporizador si está activo
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setTimerActive(false)
        }
      }

      // Decidir si mostrar una pregunta según la configuración
      if (shouldAskQuestion(move)) {
        const randomQuestion = getRandomQuestion()
        if (randomQuestion) {
          // Guardar información sobre el estado actual
          setLastMoveInfo({
            position: gameCopy.fen(),
            moveHistory: updatedMoveHistory,
            lastMove: move,
            capturedPieces: JSON.parse(JSON.stringify(capturedPieces)), // Copia profunda del estado actual de piezas capturadas
          })

          setCurrentQuestion(randomQuestion)
          setShowQuestion(true)

          // Si estamos en modo temporizador, pausar el temporizador durante la pregunta
          if (frequencySettings.mode === "timer" && frequencySettings.pauseTimerDuringQuestion && timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
            setTimerActive(false)
          }
        }
      }

      return true
    } catch (error) {
      console.error("Error al mover:", error)
      return false
    }
  }

  // Manejar la respuesta a la pregunta
  const handleAnswer = (selectedOption, isCorrect) => {
    if (!isCorrect && lastMoveInfo && frequencySettings.loseOnWrongAnswer) {
      try {
        // Si la respuesta es incorrecta:
        // 1. Obtener el último movimiento
        const lastMove = lastMoveInfo.lastMove

        // 2. Restaurar el estado de piezas capturadas al estado anterior
        if (lastMove.captured) {
          setCapturedPieces(lastMoveInfo.capturedPieces)
        }

        // 3. Reconstruir el juego hasta el movimiento anterior
        const prevMoveHistory = lastMoveInfo.moveHistory.slice(0, -1)
        const newGame = new Chess()

        prevMoveHistory.forEach((move) => {
          newGame.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          })
        })

        // 4. Determinar el turno actual y el turno opuesto
        const currentTurn = newGame.turn()
        const oppositeTurn = currentTurn === "w" ? "b" : "w"

        // 5. Modificar el FEN para cambiar el turno al oponente
        const newFen = changeTurnInFEN(newGame.fen(), oppositeTurn)

        // 6. Crear un nuevo juego con el FEN modificado
        const gameWithOppositeTurn = new Chess(newFen)

        // 7. Actualizar todos los estados
        setGame(gameWithOppositeTurn)
        setPosition(newFen)
        setMoveHistory(prevMoveHistory)

        // Mostrar mensaje de feedback para respuesta incorrecta si está habilitado
        if (frequencySettings.showFeedback) {
          setFeedbackMessage(`Respuesta incorrecta, turno de ${oppositeTurn === "w" ? "blancas" : "negras"}`)
          setShowFeedback(true)
        }

        console.log(`Respuesta incorrecta. Turno cambiado de ${currentTurn} a ${oppositeTurn}`)
      } catch (error) {
        console.error("Error al manejar respuesta incorrecta:", error)
      }
    } else {
      // Si la respuesta es correcta o no se pierde el turno, el turno sigue siendo del jugador que respondió
      if (frequencySettings.showFeedback) {
        setFeedbackMessage("Respuesta correcta, tu turno se mantiene")
        setShowFeedback(true)
      }
    }

    // Ocultar el mensaje después de 3 segundos si está habilitado
    if (frequencySettings.showFeedback) {
      setTimeout(() => {
        setShowFeedback(false)
      }, 3000)
    }

    setShowQuestion(false)
    setCurrentQuestion(null)
    setLastMoveInfo(null)
  }

  // Agregar una nueva pregunta
  const addQuestion = (newQuestion) => {
    // Actualizar el estado local
    setQuestions([...questions, newQuestion])

    // En una aplicación real, aquí se guardaría en el servidor
    console.log("Nueva pregunta agregada:", newQuestion)
  }

  // Eliminar una pregunta
  const deleteQuestion = (questionId) => {
    if (questionId === "all") {
      // Eliminar todas las preguntas
      setQuestions([])
      console.log("Todas las preguntas eliminadas")
    } else {
      // Eliminar una pregunta específica
      const updatedQuestions = questions.filter((q) => q.id !== questionId)
      setQuestions(updatedQuestions)
      console.log(`Pregunta con ID ${questionId} eliminada`)
    }
  }

  // Actualizar colores del tablero
  const updateBoardColors = (newColors) => {
    setBoardColors(newColors)

    // Actualizar las variables CSS personalizadas para aplicar los colores globalmente
    document.documentElement.style.setProperty("--light-square", newColors.lightSquare)
    document.documentElement.style.setProperty("--dark-square", newColors.darkSquare)
    document.documentElement.style.setProperty("--border-color", newColors.border)
  }

  // Actualizar configuración de frecuencia
  const updateFrequencySettings = (newSettings) => {
    setFrequencySettings(newSettings)

    // Reiniciar el temporizador si es necesario
    if (newSettings.mode === "timer" && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setTimerActive(false)

      // El temporizador se reiniciará automáticamente por el efecto
    }

    console.log("Configuración de frecuencia actualizada:", newSettings)
  }

  // Reiniciar el juego
  const resetGame = () => {
    const newGame = new Chess()
    setGame(newGame)
    setPosition(newGame.fen())
    setMoveHistory([])
    setMoveCount(0)
    setCapturedPieces({ w: [], b: [] })
    setGameOver(false)
    setGameResult("")

    // Reiniciar el temporizador si está en modo temporizador
    if (frequencySettings.mode === "timer" && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setTimerActive(false)
      // El temporizador se reiniciará automáticamente por el efecto
    }
  }

  // Añadir un useEffect para inicializar las variables CSS al cargar el componente
  useEffect(() => {
    // Inicializar las variables CSS con los colores por defecto
    document.documentElement.style.setProperty("--light-square", boardColors.lightSquare)
    document.documentElement.style.setProperty("--dark-square", boardColors.darkSquare)
    document.documentElement.style.setProperty("--border-color", boardColors.border)
  }, [])

  // Modificar los estilos de los elementos para usar las variables CSS
  // Reemplazar las referencias directas a los colores por las variables CSS
  // Por ejemplo, cambiar style={{ backgroundColor: "#b58863" }} por style={{ backgroundColor: "var(--dark-square)" }}

  // En el return, actualizar los estilos de los elementos
  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-between mb-4">
        <div className="text-lg font-semibold" style={{ color: "var(--dark-square)" }}>
          Turno actual: {game.turn() === "w" ? "Blancas" : "Negras"}
        </div>
        <SettingsButton onClick={() => setShowSettings(true)} boardColors={boardColors} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="border-4 rounded-md" style={{ borderColor: "var(--border-color)" }}>
            <Chessboard
              position={position}
              onPieceDrop={onDrop}
              customBoardStyle={{
                borderRadius: "4px",
                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
              }}
              customDarkSquareStyle={{ backgroundColor: "var(--dark-square)" }}
              customLightSquareStyle={{ backgroundColor: "var(--light-square)" }}
            />
          </div>
        </div>
        <div className="md:col-span-1">
          <GameInfo
            playerTurn={game.turn()}
            moveHistory={moveHistory}
            capturedPieces={capturedPieces}
            boardColors={boardColors}
          />
        </div>
      </div>

      {showQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <MathQuestion question={currentQuestion} onAnswer={handleAnswer} boardColors={boardColors} />
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            onAddQuestion={addQuestion}
            onDeleteQuestion={deleteQuestion}
            onUpdateColors={updateBoardColors}
            onUpdateFrequencySettings={updateFrequencySettings}
            currentColors={boardColors}
            questions={questions}
            frequencySettings={frequencySettings}
          />
        </div>
      )}

      {showFeedback && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-lg z-50 ${
            feedbackMessage.includes("incorrecta")
              ? "bg-red-600 text-white"
              : "bg-[var(--light-square)] border-2 text-[var(--dark-square)]"
          }`}
          style={{ borderColor: feedbackMessage.includes("incorrecta") ? "" : "var(--dark-square)" }}
        >
          {feedbackMessage}
        </div>
      )}

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader style={{ backgroundColor: "var(--dark-square)", color: "white" }}>
              <CardTitle className="text-xl text-center">Fin de la Partida</CardTitle>
            </CardHeader>
            <CardContent className="p-6" style={{ backgroundColor: "var(--light-square)" }}>
              <p className="text-xl font-bold mb-6 text-center" style={{ color: "var(--dark-square)" }}>
                {gameResult}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center p-4" style={{ backgroundColor: "var(--light-square)" }}>
              <Button
                onClick={resetGame}
                style={{ backgroundColor: "var(--dark-square)", color: "white" }}
                className="hover:opacity-90 px-8"
              >
                Nueva Partida
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
