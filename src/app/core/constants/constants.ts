import { remoteConfig } from "src/environments/environment.remoteconfig"

export const COLORS = {
    primary: '#309A41',
    green: '#77AD40',
    white: '#FFFFFF',
    primaryGreen: "#3cb53f",
    headerGreen: '#F3FAF2'
}

export const IMAGES = {
    noData: 'no-data.svg',
    researching: 'researching-amico.svg'
}

export const ANALITYCS_EVENTS = {

}
export const REGEX = {
    password: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}/
}

export const ALERT_ICONS = {
    SUCCESS: 'assets/img/shared/check.svg',
    ERROR: 'assets/img/shared/error_icon.svg',
    QUESTION: 'assets/img/shared/question_icon.svg',
}

export function cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, ''); // elimina todo lo que no sea dígito
}

export function scrollToElement(elementId: string) {
    setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Puedes cambiar 'center' por 'start' o 'end'
        }
    }, 300);

}

export const EVENT_STATE = {
    managementOptionSelected: '',
    eventRole: ''
}

export function removeSpecialCharsAndEmojis(text: string): string {
  // Elimina emojis y caracteres fuera del rango básico
  const withoutEmojis = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '')  // emoticonos
                            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')  // símbolos y pictogramas
                            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')  // transporte y mapas
                            .replace(/[\u{2600}-\u{26FF}]/gu, '')    // misceláneos
                            .replace(/[\u{2700}-\u{27BF}]/gu, '');   // símbolos dingbats

  // Elimina caracteres especiales y deja solo letras, números y espacios
  return withoutEmojis.replace(/[^a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ ]/g, '').trim();
}

export function isAdminUser(userId: string): boolean {
    return remoteConfig.ADMINS_USERS.find(r => r === userId) !== undefined;
}

export const USER_SINGLE = {
    ID: 0,
}

/**
 * Convierte un texto a un nombre seguro para carpeta/archivo en Supabase.
 * - Quita acentos/diacríticos (áéíóúñ… -> aeioun)
 * - Reemplaza espacios/Separadores por "_" (configurable)
 * - Elimina cualquier caracter fuera de [a-z0-9_-] (y opcional "/")
 */
export function sanitizeForBucket(
  input: string,
  opts: { separator?: '_' | '-'; allowSlash?: boolean; maxLength?: number } = {}
): string {
  const separator = opts.separator ?? '_';
  const allowSlash = opts.allowSlash ?? false;

  // 1) Normaliza y quita diacríticos (compat Safari/Chrome/Node)
  let s = input.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // elimina marcas combinadas

  // Casos especiales comunes (opcional)
  s = s.replace(/ß/g, 'ss').replace(/æ/g, 'ae').replace(/œ/g, 'oe');

  // 2) Minúsculas
  s = s.toLowerCase();

  // 3) Reemplaza cualquier separador por el elegido
  s = s.replace(/[\s\p{Z}]+/gu, separator); // espacios unicode -> "_"

  // 4) Borra todo lo que no sea permitido
  const allowed = allowSlash ? new RegExp(`[^a-z0-9_\\-\\/]+`, 'g') : /[^a-z0-9_\-]+/g;
  s = s.replace(allowed, '');

  // 5) Colapsa separadores repetidos y recorta extremos
  const rep = new RegExp(`${separator}{2,}`, 'g');
  s = s.replace(rep, separator).replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

  // 6) Longitud máxima opcional
  if (opts.maxLength && s.length > opts.maxLength) s = s.slice(0, opts.maxLength);

  return s;
}


