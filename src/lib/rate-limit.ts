import { NextRequest } from "next/server";

// Mapa para controlar rate limiting por IP
const uploadAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();

// Configurações de rate limiting
const RATE_LIMIT = {
  maxAttempts: 10, // máximo 10 uploads por hora
  windowMs: 60 * 60 * 1000, // 1 hora
  blockDurationMs: 15 * 60 * 1000, // bloqueio por 15 minutos
};

export function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  error?: string;
} {
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const userAttempts = uploadAttempts.get(clientIP);

  if (!userAttempts) {
    // Primeira tentativa
    uploadAttempts.set(clientIP, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Verificar se está dentro da janela de tempo
  const timeSinceLastAttempt = now - userAttempts.lastAttempt;

  // Reset counter se passou da janela de tempo
  if (timeSinceLastAttempt > RATE_LIMIT.windowMs) {
    uploadAttempts.set(clientIP, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Verificar se excedeu o limite
  if (userAttempts.count >= RATE_LIMIT.maxAttempts) {
    // Verificar se ainda está no período de bloqueio
    if (timeSinceLastAttempt < RATE_LIMIT.blockDurationMs) {
      const remainingTime = Math.ceil(
        (RATE_LIMIT.blockDurationMs - timeSinceLastAttempt) / 1000 / 60
      );
      return {
        allowed: false,
        error: `Muitas tentativas de upload. Tente novamente em ${remainingTime} minutos.`,
      };
    } else {
      // Período de bloqueio expirou, reset
      uploadAttempts.set(clientIP, { count: 1, lastAttempt: now });
      return { allowed: true };
    }
  }

  // Incrementar contador
  uploadAttempts.set(clientIP, {
    count: userAttempts.count + 1,
    lastAttempt: now,
  });

  return { allowed: true };
}

// Limpeza periódica do mapa (para evitar memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of uploadAttempts.entries()) {
    if (now - data.lastAttempt > RATE_LIMIT.windowMs * 2) {
      uploadAttempts.delete(ip);
    }
  }
}, RATE_LIMIT.windowMs);

export default { checkRateLimit };
