import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { setName, setSessionId, setUserId } from "../../reducers/userSlice";
import { setLobbyId } from "../../reducers/lobbySlice";
import socket from "../../api/socketClient";

import "./Home.css";

export default function Home() {
	const [lobbyStatus, setLobbyStatus] = useState("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const user = useSelector((state) => state.user);
	const lobbyId = useSelector((state) => state.lobby.lobbyId);
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();

	// useEffect(() => {
	// 	if (location.pathname === "/") {
	// 		let query = new URLSearchParams(location.search);
	// 		dispatch(setLobbyId(query.get("id")));
	// 	}
	// }, [location, dispatch]);

	// useEffect(() => {
	// 	if (lobbyStatus === "succeeded" && lobbyId) {
	// 		history.push("/lobby");
	// 	}
	// }, [lobbyStatus, history, lobbyId]);

	useEffect(() => {
		socket.on("connect", () => {});
		socket.on("connect_error", (err) => {
			setLobbyStatus("failed");
			setErrorMessage(err.message);
		});
		socket.on("session", ({ sessionId, userId }) => {
			socket.auth.sessionId = sessionId;
			socket.auth.userId = userId;
			dispatch(setSessionId(sessionId));
			dispatch(setUserId(userId));
			const query = new URLSearchParams(location.search);
			const roomId = query.get("id");
			if (roomId) {
				socket.emit("lobby:join", { roomId: roomId });
			} else {
				socket.emit("lobby:create", {});
			}
		});
		socket.on("lobby:created", ({ roomId }) => {
			setLobbyStatus("succeeded");
			dispatch(setLobbyId(roomId));
			history.push("/lobby");
		});
		socket.on("lobby:error", ({ error }) => {
			setLobbyStatus("failed");
			setErrorMessage(error);
		});
		return () => {
			socket.off("connect");
			socket.off("connect_error");
			socket.off("session");
			socket.off("lobby:created");
			socket.off("lobby:error");
		};
	}, [dispatch, location, history]);

	function play() {
		if (user.name.trim() !== "" && !socket.connected) {
			setLobbyStatus("loading");
			socket.auth = { username: user.name, sessionId: user.sessionId };
			socket.connect();
		}
	}

	return (
		<div className="screen">
			{lobbyStatus === "loading" ? (
				<div>
					<h1>Loading...</h1>
				</div>
			) : lobbyStatus === "failed" ? (
				<div>
					<h1>{errorMessage}</h1>
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
						<button className="play-button" onClick={play}>
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
