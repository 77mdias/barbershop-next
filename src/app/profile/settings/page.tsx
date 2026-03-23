"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/server/profileActions";
import {
  ProfileSettingsSchema,
  type ProfileSettingsInput,
} from "@/schemas/profileSchemas";
import { useSession, signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Camera,
  User,
  Phone,
  Mail,
  Edit3,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { ProfileSettingsSkeleton } from "@/components/profile/ProfileSkeleton";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/contexts/ThemeContext";
import { PageHero } from "@/components/shared/PageHero";

/**
 * Página de Configurações do Perfil
 *
 * Permite ao usuário editar suas informações pessoais:
 * - Nome e apelido
 * - Email e telefone
 * - Foto de perfil (com upload funcional)
 */
export default function ProfileSettings() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { update } = useSession();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [currentImage, setCurrentImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showDebugModal, setShowDebugModal] = React.useState(false);

  // Novos estados para mudanças pendentes
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(
    null
  );
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [pendingTheme, setPendingTheme] = React.useState<Theme | null>(null);

  // Detectar se é mobile para usar estratégias específicas
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Mobi|Android/i.test(userAgent);
      const isTouchDevice = "ontouchstart" in window;
      const isSmallScreen = window.innerWidth < 768;

      const mobile = isMobileDevice || (isTouchDevice && isSmallScreen);
      console.log("Device detection:", {
        userAgent,
        isMobileDevice,
        isTouchDevice,
        isSmallScreen,
        finalResult: mobile,
      });

      setIsMobile(mobile);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Estado local para a imagem atual
  React.useEffect(() => {
    if (user?.image) {
      setCurrentImage(user.image);
    }
  }, [user?.image]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProfileSettingsInput>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      name: "",
      nickname: "",
      phone: "",
      email: "",
    },
  });

  // Preencher formulário quando usuário carregar
  React.useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("nickname", user.nickname || "");
      setValue("phone", user.phone || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  // Redirect se não autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: ProfileSettingsInput) => {
    console.log("Form submitted with data:", data);
    console.log("User ID:", user?.id);

    if (!user?.id) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      // PASSO 1: Aplicar tema pendente (se houver)
      if (pendingTheme) {
        console.log("Aplicando tema pendente:", pendingTheme);
        setTheme(pendingTheme);
        setPendingTheme(null);
      }

      // PASSO 2: Fazer upload da imagem pendente (se houver)
      if (pendingImageFile) {
        console.log("Fazendo upload da imagem pendente...");
        setIsUploadingImage(true);

        try {
          const formData = new FormData();
          formData.append("file", pendingImageFile);

          const response = await fetch("/api/upload/profile", {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
            },
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || "Erro ao fazer upload da imagem");
          }

          console.log("Upload da imagem concluído com sucesso");
          setPendingImageFile(null);
          setImagePreview(null);
        } catch (uploadError) {
          console.error("Erro no upload da imagem:", uploadError);
          toast.error(
            uploadError instanceof Error
              ? uploadError.message
              : "Erro ao fazer upload da imagem"
          );
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      // PASSO 3: Atualizar campos do perfil
      const result = await updateProfile({
        id: user.id,
        ...data,
      });

      console.log("Update result:", result);

      if (result.success) {
        toast.success("Perfil atualizado com sucesso!");

        try {
          await update();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          console.error("Erro ao atualizar sessão:", error);
          window.location.reload();
        }
      } else {
        toast.error(result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro inesperado ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função alternativa para mobile usando eventos de touch
  const handleMobileImageUpload = () => {
    if (!fileInputRef.current) return;

    console.log("Mobile upload method triggered");

    const input = fileInputRef.current;

    const handleChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        console.log("Mobile file selected:", file.name);
        await handleImageUpload({
          target,
        } as React.ChangeEvent<HTMLInputElement>);
      }

      input.removeEventListener("change", handleChange);
    };

    input.addEventListener("change", handleChange);
    input.click();
  };

  // Função alternativa para trigger do upload
  const triggerFileInput = () => {
    console.log("Triggering file input manually...");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Debug helper
  const showDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      platform: navigator.platform,
      touchSupport: "ontouchstart" in window,
      fileAPISupport:
        window.File && window.FileReader && window.FileList && window.Blob,
      timestamp: new Date().toISOString(),
    };

    console.log("Device Info:", info);

    const debugLogs = JSON.parse(
      localStorage.getItem("barbershop-debug") || "[]"
    );
    debugLogs.push({
      type: "device-info",
      data: info,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(
      "barbershop-debug",
      JSON.stringify(debugLogs.slice(-10))
    );

    toast.info(
      `${info.isMobile ? "Mobile" : "Desktop"} | Touch: ${info.touchSupport ? "sim" : "nao"} | FileAPI: ${info.fileAPISupport ? "sim" : "nao"}`
    );

    return info;
  };

  // Função para testar diretório de uploads
  const testUploadDir = async () => {
    try {
      toast.info("Testando diretório de uploads...");
      const response = await fetch("/api/test-upload-dir");
      const result = await response.json();

      if (result.success) {
        toast.success("Diretórios OK!");
        console.log("Upload dir test result:", result);
      } else {
        toast.error("Problema nos diretórios!");
        console.error("Upload dir test failed:", result);
      }

      saveUploadLog("upload-dir-test", result);
    } catch (error) {
      toast.error("Erro ao testar diretórios");
      console.error("Upload dir test error:", error);
      saveUploadLog("upload-dir-test-error", {
        error: (error as Error).message,
      });
    }
  };

  // Função para testar Sharp no servidor
  const testSharp = async () => {
    try {
      toast.info("Testando Sharp no servidor...");
      const response = await fetch("/api/test-sharp");
      const result = await response.json();

      if (result.success) {
        toast.success("Sharp funcionando!");
        console.log("Sharp test result:", result);
      } else {
        toast.error("Sharp com problema!");
        console.error("Sharp test failed:", result);
      }

      saveUploadLog("sharp-test", result);
    } catch (error) {
      toast.error("Erro ao testar Sharp");
      console.error("Sharp test error:", error);
      saveUploadLog("sharp-test-error", { error: (error as Error).message });
    }
  };

  // Função para copiar logs
  const copyLogsToClipboard = async () => {
    const logs = JSON.parse(
      localStorage.getItem("barbershop-debug") || "[]"
    );
    const logText = JSON.stringify(logs, null, 2);

    try {
      await navigator.clipboard.writeText(logText);
      toast.success("Logs copiados para área de transferência!");
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = logText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Logs copiados!");
    }
  };

  // Função para enviar logs por email
  const shareLogsViaEmail = () => {
    const logs = JSON.parse(
      localStorage.getItem("barbershop-debug") || "[]"
    );
    const logText = JSON.stringify(logs, null, 2);
    const subject = "Barbershop - Debug Logs Upload Mobile";
    const body = `Logs de debug do upload mobile:\n\n${logText}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Função para salvar logs de upload
  const saveUploadLog = (step: string, data: unknown) => {
    const debugLogs = JSON.parse(
      localStorage.getItem("barbershop-debug") || "[]"
    );
    debugLogs.push({
      type: "upload-step",
      step,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(
      "barbershop-debug",
      JSON.stringify(debugLogs.slice(-20))
    );
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name);

    if (!file.type.startsWith("image/")) {
      console.log("Invalid file type:", file.type);
      toast.error("Apenas imagens são permitidas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log("File too large:", file.size);
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setPendingImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      console.log("Image preview created");
    };
    reader.readAsDataURL(file);

    toast.info("Imagem selecionada. Clique em 'Salvar Alterações' para aplicar.");

    if (event.target) {
      event.target.value = "";
    }
  };

  // Função para alternar tema
  const handleThemeToggle = () => {
    const nextTheme: Theme =
      theme === "system"
        ? resolvedTheme === "dark"
          ? "light"
          : "dark"
        : theme === "dark"
          ? "light"
          : "dark";

    setPendingTheme(nextTheme);
    const themeName = nextTheme === "dark" ? "escuro" : "claro";
    toast.info(`Tema ${themeName} será aplicado ao salvar.`);
  };

  // Função para cancelar e resetar todas as mudanças pendentes
  const handleCancel = () => {
    setPendingImageFile(null);
    setImagePreview(null);
    setPendingTheme(null);

    if (user) {
      setValue("name", user.name || "");
      setValue("nickname", user.nickname || "");
      setValue("phone", user.phone || "");
      setValue("email", user.email || "");
    }

    router.back();
  };

  if (isLoading) {
    return <ProfileSettingsSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="mb-16 min-h-screen min-w-full flex-col bg-background">
      {/* Hero */}
      <PageHero
        badge="Configurações"
        title="Configurações do Perfil"
        subtitle="Gerencie suas informações pessoais e preferências da conta"
        actions={[{ label: "Voltar", href: "/profile", variant: "outline" }]}
      />

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Avatar Section */}
        <div className="mb-6 rounded-2xl border border-border bg-surface-card p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surface-1">
                {imagePreview || currentImage || user.image ? (
                  <img
                    src={
                      imagePreview ||
                      `${currentImage || user.image}?t=${Date.now()}`
                    }
                    alt={user.name ?? ""}
                    className="h-full w-full object-cover"
                    onError={() => {
                      console.log(
                        "Erro ao carregar imagem:",
                        imagePreview || currentImage || user.image
                      );
                      if (imagePreview) {
                        setImagePreview(null);
                      } else {
                        setCurrentImage(null);
                      }
                    }}
                  />
                ) : (
                  <User className="h-10 w-10 text-fg-subtle" />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isUploadingImage}
                multiple={false}
              />
              <Label
                htmlFor="avatar-upload"
                className={cn(
                  "absolute -bottom-2 -right-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-all duration-200 touch-manipulation hover:bg-accent/90",
                  isUploadingImage
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-105"
                )}
                onClick={(e) => {
                  console.log("Label clicked - device info:", {
                    isMobile,
                    isUploadingImage,
                  });

                  if (isUploadingImage) {
                    e.preventDefault();
                    return;
                  }

                  if (isMobile) {
                    e.preventDefault();
                    handleMobileImageUpload();
                  } else {
                    setTimeout(() => triggerFileInput(), 50);
                  }
                }}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Label>
            </div>

            <div className="text-center">
              <h2 className="font-semibold text-foreground">{user.name}</h2>
              <p className="text-sm text-fg-muted">{user.email}</p>
              {isMobile && (
                <p className="mt-1 text-xs text-accent">
                  Toque na câmera para alterar foto
                </p>
              )}

              {/* Botões de debug */}
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={showDeviceInfo}
                  className="text-xs text-accent underline hover:text-accent/80"
                >
                  Device Info
                </button>
                <button
                  type="button"
                  onClick={() => setShowDebugModal(true)}
                  className="text-xs text-accent underline hover:text-accent/80"
                >
                  Ver Logs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("barbershop-debug");
                    toast.info("Logs de debug limpos");
                  }}
                  className="text-xs text-destructive underline hover:text-destructive/80"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="rounded-2xl border border-border bg-surface-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <User className="mr-2 h-4 w-4 text-fg-muted" />
                Nome Completo
              </Label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                placeholder="Digite seu nome completo"
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Apelido */}
            <div className="space-y-2">
              <Label
                htmlFor="nickname"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <Edit3 className="mr-2 h-4 w-4 text-fg-muted" />
                Apelido
              </Label>
              <input
                id="nickname"
                type="text"
                {...register("nickname")}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                placeholder="Como gosta de ser chamado?"
              />
              {errors.nickname && (
                <p className="text-xs text-destructive">
                  {errors.nickname.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <Mail className="mr-2 h-4 w-4 text-fg-muted" />
                Email
              </Label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="flex items-center text-sm font-medium text-foreground"
              >
                <Phone className="mr-2 h-4 w-4 text-fg-muted" />
                Telefone
              </Label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.18)]"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Seção de Tema */}
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium text-foreground">
                <Sun className="mr-2 h-4 w-4 text-fg-muted" />
                Modo de Aparência
              </Label>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    Tema da Interface
                  </span>
                  <span className="text-xs text-fg-muted">
                    {pendingTheme
                      ? `Mudando para ${pendingTheme === "dark" ? "escuro" : "claro"} ao salvar`
                      : "Alternar entre modo claro e escuro"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  aria-label={
                    (pendingTheme || resolvedTheme) === "dark"
                      ? "Mudar para tema claro"
                      : "Mudar para tema escuro"
                  }
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:text-foreground"
                >
                  <Sun
                    className={`h-5 w-5 transition-all duration-300 ${
                      (pendingTheme || resolvedTheme) === "dark"
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                    }`}
                  />
                  <Moon
                    className={`absolute h-5 w-5 transition-all duration-300 ${
                      (pendingTheme || resolvedTheme) === "dark"
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:text-accent disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() =>
                  console.log(
                    "Button clicked, isDirty:",
                    isDirty,
                    "errors:",
                    errors
                  )
                }
                className="gold-shimmer flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-300 hover:bg-accent/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Debug */}
      {showDebugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold text-foreground">Debug Logs</h3>
              <button
                onClick={() => setShowDebugModal(false)}
                className="text-xl leading-none text-fg-muted hover:text-foreground"
              >
                &#x2715;
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {(() => {
                const logs = JSON.parse(
                  localStorage.getItem("barbershop-debug") || "[]"
                );

                if (logs.length === 0) {
                  return (
                    <div className="py-8 text-center text-fg-muted">
                      Nenhum log de debug encontrado
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {logs.map((log: unknown, index: number) => {
                      const l = log as {
                        type: string;
                        step?: string;
                        timestamp: string;
                        data: unknown;
                      };
                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-border bg-surface-1 p-3"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <span className="text-sm font-medium text-accent">
                              {l.type} {l.step && `- ${l.step}`}
                            </span>
                            <span className="text-xs text-fg-subtle">
                              {new Date(l.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-background p-2 text-xs text-foreground">
                            {JSON.stringify(l.data, null, 2)}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border p-4">
              <button
                type="button"
                onClick={testUploadDir}
                className="flex-1 min-w-0 inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition-all hover:border-accent hover:text-accent"
              >
                Testar Diretórios
              </button>
              <button
                type="button"
                onClick={testSharp}
                className="flex-1 min-w-0 inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition-all hover:border-accent hover:text-accent"
              >
                Testar Sharp
              </button>
              <button
                type="button"
                onClick={copyLogsToClipboard}
                className="flex-1 min-w-0 inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition-all hover:border-accent hover:text-accent"
              >
                Copiar Logs
              </button>
              <button
                type="button"
                onClick={shareLogsViaEmail}
                className="flex-1 min-w-0 inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition-all hover:border-accent hover:text-accent"
              >
                Enviar por Email
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("barbershop-debug");
                  setShowDebugModal(false);
                  toast.info("Logs limpos");
                }}
                className="flex-1 min-w-0 inline-flex items-center justify-center rounded-xl border border-[hsl(var(--destructive)/0.3)] px-3 py-2 text-sm font-semibold text-destructive transition-all hover:bg-[hsl(var(--destructive)/0.08)]"
              >
                Limpar Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
