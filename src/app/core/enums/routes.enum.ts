import { authRoutes } from "src/app/features/auth/auth.routes";
import { dashBoardRoutes } from "src/app/features/dashboard/dashboard.routes";
import { eventRoutes } from "src/app/features/events/events.routes";
import { informationRoutes } from "src/app/features/information/information.routes";
import { settingsRoutes } from "src/app/features/settings/settings.routes";
import { templateRoutes } from "src/app/features/templates/templates.routes";

export const RoutesApp = {
    ONBOARDING: '/onboarding',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/product-detail',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_DETAIL: '/order-detail',
    PROFILE: '/profile',
    FORCE_UPDATE: '/force-update',
    NOT_FOUND: '/not-found',
    NO_INTERNET: '/no-internet',
    APP_MAINTENANCE: '/maintenance',
    HOME: dashBoardRoutes[0]?.path ?? '',
    PRE_HOME: '/pre-home',
    AUTH: '/auth',
    SPLASH: '/splash-screen',
    LOGIN_PREVIEW: 'auth/login-preview',
    LOGIN_EMAIL: 'auth/login-email',
    LOGIN_PHONE: 'auth/login-phone',
    AUTH_REGISTER: authRoutes[0]?.path ?? '',
    AUTH_FORGOT_PASSWORD: 'auth/forgot-password',
    AUTH_OTP: 'auth/otp-verification',

    //Events
    CREATE_EVENT: eventRoutes[0]?.path ?? '',
    MANAGE_EVENT: eventRoutes[1]?.path ?? '',
    EVENT_EXPENSES: eventRoutes[2]?.path ?? '',
    EVENT_GIFT_LIST: eventRoutes[3]?.path ?? '',
    GROUPS: eventRoutes[4]?.path ?? '',
    EVENT_MEMBERS: eventRoutes[5]?.path ?? '',
    EVENT_TABLES: eventRoutes[6]?.path ?? '',
    EVENT_GUESTS: eventRoutes[7]?.path ?? '',
    EVENT_TICKETS: eventRoutes[8]?.path ?? '',
    EVENT_SCANNER: eventRoutes[9]?.path ?? '',
    EVENT_GUEST_VERIFICATION: eventRoutes[10]?.path ?? '',
    EVENT_DETAIL: '/event-detail',

    //Information
    INFORMATION: informationRoutes[0]?.path ?? '',

    //Settings
    SETTINGS: settingsRoutes[0]?.path ?? '',


    //Templates
    TEMPLATES:  templateRoutes[0]?.path ?? '',

    //Top Up
    TOP_UP: '/top-up',
    TOP_UP_VALIDATE_PHONE: '/top-up/validate-phone',
    TOP_UP_SEND_TOP_UPS: '/top-up/send-top-ups',

    //Bill Payment
    BILL_PAYMENT: '/bill-payment',

    //Favorite numbers
    FAVORITE_NUMBERS: '/favorite-numbers',

    //Credit Card
    CREATE_CREDIT_CARD: '/creditcard/create',
} as const;