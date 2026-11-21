const REQUIRED_OPERATIONS = ['list', 'save', 'remove']

export function createPathwayRepository(store) {
  if (
    store === null ||
    typeof store !== 'object' ||
    REQUIRED_OPERATIONS.some((operation) => typeof store[operation] !== 'function')
  ) {
    throw new TypeError('A pathway store must implement list, save and remove operations.')
  }

  return Object.freeze({
    list(ownerId) {
      return store.list(ownerId)
    },
    save(ownerId, pathway) {
      return store.save(ownerId, pathway)
    },
    remove(ownerId, pathwayId) {
      return store.remove(ownerId, pathwayId)
    },
  })
}
