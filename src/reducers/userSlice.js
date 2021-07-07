import { createSlice } from "@reduxjs/toolkit";
import { storageAvailable } from "../util/storageAvailable";

export const userSlice = createSlice({
	name: "user",
	initialState: {
		name: localStorage.getItem("username") || "",
		sessionId: localStorage.getItem("sessionId") || "",
		userId: localStorage.getItem("userId") || "",
	},
	reducers: {
		setName: (state, action) => {
			state.name = action.payload;
			if (storageAvailable("localStorage"))
				localStorage.setItem("username", action.payload);
		},
		setSessionId: (state, action) => {
			state.sessionId = action.payload;
			if (storageAvailable("localStorage"))
				localStorage.setItem("sessionId", action.payload);
		},
		setUserId: (state, action) => {
			state.userId = action.payload;
			if (storageAvailable("localStorage"))
				localStorage.setItem("userId", action.payload);
		},
	},
});

export const { setName, setSessionId, setUserId } = userSlice.actions;

export default userSlice.reducer;
