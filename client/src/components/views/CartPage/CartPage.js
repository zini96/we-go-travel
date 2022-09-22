import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getCartItems,
  removeCartItem,
  onSuccessBuy,
} from "../../../_actions/user_actions";
import { Result, Empty } from "antd";
import Axios from "axios";
import UserCardBlock from "./Sections/UserCardBlock";
import Paypal from "../../utils/Paypal";

function CartPage(props) {
  const dispatch = useDispatch();

  const [Total, setTotal] = useState(0);
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);
  const [ItemNum, setItemNum] = useState(0);

  useEffect(() => {
    let cartItems = [];
    //리덕스 User state 안에 cart 안에 상품이 들었는지 확인
    if (props.user.userData && props.user.userData.cart) {
      //cart안에 상품이 하나 이상 있다면
      if (props.user.userData.cart.length > 0) {
        //상품의 정보 불러오기
        props.user.userData.cart.forEach((item) => {
          cartItems.push(item.id);
        });

        dispatch(getCartItems(cartItems, props.user.userData.cart)).then(
          (response) => {
            if (response.payload.length > 0) {
              calculateTotal(response.payload);
            }
          }
        );
      }
    }
  }, [props.user.userData]);

  let calculateTotal = (cartDetail) => {
    let total = 0;
    let itemtotal = 0;

    cartDetail.map((item) => {
      total += parseInt(item.price, 10) * item.quantity;
      itemtotal += item.quantity;
    });

    setTotal(total);
    setItemNum(itemtotal);
    setShowTotal(true);
  };

  const removeFromCart = (productId) => {
    dispatch(removeCartItem(productId)).then((response) => {
      if (response.payload.cartDetail.length <= 0) {
        setShowTotal(false);
      } else {
        calculateTotal(response.payload.cartDetail);
      }
    });
  };

  const transactionSuccess = (data) => {
    dispatch(
      onSuccessBuy({
        //결제 정보 저장하기
        cartDetail: props.user.cartDetail,
        paymentData: data, //결제 성공 후 paypal에서 받는 정보
      })
    ).then((response) => {
      if (response.payload.success) {
        setShowSuccess(true);
        setShowTotal(false);
      }
    });
  };

  const transactionError = () => {
    console.log("결제오류");
  };

  const transactionCanceled = () => {
    console.log("Transaction canceled");
  };

  return (
    <div style={{ overflowX: "hidden" }}>
      {/* 장바구니 */}
      <div
        style={{
          width: "80%",
          margin: "3rem auto",
          boxSizing: "border-box",
          padding: "0",
        }}
      >
        <h1>My Cart</h1>
        <div>
          <UserCardBlock
            products={props.user.cartDetail}
            removeItem={removeFromCart}
          />
        </div>
      </div>
      {/* 결제창 */}
      {ShowTotal ? (
        <div className="orderBox">
          <h2>Order Summary</h2>
          <br />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            Items<span>{ItemNum} EA</span>
          </div>
          <hr />
          <h3 style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgb(245,34,45)" }}> Order Total</span>${" "}
            {Total}
          </h3>
          <br />
          <Paypal
            toPay={Total}
            onSuccess={transactionSuccess}
            transactionError={transactionError}
            transactionCanceled={transactionCanceled}
          />
        </div>
      ) : ShowSuccess ? (
        <Result status="success" title="Successfully Purchased Items" />
      ) : (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            marginTop: "4rem",
          }}
        >
          <br />
          <Empty description={false} />
          <p style={{ fontStyle: "italic" }}>No Items In the Cart</p>
        </div>
      )}
    </div>
  );
}

export default CartPage;
