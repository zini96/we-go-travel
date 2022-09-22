import React from "react";
import PaypalExpressBtn from "react-paypal-express-checkout";

export default class Paypal extends React.Component {
  render(props) {
    const onSuccess = (payment) => {
      console.log("The payment was succeeded!", payment);

      this.props.onSuccess(payment);
    };

    const onCancel = (data) => {
      console.log("The payment was cancelled!", data);
    };

    const onError = (err) => {
      console.log("Error!", err);
    };

    let env = "sandbox";
    let currency = "USD";
    let total = this.props.toPay;

    const client = {
      sandbox:
        "ATHoaUPgCKoNOD4pExA8Nx_lszXC5VN2QPGdswTRv5i_v0VPFVIs8jCGdVmcZuMwWNHeV10Z1RMDXhRl",
      // "AbxatIh15Hspz9jFxLkE-Ka06nhqb90DzT1Uug7xUi0XzwB6hV7MvzSfhX3bVU6PKBG2nooQYCoAbIi0",
      production: "YOUR-PRODUCTION-APP-ID",
    };

    return (
      <PaypalExpressBtn
        env={env}
        client={client}
        currency={currency}
        total={total}
        onError={onError}
        onSuccess={onSuccess}
        onCancel={onCancel}
        style={{
          size: "large",
          lable: "checkout",
          shape: "rect",
        }}
      />
    );
  }
}
