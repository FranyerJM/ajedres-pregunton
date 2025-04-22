"use client"

import { useState, useRef } from "react"
import { X, Trash2, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPanel({
  onClose,
  onAddQuestion,
  onAddMultipleQuestions,
  onDeleteQuestion,
  onUpdateColors,
  onUpdateFrequencySettings,
  currentColors,
  questions,
  frequencySettings,
}) {
  // Estado para la nueva pregunta
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: [
      { id: "A", value: "" },
      { id: "B", value: "" },
      { id: "C", value: "" },
      { id: "D", value: "" },
    ],
    correctAnswer: "", // Ahora será "A", "B", "C" o "D"
    difficulty: "medium", // Fácil, Media o Difícil
    feedback: "", // Retroalimentación para la pregunta
  })

  // Estado para los colores del tablero
  const [colors, setColors] = useState({
    lightSquare: currentColors.lightSquare,
    darkSquare: currentColors.darkSquare,
    border: currentColors.border,
  })

  // Estado para la configuración de frecuencia
  const [frequency, setFrequency] = useState(
    frequencySettings || {
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
    },
  )

  // Estado para el diálogo de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)

  // Estado para el diálogo de importación CSV
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [csvData, setCsvData] = useState("")
  const [importError, setImportError] = useState("")
  const fileInputRef = useRef(null)

  // Manejar cambios en el formulario de pregunta
  const handleQuestionChange = (e) => {
    setNewQuestion({
      ...newQuestion,
      question: e.target.value,
    })
  }

  // Manejar cambios en las opciones
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index] = {
      ...updatedOptions[index],
      value: value, // Ahora acepta cualquier valor de texto
    }

    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    })
  }

  // Manejar cambios en los colores
  const handleColorChange = (colorType, value) => {
    setColors({
      ...colors,
      [colorType]: value,
    })
  }

  // Manejar cambios en la configuración de frecuencia
  const handleFrequencyChange = (key, value) => {
    setFrequency({
      ...frequency,
      [key]: value,
    })
  }

  // Agregar nueva pregunta
  const handleAddQuestion = () => {
    // Validar que todos los campos estén completos
    if (
      !newQuestion.question ||
      newQuestion.options.some((option) => option.value === "") ||
      !newQuestion.correctAnswer
    ) {
      alert("Por favor complete todos los campos")
      return
    }

    // Crear nueva pregunta con ID único
    const questionToAdd = {
      id: questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1,
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer, // Ahora usamos el ID (A, B, C, D)
      difficulty: newQuestion.difficulty,
      feedback: newQuestion.feedback,
    }

    // Llamar a la función para agregar la pregunta
    onAddQuestion(questionToAdd)

    // Limpiar el formulario
    setNewQuestion({
      question: "",
      options: [
        { id: "A", value: "" },
        { id: "B", value: "" },
        { id: "C", value: "" },
        { id: "D", value: "" },
      ],
      correctAnswer: "",
      difficulty: "medium",
      feedback: "",
    })
  }

  // Confirmar eliminación de pregunta
  const confirmDeleteQuestion = (question) => {
    setQuestionToDelete(question)
    setShowDeleteConfirm(true)
  }

  // Eliminar pregunta
  const handleDeleteQuestion = () => {
    if (questionToDelete) {
      onDeleteQuestion(questionToDelete.id)
      setShowDeleteConfirm(false)
      setQuestionToDelete(null)
    }
  }

  // Aplicar cambios de colores
  const handleApplyColors = () => {
    onUpdateColors({
      ...currentColors,
      ...colors,
    })
  }

  // Aplicar configuración de frecuencia
  const handleApplyFrequency = () => {
    if (onUpdateFrequencySettings) {
      onUpdateFrequencySettings(frequency)
    }
  }

  // Eliminar todas las preguntas
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)

  const confirmDeleteAllQuestions = () => {
    setShowDeleteAllConfirm(true)
  }

  const handleDeleteAllQuestions = () => {
    onDeleteQuestion("all")
    setShowDeleteAllConfirm(false)
  }

  // Manejar la selección de archivo CSV
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvData(event.target.result)
      setImportError("")
    }
    reader.onerror = () => {
      setImportError("Error al leer el archivo")
    }
    reader.readAsText(file)
  }

  // Procesar e importar datos CSV
  const processCSV = () => {
    try {
      if (!csvData.trim()) {
        setImportError("No hay datos para importar")
        return
      }

      // Dividir el CSV en líneas
      const lines = csvData.split("\n").filter((line) => line.trim() !== "")

      if (lines.length === 0) {
        setImportError("El archivo no contiene datos válidos")
        return
      }

      // Procesar cada línea
      const newQuestions = []
      let hasErrors = false
      let errorMessage = ""

      lines.forEach((line, index) => {
        try {
          // Dividir la línea por comas, teniendo en cuenta las comillas
          const values = line.split(",").map((value) => value.trim())

          if (values.length < 7) {
            hasErrors = true
            errorMessage = `Error en la línea ${index + 1}: formato incorrecto. Se esperan al menos 7 columnas.`
            return
          }

          const [question, optionA, optionB, optionC, optionD, correctAnswer, difficulty, feedback] = values

          // Validar la respuesta correcta
          const correctAnswerUpper = correctAnswer.toUpperCase()
          if (!["A", "B", "C", "D"].includes(correctAnswerUpper)) {
            hasErrors = true
            errorMessage = `Error en la línea ${index + 1}: la respuesta correcta debe ser A, B, C o D.`
            return
          }

          // Validar la dificultad con las nuevas abreviaturas
          const difficultyLower = difficulty.toLowerCase()
          let internalDifficulty = ""

          // Convertir abreviaturas a valores internos
          if (difficultyLower === "f" || difficultyLower === "facil" || difficultyLower === "fácil") {
            internalDifficulty = "easy"
          } else if (difficultyLower === "m" || difficultyLower === "media") {
            internalDifficulty = "medium"
          } else if (difficultyLower === "d" || difficultyLower === "dificil" || difficultyLower === "difícil") {
            internalDifficulty = "hard"
          } else {
            hasErrors = true
            errorMessage = `Error en la línea ${index + 1}: la dificultad debe ser f (fácil), m (media) o d (difícil).`
            return
          }

          // Crear la nueva pregunta
          const options = [
            { id: "A", value: optionA },
            { id: "B", value: optionB },
            { id: "C", value: optionC },
            { id: "D", value: optionD },
          ]

          newQuestions.push({
            id: questions.length + newQuestions.length + 1,
            question,
            options,
            correctAnswer: correctAnswerUpper, // Usar el ID como respuesta correcta
            difficulty: internalDifficulty,
            feedback: feedback || "",
          })
        } catch (error) {
          console.error(`Error procesando línea ${index + 1}:`, error)
          hasErrors = true
          errorMessage = `Error en la línea ${index + 1}: ${error.message}`
        }
      })

      if (hasErrors) {
        setImportError(errorMessage)
        return
      }

      // Añadir todas las preguntas de una vez
      if (newQuestions.length > 0) {
        // Usar la función para añadir múltiples preguntas
        onAddMultipleQuestions(newQuestions)

        // Cerrar el diálogo y limpiar
        setShowImportDialog(false)
        setCsvData("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        alert(`Se importaron ${newQuestions.length} preguntas correctamente.`)
      } else {
        setImportError("No se encontraron preguntas válidas para importar")
      }
    } catch (error) {
      console.error("Error al procesar CSV:", error)
      setImportError("Error al procesar el archivo CSV. Verifique el formato.")
    }
  }

  // Generar un ejemplo de CSV para descargar
  const generateExampleCSV = () => {
    const csvContent = [
      "¿Cuánto es 2 + 2?,4,3,5,6,A,f,La suma de 2 + 2 es 4",
      "¿Cuál es la capital de Francia?,París,Madrid,Londres,Berlín,A,m,París es la capital de Francia",
      "¿Cuánto es 15 × 3?,30,45,60,15,B,m,15 × 3 = 45",
      "¿Qué símbolo representa el oro en la tabla periódica?,Ag,Fe,Au,O,C,d,Au es el símbolo del oro (Aurum en latín)",
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "ejemplo_preguntas.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-white relative" style={{ backgroundColor: "var(--dark-square)" }}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-white hover:bg-opacity-70"
            style={{ backgroundColor: "transparent" }}
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          <CardTitle className="text-2xl">Configuración</CardTitle>
          <CardDescription style={{ color: "var(--light-square)" }}>
            Personaliza el juego de ajedrez pregunton
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="questions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Preguntas</TabsTrigger>
              <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
              <TabsTrigger value="appearance">Apariencia</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Agregar Nueva Pregunta</h3>
                    <Button
                      onClick={() => setShowImportDialog(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                      style={{ borderColor: "var(--dark-square)", color: "var(--dark-square)" }}
                    >
                      <Upload className="h-4 w-4" />
                      Importar CSV
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question">Pregunta</Label>
                      <Input
                        id="question"
                        value={newQuestion.question}
                        onChange={handleQuestionChange}
                        placeholder="Ej: ¿Cuánto es 5 + 7?"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {newQuestion.options.map((option, index) => (
                        <div key={option.id}>
                          <Label htmlFor={`option-${option.id}`}>Opción {option.id}</Label>
                          <Input
                            id={`option-${option.id}`}
                            type="text" // Cambiado de "number" a "text"
                            value={option.value}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Valor para opción ${option.id}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="correctAnswer">Respuesta Correcta</Label>
                      <div className="grid grid-cols-4 gap-2 mt-1">
                        {newQuestion.options.map((option) => (
                          <Button
                            key={option.id}
                            type="button"
                            variant={newQuestion.correctAnswer === option.id ? "default" : "outline"}
                            className={`${
                              newQuestion.correctAnswer === option.id
                                ? "bg-green-600 hover:bg-green-700"
                                : "border-2 border-gray-300 hover:bg-gray-100"
                            }`}
                            onClick={() =>
                              setNewQuestion({
                                ...newQuestion,
                                correctAnswer: option.id,
                              })
                            }
                          >
                            {option.id}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="questionDifficulty">Dificultad de la pregunta</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <Button
                          type="button"
                          variant={newQuestion.difficulty === "easy" ? "default" : "outline"}
                          className={`${
                            newQuestion.difficulty === "easy"
                              ? "bg-green-600 hover:bg-green-700"
                              : "border-2 border-gray-300 hover:bg-gray-100"
                          }`}
                          onClick={() =>
                            setNewQuestion({
                              ...newQuestion,
                              difficulty: "easy",
                            })
                          }
                        >
                          Fácil
                        </Button>
                        <Button
                          type="button"
                          variant={newQuestion.difficulty === "medium" ? "default" : "outline"}
                          className={`${
                            newQuestion.difficulty === "medium"
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "border-2 border-gray-300 hover:bg-gray-100"
                          }`}
                          onClick={() =>
                            setNewQuestion({
                              ...newQuestion,
                              difficulty: "medium",
                            })
                          }
                        >
                          Media
                        </Button>
                        <Button
                          type="button"
                          variant={newQuestion.difficulty === "hard" ? "default" : "outline"}
                          className={`${
                            newQuestion.difficulty === "hard"
                              ? "bg-red-600 hover:bg-red-700"
                              : "border-2 border-gray-300 hover:bg-gray-100"
                          }`}
                          onClick={() =>
                            setNewQuestion({
                              ...newQuestion,
                              difficulty: "hard",
                            })
                          }
                        >
                          Difícil
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="feedback">Retroalimentación</Label>
                      <Input
                        id="feedback"
                        value={newQuestion.feedback}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            feedback: e.target.value,
                          })
                        }
                        placeholder="Explicación o retroalimentación para esta pregunta"
                      />
                    </div>

                    <Button
                      onClick={handleAddQuestion}
                      className="w-full hover:opacity-90 text-white"
                      style={{ backgroundColor: "var(--dark-square)" }}
                    >
                      Agregar Pregunta
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Preguntas Existentes</h3>
                    {questions.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={confirmDeleteAllQuestions}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar Todas
                      </Button>
                    )}
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No hay preguntas registradas</div>
                  ) : (
                    <div className="border rounded-md divide-y">
                      {questions.map((q) => (
                        <div key={q.id} className="p-3 relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => confirmDeleteQuestion(q)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium pr-8 flex-grow">{q.question}</p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                q.difficulty === "easy"
                                  ? "bg-green-100 text-green-800"
                                  : q.difficulty === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {q.difficulty === "easy" ? "Fácil" : q.difficulty === "medium" ? "Media" : "Difícil"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`p-1 rounded ${opt.id === q.correctAnswer ? "bg-green-100" : ""}`}
                              >
                                {opt.id}: {opt.value} {opt.id === q.correctAnswer && "✓"}
                              </div>
                            ))}
                          </div>
                          {q.feedback && (
                            <div className="mt-2 text-sm text-gray-600 italic border-t pt-1">
                              <span className="font-medium">Retroalimentación:</span> {q.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="frequency" className="mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Frecuencia de Preguntas</h3>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Modo de Preguntas</Label>
                      <RadioGroup
                        value={frequency.mode}
                        onValueChange={(value) => handleFrequencyChange("mode", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="random" id="mode-random" />
                          <Label htmlFor="mode-random">Aleatorio (probabilidad)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="turns" id="mode-turns" />
                          <Label htmlFor="mode-turns">Por turnos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="captures" id="mode-captures" />
                          <Label htmlFor="mode-captures">Al capturar piezas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="timer" id="mode-timer" />
                          <Label htmlFor="mode-timer">Por tiempo</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {frequency.mode === "random" && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label htmlFor="probability">Probabilidad de pregunta: {frequency.probability}%</Label>
                          </div>
                          <Slider
                            id="probability"
                            min={0}
                            max={100}
                            step={5}
                            value={[frequency.probability]}
                            onValueChange={(value) => handleFrequencyChange("probability", value[0])}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    {frequency.mode === "turns" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="turnFrequency">Preguntar cada</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              id="turnFrequency"
                              type="number"
                              min={1}
                              max={10}
                              value={frequency.turnFrequency}
                              onChange={(e) =>
                                handleFrequencyChange("turnFrequency", Number.parseInt(e.target.value) || 1)
                              }
                              className="w-20"
                            />
                            <span>turnos</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="askWhite"
                            checked={frequency.askWhite}
                            onCheckedChange={(checked) => handleFrequencyChange("askWhite", checked)}
                          />
                          <Label htmlFor="askWhite">Preguntar a las blancas</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="askBlack"
                            checked={frequency.askBlack}
                            onCheckedChange={(checked) => handleFrequencyChange("askBlack", checked)}
                          />
                          <Label htmlFor="askBlack">Preguntar a las negras</Label>
                        </div>
                      </div>
                    )}

                    {frequency.mode === "captures" && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="askOnCapture"
                            checked={frequency.askOnCapture}
                            onCheckedChange={(checked) => handleFrequencyChange("askOnCapture", checked)}
                          />
                          <Label htmlFor="askOnCapture">Preguntar siempre al capturar</Label>
                        </div>

                        <div>
                          <Label htmlFor="captureValue">Preguntar según valor de la pieza</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <span>Peón</span>
                              <Switch
                                id="askOnPawn"
                                checked={frequency.askOnPieceType.includes("p")}
                                onCheckedChange={(checked) => {
                                  const newPieceTypes = [...frequency.askOnPieceType]
                                  if (checked && !newPieceTypes.includes("p")) {
                                    newPieceTypes.push("p")
                                  } else if (!checked) {
                                    const index = newPieceTypes.indexOf("p")
                                    if (index > -1) newPieceTypes.splice(index, 1)
                                  }
                                  handleFrequencyChange("askOnPieceType", newPieceTypes)
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Caballo</span>
                              <Switch
                                id="askOnKnight"
                                checked={frequency.askOnPieceType.includes("n")}
                                onCheckedChange={(checked) => {
                                  const newPieceTypes = [...frequency.askOnPieceType]
                                  if (checked && !newPieceTypes.includes("n")) {
                                    newPieceTypes.push("n")
                                  } else if (!checked) {
                                    const index = newPieceTypes.indexOf("n")
                                    if (index > -1) newPieceTypes.splice(index, 1)
                                  }
                                  handleFrequencyChange("askOnPieceType", newPieceTypes)
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Alfil</span>
                              <Switch
                                id="askOnBishop"
                                checked={frequency.askOnPieceType.includes("b")}
                                onCheckedChange={(checked) => {
                                  const newPieceTypes = [...frequency.askOnPieceType]
                                  if (checked && !newPieceTypes.includes("b")) {
                                    newPieceTypes.push("b")
                                  } else if (!checked) {
                                    const index = newPieceTypes.indexOf("b")
                                    if (index > -1) newPieceTypes.splice(index, 1)
                                  }
                                  handleFrequencyChange("askOnPieceType", newPieceTypes)
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Torre</span>
                              <Switch
                                id="askOnRook"
                                checked={frequency.askOnPieceType.includes("r")}
                                onCheckedChange={(checked) => {
                                  const newPieceTypes = [...frequency.askOnPieceType]
                                  if (checked && !newPieceTypes.includes("r")) {
                                    newPieceTypes.push("r")
                                  } else if (!checked) {
                                    const index = newPieceTypes.indexOf("r")
                                    if (index > -1) newPieceTypes.splice(index, 1)
                                  }
                                  handleFrequencyChange("askOnPieceType", newPieceTypes)
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Dama</span>
                              <Switch
                                id="askOnQueen"
                                checked={frequency.askOnPieceType.includes("q")}
                                onCheckedChange={(checked) => {
                                  const newPieceTypes = [...frequency.askOnPieceType]
                                  if (checked && !newPieceTypes.includes("q")) {
                                    newPieceTypes.push("q")
                                  } else if (!checked) {
                                    const index = newPieceTypes.indexOf("q")
                                    if (index > -1) newPieceTypes.splice(index, 1)
                                  }
                                  handleFrequencyChange("askOnPieceType", newPieceTypes)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {frequency.mode === "timer" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="timerInterval">Intervalo de tiempo</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Select
                              value={frequency.timerInterval.toString()}
                              onValueChange={(value) => handleFrequencyChange("timerInterval", Number.parseInt(value))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 segundos</SelectItem>
                                <SelectItem value="60">1 minuto</SelectItem>
                                <SelectItem value="120">2 minutos</SelectItem>
                                <SelectItem value="300">5 minutos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="pauseTimerDuringQuestion"
                            checked={frequency.pauseTimerDuringQuestion}
                            onCheckedChange={(checked) => handleFrequencyChange("pauseTimerDuringQuestion", checked)}
                          />
                          <Label htmlFor="pauseTimerDuringQuestion">Pausar temporizador durante preguntas</Label>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Configuración adicional</h4>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="loseOnWrongAnswer"
                          checked={frequency.loseOnWrongAnswer}
                          onCheckedChange={(checked) => handleFrequencyChange("loseOnWrongAnswer", checked)}
                        />
                        <Label htmlFor="loseOnWrongAnswer">Perder turno al responder incorrectamente</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showFeedback"
                          checked={frequency.showFeedback}
                          onCheckedChange={(checked) => handleFrequencyChange("showFeedback", checked)}
                        />
                        <Label htmlFor="showFeedback">Mostrar retroalimentación de respuestas</Label>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="questionDifficulty">Dificultad de preguntas</Label>
                        </div>
                        <RadioGroup
                          value={frequency.difficulty}
                          onValueChange={(value) => handleFrequencyChange("difficulty", value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="easy" id="difficulty-easy" />
                            <Label htmlFor="difficulty-easy">Fácil</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="difficulty-medium" />
                            <Label htmlFor="difficulty-medium">Media</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hard" id="difficulty-hard" />
                            <Label htmlFor="difficulty-hard">Difícil</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="difficulty-all" />
                            <Label htmlFor="difficulty-all">Todas</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={handleApplyFrequency}
                      className="w-full hover:opacity-90 text-white"
                      style={{ backgroundColor: "var(--dark-square)" }}
                    >
                      Aplicar Configuración
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Colores del Tablero</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="lightSquare">Casillas Claras</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="lightSquare"
                          type="color"
                          value={colors.lightSquare}
                          onChange={(e) => handleColorChange("lightSquare", e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={colors.lightSquare}
                          onChange={(e) => handleColorChange("lightSquare", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="darkSquare">Casillas Oscuras</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="darkSquare"
                          type="color"
                          value={colors.darkSquare}
                          onChange={(e) => handleColorChange("darkSquare", e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={colors.darkSquare}
                          onChange={(e) => handleColorChange("darkSquare", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="border">Borde</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="border"
                          type="color"
                          value={colors.border}
                          onChange={(e) => handleColorChange("border", e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input value={colors.border} onChange={(e) => handleColorChange("border", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={handleApplyColors}
                      className="w-full hover:opacity-90 text-white"
                      style={{ backgroundColor: "var(--dark-square)" }}
                    >
                      Aplicar Colores
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Vista Previa</h3>
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <div className="grid grid-cols-4 w-64 h-64 border-4" style={{ borderColor: colors.border }}>
                      {Array.from({ length: 16 }).map((_, index) => {
                        const isLight = (Math.floor(index / 4) + (index % 4)) % 2 === 0
                        return (
                          <div
                            key={index}
                            className="w-16 h-16"
                            style={{ backgroundColor: isLight ? colors.lightSquare : colors.darkSquare }}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 bg-gray-50 p-4">
          <Button
            variant="outline"
            onClick={onClose}
            style={{ borderColor: "var(--dark-square)", color: "var(--dark-square)" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={onClose}
            className="hover:opacity-90 text-white"
            style={{ backgroundColor: "var(--dark-square)" }}
          >
            Guardar y Cerrar
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogo de importación CSV */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Preguntas desde CSV</DialogTitle>
            <DialogDescription>
              Sube un archivo CSV con tus preguntas o copia y pega el contenido directamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Actualizar la documentación del formato CSV para mostrar dificultad con abreviaturas */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="font-medium text-sm text-blue-700 mb-2">Formato del CSV:</p>
              <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
                Pregunta,Opción A,Opción B,Opción C,Opción D,Respuesta,Dificultad,Retroalimentación
              </pre>
              <div className="mt-2 space-y-1 text-xs text-blue-700">
                <div>
                  <strong>Pregunta:</strong> Texto de la pregunta
                </div>
                <div>
                  <strong>Opciones A-D:</strong> Opciones de respuesta
                </div>
                <div>
                  <strong>Respuesta:</strong> A, B, C o D
                </div>
                <div>
                  <strong>Dificultad:</strong> f (fácil), m (media) o d (difícil)
                </div>
                <div>
                  <strong>Retroalimentación:</strong> Explicación (opcional)
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateExampleCSV}
                  className="flex items-center gap-1 text-xs"
                >
                  <Download className="h-3 w-3" />
                  Descargar ejemplo
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-file">Subir archivo CSV</Label>
              <Input id="csv-file" type="file" accept=".csv,text/csv" onChange={handleFileSelect} ref={fileInputRef} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-content">O pega el contenido CSV aquí</Label>
              <Textarea
                id="csv-content"
                placeholder="Pega el contenido CSV aquí..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="min-h-[80px] text-sm w-full"
              />
            </div>
            {importError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{importError}</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={processCSV} style={{ backgroundColor: "var(--dark-square)" }}>
              Importar Preguntas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar una pregunta */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La pregunta será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuestion} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para eliminar todas las preguntas */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar todas las preguntas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Todas las preguntas serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllQuestions} className="bg-red-600 hover:bg-red-700">
              Eliminar Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
