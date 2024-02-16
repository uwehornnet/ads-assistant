const ActivityIndicator = () => {
	return (
		<div className="flex space-x-1 justify-center items-center py-2">
			<div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
			<div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
			<div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
		</div>
	);
};

export default ActivityIndicator;
