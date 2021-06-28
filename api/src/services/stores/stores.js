import { db } from 'src/lib/db'

export const stores = () => {
  return db.store.findMany()
}

export const store = ({ id }) => {
  return db.store.findUnique({
    where: { id },
  })
}

export const createStore = ({ input }) => {
  return db.store.create({
    data: input,
  })
}

export const updateStore = ({ id, input }) => {
  return db.store.update({
    data: input,
    where: { id },
  })
}

export const deleteStore = ({ id }) => {
  return db.store.delete({
    where: { id },
  })
}

export const Store = {
  tournaments: (_obj, { root }) =>
    db.store.findUnique({ where: { id: root.id } }).tournaments(),
  owner: (_obj, { root }) =>
    db.store.findUnique({ where: { id: root.id } }).owner(),
}