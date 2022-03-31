import { createSlice } from "@reduxjs/toolkit";

export const lobbySlice = createSlice({
	name: "lobby",
	initialState: {
		lobbyId: null,
		players: [],
	},
	reducers: {
		setLobbyId: (state, action) => {
			state.lobbyId = action.payload;
		},
		setPlayers: (state, action) => {
			state.players = action.payload;
		},
		addPlayer: (state, action) => {
			if (!state.players.find((p) => p.userId === action.payload.userId))
				state.players.push(action.payload);
		},
		removePlayer: (state, action) => {
			state.players = state.players.filter(
				(p) => p.userId !== action.payload.userId
			);
		},
	},
});

export const { setLobbyId, setPlayers, addPlayer, removePlayer } =
	lobbySlice.actions;

export default lobbySlice.reducer;
