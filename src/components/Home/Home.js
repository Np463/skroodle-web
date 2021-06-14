import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { setName } from "../../reducers/userSlice";
import { setLobbyId, createLobby } from "../../reducers/lobbySlice";

import "./Home.css";

export default function Home() {
	const user = useSelector((state) => state.user);
	const lobbyId = useSelector((state) => state.lobby.lobbyId);
	const lobbyStatus = useSelector((state) => state.lobby.status);
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();

	useEffect(() => {
		if(location.pathname === "/") {
			let query = new URLSearchParams(location.search);
			dispatch(setLobbyId(query.get("id")));
		}
	}, [location, dispatch]);

	useEffect(() => {
		if (lobbyStatus === "succeeded" && lobbyId) {
			history.push("/lobby");
		}
	}, [lobbyStatus, history, lobbyId]);

	function play() {
		if (user.name.trim() !== "") {
			dispatch(createLobby());
		}
	}

	function join() {
		if (user.name.trim() !== "") {
			history.push("/lobby");
		}
	}

	return (
		<div className="screen">
			{lobbyStatus === "loading" ? (
				<div>
					<h1>Loading...</h1>
				</div>
			) : (
				<>
					<div className="title" onClick={() => history.push("/")}>
						Skroodle
					</div>
					<input
						className="name-input"
						type="text"
						placeholder="Enter your name"
						value={user.name}
						onChange={(e) => dispatch(setName(e.target.value))}
					></input>
					{lobbyId ? (
						<button className="play-button" onClick={join}>
							Join Game
						</button>
					) : (
						<button className="play-button" onClick={play}>
							Play
						</button>
					)}
				</>
			)}
		</div>
	);
}
