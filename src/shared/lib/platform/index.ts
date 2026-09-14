export const checkIsSafariAgent = (userAgent: string) =>
	/^((?!chrome|android).)*safari/i.test(userAgent);

export const checkIsSafari = () => {
	if (typeof navigator !== 'undefined' && navigator.userAgent) {
		return checkIsSafariAgent(navigator.userAgent);
	}

	return false;
};
