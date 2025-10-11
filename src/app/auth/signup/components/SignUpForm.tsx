"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Mail, Eye, EyeOff } from "lucide-react";
import styles from "@/app/scss/components/CourseCard.module.scss";
import { logger } from "@/lib/logger";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para validar senha com requisitos de segurança
  const validatePassword = (
    password: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Mínimo 8 caracteres
    if (password.length < 8) {
      errors.push("Pelo menos 8 caracteres");
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      errors.push("Uma letra maiúscula (A-Z)");
    }

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push("Uma letra minúscula (a-z)");
    }

    // Pelo menos um número
    if (!/\d/.test(password)) {
      errors.push("Um número (0-9)");
    }

    // Pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Um caractere especial (!@#$%^&*)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(`Senha deve conter: ${passwordValidation.errors.join(", ")}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Tratamento específico para email já existente
        if (response.status === 409) {
          setError(
            "Este email já está cadastrado. Use a página de login ou tente recuperar sua senha."
          );
        } else if (data.details && Array.isArray(data.details)) {
          // Se o erro contém detalhes específicos da validação de senha
          setError(`Senha deve conter: ${data.details.join(", ")}`);
        } else {
          setError(data.message || "Erro ao criar conta");
        }
        setIsLoading(false);
        return;
      }

      // Mostrar mensagem de sucesso e redirecionar para verificação
      setError(""); // Limpar qualquer erro anterior

      const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(
        formData.email
      )}`;
      router.push(verifyUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsOAuthLoading(provider);
    setError(""); // Limpar erros anteriores

    try {
      const result = await signIn(provider, {
        callbackUrl: "/", // Redirecionar para home após sucesso
      });

      if (result?.error) {
        logger.auth.warn("OAuth error in SignUp", { error: result.error });

        if (result.error === "OAuthAccountNotLinked") {
          setError(
            "Este email já está cadastrado. Use a senha que você criou ou faça login na página de entrada."
          );
        } else if (result.error === "AccessDenied") {
          setError("Acesso negado. Tente novamente.");
        } else {
          setError("Erro ao conectar com " + provider + ". Tente novamente.");
        }
      }
    } catch (error) {
      logger.auth.error("OAuth error", { error });
      setError("Erro ao conectar com " + provider + ". Tente novamente.");
    } finally {
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="content mb-4 w-full mt-16 flex justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-[var(--foreground)]">Crie sua conta</h2>
          <p className="mt-2 text-sm text-gray-400">
            Ou{" "}
            <Link
              href={`/auth/signin`}
              className={`font-medium text-[var(--text-price)] transition-all duration-300 hover:text-[var(--text-price-secondary)] ${styles.textPrimary}`}
            >
              faça login em sua conta existente
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Nickname
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Nickname"
                value={formData.name}
                onChange={handleChange}
                className="border-gray-600 bg-[var(--card-product)] text-[var(--foreground)] placeholder-gray-400"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border-gray-600 bg-[var(--card-product)] text-[var(--foreground)] placeholder-gray-400"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Senha (requisitos abaixo)"
                value={formData.password}
                onChange={handleChange}
                className="border-gray-600 bg-[var(--card-product)] pr-10 text-[var(--foreground)] placeholder-gray-400"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Requisitos de senha */}
            <div className="mt-2 text-xs text-gray-400">
              <p className="mb-1 font-medium">Sua senha deve conter:</p>
              <div className="grid grid-cols-1 gap-1">
                <div
                  className={`flex items-center ${
                    formData.password.length >= 8
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-1">
                    {formData.password.length >= 8 ? "✓" : "○"}
                  </span>
                  Pelo menos 8 caracteres
                </div>
                <div
                  className={`flex items-center ${
                    /[A-Z]/.test(formData.password)
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-1">
                    {/[A-Z]/.test(formData.password) ? "✓" : "○"}
                  </span>
                  Uma letra maiúscula (A-Z)
                </div>
                <div
                  className={`flex items-center ${
                    /[a-z]/.test(formData.password)
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-1">
                    {/[a-z]/.test(formData.password) ? "✓" : "○"}
                  </span>
                  Uma letra minúscula (a-z)
                </div>
                <div
                  className={`flex items-center ${
                    /\d/.test(formData.password)
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-1">
                    {/\d/.test(formData.password) ? "✓" : "○"}
                  </span>
                  Um número (0-9)
                </div>
                <div
                  className={`flex items-center ${
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                      formData.password
                    )
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-1">
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                      formData.password
                    )
                      ? "✓"
                      : "○"}
                  </span>
                  Um caractere especial (!@#$%^&*)
                </div>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Confirmar senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="border-gray-600 bg-[var(--card-product)] pr-10 text-[var(--foreground)] placeholder-gray-400"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isOAuthLoading !== null}
            className={`w-full text-white hover:bg-[var(--text-price-secondary)] ${styles.buttonAccent}`}
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>

          <div className="mt-6">
            <div className="relative mt-6">
              <div className="flex justify-center text-sm">
                <span className="relative z-10 bg-black px-2 text-gray-400">
                  Ou continue com
                </span>
              </div>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-600" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading || isOAuthLoading === "github"}
                className={`w-full border-gray-600 text-[var(--primary)] transition-all duration-300 hover:border-primary hover:bg-[hsl(var(--foreground))]`}
              >
                <Github className="mr-2 h-4 w-4" />
                {isOAuthLoading === "github" ? "Conectando..." : "GitHub"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading || isOAuthLoading === "google"}
                className={`w-full border-gray-600 text-[var(--primary)] transition-all duration-300 hover:border-primary hover:bg-[hsl(var(--foreground))]`}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isOAuthLoading === "google" ? "Conectando..." : "Google"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
