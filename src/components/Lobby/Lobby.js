import { useEffect, useState } from "react";
import { Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import socket from "api/socketClient";
import { useSelector, useDispatch } from "react-redux";
import {
	setLobbyState,
	setPlayers,
	setOwner,
	addPlayer,
	removePlayer,
	setRounds,
	setSecondsPerRound,
} from "reducers/lobbySlice";

import "./Lobby.css";

export default function Lobby() {
	const [showRoomCode, setShowRoomCode] = useState(false);
	const [anim, setAnim] = useState(0);
	const lobby = useSelector((state) => state.lobby);
	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const history = useHistory();

	useEffect(() => {
		socket.emit("players:list", lobby.lobbyId, (res) => {
			dispatch(setPlayers(res.players));
			dispatch(setOwner(res.owner));
		});
		socket.on("player:connected", (player) => {
			dispatch(addPlayer(player));
		});
		socket.on("player:disconnected", (player) => {
			dispatch(removePlayer(player));
		});
		socket.on("game:loading", () => {
			history.push("/game");
		});
		socket.on("game:starting", () => {
			dispatch(setLobbyState("starting"));
		});
		socket.on("lobby:settingsUpdated", (settings) => {
			if (settings.setting === "rounds") dispatch(setRounds(settings.value));
			else if (settings.setting === "secondsPerRound")
				dispatch(setSecondsPerRound(settings.value));
		});
		return () => {
			socket.off("player:connected");
			socket.off("player:disconnected");
			socket.off("lobby:settingsUpdated");
			socket.off("game:loading");
		};
	}, [dispatch, history, lobby.lobbyId]);

	function copyInviteLink() {
		setAnim(1);
		navigator.clipboard.writeText(
			process.env.REACT_APP_BASE_URL + "?id=" + lobby.lobbyId
		);
	}

	function startGame() {
		socket.emit("lobby:startGame", lobby.lobbyId);
	}

	function changeRounds(e) {
		const rounds = parseInt(e.target.value, 10);
		if (isNaN(rounds)) return;
		if (rounds < 1 || rounds > 10) return;
		socket.emit("lobby:updateSettings", lobby.lobbyId, "rounds", rounds);
	}

	function changeSecondsPerRoundValue(e) {
		let parsed = parseInt(e.target.value, 10);
		if (isNaN(parsed)) return;
		dispatch(setSecondsPerRound(e.target.value));
	}

	function changeSecondsPerRound(e) {
		let parsed = parseInt(e.target.value, 10);
		if (isNaN(parsed)) return;
		if (parsed < 20) parsed = 20;
		if (parsed > 180) parsed = 180;
		socket.emit(
			"lobby:updateSettings",
			lobby.lobbyId,
			"secondsPerRound",
			parsed
		);
	}

	if (!socket.connected) {
		return <Redirect to={{ pathname: "/" }} />;
	}
	return (
		<div className="lobby-container">
			<div className="lobby-top-buttons">
				<button
					className="button-white-green"
					onClick={() => setShowRoomCode(!showRoomCode)}
				>
					{showRoomCode ? lobby.lobbyId : "Show Room Code"}
				</button>
				<button
					anim={anim}
					onAnimationEnd={() => setAnim(0)}
					className="button-white-green animate-text"
					onClick={copyInviteLink}
				>
					{anim === 1 ? "Copied!" : "Copy Invite Link"}
				</button>
			</div>
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
						<div className="settings">
							<div>
								<div>Rounds</div>
								<select
									className="settings-input"
									disabled={lobby.owner?.userId !== user?.userId}
									value={lobby.rounds}
									onChange={changeRounds}
								>
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
										<option key={n} value={n}>
											{n}
										</option>
									))}
								</select>
							</div>
							<div>
								<div>Second per Round</div>
								<input
									disabled={lobby.owner?.userId !== user?.userId}
									className="settings-input"
									onChange={changeSecondsPerRoundValue}
									onBlur={changeSecondsPerRound}
									value={lobby.secondsPerRound}
								></input>
							</div>
						</div>
					</div>
				</div>
			</div>
			<button className="menu-button button-white-green" onClick={startGame}>
				Start
			</button>
		</div>
	);
}
