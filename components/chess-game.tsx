"use client"

import { useState, useEffect, useRef } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import MathQuestion from "./math-question"
import GameInfo from "./game-info"
import SettingsButton from "./settings-button"
import SettingsPanel from "./settings-panel"
import StatsPanel from "./stats-panel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, RefreshCw, Flag, HelpCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Preguntas predeterminadas como respaldo en caso de que no se pueda cargar el JSON
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "¿Cuál es la capital de Francia?",
    options: [
      { id: "A", value: "Londres" },
      { id: "B", value: "París" },
      { id: "C", value: "Madrid" },
      { id: "D", value: "Roma" },
    ],
    correctAnswer: "B",
    difficulty: "easy",
    feedback: "París es la capital de Francia desde hace siglos.",
  },
  {
    id: 2,
    question: "¿Quién pintó La Mona Lisa?",
    options: [
      { id: "A", value: "Vincent van Gogh" },
      { id: "B", value: "Pablo Picasso" },
      { id: "C", value: "Leonardo da Vinci" },
      { id: "D", value: "Miguel Ángel" },
    ],
    correctAnswer: "C",
    difficulty: "medium",
    feedback: "Leonardo da Vinci pintó La Mona Lisa entre 1503 y 1519.",
  },
  {
    id: 3,
    question: "¿En qué año llegó Cristóbal Colón a América?",
    options: [
      { id: "A", value: "1492" },
      { id: "B", value: "1500" },
      { id: "C", value: "1592" },
      { id: "D", value: "1420" },
    ],
    correctAnswer: "A",
    difficulty: "medium",
    feedback: "Cristóbal Colón llegó a América el 12 de octubre de 1492.",
  },
  {
    id: 4,
    question: "¿Cuál es el planeta más grande del sistema solar?",
    options: [
      { id: "A", value: "Tierra" },
      { id: "B", value: "Marte" },
      { id: "C", value: "Saturno" },
      { id: "D", value: "Júpiter" },
    ],
    correctAnswer: "D",
    difficulty: "easy",
    feedback: "Júpiter es el planeta más grande del sistema solar, con un diámetro de aproximadamente 143,000 km.",
  },
]

