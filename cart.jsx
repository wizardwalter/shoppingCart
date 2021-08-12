// simulate getting products from DataBase

const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
  ReactBootstrap;
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = () => {
  const [items, setItems] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:8082/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:8082/products",
    {
      data: [],
    }
  );

  useEffect(async () => {
    const rawData = await fetch(query);
    const data = await rawData.json();
    setItems(data);

    //  fetch(query)
    //   .then((rawData)=>{
    //     return rawData.json();
    //   })
    //   .then((data)=>{
    //     console.log(data)
    //   })
  }, []);

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    const newItems = [];
    let instock;
    for (const item of items) {
      if (item.name === name) {
        item.instock = item.instock - 1;
        instock = item.instock;
      }
      newItems.push(item);
    }
    if (instock >= 0) {
      setItems(newItems);
      setCart([...cart, ...item]);
    }
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    let n = index + 1049 + Math.floor(Math.random() * 10);
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name} : ${item.cost} : instock {item.instock}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    let query = doFetch(url)
    .then(query.json());
    setItems(query)
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts('${query}');
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
