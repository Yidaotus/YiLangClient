import './Dictionary.css';
import React, { useRef, useState } from 'react';
import DictionaryList from '@components/DictionaryList/DictionaryList';
import { Button, Col, Empty, notification, PageHeader, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import WordInput, {
	useWordInput,
} from '@components/Editor/Toolbar/Modals/WordEditor/WordEditor';
import TagList from '@components/TagList/TagList';
import handleError from '@helpers/Error';
import InnerModal from '@components/InnerModal/InnerModal';
import { useActiveLanguageConf } from '@hooks/useActiveLanguageConf';

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const Dictionary: React.FC = () => {
	const { wordInputState, getUserWord } = useWordInput();
	const dictCardRef = useRef<HTMLDivElement>(null);
	const [newEntryVisible, setNewEntryVisible] = useState(false);
	const [newTagVisible, setNewTagVisible] = useState(false);
	const activeLanguage = useActiveLanguageConf();

	const createNewEntry = async () => {
		try {
			if (!activeLanguage) {
				throw new Error('No language selected!');
			}

			setNewEntryVisible(true);
			const editResult = await getUserWord('');
			if (editResult) {
				notification.open({
					message: 'Success',
					description: 'Entry saved!',
					type: 'success',
				});
			}
			setNewEntryVisible(false);
		} catch (e) {
			handleError(e);
		}
	};

	return (
		<Row gutter={[24, 2]}>
			<Col span={17}>
				<div ref={dictCardRef}>
					<PageHeader
						className="site-page-header"
						backIcon={false}
						title="Dictionary"
						subTitle="Everything dictionary"
						ghost={false}
						extra={[
							<Button
								key="1"
								icon={<PlusOutlined />}
								type="primary"
								onClick={() => {
									createNewEntry();
								}}
							>
								New Entry
							</Button>,
						]}
					>
						<div
							style={{ position: 'relative', minHeight: '500px' }}
						>
							{activeLanguage && <DictionaryList />}
							{!activeLanguage && (
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									imageStyle={{
										height: 50,
									}}
									description="No language selected!"
								/>
							)}
							{newEntryVisible && (
								<InnerModal
									onClose={() => {
										setNewEntryVisible(false);
									}}
									width="500px"
								>
									<WordInput
										width="500px"
										{...wordInputState}
									/>
								</InnerModal>
							)}
						</div>
					</PageHeader>
				</div>
			</Col>
			<Col span={7}>
				<PageHeader
					className="site-page-header"
					backIcon={false}
					title="Tags"
					subTitle="Everything tags"
					ghost={false}
					extra={[
						<Button
							key="1"
							icon={<PlusOutlined />}
							onClick={() => {
								createNewEntry();
							}}
							type="primary"
						>
							New Tag
						</Button>,
					]}
				>
					<div style={{ position: 'relative' }}>
						{activeLanguage && <TagList />}
						{!activeLanguage && (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								imageStyle={{
									height: 50,
								}}
								description="No language selected!"
							/>
						)}

						{newTagVisible && (
							<InnerModal
								onClose={() => {
									setNewTagVisible(false);
								}}
								width="20px"
							>
								<p>Hi</p>
							</InnerModal>
						)}
					</div>
				</PageHeader>
			</Col>
		</Row>
	);
};

export default Dictionary;
