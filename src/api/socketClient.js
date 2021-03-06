import io from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL, { autoConnect: false });

socket.onAny((event, ...args) => {
	if (process.env.NODE_ENV === "development") console.log(event, args);
});

socket.on("connect_error", (err) => {
	console.log(err.message);
});

export default socket;
