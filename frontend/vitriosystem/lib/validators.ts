// Formata progressivamente enquanto o usuário digita: 000.000.000-00
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Formata progressivamente enquanto o usuário digita: 00.000.000/0000-00
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

// Enquanto digita, se tiver até 11 dígitos formata como CPF;
// a partir do 12º dígito, passa a formatar como CNPJ. Usado no login,
// onde o mesmo campo aceita os dois documentos.
export function formatDocument(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits.length <= 11 ? formatCpf(value) : formatCnpj(value);
}

// Formata progressivamente enquanto o usuário digita:
// fixo -> (00) 0000-0000 | celular -> (00) 00000-0000
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

// Valida o formato final: (00) 0000-0000 (fixo, 10 dígitos) ou
// (00) 00000-0000 (celular, 11 dígitos).
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) return false;

  return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value);
}

// Valida o CPF de verdade: tamanho, sequência repetida (000.000.000-00,
// 111.111.111-11 etc, que passam no formato mas nunca são válidos) e o
// cálculo dos dois dígitos verificadores.
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (base: string, factorStart: number): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * (factorStart - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const base = digits.slice(0, 9);
  const digit1 = calcDigit(base, 10);
  const digit2 = calcDigit(base + digit1, 11);

  return digits === base + digit1.toString() + digit2.toString();
}

// Valida o CNPJ de verdade: tamanho, sequência repetida e os dois
// dígitos verificadores (pesos padrão da Receita Federal).
export function isValidCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const base = digits.slice(0, 12);
  const digit1 = calcDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calcDigit(base + digit1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digits === base + digit1.toString() + digit2.toString();
}