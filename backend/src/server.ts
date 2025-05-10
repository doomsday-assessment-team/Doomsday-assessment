import * as dotenv from 'dotenv';
import app from './app';
import { configureEnvironment, EnvironmentVariables, environmentTypes } from './utils/env';

const environmentVariables: EnvironmentVariables = configureEnvironment();

const PORT = environmentVariables.PORT || 3000;

app.listen(PORT, () => {
  if (environmentVariables.NODE_ENV === environmentTypes.DEVELOPMENT) {
    console.log(`🚀 Listening on port ${PORT}`);
  } else {
    // The environment is set to production
  }
});
