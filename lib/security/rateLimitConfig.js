export const RATE_LIMITS = {
  LOGIN: { // Done
    requests: 3,
    window: "1 m",
  },

  SIGNUP: { // Done
    requests: 3,
    window: "1 m",
  },

  VERIFY_OTP: { // Done
    requests: 5,
    window: "10 m",
  },

  FORGOT_PASSWORD_SEND_OTP: { // Done
    requests: 3,
    window: "10 m",
  },

  FORGOT_PASSWORD_VERIFY_OTP: { // Done
    requests: 5,
    window: "10 m",
  },

  CHANGE_PASSWORD: { // Done
    requests: 5,
    window: "10 m",
  },

  RESET_PASSWORD: { // Done
    requests: 5,
    window: "10 m",
  },

  AI: { // Done
    requests: 10,
    window: "1 m",
  },

  EXPORT: { // Done
    requests: 6,
    window: "1 m",
  },

  USER: { // Done
    requests: 30,
    window: "1 m",
  },

  RESUME_GET: { // Done
    requests: 5,
    window: "1 m",
  },

  RESUME_SAVE: { // Done
    requests: 5,
    window: "1 m",
  },

  JOBS: { // Done
    requests: 45,
    window: "1 m",
  },

  PIPELINE: { // Done
    requests: 75,
    window: "1 m",
  },

  PAYMENT: { // Done
    requests: 20,
    window: "1 m",
  },

  FEEDBACK: { // Done
    requests: 10,
    window: "1 m",
  },

  COUPON: { // Done
    requests: 10,
    window: "1 m",
  },
};
