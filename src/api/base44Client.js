import { createClient } from '@base44/sdk'

const appId = import.meta.env.VITE_BASE44_APP_ID

const localDb = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => {
      throw new Error('not authenticated')
    },
    logout: () => {},
    redirectToLogin: () => {
      window.location.href = '/login'
    },
    loginViaEmailPassword: async () => {
      throw new Error('Base44 backend bağlı değil. .env.local içine VITE_BASE44_APP_ID ekleyin.')
    },
    loginWithProvider: () => {
      throw new Error('Base44 backend bağlı değil.')
    },
    register: async () => {
      throw new Error('Base44 backend bağlı değil.')
    },
    verifyOtp: async () => {
      throw new Error('Base44 backend bağlı değil.')
    },
    resendOtp: async () => {},
    setToken: () => {},
    resetPasswordRequest: async () => {},
    resetPassword: async () => {},
  },
  entities: new Proxy(
    {},
    {
      get: () => ({
        filter: async () => [],
        get: async () => null,
        create: async () => ({}),
        update: async () => ({}),
        delete: async () => ({}),
      }),
    }
  ),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
    },
  },
}

export const db = appId ? createClient({ appId, requiresAuth: false }) : localDb
export const base44 = db
export default db
