type timeoutType = ReturnType<typeof setTimeout>;
export const throttle = (callback: () => void, time: number) => {
	let last = 0;
	let timeout: timeoutType = 0 as unknown as timeoutType;
	return () => {
		if (new Date().getTime() - last >= time) {
			last = new Date().getTime();
			callback();
			clearTimeout(timeout);
			timeout = 0 as unknown as timeoutType;
		} else if (!timeout) {
			timeout = setTimeout(() => {
				callback();
				timeout = 0 as unknown as timeoutType;
			}, 1000);
		}
	};
};
