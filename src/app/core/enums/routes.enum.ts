import { authRoutes } from "src/app/features/auth/auth.routes";

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
    HOME: '/home',
    PRE_HOME: '/pre-home',
    AUTH: '/auth',
    SPLASH: '/splash-screen',
    LOGIN_PREVIEW: 'auth/login-preview',
    LOGIN_EMAIL: 'auth/login-email',
    LOGIN_PHONE: 'auth/login-phone',
    AUTH_REGISTER: authRoutes[0]?.path ?? '',
    AUTH_FORGOT_PASSWORD: 'auth/forgot-password',
    AUTH_OTP: 'auth/otp',

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