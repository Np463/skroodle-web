import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import lobbyReducer from "./reducers/lobbySlice";
import gameReducer from "./reducers/gameSlice";

export default configureStore({
	reducer: {
		user: userReducer,
		lobby: lobbyReducer,
		game: gameReducer,
	},
});
