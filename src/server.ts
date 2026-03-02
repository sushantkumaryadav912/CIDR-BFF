import app from "./app";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`CIDR BFF running on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    javaBackend: process.env.JAVA_BACKEND_BASE_URL,
  });
});