"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout/Layout"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import api from "@/lib/axios"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLogin = async (email: string, senha: string) => {
    try {
      const response = await api.post("/login", { email, senha })
      const { token, user } = response.data

      if (!user.emailVerificado) {
        // Salva email temporariamente para a página de email não confirmado
        localStorage.setItem("pendingEmail", user.email)
        navigate("/email-nao-confirmado", { state: { email: user.email } })
        return
      }

      // Se email verificado, salva login e redireciona
      useAuthStore.getState().setAuth(user, token)
      navigate("/dashboard")
    } catch (error) {
      toast.error("Email ou senha inválidos")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.email || !formData.senha) {
      toast.error("Por favor, preencha todos os campos")
      setIsLoading(false)
      return
    }

    handleLogin(formData.email, formData.senha)

    setIsLoading(false)
  }

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
              <p className="text-gray-600">Entre com sua conta para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="senha" className="block mb-2 text-gray-700 font-medium">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent pr-12"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lembrar"
                    className="h-4 w-4 text-event-blue focus:ring-event-blue border-gray-300 rounded"
                  />
                  <label htmlFor="lembrar" className="ml-2 text-sm text-gray-600">
                    Lembrar de mim
                  </label>
                </div>
                <Link to="/recuperar-senha" className="text-sm text-event-blue hover:text-blue-600">
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Não tem uma conta?{" "}
                <Link to="/inscricao" className="text-event-blue hover:text-blue-600 font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Ou acesse diretamente:</p>
                <div className="space-y-2">
                  <Link to="/programacao" className="block text-event-blue hover:text-blue-600 text-sm">
                    📅 Ver Programação
                  </Link>
                  <Link to="/palestras" className="block text-event-blue hover:text-blue-600 text-sm">
                    🎤 Ver Palestras
                  </Link>
                  <Link to="/minicursos" className="block text-event-blue hover:text-blue-600 text-sm">
                    📚 Ver Oficinas
                  </Link>
                  <Link to="/torneio-jogos" className="block text-event-blue hover:text-blue-600 text-sm">
                    🎮 Ver Torneio de Jogos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Login
