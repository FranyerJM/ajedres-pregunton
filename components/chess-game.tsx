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

// Actualizar las preguntas predeterminadas con preguntas de estructura algebraica
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "¿Cuál de las siguientes estructuras es un anillo conmutativo con unidad?",
    options: [
      { id: "A", value: "(Z, +, ·)" },
      { id: "B", value: "(Q*, ·)" },
      { id: "C", value: "(N, +, ·)" },
      { id: "D", value: "(R, +)" },
    ],
    correctAnswer: "A",
    difficulty: "medium",
    feedback: "Z con operaciones de suma y multiplicación forma un anillo conmutativo con unidad.",
  },
  {
    id: 2,
    question: "Sea f: G→H un homomorfismo de grupos, ¿qué indica el Teorema de Isomorfismo de Grupos?",
    options: [
      { id: "A", value: "G/ker(f) ≅ im(f)" },
      { id: "B", value: "G ≅ H" },
      { id: "C", value: "ker(f)=e" },
      { id: "D", value: "f es inyectivo" },
    ],
    correctAnswer: "A",
    difficulty: "hard",
    feedback: "El primer teorema de isomorfismo establece G/ker(f) ≅ im(f).",
  },
  {
    id: 3,
    question: "¿Cuál es la definición de un grupo?",
    options: [
      { id: "A", value: "Conjunto con una operación asociativa" },
      { id: "B", value: "Conjunto con una operación asociativa, elemento neutro e inversos" },
      { id: "C", value: "Conjunto con una operación conmutativa" },
      { id: "D", value: "Conjunto con dos operaciones que cumplen distributividad" },
    ],
    correctAnswer: "B",
    difficulty: "easy",
    feedback:
      "Un grupo es un conjunto con una operación binaria que es asociativa, tiene elemento neutro y todo elemento tiene inverso.",
  },
  {
    id: 4,
    question: "¿Qué es un cuerpo en álgebra?",
    options: [
      { id: "A", value: "Un anillo donde todo elemento no nulo tiene inverso multiplicativo" },
      { id: "B", value: "Un conjunto con una operación asociativa" },
      { id: "C", value: "Un grupo abeliano" },
      { id: "D", value: "Un anillo sin divisores de cero" },
    ],
    correctAnswer: "A",
    difficulty: "medium",
    feedback: "Un cuerpo es un anillo conmutativo con unidad donde todo elemento no nulo tiene inverso multiplicativo.",
  },
  {
    id: 5,
    question: "¿Cuál de los siguientes NO es un grupo?",
    options: [
      { id: "A", value: "(Z, +)" },
      { id: "B", value: "(Q*, ·)" },
      { id: "C", value: "(Z, ·)" },
      { id: "D", value: "(R*, ·)" },
    ],
    correctAnswer: "C",
    difficulty: "medium",
    feedback: "(Z, ·) no es un grupo porque los elementos no tienen inversos multiplicativos (excepto 1 y -1).",
  },
  {
    id: 6,
    question: "¿Qué es un homomorfismo entre grupos (G,*) y (H,•)?",
    options: [
      { id: "A", value: "Una función f:G→H tal que f(a*b)=f(a)•f(b)" },
      { id: "B", value: "Una función biyectiva f:G→H" },
      { id: "C", value: "Una función f:G→H tal que f(a*b)=f(b)•f(a)" },
      { id: "D", value: "Una función inyectiva f:G→H" },
    ],
    correctAnswer: "A",
    difficulty: "medium",
    feedback: "Un homomorfismo es una función que preserva la estructura algebraica: f(a*b)=f(a)•f(b).",
  },
  {
    id: 7,
    question: "¿Qué es un ideal en un anillo R?",
    options: [
      { id: "A", value: "Un subconjunto cerrado bajo la suma" },
      { id: "B", value: "Un subconjunto I tal que para todo a∈I y r∈R, ar∈I y ra∈I" },
      { id: "C", value: "Un subconjunto que contiene al elemento neutro" },
      { id: "D", value: "Un subconjunto que contiene todos los elementos invertibles" },
    ],
    correctAnswer: "B",
    difficulty: "hard",
    feedback:
      "Un ideal es un subconjunto I que es un subgrupo aditivo y absorbe productos: para todo a∈I y r∈R, ar∈I y ra∈I.",
  },
  {
    id: 8,
    question: "¿Cuál es el orden del grupo cíclico Z₄?",
    options: [
      { id: "A", value: "2" },
      { id: "B", value: "3" },
      { id: "C", value: "4" },
      { id: "D", value: "Infinito" },
    ],
    correctAnswer: "C",
    difficulty: "easy",
    feedback: "El grupo cíclico Z₄ tiene orden 4, ya que contiene exactamente 4 elementos: {0,1,2,3}.",
  },
  {
    id: 9,
    question: "¿Qué caracteriza a un dominio de integridad?",
    options: [
      { id: "A", value: "Es un anillo conmutativo con unidad" },
      { id: "B", value: "Es un anillo donde todo elemento tiene inverso" },
      { id: "C", value: "Es un anillo conmutativo con unidad sin divisores de cero" },
      { id: "D", value: "Es un anillo donde todo ideal es principal" },
    ],
    correctAnswer: "C",
    difficulty: "medium",
    feedback:
      "Un dominio de integridad es un anillo conmutativo con unidad donde no hay divisores de cero (si ab=0, entonces a=0 o b=0).",
  },
  {
    id: 10,
    question: "¿Cuál es el núcleo (kernel) de un homomorfismo de grupos f:G→H?",
    options: [
      { id: "A", value: "El conjunto {g∈G | f(g)=e_H}" },
      { id: "B", value: "El conjunto {h∈H | h=f(g) para algún g∈G}" },
      { id: "C", value: "El conjunto {g∈G | f(g)=g}" },
      { id: "D", value: "El conjunto {g∈G | f(g)≠e_H}" },
    ],
    correctAnswer: "A",
    difficulty: "medium",
    feedback:
      "El núcleo de un homomorfismo f:G→H es el conjunto de elementos de G que se mapean al elemento identidad de H.",
  },
  {
    id: 11,
    question: "¿Qué es un subgrupo normal?",
    options: [
      { id: "A", value: "Un subgrupo que contiene solo elementos de orden finito" },
      { id: "B", value: "Un subgrupo H de G tal que gH=Hg para todo g∈G" },
      { id: "C", value: "Un subgrupo generado por un solo elemento" },
      { id: "D", value: "Un subgrupo de índice finito" },
    ],
    correctAnswer: "B",
    difficulty: "hard",
    feedback:
      "Un subgrupo normal H de G es aquel donde los cosets izquierdos y derechos coinciden: gH=Hg para todo g∈G.",
  },
  {
    id: 12,
    question: "¿Cuál de los siguientes es un anillo pero no un dominio de integridad?",
    options: [
      { id: "A", value: "Z (enteros)" },
      { id: "B", value: "Q (racionales)" },
      { id: "C", value: "Z₆ (enteros módulo 6)" },
      { id: "D", value: "R[x] (polinomios con coeficientes reales)" },
    ],
    correctAnswer: "C",
    difficulty: "medium",
    feedback:
      "Z₆ tiene divisores de cero: 2×3=0 en Z₆, pero ni 2 ni 3 son cero, por lo que no es un dominio de integridad.",
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
    let filteredQuestions = [...questions]
    if (frequencySettings.difficulty !== "all") {
      filteredQuestions = questions.filter((q) => q.difficulty === frequencySettings.difficulty)
      if (filteredQuestions.length === 0) {
        // Si no hay preguntas de la dificultad seleccionada, usar todas
        filteredQuestions = [...questions]
      }
    }

    const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
    const question = filteredQuestions[randomIndex]

    return {
      question: question.question,
      options: question.options,
      answer: question.correctAnswer, // Ahora esto es el ID (A, B, C, D)
      feedback: question.feedback, // Añadir retroalimentación
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

  // Reiniciar el juego
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
              className="border-b-2 border-gray-300"
            >
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

      {/* Botones para probar diferentes finales de partida (solo visible en desarrollo) */}
      <div className="mt-4">
        <Button
          variant="outline"
          onClick={() => setShowTestButtons(!showTestButtons)}
          className="text-xs"
          style={{ borderColor: "var(--dark-square)", color: "var(--dark-square)" }}
        >
          {showTestButtons ? "Ocultar pruebas" : "Mostrar pruebas de fin de partida"}
        </Button>

        {showTestButtons && (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => testEndgame("checkmate-white")} className="text-xs">
              Jaque mate (ganan blancas)
            </Button>
            <Button variant="outline" size="sm" onClick={() => testEndgame("checkmate-black")} className="text-xs">
              Jaque mate (ganan negras)
            </Button>
            <Button variant="outline" size="sm" onClick={() => testEndgame("stalemate")} className="text-xs">
              Tablas por ahogado
            </Button>
            <Button variant="outline" size="sm" onClick={() => testEndgame("insufficient")} className="text-xs">
              Material insuficiente
            </Button>
            <Button variant="outline" size="sm" onClick={() => testEndgame("threefold")} className="text-xs">
              Triple repetición
            </Button>
            <Button variant="outline" size="sm" onClick={resetGame} className="text-xs">
              Reiniciar tablero
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
