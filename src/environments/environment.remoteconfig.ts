import { ExampleInvitation } from "src/app/features/dashboard/dashboard.page";

export const remoteConfig = {
    ENVIRONMENTS: {
        ENABLE_ADS: "",
        ENABLE_ADS_BANNERS: "",
        USER: "",
        PASS: "",
        APP_MAINTENANCE: "",
        IS_TESTING: "",
        URL_TERMS: "",
        URL_APP_ANDROID: "",
        DEFAULT_ADS: ""
    },
    SCREENS: {
        FORCE_UPDATE: {
            title: "",
            message: "",
            btnUpdateText: ""
        },
        MAINTENANCE: {
            title: "",
            message: "",
            btnText: ""
        },
        PRE_HOME: {
            intro: {
                title: "",
                subtitle: ""
            },
            main_content: {
                title: "",
                description: "",
                buttons: {
                    google: "",
                    apple: "",
                    register: ""
                },
                footer: {
                    text_part_1: "",
                    terms_link: "",
                    text_part_2: "",
                    privacy_link: ""
                }
            },
            images: [] as any[]
        },
        ONBOARDING: {
            steps: [] as any[],
            buttons: {
                start: "",
                continue: ""
            }
        },
        PUSH_NOTIFICATION: {
            title: "",
            subtitle: "",
            options: ""
        }
    },
    OPTIONS_ITEMS: {
        options: [] as any[],
        nextFeatures: [] as any[]
    },
    VARIABLES: {},
    ADS: {
        android: {
            banner: "",
            interstitial: "",
            rewarded: ""
        },
        ios: {
            banner: "",
            interstitial: "",
            rewarded: ""
        }
    },
    FEATURE_FLAGS: {
        FORCE_UPDATE: {
            active: "",
            users: [] as any[]
        }
    },
    ADMINS_USERS: [] as string[],
    TICKET_TEMPLATES: [] as ExampleInvitation[]
}
