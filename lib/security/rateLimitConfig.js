export const RATE_LIMITS = {
  LOGIN: {
    requests: 5,
    window: "1 m",
  },

  SIGNUP: {
    requests: 5,
    window: "1 m",
  },

  VERIFY_OTP: {
    requests: 5,
    window: "10 m",
  },

  FORGOT_PASSWORD_SEND_OTP: {
    requests: 3,
    window: "10 m",
  },

  FORGOT_PASSWORD_VERIFY_OTP: {
    requests: 5,
    window: "10 m",
  },

  AI: {
    requests: 10,
    window: "1 m",
  },

  EXPORT: {
    requests: 20,
    window: "1 m",
  },

  USER: {
    requests: 60,
    window: "1 m",
  },
};