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
      const isCorrect = selectedOption.value === question.answer
      onAnswer(selectedOption, isCorrect)
    }
  }

  return (
    <Card className="w-full max-w-md bg-white shadow-lg">
      <CardHeader style={{ backgroundColor: "var(--dark-square)", color: "white" }}>
        <CardTitle className="text-xl text-center">Pregunta Matemática</CardTitle>
      </CardHeader>
      <CardContent className="p-6" style={{ backgroundColor: "var(--light-square)" }}>
        <p className="text-xl font-bold mb-6 text-center" style={{ color: "var(--dark-square)" }}>
          {question.question}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((option) => (
            <Button
              key={option.id}
              variant={selectedOption === option ? "default" : "outline"}
              className={`h-16 text-lg ${selectedOption === option ? "text-white" : "border-2 hover:bg-opacity-10"}`}
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
              {option.id}: {option.value}
            </Button>
          ))}
        </div>
      </CardContent>
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
