const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const { Payment } = require("../models/Payment");

const { auth } = require("../middleware/auth");
const async = require("async");

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
    cart: req.user.cart,
    history: req.user.history,
  });
});

router.post("/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("w_authExp", user.tokenExp);
        res.cookie("w_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "", tokenExp: "" },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

router.post("/addToCart", auth, (req, res) => {
  //카트에 상품이 추가 된 정보를 redux 안에 저장

  //User collection의 해당 user 정보를 가져오기
  User.findOne(
    { _id: req.user._id }, //쿠키속에 담긴 유저 정보를 가져오기
    (err, userInfo) => {
      //가져온 정보에서 카트에 넣으려는 상품이 이미 있는지 확인,
      let duplicate = false;

      console.log(userInfo);

      userInfo.cart.forEach((item) => {
        if (item.id == req.query.productId) {
          duplicate = true;
        }
      });

      //내가 추가한 상품이 이미 카트 안에 있을때 숫자 1 올리기
      if (duplicate) {
        User.findOneAndUpdate(
          { _id: req.user._id, "cart.id": req.query.productId },
          { $inc: { "cart.$.quantity": 1 } }, //$inc = 숫자 올리기
          { new: true }, //쿼리를 돌려서 나온 업데이트가 된 결과값을 받기 위해서 줘야하는 옵션
          (err, userInfo) => {
            //프론트로 보내주기
            if (err) return res.json({ success: false, err });
            res.status(200).json(userInfo.cart);
          }
        );
      } else {
        //카트 안에 동일 상품이 없을때 모든 정보를 넣어주기
        User.findOneAndUpdate(
          { _id: req.user._id },
          {
            $push: {
              cart: {
                id: req.query.productId,
                quantity: 1,
                date: Date.now(),
              },
            },
          },
          { new: true },
          (err, userInfo) => {
            if (err) return res.json({ success: false, err });
            res.status(200).json(userInfo.cart);
          }
        );
      }
    }
  );
});

router.get("/removeFromCart", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $pull: { cart: { id: req.query._id } },
    },
    { new: true },
    (err, userInfo) => {
      let cart = userInfo.cart;
      let array = cart.map((item) => {
        return item.id;
      });

      Product.find({ _id: { $in: array } })
        .populate("writer")
        .exec((err, cartDetail) => {
          return res.status(200).json({
            cartDetail,
            cart,
          });
        });
    }
  );
});

router.get("/userCartInfo", auth, (req, res) => {
  User.findOne({ _id: req.user._id }, (err, userInfo) => {
    let cart = userInfo.cart;
    let array = cart.map((item) => {
      return item.id;
    });

    Product.find({ _id: { $in: array } })
      .populate("writer")
      .exec((err, cartDetail) => {
        if (err) return res.status(400).send(err);
        return res.status(200).json({ success: true, cartDetail, cart });
      });
  });
});

router.post("/successBuy", auth, (req, res) => {
  let history = [];
  let transactionData = {};

  //1.User Collection 안의 history 필드 안에 간단한 결제 정보 넣기
  req.body.cartDetail.forEach((item) => {
    //CartPage에서 받은 cartDetail
    history.push({
      dateOfPurchase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quantity: item.quantity,
      paymentId: req.body.paymentData.paymentID,
    });
  });

  //2.Payment Collection 안에 자세한 결제(결제한 사람, paypal에서 넘어온 token, address, product) 정보 넣어주기
  transactionData.user = {
    //middleware를 통해서 받아오는 user 데이터 req로 받아오기
    id: req.user._id,
    name: req.user.name,
    lastname: req.user.lastname,
    email: req.user.email,
  };

  transactionData.data = req.body.paymentData;
  transactionData.product = history;

  //history 정보 저장
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { history: history }, $set: { cart: [] } }, //cart 비워주기!!
    { new: true }, //프론트로 넘겨주기위해
    (err, user) => {
      if (err) return res.json({ success: false, err });

      //payment에 transitionData 정보 저장
      const payment = new Payment(transactionData);
      payment.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        //3.결제가 성공할때마다 Product Collection 안의 sold 필드 업데이트 시켜서 상품이 얼마나 팔렸는지 정보 저장하기

        //상품 당 몇개를 구매했는지 quantity 가져오기
        let products = [];
        doc.product.forEach((item) => {
          products.push({ id: item.id, quantity: item.quantity });
        });

        //여러 product의 sold를 업데이트 해주기 위해서 for문 돌리기 대신(id 등 조건 줄게 많으니까) eachSeries 사용하기
        async.eachSeries(
          products,
          (item, callback) => {
            Product.update(
              { _id: item.id },
              {
                $inc: {
                  sold: item.quantity,
                },
              },
              { new: false }, //update된 doc를 프론트로 보내줄 필요가 없으니까 false
              callback
            );
          },

          (err) => {
            if (err) return res.status(400).json({ success: false, err });
            res.status(200).json({
              success: true,
              cart: user.cart,
              cartDetail: [], //성공 뒤엔 빈카트
            });
          }
        );
      });
    }
  );
});

router.get("/getHistory", auth, (req, res) => {
  User.findOne({ _id: req.user._id }, (err, doc) => {
    let history = doc.history;
    if (err) return res.status(400).send(err);
    return res.status(200).json({ success: true, history });
  });
});

module.exports = router;
