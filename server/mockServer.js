const app = require("./mock/mockApp");

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("Mock server started on port:", port);
});
