//importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import Cors from "cors";

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1112314",
  key: "d6aa16c753e907bc3fac",
  secret: "5ebbe5527de103a50d2b",
  cluster: "ap2",
  useTLS: true,
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world",
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//middleware
app.use(express.json());
app.use(Cors());

// app.use((req, res, next) => {
//   res.setHeader("Access-cintrol-allow-origin", "*");
//   res.setHeader("Access-cintrol-allow-origin", "*");
//   next();
// });

//DB config
const connection_url =
  "mongodb+srv://admin:jsn4kMIQIrW8VF6d@cluster0.locvq.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//???

const db = mongoose.connection;

db.once("open", () => {
  console.log("db is connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("message", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        recieved: messageDetails.recieved,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

//Api routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created: \n ${data}`);
    }
  });
});

//listen
