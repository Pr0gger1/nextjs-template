import type { ReactNode } from 'react';

import { InterFont } from '@/shared/config/fonts';

import '@/shared/styles/global.css';

const RootLayout = ({
	children,
}: Readonly<{
	children: ReactNode;
}>) => {
	return (
		<html lang="en">
			<body className={InterFont.className}>{children}</body>
		</html>
	);
};

export default RootLayout;
