/**
 * Utilitários para manipulação de datas
 *
 * Substitui a dependência do date-fns com implementações nativas
 * para evitar problemas de tipagem em ambiente Docker.
 */

// Adicionar dias a uma data
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Adicionar minutos a uma data
export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

// Verificar se duas datas são do mesmo dia
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

// Retornar o início do dia (00:00:00)
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Verificar se uma data é anterior a outra
export const isBefore = (date1: Date, date2: Date): boolean => {
  return date1.getTime() < date2.getTime();
};

// Parsear string de tempo para Date
export const parseTime = (
  timeStr: string,
  baseDate: Date = new Date()
): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

// Formatar datas em português brasileiro
export const formatDate = (date: Date, format: string): string => {
  const days = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];
  const daysShort = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const monthsShort = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  switch (format) {
    case "EEE":
      return daysShort[date.getDay()];
    case "dd":
      return date.getDate().toString().padStart(2, "0");
    case "dd/MM/yyyy":
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    case "MMMM 'de' yyyy":
      return `${months[date.getMonth()]} de ${date.getFullYear()}`;
    case "EEEE, dd 'de' MMMM":
      return `${days[date.getDay()]}, ${date.getDate()} de ${
        months[date.getMonth()]
      }`;
    case "dd 'de' MMM":
      return `${date.getDate()} de ${monthsShort[date.getMonth()]}`;
    case "HH:mm":
      return date.toTimeString().slice(0, 5);
    default:
      return date.toLocaleDateString("pt-BR");
  }
};

// Verificar se é hoje
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// Verificar se uma data está no passado
export const isPast = (date: Date): boolean => {
  return isBefore(date, new Date());
};

// Verificar se uma data está no futuro
export const isFuture = (date: Date): boolean => {
  return !isBefore(date, new Date()) && !isToday(date);
};

// Obter início da semana (domingo)
export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  return new Date(result.setDate(diff));
};

// Obter fim da semana (sábado)
export const endOfWeek = (date: Date): Date => {
  const result = startOfWeek(date);
  return addDays(result, 6);
};

// Calcular diferença em horas entre duas datas
export const differenceInHours = (date1: Date, date2: Date): number => {
  return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
};

// Calcular diferença em minutos entre duas datas
export const differenceInMinutes = (date1: Date, date2: Date): number => {
  return (date1.getTime() - date2.getTime()) / (1000 * 60);
};

// Formatar duração em minutos para texto legível
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

// Verificar se um horário está dentro do horário comercial
export const isBusinessHour = (
  date: Date,
  start = "09:00",
  end = "18:00"
): boolean => {
  const timeStr = formatDate(date, "HH:mm");
  return timeStr >= start && timeStr <= end;
};

// Obter próximo dia útil (segunda a sábado)
export const getNextBusinessDay = (date: Date): Date => {
  let nextDay = addDays(date, 1);

  // Se for domingo (0), pular para segunda
  while (nextDay.getDay() === 0) {
    nextDay = addDays(nextDay, 1);
  }

  return nextDay;
};
