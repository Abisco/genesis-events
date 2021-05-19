import { AuthenticationError } from '@redwoodjs/api'
import admin from 'firebase-admin'

import { db } from './db'

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}

const adminApp = admin.initializeApp(config)

export const getCurrentUser = async (decoded, { token, type }) => {
  const data = await adminApp.auth().verifyIdToken(token)
  const { email, uid, firebase } = data
  let provider = await db.provider.findUnique({
    where: { uid },
  })

  if (!provider) {
    provider = await db.provider.create({
      data: {
        uid,
        type: firebase?.sign_in_provider,
      },
    })
  }

  let user = provider.userId
    ? await db.user.findUnique({
        where: { id: provider.userId },
      })
    : {}

  let roles = provider.userId ? await retrieveUserRoles(provider.userId) : []

  let stores = provider.userId
    ? await db.store.findMany({
        where: { ownerId: user.id },
      })
    : {}

  return { email, uid, user, roles, stores }
}

export const requireAuth = () => {
  if (!context.currentUser) {
    throw new AuthenticationError("You don't have permission to do that.")
  }
}

export const retrieveUserRoles = async (userId) => {
  const roles = []

  let userRoles = await db.userUserRole.findMany({
    where: { userId },
  })

  for (let i = 0; i < userRoles.length; i++) {
    let role = await db.userRole.findUnique({
      where: { id: userRoles[i].userRoleId },
    })
    roles.push(role.name)
  }

  return roles
}
