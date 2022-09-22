const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Product } = require("../models/Product");

const { auth } = require("../middleware/auth");

//=================================
//             Product
//=================================

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //파일 저장을 어디에 할지 위치 알려주기
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); //파일 저장명
  },
});

var upload = multer({ storage: storage }).single("file");

router.post("/image", (req, res) => {
  //가져온 이미지 저장
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      filePath: res.req.file.path,
      fileName: res.req.file.filename,
    }); //프론트로 파일위치와 이름 전달
  });
});

//정보 저장하기
router.post("/uploadProduct", (req, res) => {
  //받아온 정보를 DB에 넣어주기
  const product = new Product(req.body);

  product.save((err) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

//랜딩페이지에 모든 정보 불러오기
router.post("/uploadProduct", auth, (req, res) => {
  //프론트에서 보내준 정보를 req.body로 받아오기
  const product = new Product(req.body);

  product.save((err) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

router.post("/getProducts", (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 50; //limit이 있으면 String을 숫자로 바꿔서 limit해주고 없으면 50으로
  let skip = parseInt(req.body.skip);

  let findArgs = {};
  let term = req.body.searchTerm;

  //showFilterResults에서 보내주는 filters의 key가 continents인지 price인지에 따라 다르게 route 주기
  for (let key in req.body.filters) {
    //continents나 price에 값이 하나 이상 들어있는 경우,
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          //mongoDB에서 제공해주는 쿼리 이용하기
          $gte: req.body.filters[key][0], //greater than equal
          $lte: req.body.filters[key][1], //less than equal
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  console.log(findArgs);

  if (term) {
    Product.find(findArgs)
      .find({ $text: { $search: term } }) //mongoDB에서 제공
      //docs.mongodb.com/manual/reference/operator/query/text/index.html
      .populate("writer")
      .sort([[sortBy, order]])
      .skip(skip) //처음에는 0부터 시작, limit이 8이면 다음번엔 2rd Skip = 0+8
      .limit(limit) //한번에 불러가는 데이터의 수(8)
      .exec((err, products) => {
        if (err) return res.status(400).json({ success: false, err });
        res
          .status(200)
          .json({ success: true, products, postSize: products.length }); //limit과 같거나 더 크면 앞으로 가져올 포스트가 더 있음을 의미
      });
  } else {
    Product.find(findArgs)
      .populate("writer")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, products) => {
        if (err) return res.status(400).json({ success: false, err });
        res
          .status(200)
          .json({ success: true, products, postSize: products.length });
      });
  }
});

///api/product/products_by_id?id=${productId}&type=single
router.get("/products_by_id", (req, res) => {
  //productId를 이용해서 DB에서 productId와 같은 상품의 정보 받아오기

  let type = req.query.type;
  let productIds = req.query.id;

  //productId를 이용해서 DB에서 productId와 같은 상품의 정보를 가져온다
  if (type === "array") {
    let ids = req.query.id.split(",");
    productIds = [];
    productIds = ids.map((item) => {
      return item;
    });
  }

  Product.find({ _id: productIds })
    .populate("writer")
    .exec((err, product) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(product);
    });
});

module.exports = router;
