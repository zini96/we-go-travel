import React from "react";
import Axios from "axios";
import "./HistoryPage.css";

function HistoryPage(props) {
  const datechange = (date) => {
    var timestamp = date;
    var newdate = new Date(timestamp);
    var year = newdate.getFullYear().toString().slice(-4);
    var month = ("0" + (newdate.getMonth() + 1)).slice(-2);
    var day = ("0" + newdate.getDate()).slice(-2);
    var hour = ("0" + newdate.getHours()).slice(-2);
    var minute = ("0" + newdate.getMinutes()).slice(-2);

    var returnDate =
      year +
      "년 " +
      month +
      "월 " +
      day +
      "일 " +
      "(" +
      hour +
      ":" +
      minute +
      ")";
    console.log(returnDate);

    return returnDate;
  };
  return (
    <div style={{ width: "80%", margin: "3rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <h1>History</h1>
        <br />
        <table>
          <thead>
            <tr>
              <th>Payment Id</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Date of Purchase</th>
            </tr>
          </thead>

          <tbody>
            {props.user.userData &&
              props.user.userData.history &&
              props.user.userData.history.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>$ {item.price}</td>
                  <td>{item.quantity} EA</td>
                  <td>{datechange(item.dateOfPurchase)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryPage;
