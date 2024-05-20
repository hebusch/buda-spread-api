import { app } from './app';
import { env } from './common/utils/envConfig';

app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
});
