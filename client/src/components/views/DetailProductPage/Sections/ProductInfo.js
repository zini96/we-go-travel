import React, { useEffect, useState } from "react";
import { Button, Descriptions } from "antd";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../../_actions/user_actions";

function ProductInfo(props) {
  const [Product, setProduct] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    setProduct(props.detail);
  }, [props.detail]);

  const addToCarthandler = () => {
    //카트 필드에 정보 넣기(productId, 개수, 날짜)
    dispatch(addToCart(props.detail._id));
  };

  return (
    <div>
      <Descriptions title="Product Info">
        <Descriptions.Item label="Price">$ {Product.price}</Descriptions.Item>
        <Descriptions.Item label="Sold">{Product.sold}</Descriptions.Item>
        <Descriptions.Item label="View"> {Product.views}</Descriptions.Item>
        <Descriptions.Item label="Description">
          {Product.description}
        </Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          size="large"
          shape="round"
          type="danger"
          onClick={addToCarthandler}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

export default ProductInfo;
