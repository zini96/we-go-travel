import React, { useEffect, useState } from "react";
import { FaCode } from "react-icons/fa";
import axios from "axios";
import { Card, Row, Col, Icon } from "antd";
import ImageSlider from "../../utils/ImageSlider";
import FollowingPage from "../../utils/FollowingPage";
import CheckBox from "./Sections/CheckBox";
import RadioBox from "./Sections/RadioBox";
import { continents, price } from "./Sections/Datas";
import SearchFeature from "./Sections/SearchFeature";

const { Meta } = Card;

function LandingPage() {
  const [Products, setProducts] = useState([]);
  const [Skip, setSkip] = useState(0);
  const [Limit, setLimit] = useState(8);
  const [PostSize, setPostSize] = useState(0);
  const [SearchTerms, setSearchTerms] = useState("");
  const [Filters, setFilters] = useState({
    continents: [],
    price: [],
  });

  useEffect(() => {
    const variables = {
      skip: Skip,
      limit: Limit,
    };

    getProducts(variables);
  }, []);

  const getProducts = (variables) => {
    axios.post("/api/product/getproducts", variables).then((response) => {
      if (response.data.success) {
        // console.log(response.data.products);
        if (variables.loadMore) {
          setProducts([...Products, ...response.data.products]);
        } else {
          setProducts(response.data.products);
        }
        setPostSize(response.data.postSize);
      } else {
        alert("상품 리스트를 가져오지 못했습니다.");
      }
    });
  };

  const onLoadMore = () => {
    let skip = Skip + Limit;

    const variables = {
      skip: skip,
      limit: Limit,
      loadMore: true,
      filters: Filters,
      searchTerm: SearchTerms,
    };

    getProducts(variables);
    setSkip(skip);
  };

  const renderCard = Products.map((product, index) => {
    return (
      <Col lg={6} md={8} xs={24} key={product._id}>
        <Card
          className="cardcontainer"
          hoverable={true}
          cover={
            <a href={`/product/${product._id}`}>
              <ImageSlider images={product.images} />
            </a>
          }
        >
          <Meta
            title={product.title}
            description={`$${product.price}`}
            className="carddesc"
          />
        </Card>
      </Col>
    );
  });

  const showFilterResults = (filters) => {
    const variables = {
      skip: 0,
      limit: Limit,
      filters: filters,
    };
    //filter된 item을 새로 받아오면서 skip도 리셋해주기
    getProducts(variables);
    setSkip(0);
  };

  const handleFilters = (filters, category) => {
    const newFilters = { ...Filters };
    //category => continents / price
    //CheckBox 컴포넌트에서 받은 checked array의 값을 filters에 받아서 newFilters에 저장해주기
    newFilters[category] = filters;

    if (category === "price") {
      //category가 price일때
      let priceValues = handlePrice(filters); //pricevaluews => [200,299],,,
      newFilters[category] = priceValues;
    }

    showFilterResults(newFilters);
    setFilters(newFilters);
  };

  const handlePrice = (value) => {
    //filter value(0,1,2,..)
    const data = price; // Sections/Data 에서 정의해준 price
    let array = [];

    for (let key in data) {
      if (data[key]._id === parseInt(value, 10)) {
        array = data[key].array;
        //radio에서 선택한 item의 key(filters = value)가 받아온 price data의 키와 같다면 price data의 array를 받아와서 빈 배열에 넣어주기
      }
    }
    return array;
  };

  const updateSearchTerm = (newSearchTerm) => {
    let variables = {
      skip: 0,
      limit: Limit,
      filters: Filters, //filter가 더해지는 이유 =  filter가 눌러져있는 상태라면, 추가로 검색
      searchTerm: newSearchTerm,
    };

    setSkip(0);
    setSearchTerms(newSearchTerm);

    getProducts(variables);
  };

  return (
    <div style={{ width: "75%", margin: "3rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: "2rem" }}>
          Let's Travel Anywhere &nbsp;
          <Icon type="rocket" />
        </h2>
      </div>

      {/* filter */}
      <Row gutter={[16, 16]}>
        {/* checkBox */}
        <Col lg={12} xs={24}>
          <CheckBox
            list={continents}
            handleFilters={(filters) => handleFilters(filters, "continents")} //category = continents
          />
        </Col>
        {/* <RadioBox /> */}
        <Col lg={12} xs={24}>
          <RadioBox
            list={price}
            handleFilters={(filters) => handleFilters(filters, "price")} //category = price
          />
        </Col>
      </Row>

      {/* Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "1rem auto",
        }}
      >
        <SearchFeature refreshFunction={updateSearchTerm} />
      </div>

      {/* Card */}
      {Products.length === 0 ? (
        <div
          style={{
            height: "300px",
            textAlign: "center",
            paddingTop: "8rem",
          }}
        >
          <h2>No post yet...</h2>
        </div>
      ) : (
        <div>
          <Row gutter={[16, 16]}>{renderCard}</Row>
        </div>
      )}

      <br />
      <br />
      {PostSize >= Limit && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button onClick={onLoadMore} className="loadMoreBtn">
            Load More
          </button>
        </div>
      )}

      {Skip >= 8 && <FollowingPage />}
    </div>
  );
}

export default LandingPage;
