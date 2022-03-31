import { useEffect } from "react";
import { Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import socket from "../../api/socketClient";
import { useSelector, useDispatch } from "react-redux";
import { setPlayers, addPlayer, removePlayer } from "../../reducers/lobbySlice";

import "./Lobby.css";

export default function Lobby() {
	const lobby = useSelector((state) => state.lobby);
	const dispatch = useDispatch();
	const history = useHistory();

	useEffect(() => {
		socket.emit("players:list", lobby.lobbyId, (res) => {
			dispatch(setPlayers(res.players));
		});
		socket.on("player:connected", (player) => {
			dispatch(addPlayer(player));
		});
		socket.on("player:disconnected", (player) => {
			dispatch(removePlayer(player));
		});
		socket.on("game:starting", (player) => {
			dispatch(removePlayer(player));
		});
		return () => {
			socket.off("player:connected");
			socket.off("player:disconnected");
		};
	}, [dispatch, lobby]);

	function copyInviteLink() {
		navigator.clipboard.writeText(
			process.env.REACT_APP_BASE_URL + "?id=" + lobby.lobbyId
		);
	}

	function startGame() {
		history.push("/game");
	}

	if (!socket.connected) {
		return <Redirect to={{ pathname: "/" }} />;
	}
	return (
		<div className="lobby-container">
			<button
				className="menu-button button-white-green"
				onClick={copyInviteLink}
			>
				Copy invite link
			</button>
			<div className="box-container">
				<div className="box">
					<div className="box-inner">
						<div className="box-header">Players : {lobby.players.length}</div>
						<div className="players-list">
							{lobby.players.map((player) => (
								<div key={player.userId} className="player-badge">
									<div className="player-icon"></div>
									<div className="player-name">{player.username}</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="box">
					<div className="box-inner">
						<div className="box-header">Settings</div>
					</div>
				</div>
			</div>
			<button className="menu-button button-white-green" onClick={startGame}>
				Start
			</button>
		</div>
	);
}
