import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import lobbyReducer from "./reducers/lobbySlice";

export default configureStore({
	reducer: {
		user: userReducer,
		lobby: lobbyReducer,
	},
});
