import type { NextPage } from 'next';

type ErrorPageProps = {
	statusCode: 404 | 500;
};

export const Error: NextPage<ErrorPageProps> = () => {
	return <></>;
};
