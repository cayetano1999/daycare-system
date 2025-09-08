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
