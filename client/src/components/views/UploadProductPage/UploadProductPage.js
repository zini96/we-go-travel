import React, { useState } from "react";
import { Typography, Button, Form, Input, Descriptions } from "antd";
import FileUpload from "../../utils/FileUpload";
import Axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;
const Continents = [
  { key: 1, value: "Africa" },
  { key: 2, value: "Europe" },
  { key: 3, value: "Asia" },
  { key: 4, value: "North America" },
  { key: 5, value: "South America" },
  { key: 6, value: "Australia" },
  { key: 7, value: "Antarctica" },
];

function UploadProductPage(props) {
  const [TitleValue, setTitleValue] = useState("");
  const [Desc, setDesc] = useState("");
  const [Price, setPrice] = useState(0);
  const [Continent, setContinent] = useState(1);
  const [Images, setImages] = useState([]);

  const titleChangeHandler = (event) => {
    setTitleValue(event.currentTarget.value);
  };

  const descChangeHandler = (event) => {
    setDesc(event.currentTarget.value);
  };

  const priceChangeHandler = (event) => {
    setPrice(event.currentTarget.value);
  };

  const continentChangeHandler = (event) => {
    setContinent(event.currentTarget.value);
  };

  const updateImages = (newImages) => {
    setImages(newImages);
  };

  const SubmitHandler = (event) => {
    event.preventDefault();

    if (!TitleValue || !Desc || !Price || !Continent || !Images) {
      return alert("비어있는 칸이 있습니다.");
    }

    // console.log(localStorage.getItem("userId"));
    // console.log(props.user.userData_id);

    // //input의 값을 req로 서버에 보내기
    const variables = {
      writer: localStorage.getItem("userId"), //현재 로그인 되어있는 user의 ID
      title: TitleValue,
      description: Desc,
      price: Price,
      images: Images,
      continents: Continent,
    };

    Axios.post("/api/product/uploadProduct", variables).then((response) => {
      if (response.data.success) {
        alert("상품이 정상적으로 업로드 되었습니다.");
        props.history.push("/");
      } else {
        alert("상품 업로드에 실패했습니다.");
      }
    });
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Title level={2}> 여행 상품 업로드</Title>
      </div>

      <Form onSubmit={SubmitHandler}>
        {/* Drop zone */}
        <FileUpload refreshFunction={updateImages} />
        <br />
        <br />

        {/* product info */}
        <label>이름</label>
        <Input onChange={titleChangeHandler} value={TitleValue} />
        <br />
        <br />

        <label>설명</label>
        <TextArea onChange={descChangeHandler} value={Desc} />
        <br />
        <br />

        <label>가격($)</label>
        <Input onChange={priceChangeHandler} value={Price} type="number" />
        <br />
        <br />

        <select onChange={continentChangeHandler} value={Continent}>
          {Continents.map((item) => (
            <option key={item.key} value={item.key}>
              {item.value}
            </option>
          ))}
        </select>
        <br />
        <br />

        <Button type="submit" onClick={SubmitHandler}>
          확인
        </Button>
      </Form>
    </div>
  );
}

export default UploadProductPage;
