import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { Icon } from "antd";
import axios from "axios";

function FileUpload(props) {
  const [Images, setImages] = useState([]);

  const dropHandler = (files) => {
    let formData = new FormData();

    const config = {
      header: { "content-type": "multipart/form-data" }, //파일에 대한 content-type 정의해주기
    };
    formData.append("file", files[0]); //img file에 대한 정보를 append를 이용해서 formData에 넣어주기
    axios
      .post("/api/product/image", formData, config) //이미지를 back으로 전송해줄때 formData와 config가 없으면 오류 발생
      .then((response) => {
        if (response.data.success) {
          // console.log(response.data.filePath);
          setImages([...Images, response.data.filePath]); //기존에 넣어준 이미지를 포함해서 새로 state에 저장해주기
          props.refreshFunction([...Images, response.data.filePath]); //부모 컴포넌트에 이미지 state 넘겨주기
        } else {
          alert("이미지를 서버에 저장하지 못했습니다.");
        }
      });
  };

  const deleteHandler = (image) => {
    const currentIndex = Images.indexOf(image); //클릭한 이미지의 인덱스를 구한 다음, 해당 인덱스 넘버의 이미지를 state에서 지우기

    let newImages = [...Images];
    newImages.splice(currentIndex, 1); //splice를 이용해서 currentIndex에서 1개의 이미지(=currentIndex를 index로 가지는 이미지)를 지워주기

    setImages(newImages);
    props.refreshFunction(newImages); //부모 컴포넌트에 이미지 state 넘겨주기
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Dropzone onDrop={dropHandler}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div
              {...getRootProps()}
              style={{
                width: "300px",
                height: "240px",
                border: "1px solid lightgray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input {...getInputProps()} />
              <p>
                <Icon type="plus" style={{ fontSize: "3rem" }} />
              </p>
            </div>
          </section>
        )}
      </Dropzone>

      <div className="imgBox">
        {Images.map((image, index) => (
          <div key={index} onClick={() => deleteHandler(image)}>
            <img
              style={{ minWidth: "300px", width: "300px", height: "240px" }}
              src={`http://localhost:5000/${image}`}
              alt={`productImg-${index}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileUpload;
