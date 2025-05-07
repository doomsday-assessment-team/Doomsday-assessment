import * as dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

import app from './app';

const PORT = process.env.PORT || 3000;

console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Server running on port ${PORT}`);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at: \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
});
