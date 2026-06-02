const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const startOfWeek = (date) => {
	const day = date.getDay();
	const diffToMonday = (day + 6) % 7;
	const start = new Date(date);
	start.setDate(date.getDate() - diffToMonday);
	return startOfDay(start);
};

const endOfWeek = (date) => {
	const start = startOfWeek(date);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	return endOfDay(end);
};

const formatLocalDate = (date) => {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("-");
};

export const getPeriodRange = (period, now = new Date()) => {
	let start;
	let end;

	switch (period) {
		case "today":
			start = startOfDay(now);
			end = endOfDay(now);
			break;
		case "week":
			start = startOfWeek(now);
			end = endOfWeek(now);
			break;
		case "month":
			start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
			end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
			break;
		case "year":
			start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
			end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
			break;
		default:
			throw new Error("Invalid period");
	}

	return {
		start: formatLocalDate(start),
		end:formatLocalDate(end),
	};
};
