import { useSelector } from "react-redux";
import { Redirect } from "react-router";

export default function Lobby() {
	const lobbyId = useSelector((state) => state.lobby.lobbyId);

	if (!lobbyId) {
		return <Redirect to={{ pathname: "/" }} />;
	}
	return <div>Lobby</div>;
}
