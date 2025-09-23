import { ExampleInvitation } from "src/app/features/dashboard/dashboard.page";

export const remoteConfig = {
    ENVIRONMENT: {
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
                    register: "",
                    login: ""
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
    FEATURE_FLAGS: [] as any[],
    ADMINS_USERS: [] as string[],
    TICKET_TEMPLATES: [] as ExampleInvitation[],

    FESTIVA_PLANS_TEMPLATE: {
        FESTIVA_PLANS: [
            {
                code: "",
                name: "",
                limits: {
                    guests_max: 0,
                    admins_max: 0,
                    groups_max: 0,
                    tables_max: 0
                },
                features: {
                    guests: {
                        enabled: false,
                        crud: false,
                        export: false,
                        import: false,
                        tracking: {
                            viewed: false,
                            sent: false,
                            confirmed: false,
                            no_send: false
                        }
                    },
                    gift_list: {
                        enabled: false
                    },
                    groups: {
                        enabled: false,
                        level: ""
                    },
                    tables: {
                        enabled: false
                    },
                    expenses: {
                        enabled: false,
                        push_on_record: false,
                        reports: false
                    },
                    admins: {
                        enabled: false,
                        roles: []
                    },
                    scanner: {
                        enabled: false,
                        analytics: false
                    },
                    notifications: {
                        invite_accepted: false,
                        expense_recorded: false
                    },
                    branding: {
                        customization: ""
                    }
                }
            }
        ],
        VALIDATION: {
            unlimited_value: 0,
            notes: {
                groups_level: {
                    none: 0,
                    basic: "",
                    advanced: "",
                    unlimited: ""
                }
            }
        }
    },
    FESTIVA_PLANS: [] as any[],
    EVENT_OPTIONS: [] as any[],
    CONTACTS: {
        email: "",
        invitarte_phone: "",
        festiva_phone: ""
    }

}
