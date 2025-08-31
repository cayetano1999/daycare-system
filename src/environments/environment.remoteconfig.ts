
export const remoteConfig = {
    ENVIRONMENTS: {
        ENABLE_ADS: false,
        ENABLE_ADS_BANNERS: false,
        USER: "",
        PASS: "",
        APP_MAINTENANCE: false,
        IS_TESTING: false,
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
            images: [] as string[]
        },
        ONBOARDING: {
            textBtnSkip: "",
            textBtnNext: "",
            textBtnStart: "",
            slides: [] as any[],
            termsConditionLabel: ""
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
            active: false,
            users: [] as any[]
        }
    }
}
