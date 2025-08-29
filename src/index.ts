import { app } from "./app";
import { ENV } from "./config/env";

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`Server runs ar http://localhost:${PORT}`);
});
