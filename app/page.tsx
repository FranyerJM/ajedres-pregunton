import ChessGame from "@/components/chess-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-slate-100">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="mb-8 mt-4">
          <img src="/logo.png" alt="Ujap" className="h-24 md:h-32" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ color: "var(--dark-square)" }}>
          Ajedrez Preguntón
        </h1>
        <ChessGame />
        <footer className="mt-8 text-center font-medium" style={{ color: "var(--dark-square)" }}>
          Desarrollado por: Franyer Marin y Santiago Mendez
        </footer>
      </div>
    </main>
  )
}
