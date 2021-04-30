class Car extends React.Component {
  constructor() {
    super();
    this.state = { color: "red" };
  }
  render() {
    return <h2>I am a Car!</h2>;
  }
}
const nombre = "Goku";
const divRoot = document.querySelector("#root");
const h1Tag = (
  <div>
    <h1>Hola soy {nombre}</h1>
    <Car color="blue" />
  </div>
);

ReactDOM.render(h1Tag, divRoot);
