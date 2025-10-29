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
import { ProfileSettingsSchema, type ProfileSettingsInput } from "@/schemas/profileSchemas";
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
  Moon
} from "lucide-react";
import { ProfileSettingsSkeleton } from "@/components/profile/ProfileSkeleton";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/contexts/ThemeContext";

/**
 * Página de Configurações do Perfil - Design Minimalista
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
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [pendingTheme, setPendingTheme] = React.useState<Theme | null>(null);

  // Detectar se é mobile para usar estratégias específicas
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Mobi|Android/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window;
      const isSmallScreen = window.innerWidth < 768;
      
      const mobile = isMobileDevice || (isTouchDevice && isSmallScreen);
      console.log("📱 Device detection:", {
        userAgent,
        isMobileDevice,
        isTouchDevice,
        isSmallScreen,
        finalResult: mobile
      });
      
      setIsMobile(mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
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
        setPendingTheme(null); // Limpar tema pendente
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
              'Accept': 'application/json',
            }
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || "Erro ao fazer upload da imagem");
          }

          console.log("Upload da imagem concluído com sucesso");
          // Limpar estados de imagem pendente
          setPendingImageFile(null);
          setImagePreview(null);

        } catch (uploadError) {
          console.error("Erro no upload da imagem:", uploadError);
          toast.error(uploadError instanceof Error ? uploadError.message : "Erro ao fazer upload da imagem");
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return; // Abortar se upload falhar
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

        // Força atualização da sessão
        try {
          await update();

          // Reload completo para garantir que todas as mudanças sejam aplicadas
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
    
    console.log("📱 Mobile upload method triggered");
    
    // Para mobile, criar um listener direto no input
    const input = fileInputRef.current;
    
    const handleChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        console.log("📱 Mobile file selected:", file.name);
        // Usar a mesma função de upload
        await handleImageUpload({ target } as React.ChangeEvent<HTMLInputElement>);
      }
      
      // Remover listener após uso
      input.removeEventListener('change', handleChange);
    };
    
    input.addEventListener('change', handleChange);
    input.click();
  };

  // Função alternativa para trigger do upload (melhor compatibilidade mobile)
  const triggerFileInput = () => {
    console.log("🎯 Triggering file input manually...");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Debug helper para mostrar informações do dispositivo
  const showDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      platform: navigator.platform,
      touchSupport: 'ontouchstart' in window,
      fileAPISupport: window.File && window.FileReader && window.FileList && window.Blob,
      timestamp: new Date().toISOString()
    };
    
    console.log("📱 Device Info:", info);
    
    // Salvar info no localStorage para debug posterior
    const debugLogs = JSON.parse(localStorage.getItem("barbershop-debug") || "[]");
    debugLogs.push({
      type: "device-info",
      data: info,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("barbershop-debug", JSON.stringify(debugLogs.slice(-10))); // Manter apenas 10 logs
    
    // Mostrar info em toast também para debug em produção
    toast.info(`📱 ${info.isMobile ? 'Mobile' : 'Desktop'} | Touch: ${info.touchSupport ? '✅' : '❌'} | FileAPI: ${info.fileAPISupport ? '✅' : '❌'}`);
    
    return info;
  };

  // Função para testar diretório de uploads
  const testUploadDir = async () => {
    try {
      toast.info("📁 Testando diretório de uploads...");
      const response = await fetch("/api/test-upload-dir");
      const result = await response.json();
      
      if (result.success) {
        toast.success("✅ Diretórios OK!");
        console.log("Upload dir test result:", result);
      } else {
        toast.error("❌ Problema nos diretórios!");
        console.error("Upload dir test failed:", result);
      }
      
      // Salvar resultado nos logs
      saveUploadLog("upload-dir-test", result);
    } catch (error) {
      toast.error("❌ Erro ao testar diretórios");
      console.error("Upload dir test error:", error);
      saveUploadLog("upload-dir-test-error", { error: error.message });
    }
  };

  // Função para testar Sharp no servidor
  const testSharp = async () => {
    try {
      toast.info("🧪 Testando Sharp no servidor...");
      const response = await fetch("/api/test-sharp");
      const result = await response.json();
      
      if (result.success) {
        toast.success("✅ Sharp funcionando!");
        console.log("Sharp test result:", result);
      } else {
        toast.error("❌ Sharp com problema!");
        console.error("Sharp test failed:", result);
      }
      
      // Salvar resultado nos logs
      saveUploadLog("sharp-test", result);
    } catch (error) {
      toast.error("❌ Erro ao testar Sharp");
      console.error("Sharp test error:", error);
      saveUploadLog("sharp-test-error", { error: error.message });
    }
  };

  // Função para copiar logs para área de transferência
  const copyLogsToClipboard = async () => {
    const logs = JSON.parse(localStorage.getItem("barbershop-debug") || "[]");
    const logText = JSON.stringify(logs, null, 2);
    
    try {
      await navigator.clipboard.writeText(logText);
      toast.success("📋 Logs copiados para área de transferência!");
    } catch (error) {
      // Fallback para dispositivos que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = logText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success("📋 Logs copiados!");
    }
  };

  // Função para enviar logs por email (abre app de email)
  const shareLogsViaEmail = () => {
    const logs = JSON.parse(localStorage.getItem("barbershop-debug") || "[]");
    const logText = JSON.stringify(logs, null, 2);
    const subject = "Barbershop - Debug Logs Upload Mobile";
    const body = `Logs de debug do upload mobile:\n\n${logText}`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Função para salvar logs de upload
  const saveUploadLog = (step: string, data: any) => {
    const debugLogs = JSON.parse(localStorage.getItem("barbershop-debug") || "[]");
    debugLogs.push({
      type: "upload-step",
      step,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("barbershop-debug", JSON.stringify(debugLogs.slice(-20))); // Manter 20 logs
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    console.log("📄 File selected:", file.name);

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      console.log("❌ Invalid file type:", file.type);
      toast.error("Apenas imagens são permitidas");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log("❌ File too large:", file.size);
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    // Armazenar arquivo para upload posterior
    setPendingImageFile(file);

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      console.log("✅ Image preview created");
    };
    reader.readAsDataURL(file);

    toast.info("Imagem selecionada. Clique em 'Salvar Alterações' para aplicar.");

    // Limpar o input para permitir re-upload do mesmo arquivo
    if (event.target) {
      event.target.value = '';
    }
  };

  // Função para alternar tema (não aplica imediatamente)
  const handleThemeToggle = () => {
    // Determinar próximo tema
    const nextTheme: Theme = theme === "system"
      ? (resolvedTheme === "dark" ? "light" : "dark")
      : (theme === "dark" ? "light" : "dark");

    setPendingTheme(nextTheme);
    const themeName = nextTheme === "dark" ? "escuro" : "claro";
    toast.info(`Tema ${themeName} será aplicado ao salvar.`);
  };

  // Função para cancelar e resetar todas as mudanças pendentes
  const handleCancel = () => {
    // Resetar estados de imagem pendente
    setPendingImageFile(null);
    setImagePreview(null);

    // Resetar tema pendente
    setPendingTheme(null);

    // Resetar formulário para valores originais
    if (user) {
      setValue("name", user.name || "");
      setValue("nickname", user.nickname || "");
      setValue("phone", user.phone || "");
      setValue("email", user.email || "");
    }

    // Voltar para página anterior
    router.back();
  };

  if (isLoading) {
    return <ProfileSettingsSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen mt-20 mb-16 min-w-full flex flex-col  bg-background">
      {/* Header simples e moderno */}
      <div className=" border-b w-full">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className=" py-6 px-4 max-w-2xl ">
        {/* Avatar Section */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagePreview || currentImage || user.image ? (
                  <img
                    src={imagePreview || `${currentImage || user.image}?t=${Date.now()}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback se a imagem não carregar
                      console.log("Erro ao carregar imagem:", imagePreview || currentImage || user.image);
                      if (imagePreview) {
                        setImagePreview(null);
                      } else {
                        setCurrentImage(null);
                      }
                    }}
                  />
                ) : (
                  <User className="h-10 w-10 text-foreground" />
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
                  "absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 touch-manipulation",
                  isUploadingImage 
                    ? "opacity-50 cursor-not-allowed scale-95" 
                    : "cursor-pointer hover:scale-105"
                )}
                onClick={(e) => {
                  console.log("📱 Label clicked - device info:", { isMobile, isUploadingImage });
                  
                  if (isUploadingImage) {
                    e.preventDefault();
                    return;
                  }
                  
                  // Para mobile, usar método alternativo mais confiável
                  if (isMobile) {
                    e.preventDefault();
                    handleMobileImageUpload();
                  } else {
                    // Para desktop, usar método padrão com delay
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
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {isMobile && (
                <p className="text-xs text-blue-600 mt-1">
                  👆 Toque na câmera para alterar foto
                </p>
              )}
              
              {/* Botões de debug para teste em produção - pode remover depois */}
              <div className="flex gap-2 justify-center mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={showDeviceInfo}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  📱 Device Info
                </button>
                <button
                  type="button"
                  onClick={() => setShowDebugModal(true)}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  📋 Ver Logs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("barbershop-debug");
                    toast.info("🗑️ Logs de debug limpos");
                  }}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center">
                <User className="h-4 w-4 mr-2 text-foreground" />
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                className="border-border text-[hsl(var(--color-text))] bg-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Digite seu nome completo"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Apelido */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-sm font-medium text-foreground flex items-center">
                <Edit3 className="h-4 w-4 mr-2 text-foreground" />
                Apelido
              </Label>
              <Input
                id="nickname"
                type="text"
                {...register("nickname")}
                className="border-border text-[hsl(var(--color-text))] bg-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Como gosta de ser chamado?"
              />
              {errors.nickname && (
                <p className="text-xs text-red-500">{errors.nickname.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center">
                <Mail className="h-4 w-4 mr-2 text-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="border-border text-[hsl(var(--color-text))] bg-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center">
                <Phone className="h-4 w-4 mr-2 text-foreground" />
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                className="border-border bg-foreground text-[hsl(var(--color-text))] focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Seção de Tema */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center">
                <Sun className="h-4 w-4 mr-2 text-foreground" />
                Modo de Aparência
              </Label>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Tema da Interface</span>
                  <span className="text-xs text-muted-foreground">
                    {pendingTheme
                      ? `Mudando para ${pendingTheme === "dark" ? "escuro" : "claro"} ao salvar`
                      : "Alternar entre modo claro e escuro"
                    }
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleThemeToggle}
                  aria-label={
                    (pendingTheme || resolvedTheme) === "dark"
                      ? "Mudar para tema claro"
                      : "Mudar para tema escuro"
                  }
                  className="relative h-9 w-9"
                >
                  {/* Ícone Sol - Visível em light mode */}
                  <Sun
                    className={`h-5 w-5 transition-all duration-300 ${
                      (pendingTheme || resolvedTheme) === "dark"
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100"
                    }`}
                  />
                  {/* Ícone Lua - Visível em dark mode */}
                  <Moon
                    className={`absolute h-5 w-5 transition-all duration-300 ${
                      (pendingTheme || resolvedTheme) === "dark"
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                    }`}
                  />
                </Button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                onClick={() => console.log("Button clicked, isDirty:", isDirty, "errors:", errors)} // Debug
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Debug - Remove quando não precisar mais */}
      {showDebugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">🔍 Debug Logs</h3>
              <button
                onClick={() => setShowDebugModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {(() => {
                const logs = JSON.parse(localStorage.getItem("barbershop-debug") || "[]");
                
                if (logs.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      📋 Nenhum log de debug encontrado
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {logs.map((log: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-blue-700">
                            {log.type} {log.step && `- ${log.step}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <pre className="text-xs bg-white p-2 rounded overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={testUploadDir}
                className="flex-1 min-w-0"
              >
                📁 Testar Diretórios
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={testSharp}
                className="flex-1 min-w-0"
              >
                🧪 Testar Sharp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={copyLogsToClipboard}
                className="flex-1 min-w-0"
              >
                📋 Copiar Logs
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={shareLogsViaEmail}
                className="flex-1 min-w-0"
              >
                📧 Enviar por Email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("barbershop-debug");
                  setShowDebugModal(false);
                  toast.info("🗑️ Logs limpos");
                }}
                className="flex-1 min-w-0"
              >
                🗑️ Limpar Logs
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}