// Configuración predeterminada para la frecuencia de preguntas
const DEFAULT_FREQUENCY_SETTINGS = {
  mode: "turns", // Cambiado de "random" a "turns"
  probability: 30, // Porcentaje para modo aleatorio
  turnFrequency: 1, // Cambiado de 2 a 1 - Preguntar en cada turno
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
  const [showFeedback, setShowFeedback] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState("")

  // Estado para guardar información antes de una pregunta
  const [lastMoveInfo, setLastMoveInfo] = useState(null)

  // Estado para el modal de fin de juego
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState({
    title: "",
    message: "",
    winner: "", // "w", "b", o "draw"
  })

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

  // Añadir este nuevo estado después de las otras declaraciones de estado
  const [askedQuestionIds, setAskedQuestionIds] = useState([])

  // Nuevo estado para rastrear estadísticas de preguntas por jugador
  const [playerStats, setPlayerStats] = useState({
    w: { correct: 0, incorrect: 0 },
    b: { correct: 0, incorrect: 0 },
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

  // Reemplazar la función getRandomQuestion con esta nueva implementación
  const getRandomQuestion = () => {
    if (questions.length === 0) return null

    // Filtrar preguntas según la dificultad seleccionada
    let filteredQuestions = [...questions]
    if (frequencySettings.difficulty !== "all") {
      filteredQuestions = questions.filter((q) => q.difficulty === frequencySettings.difficulty)
      if (filteredQuestions.length === 0) {
        // Si no hay preguntas de la dificultad seleccionada, usar todas
        filteredQuestions = [...questions]
      }
    }

    // Filtrar las preguntas que aún no se han mostrado en este ciclo
    let availableQuestions = filteredQuestions.filter((q) => !askedQuestionIds.includes(q.id))

    // Si todas las preguntas ya se han mostrado, reiniciar el ciclo
    if (availableQuestions.length === 0) {
      console.log("Todas las preguntas han sido mostradas. Reiniciando ciclo...")
      setAskedQuestionIds([])
      availableQuestions = filteredQuestions
    }

    // Seleccionar una pregunta aleatoria de las disponibles
    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const question = availableQuestions[randomIndex]

    // Registrar esta pregunta como mostrada
    setAskedQuestionIds((prev) => [...prev, question.id])

    return {
      question: question.question,
      options: question.options,
      answer: question.correctAnswer,
      feedback: question.feedback,
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

      // Guardar el estado FEN antes del movimiento
      const previousFen = game.fen()

      // Intentar hacer el movimiento
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // Siempre promover a reina por simplicidad
      })

      // Si el movimiento no es válido
      if (move === null) return false

      // Añadir el FEN anterior al objeto de movimiento para poder revertirlo si es necesario
      move.fen = previousFen

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
        if (gameCopy.isCheckmate()) {
          // Si es jaque mate, ganó el jugador que acaba de mover
          const ganador = move.color === "w" ? "Blancas" : "Negras"
          const perdedor = move.color === "w" ? "Negras" : "Blancas"

          setGameResult({
            title: `¡${ganador} ganan la partida!`,
            message: `Victoria por jaque mate. ${perdedor} no pueden evitar el jaque.`,
            winner: move.color,
          })

          console.log(`Fin de partida: ${ganador} ganan por jaque mate`)
        } else if (gameCopy.isDraw()) {
          // Determinar el tipo específico de tablas
          const titulo = "¡Partida finalizada en tablas!"
          let razon = ""

          if (gameCopy.isStalemate()) {
            razon = `Tablas por ahogado. El jugador de ${game.turn() === "w" ? "blancas" : "negras"} no tiene movimientos legales pero no está en jaque.`
            console.log("Fin de partida: Tablas por ahogado")
          } else if (gameCopy.isThreefoldRepetition()) {
            razon = "Tablas por triple repetición. La misma posición ha ocurrido tres veces."
            console.log("Fin de partida: Tablas por triple repetición")
          } else if (gameCopy.isInsufficientMaterial()) {
            razon = "Tablas por material insuficiente. No hay suficientes piezas para dar jaque mate."
            console.log("Fin de partida: Tablas por material insuficiente")
          } else {
            razon = "Tablas por regla de 50 movimientos. Han pasado 50 movimientos sin capturas ni movimientos de peón."
            console.log("Fin de partida: Tablas por regla de 50 movimientos")
          }

          setGameResult({
            title: titulo,
            message: razon,
            winner: "draw",
          })
        }

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
            playerColor: move.color, // Guardar el color del jugador que está respondiendo
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

  // Actualizar la función handleAnswer para registrar estadísticas
  const handleAnswer = (selectedOption, isCorrect) => {
    // Obtener el color del jugador que está respondiendo
    const playerColor = lastMoveInfo ? lastMoveInfo.playerColor : game.turn()

    // Actualizar estadísticas del jugador
    setPlayerStats((prevStats) => ({
      ...prevStats,
      [playerColor]: {
        correct: prevStats[playerColor].correct + (isCorrect ? 1 : 0),
        incorrect: prevStats[playerColor].incorrect + (isCorrect ? 0 : 1),
      },
    }))

    if (!isCorrect && lastMoveInfo && frequencySettings.loseOnWrongAnswer) {
      try {
        // Si la respuesta es incorrecta:
        // 1. Obtener el último movimiento
        const lastMove = lastMoveInfo.lastMove

        // 2. Restaurar el estado de piezas capturadas al estado anterior
        if (lastMove.captured) {
          setCapturedPieces(lastMoveInfo.capturedPieces)
        }

        // 3. Revertir completamente el movimiento creando un nuevo juego con el estado anterior
        // Esto es antes de que se realizara el movimiento
        const previousFen = lastMove.fen || game.fen() // Usar el FEN anterior si está disponible
        const gameWithRevertedMove = new Chess(previousFen)

        // 4. Cambiar el turno al jugador contrario
        const currentTurn = gameWithRevertedMove.turn()
        const oppositeTurn = currentTurn === "w" ? "b" : "w"
        const fenWithChangedTurn = changeTurnInFEN(previousFen, oppositeTurn)
        const gameWithChangedTurn = new Chess(fenWithChangedTurn)

        // Actualizar el estado del juego para revertir el movimiento y cambiar el turno
        setGame(gameWithChangedTurn)
        setPosition(fenWithChangedTurn)

        // Restaurar el historial de movimientos anterior
        const previousMoveHistory = moveHistory.slice(0, -1)
        setMoveHistory(previousMoveHistory)

        // Mostrar mensaje de feedback para respuesta incorrecta si está habilitado
        if (frequencySettings.showFeedback) {
          setFeedbackMessage(
            `Respuesta incorrecta, movimiento revertido. Turno de ${oppositeTurn === "w" ? "blancas" : "negras"}`,
          )
          setShowFeedback(true)
        }

        console.log(
          `Respuesta incorrecta. Movimiento revertido. Turno cambiado a ${oppositeTurn === "w" ? "blancas" : "negras"}`,
        )
      } catch (error) {
        console.error("Error al manejar respuesta incorrecta:", error)
      }
    } else {
      // Si la respuesta es correcta o no se pierde el turno, el turno sigue siendo del jugador que respondió
      if (frequencySettings.showFeedback) {
        // Mostrar retroalimentación específica de la pregunta si está disponible
        const feedbackText = currentQuestion.feedback
          ? `Respuesta correcta: ${currentQuestion.feedback}`
          : "Respuesta correcta, tu turno se mantiene"

        setFeedbackMessage(feedbackText)
        setShowFeedback(true)
      }
    }

    // Ocultar el mensaje después de 5 segundos si está habilitado (aumentado de 3 a 5 para dar más tiempo de lectura)
    if (frequencySettings.showFeedback) {
      setTimeout(() => {
        setShowFeedback(false)
      }, 5000)
    }

    setShowQuestion(false)
    setCurrentQuestion(null)
    setLastMoveInfo(null)
  }

  // Actualizar la función handleAddQuestion para manejar valores de texto
  const addQuestion = (newQuestion) => {
    // Actualizar el estado local
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion])

    // En una aplicación real, aquí se guardaría en el servidor
    console.log("Nueva pregunta agregada:", newQuestion)
  }

  // Función para agregar múltiples preguntas a la vez
  const addMultipleQuestions = (newQuestions) => {
    if (newQuestions && newQuestions.length > 0) {
      setQuestions((prevQuestions) => [...prevQuestions, ...newQuestions])
      console.log(`${newQuestions.length} preguntas agregadas`)
    }
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

  // Modificar la función resetGame para reiniciar también el registro de preguntas mostradas y estadísticas
  const resetGame = () => {
    const newGame = new Chess()
    setGame(newGame)
    setPosition(newGame.fen())
    setMoveHistory([])
    setMoveCount(0)
    setCapturedPieces({ w: [], b: [] })
    setGameOver(false)
    setGameResult({
      title: "",
      message: "",
      winner: "",
    })
    // Reiniciar el registro de preguntas mostradas
    setAskedQuestionIds([])
    // Reiniciar estadísticas de jugadores
    setPlayerStats({
      w: { correct: 0, incorrect: 0 },
      b: { correct: 0, incorrect: 0 },
    })

    // Reiniciar el temporizador si está en modo temporizador
    if (frequencySettings.mode === "timer" && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setTimerActive(false)
      // El temporizador se reiniciará automáticamente por el efecto
    }
  }

  // Vamos a añadir una función auxiliar para probar diferentes finales de partida
  // Esto nos permitirá verificar que todos los mensajes se muestren correctamente
  // Añadir esta función después de la función resetGame:

  // Función para probar diferentes finales de partida (solo para desarrollo)
  const testEndgame = (endgameType) => {
    let testGame
    let testResult = {
      title: "",
      message: "",
      winner: "",
    }

    switch (endgameType) {
      case "checkmate-white":
        // Jaque mate en 2 movimientos (Fool's Mate)
        testGame = new Chess()
        testGame.move("f3")
        testGame.move("e5")
        testGame.move("g4")
        testGame.move("Qh4")

        testResult = {
          title: "¡Negras ganan la partida!",
          message: "Victoria por jaque mate. Blancas no pueden evitar el jaque.",
          winner: "b",
        }
        break

      case "checkmate-black":
        // Jaque mate en 4 movimientos (Scholar's Mate)
        testGame = new Chess()
        testGame.move("e4")
        testGame.move("e5")
        testGame.move("Qh5")
        testGame.move("Nc6")
        testGame.move("Bc4")
        testGame.move("Nf6")
        testGame.move("Qxf7")

        testResult = {
          title: "¡Blancas ganan la partida!",
          message: "Victoria por jaque mate. Negras no pueden evitar el jaque.",
          winner: "w",
        }
        break

      case "stalemate":
        // Ahogado
        testGame = new Chess("8/8/8/8/8/5K2/7Q/7k w - - 0 1")
        testGame.move("Qh3")

        testResult = {
          title: "¡Partida finalizada en tablas!",
          message: "Tablas por ahogado. El jugador de negras no tiene movimientos legales pero no está en jaque.",
          winner: "draw",
        }
        break

      case "insufficient":
        // Material insuficiente
        testGame = new Chess("8/8/8/8/8/5K2/8/7k w - - 0 1")

        testResult = {
          title: "¡Partida finalizada en tablas!",
          message: "Tablas por material insuficiente. No hay suficientes piezas para dar jaque mate.",
          winner: "draw",
        }
        break

      case "threefold":
        // Simulación de triple repetición
        testGame = new Chess()
        // Movimientos que llevan a una repetición
        testGame.move("Nf3")
        testGame.move("Nf6")
        testGame.move("Ng1")
        testGame.move("Ng8")
        testGame.move("Nf3")
        testGame.move("Nf6")
        testGame.move("Ng1")
        testGame.move("Ng8")

        testResult = {
          title: "¡Partida finalizada en tablas!",
          message: "Tablas por triple repetición. La misma posición ha ocurrido tres veces.",
          winner: "draw",
        }
        break

      default:
        return // No hacer nada si el tipo no es válido
    }

    // Actualizar el estado del juego
    setGame(testGame)
    setPosition(testGame.fen())
    setGameResult(testResult)
    setGameOver(true)

    // Detener el temporizador si está activo
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setTimerActive(false)
    }
  }

  // Ahora, para facilitar las pruebas, vamos a añadir botones de prueba
  // que solo se mostrarán en modo desarrollo
  // Añadir este código justo antes del return final:

  // Estado para mostrar/ocultar los botones de prueba
  const [showTestButtons, setShowTestButtons] = useState(false)

  // Estados para los nuevos diálogos
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false)
  const [showManual, setShowManual] = useState(false)

  // Función para manejar la rendición
  const handleSurrender = () => {
    // Determinar quién gana basado en quién se rinde
    const currentPlayer = game.turn()
    const winner = currentPlayer === "w" ? "b" : "w"
    const winnerName = winner === "w" ? "Blancas" : "Negras"
    const loserName = winner === "w" ? "Negras" : "Blancas"

    setGameResult({
      title: `¡${winnerName} ganan la partida!`,
      message: `Victoria por rendición. ${loserName} se han rendido.`,
      winner: winner,
    })

    setGameOver(true)
    setShowSurrenderConfirm(false)

    // Detener el temporizador si está activo
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setTimerActive(false)
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

          {/* Añadir el panel de estadísticas debajo del tablero */}
          <StatsPanel playerStats={playerStats} boardColors={boardColors} />
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
            onAddMultipleQuestions={addMultipleQuestions}
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
            <CardHeader
              style={{
                backgroundColor:
                  gameResult.winner === "w" ? "white" : gameResult.winner === "b" ? "black" : "var(--dark-square)",
                color: gameResult.winner === "w" ? "black" : "white",
              }}
              className="border-b-2 border-gray-300 relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 text-white hover:bg-opacity-20"
                style={{
                  backgroundColor: "transparent",
                  color: gameResult.winner === "w" ? "black" : "white",
                }}
                onClick={() => setGameOver(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl text-center font-bold">{gameResult.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6" style={{ backgroundColor: "var(--light-square)" }}>
              <div className="flex flex-col items-center">
                {gameResult.winner === "w" || gameResult.winner === "b" ? (
                  <div className="mb-6 flex flex-col items-center">
                    <div
                      className={`w-20 h-20 rounded-full ${
                        gameResult.winner === "w" ? "bg-white" : "bg-black"
                      } border-4 border-yellow-500 flex items-center justify-center text-5xl shadow-lg`}
                    >
                      {gameResult.winner === "w" ? "♔" : "♚"}
                    </div>
                    <div className="mt-2 text-lg font-semibold" style={{ color: "var(--dark-square)" }}>
                      {gameResult.winner === "w" ? "Blancas" : "Negras"}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 flex flex-col items-center">
                    <div className="flex">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center text-4xl mr-3 shadow-md">
                        ♔
                      </div>
                      <div className="w-16 h-16 rounded-full bg-black border-2 border-gray-400 flex items-center justify-center text-4xl text-white shadow-md">
                        ♚
                      </div>
                    </div>
                    <div className="mt-2 text-lg font-semibold" style={{ color: "var(--dark-square)" }}>
                      Tablas
                    </div>
                  </div>
                )}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full">
                  <p className="text-lg text-center" style={{ color: "var(--dark-square)" }}>
                    {gameResult.message}
                  </p>
                </div>

                <div className="mt-6 text-sm text-gray-600 text-center">
                  Estadísticas de la partida:
                  <div className="flex justify-center gap-8 mt-2">
                    <div>
                      <span className="font-bold">{moveHistory.length}</span> movimientos
                    </div>
                    <div>
                      <span className="font-bold">{capturedPieces.w.length + capturedPieces.b.length}</span> capturas
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-3 p-4" style={{ backgroundColor: "var(--light-square)" }}>
              <Button
                variant="outline"
                onClick={() => setGameOver(false)}
                style={{ borderColor: "var(--dark-square)", color: "var(--dark-square)" }}
                className="px-8"
              >
                Cerrar
              </Button>
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

      {/* Botones principales de juego */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <Button
          variant="outline"
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center justify-center gap-2"
          style={{ borderColor: "var(--dark-square)", color: "var(--dark-square)" }}
        >
          <RefreshCw className="h-4 w-4" />
          Reiniciar Partida
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowSurrenderConfirm(true)}
          className="flex items-center justify-center gap-2"
          style={{ borderColor: "var(--dark-square)", color: "var(--dark-square)" }}
        >
          <Flag className="h-4 w-4" />
          Rendirse
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowManual(true)}
          className="flex items-center justify-center gap-2"
          style={{ borderColor: "var(--dark-square)", color: "var(--dark-square)" }}
        >
          <HelpCircle className="h-4 w-4" />
          Manual de Usuario
        </Button>
      </div>

      {/* Diálogo de confirmación para reiniciar partida */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reiniciar la partida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción reiniciará el tablero y todas las estadísticas. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para rendirse */}
      <AlertDialog open={showSurrenderConfirm} onOpenChange={setShowSurrenderConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas rendirte?</AlertDialogTitle>
            <AlertDialogDescription>
              Si te rindes, el otro jugador ganará la partida automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSurrender} className="bg-red-600 hover:bg-red-700">
              Rendirse
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal del manual de usuario */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: "var(--dark-square)" }}>
              Manual de Usuario - Ajedrez Preguntón
            </DialogTitle>
            <DialogDescription>Guía completa para entender y jugar al Ajedrez Preguntón</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Introducción
              </h3>
              <p className="text-gray-700">
                Bienvenido al Ajedrez Preguntón, un juego educativo que combina el ajedrez tradicional con preguntas de
                conocimiento general. Este juego está diseñado para mejorar tus habilidades de ajedrez mientras pones a
                prueba tus conocimientos.
              </p>
              <p className="text-gray-700">
                El juego fue desarrollado por Franyer Marín y Santhiago Méndez, estudiantes de la Universidad José Antonio Páez, como parte de la materia de Estructuras Discretas bajo la supervisión de la instructora Susan León. Para obtener más información sobre el desarrollo del juego, acceder al repositorio de GitHub para realizar modificaciones o enviar sugerencias, puedes contactar a:

                franyerjmarin@gmail.com / josuechavezzz@gmail.com
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Cómo Jugar
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>El juego sigue las reglas estándar del ajedrez, con turnos alternos entre blancas y negras.</li>
                <li>
                  Después de realizar un movimiento, dependiendo de la configuración, se puede presentar una pregunta.
                </li>
                <li>Si respondes correctamente, tu movimiento se mantiene y continúa el juego.</li>
                <li>Si respondes incorrectamente, tu movimiento se revierte y el turno pasa al oponente.</li>
                <li>El objetivo es dar jaque mate al rey oponente, como en el ajedrez tradicional.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Configuración del Juego
              </h3>
              <p className="text-gray-700 mb-2">
                Puedes personalizar varios aspectos del juego a través del botón de Configuración:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>
                  <span className="font-medium">Preguntas:</span> Añadir, editar o eliminar preguntas.
                </li>
                <li>
                  <span className="font-medium">Frecuencia:</span> Configurar cuándo aparecen las preguntas (por turnos,
                  al capturar, etc.).
                </li>
                <li>
                  <span className="font-medium">Apariencia:</span> Cambiar los colores del tablero.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Modos de Preguntas
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>
                  <span className="font-medium">Aleatorio:</span> Las preguntas aparecen con una probabilidad
                  configurable.
                </li>
                <li>
                  <span className="font-medium">Por turnos:</span> Las preguntas aparecen cada cierto número de turnos.
                </li>
                <li>
                  <span className="font-medium">Al capturar:</span> Las preguntas aparecen cuando se captura una pieza.
                </li>
                <li>
                  <span className="font-medium">Por tiempo:</span> Las preguntas aparecen en intervalos de tiempo
                  regulares.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Estadísticas
              </h3>
              <p className="text-gray-700">
                El panel de estadísticas muestra el rendimiento de cada jugador con las preguntas:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Total de preguntas respondidas</li>
                <li>Número de respuestas correctas e incorrectas</li>
                <li>Precisión de acierto (porcentaje)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Importación de Preguntas
              </h3>
              <p className="text-gray-700">Puedes importar preguntas desde un archivo CSV con el siguiente formato:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                Pregunta,Opción A,Opción B,Opción C,Opción D,Respuesta,Dificultad,Retroalimentación
              </pre>
              <p className="text-gray-700 mt-2">
                Donde la respuesta debe ser A, B, C o D, y la dificultad puede ser f (fácil), m (media) o d (difícil).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Controles Principales
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>
                  <span className="font-medium">Reiniciar Partida:</span> Comienza una nueva partida desde cero.
                </li>
                <li>
                  <span className="font-medium">Rendirse:</span> Termina la partida actual, dando la victoria al
                  oponente.
                </li>
                <li>
                  <span className="font-medium">Manual de Usuario:</span> Muestra esta guía de ayuda.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--dark-square)" }}>
                Fin del Juego
              </h3>
              <p className="text-gray-700">La partida puede terminar de varias formas:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Jaque mate (victoria)</li>
                <li>Ahogado (tablas)</li>
                <li>Material insuficiente (tablas)</li>
                <li>Triple repetición (tablas)</li>
                <li>Regla de 50 movimientos (tablas)</li>
                <li>Rendición (victoria para el oponente)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowManual(false)}
              style={{ backgroundColor: "var(--dark-square)", color: "white" }}
            >
              Cerrar Manual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
