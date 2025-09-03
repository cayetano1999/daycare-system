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
