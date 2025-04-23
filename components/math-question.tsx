"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MathQuestion({ question, onAnswer, boardColors }) {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
  }

  const handleSubmit = () => {
    if (selectedOption) {
      // Verificar si el ID de la opción seleccionada coincide con la respuesta correcta
      const isCorrect = selectedOption.id === question.answer
      onAnswer(selectedOption, isCorrect)
    }
  }

  return (
    <Card className="w-full max-w-md max-h-[90vh] flex flex-col bg-white shadow-lg">
      <CardHeader style={{ backgroundColor: "var(--dark-square)", color: "white" }}>
        <CardTitle className="text-xl text-center">Pregunta</CardTitle>
      </CardHeader>

      <div className="flex-grow overflow-y-auto" style={{ backgroundColor: "var(--light-square)" }}>
        <CardContent className="p-6">
          <p className="text-xl font-bold mb-6 text-center break-words" style={{ color: "var(--dark-square)" }}>
            {question.question}
          </p>
          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option) => (
              <Button
                key={option.id}
                variant={selectedOption === option ? "default" : "outline"}
                className={`h-auto py-3 text-base text-left break-words whitespace-normal ${
                  selectedOption === option ? "text-white" : "border-2 hover:bg-opacity-10"
                }`}
                style={
                  selectedOption === option
                    ? { backgroundColor: "var(--dark-square)" }
                    : {
                        borderColor: "var(--dark-square)",
                        color: "var(--dark-square)",
                        backgroundColor: "transparent",
                      }
                }
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex">
                  <span className="mr-2 font-bold">{option.id}:</span>
                  <span className="flex-1">{option.value}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex justify-center p-4" style={{ backgroundColor: "var(--light-square)" }}>
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          style={{ backgroundColor: "var(--dark-square)", color: "white" }}
          className="hover:opacity-90 px-8"
        >
          Confirmar Respuesta
        </Button>
      </CardFooter>
    </Card>
  )
}
