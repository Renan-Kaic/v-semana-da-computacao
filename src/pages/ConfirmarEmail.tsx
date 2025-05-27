"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Layout from "../components/Layout/Layout"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"

const ConfirmarEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading")
  const [message, setMessage] = useState("")
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de confirmação não encontrado.")
      return
    }

    confirmarEmail()
  }, [token])

  const confirmarEmail = async () => {
    try {
      setStatus("loading")

      const response = await api.post(`/confirmar-email/${token}`, )

      if (response.data.success) {
        setStatus("success")
        setMessage("Email confirmado com sucesso! Sua conta está ativa.")
        toast.success("Email confirmado com sucesso!")

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Email confirmado! Você já pode fazer login.",
            },
          })
        }, 3000)
      } else {
        setStatus("error")
        setMessage(response.data.message || "Erro ao confirmar email.")
      }
    } catch (error: unknown) {
      console.error("Erro ao confirmar email:", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response === "object" &&
        (error as { response?: { status?: number } }).response !== null &&
        "status" in (error as { response?: { status?: number } }).response!
      ) {
        const status = (error as { response?: { status?: number } }).response!.status
        if (status === 400) {
          setStatus("expired")
          setMessage("Link de confirmação expirado ou inválido.")
        } else {
          setStatus("error")
          setMessage("Erro interno do servidor. Tente novamente mais tarde.")
        }
      } else {
        setStatus("error")
        setMessage("Erro interno do servidor. Tente novamente mais tarde.")
      }

      toast.error("Erro ao confirmar email")
    }
  }

  const handleTryAgain = () => {
    if (token) {
      confirmarEmail()
    }
  }

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Confirmando seu Email...</h1>
            <p className="text-lg text-gray-600 mb-6">Aguarde enquanto processamos a confirmação do seu email.</p>
          </>
        )

      case "success":
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Confirmado!</h1>
            <p className="text-lg text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-center">Redirecionando para a página de login em alguns segundos...</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
            >
              Ir para Login Agora
            </button>
          </>
        )

      case "expired":
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Mail className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Link Expirado</h1>
            <p className="text-lg text-gray-600 mb-6">{message}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-center">
                Solicite um novo link de confirmação fazendo login ou entrando em contato conosco.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
              >
                Ir para Login
              </button>
              <button
                onClick={() => navigate("/inscricao")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md transition-colors font-medium"
              >
                Fazer Novo Cadastro
              </button>
            </div>
          </>
        )

      case "error":
      default:
        return (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Erro na Confirmação</h1>
            <p className="text-lg text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleTryAgain}
                className="w-full bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => navigate("/inscricao")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md transition-colors font-medium"
              >
                Fazer Novo Cadastro
              </button>
            </div>
          </>
        )
    }
  }

  return (
    <Layout>
      <section className="py-12 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-lg shadow-sm border">{renderContent()}</div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default ConfirmarEmail
