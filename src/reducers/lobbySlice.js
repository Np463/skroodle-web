import { createSlice } from "@reduxjs/toolkit";

export const lobbySlice = createSlice({
	name: "lobby",
	initialState: {
		lobbyId: null,
	},
	reducers: {
		setLobbyId: (state, action) => {
			state.lobbyId = action.payload;
		},
	},
});

export const { setLobbyId } = lobbySlice.actions;

export default lobbySlice.reducer;
