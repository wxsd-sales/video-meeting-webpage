const express = require("express");
const path = require("path");
const cors = require("cors");
const https = require("https");
const axios = require("axios");
const fs = require("fs");
const { createServer } = require("node:http");
const cron = require("node-cron");
require("dotenv").config();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();
// const http = require("http").createServer(app);
// const io = require("socket.io")(http);
const server = createServer(app);
const { Server } = require("socket.io");
const getDestLinks = require("./src/utils/get-dest-links.js");
const getAccessToken = require("./src/utils/get-access-token.js");
const port = process.env.PORT || 3000;
// const options = {
//   key: fs.readFileSync("10.16.44.227.key"),
//   cert: fs.readFileSync("10.16.44.227.pem"),
//   passphrase: "qwertyuiop@123",
// };

cron.schedule("0 0 */13 * *", () => {
  console.log("Generating new access token");
  getAccessToken();
});

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());

app.use(cors());
app.get("/hangup", (req, res) => {
  res.send("Call has been ended");
});
app.get("/get-access-token", async (req, res) => {
  const token = await getAccessToken(); // Call the server-side function

  res.json({ access_token: token });
});

app.post("/end-meeting", async (req, res) => {
  console.log(req.body);
  const { accessToken, destination } = req.body;
  await axios
    .get(`https://webexapis.com/v1/meetings?webLink=${destination}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then(async (resp) => {
      const id = resp.data.items[0].id;
      console.log("id", id);
      await axios
        .get(`https://webexapis.com/v1/meetingParticipants?meetingId=${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then(async (resp) => {
          console.log("res", resp.data);
          resp.data.items.forEach(async (participant) => {
            const data = {
              expel: true,
            };
            await axios
              .put(
                `https://webexapis.com/v1/meetingParticipants/${participant.id}`,
                data,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
              .then(async (resp) => {
                console.log("expel res", resp.data);
                const date = new Date();
                const connectData = {
                  accessToken: accessToken,
                  meetingId: id,
                  meetingEnded: date,
                };
                console.log("connectData", connectData);
                await axios
                  .post(
                    "https://hooks.us.webexconnect.io/events/P3RGOWXKZY",
                    connectData
                  )
                  .then((res) => {
                    console.log("Connect resp", res);
                  })
                  .catch((err) => {
                    console.log("Connect err", err);
                  });
                res.send("Meeting ended");
              })
              .catch((error) => {
                console.log("expel error", error);
              });
          });
        })
        .catch((error) => {
          console.log("get participants details", error);
        });
    })
    .catch((error) => {
      console.log("get meeting details", error);
    });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
