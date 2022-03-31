import "./Game.css";

export default function SizePicker({ lineWidth, onChange }) {
	return (
		<div className="size-picker">
			<div
				className={lineWidth === 2 ? "active" : null}
				onClick={() => onChange(2)}
			>
				<div className="size-picker-1"></div>
			</div>
			<div
				className={lineWidth === 5 ? "active" : null}
				onClick={() => onChange(5)}
			>
				<div className="size-picker-2"></div>
			</div>
			<div
				className={lineWidth === 10 ? "active" : null}
				onClick={() => onChange(10)}
			>
				<div className="size-picker-3"></div>
			</div>
			<div
				className={lineWidth === 20 ? "active" : null}
				onClick={() => onChange(20)}
			>
				<div className="size-picker-4"></div>
			</div>
		</div>
	);
}
