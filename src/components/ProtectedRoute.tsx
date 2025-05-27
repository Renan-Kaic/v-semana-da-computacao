import { useAuthStore } from "@/store/useAuthStore"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = useAuthStore((state) => state.token)
    const user = useAuthStore((state) => state.user)
    if (!token) {
        return <Navigate to="/login" replace />
    }
    if (user && user.emailVerificado === false) {
        return <Navigate to="/email-nao-confirmado" replace />
    }
    return <>{children}</>
}

export default ProtectedRoute
