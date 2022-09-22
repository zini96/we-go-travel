import React, { useState } from "react";
import { Collapse, Checkbox } from "antd";

const { Panel } = Collapse;

function CheckBox(props) {
  const [Checked, setChecked] = useState([]);

  const handleToggle = (value) => {
    //클릭된 value의 index를 구해서 해당 index의 item만 state 바꿔주기

    //index 구하기
    const currentIndex = Checked.indexOf(value);
    //전체 state Checked에서 현재 누른 Checkbox가 이미 있다면 (indexOf에 배열에 없는 값을 입력하면 -1이 출력되는것을 이용)
    const newChecked = [...Checked];
    if (currentIndex === -1) {
      newChecked.push(value); //-1이면 현재 배열에 없음(checked되어 있지 않음) => newChecked 배열에 넣어주기
    } else {
      newChecked.splice(currentIndex, 1); //1이면 현재 배열에 있음(checked되어 있음) => splice로 해당 인덱스로부터 1개의 아이템(=해당인덱스 아이템) 삭제해주기
    }

    setChecked(newChecked);
    //부모 컴포넌트에 정보 보내주기
    props.handleFilters(newChecked);
  };

  const renderCheckboxLists = () =>
    props.list &&
    props.list.map((value, index) => (
      <React.Fragment key={index}>
        <Checkbox
          onChange={() => handleToggle(value._id)}
          type="checkbox"
          checked={Checked.indexOf(value._id) === -1 ? false : true}
        />
        <span style={{ marginLeft: "0.5rem", marginRight: "1rem" }}>
          {value.name}
        </span>
      </React.Fragment>
    ));
  return (
    <div>
      <Collapse defaultActiveKey={["0"]}>
        <Panel header="Continents" key={1}>
          {renderCheckboxLists()}
        </Panel>
      </Collapse>
    </div>
  );
}

export default CheckBox;
