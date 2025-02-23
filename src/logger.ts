import type { FastifyBaseLogger } from "fastify";

export const logger: FastifyBaseLogger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  fatal: console.error,
  trace: console.trace,
  level: "info",
  silent: () => {}, // Реализация метода silent, который ничего не делает
  child: () => logger, // Простая реализация метода child
  // ... другие методы логгера
};
