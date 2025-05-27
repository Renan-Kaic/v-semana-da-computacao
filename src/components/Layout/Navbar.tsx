"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Gamepad, User, LogOut, Home } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Programação", path: "/programacao" },
    { name: "Palestras", path: "/palestras" },
    { name: "Oficinas", path: "/minicursos" },
    {
      name: "Torneio de Jogos",
      path: "/torneio-jogos",
      icon: <Gamepad size={16} className="mr-1" />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold text-event-purple">
          V SCC-IFMA
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link flex items-center ${
                isActive(item.path) ? "active" : ""
              }`}
            >
              {item.icon && item.icon}
              {item.name}
            </Link>
          ))}

          {/* Temporariamente oculto
          {!user && (
            <>
              <Link
                to="/inscricao"
                className="bg-event-blue hover:bg-blue-600 text-white px-5 py-2 rounded-md transition-colors text-center"
              >
                Inscreva-se
              </Link>
              <Link
                to="/login"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-md transition-colors text-center"
              >
                Login
              </Link>
            </>
          )}
          */}
          {user && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center text-event-blue hover:text-blue-600 px-3 py-2 rounded-md transition-colors"
              >
                <Home size={16} className="mr-1" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                  window.location.href = "/";
                }}
                className="flex items-center text-gray-500 hover:text-red-600 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut size={16} className="mr-1" />
                Sair
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-event-blue"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white w-full border-t animate-fade-in">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${
                  isActive(item.path) ? "active" : ""
                } py-2 flex items-center`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon && item.icon}
                {item.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center text-event-blue hover:text-blue-600 px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Home size={16} className="mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    useAuthStore.getState().logout();
                    window.location.href = "/";
                  }}
                  className="flex items-center text-gray-500 hover:text-red-600 px-3 py-2 rounded-md transition-colors w-full text-left"
                >
                  <LogOut size={16} className="mr-1" />
                  Sair
                </button>
              </>
            ) : /* Temporariamente oculto
              <>
                <Link
                  to="/login"
                  className="text-event-blue hover:text-blue-600 px-4 py-2 rounded-md transition-colors text-center border border-event-blue"
                  onClick={() => setIsOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  to="/inscricao"
                  className="bg-event-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Cadastrar
                </Link>
              </>
              */
            null}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
