// MOCKED — in-memory, data lost on container sleep
const store = new Map();

export const redis = {
  isOpen: true,
  get: async (k) => store.get(k) ?? null,
  set: async (k, v) => {
    store.set(k, v);
    return 'OK';
  },
  del: async (k) => store.delete(k),
  incr: async (k) => {
    const n = (Number(store.get(k)) || 0) + 1;
    store.set(k, String(n));
    return n;
  },
  quit: async () => {
    store.clear();
  },
};

export const getRedisClient = async () => {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }
  return redis;
};

export const closeRedisConnection = async () => {
  store.clear();
};
