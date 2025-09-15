import { ENV } from "./config/env";
import { server } from "./socket";

const PORT = ENV.PORT;

server.listen(PORT, () => {
  console.log(`Server runs at http://localhost:${PORT}`);
});
