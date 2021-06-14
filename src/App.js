import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import Lobby from "./components/Lobby/Lobby";

export default function App() {
	return (
		<Router>
			<Switch>
				<Route path="/lobby">
					<Lobby />
				</Route>
				<Route path="/">
					<Home />
				</Route>
			</Switch>
		</Router>
	);
}
