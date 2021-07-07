import { Redirect } from "react-router";
import socket from "../../api/socketClient";

import "./Lobby.css"

export default function Lobby() {
	if (!socket.connected) {
		return <Redirect to={{ pathname: "/" }} />;
	}
	return (
		<div className="lobby-container">
			<div className="box-container">
				<div className="box">Players</div>
				<div className="box">Settings</div>
			</div>
			<button className="start-button">Start</button>
		</div>
	);
}
