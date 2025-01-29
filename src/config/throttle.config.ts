interface ThrottleConfig {
  throttle: {
    TTL: number;
    LIMIT: number;
  };
}

export default (): ThrottleConfig => ({
  throttle: {
    TTL: 10000,
    LIMIT: 15,
  },
});
