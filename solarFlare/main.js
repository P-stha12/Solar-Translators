const express = require("express");
const path = require("path");
const consolidate = require("consolidate");
const multer = require("multer");
let FormData = require("form-data");
let fs = require("fs");
const { getFips } = require("crypto");
const axios = require("axios").default;

require("dotenv").config();

//app level constants are configured here
const PORT = process.env.PORT || 3000;

const app = express();

//App configuration
app.engine("html", consolidate.swig);
app.set("views", path.join(__dirname, "/views"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, process.env.tempFile));
    },
    filename: (req, file, cb) => {
      let fileName = Date.now() + file.originalname;
      req.fileName = fileName;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) == ".csv") {
      cb(null, true);
    } else {
      cb(new Error("The file entered must be a csv file"));
    }
  },
});

app.post(
  "/graph",
  upload.single("file"),
  async (req, res) => {
    let reqUrl;
    if (parseInt(req.body.dataType) == 1) {
      reqUrl = "http://127.0.0.1:5000/predict-with-windspeed"
    }else{
      reqUrl = "http://127.0.0.1:5000/predict-with-speed-and-field"
    }
      let bodyContent = new FormData();
      bodyContent.append("next", parseInt(req.body.hours));
      console.log(req.body);
      let fName = path.join(__dirname, process.env.tempFile, req.fileName);
      console.log(path.join(__dirname, process.env.tempFile, req.fileName));
      bodyContent.append("files[]", fs.createReadStream(fName));
      console.log(reqUrl);
      let reqOptions = {
        url: reqUrl,
        method: "POST",
        headers: {},
        data: bodyContent,
      };
      try{
        let response = await axios.request(reqOptions)
        if (response.status == 200) {
          res.json({
            status: true,
            graph: `<img src="data:image/gif;base64,${response.data.response}" placeholder='check'/>`,
          });
        } else {
          res.status(400).json({
            status: false,
            message: "failed processing the file",
          });
        }
      }catch(err){
        res.status(400).json({
          "message":"Some error might have occured"
        })
      }
  },
  (err, req, res, next) => {
    if (err) {
      res.status(400).json({
        message: err.message,
      });
      console.log(err);
    }
  }
);

app.use(express.static(path.join(__dirname + "/public")));

app.listen(PORT, () => {
  console.log("We are listening to the app at port ", PORT);
});
