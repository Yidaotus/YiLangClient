import React, { useEffect, useRef } from 'react';

interface FileLinkProps {
	blob: Blob;
	fileName: string;
}
export const FileLink: React.FC<FileLinkProps> = ({ blob, fileName }) => {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const downloadLink = window.URL.createObjectURL(blob);
	useEffect(() => {
		if (linkRef.current) {
			linkRef.current.click();
		}
	}, []);

	return (
		<a download={fileName} href={downloadLink} ref={linkRef}>
			download
		</a>
	);
};

export default FileLink;
