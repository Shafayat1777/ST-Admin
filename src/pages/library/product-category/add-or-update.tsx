import { useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import useRHF from '@/hooks/useRHF';

import { FormField } from '@/components/ui/form';
import CoreForm from '@core/form';
import { AddModal } from '@core/modal';

import { useOtherDepartment } from '@/lib/common-queries/other';
import nanoid from '@/lib/nanoid';
import { getDateTime } from '@/utils';

import { IProductCategoryTableData } from './config/columns/columns.type';
import { useLibProductCategoryByUUID, useLibProductsCategory } from './config/query';
import { IProductCategory, PRODUCT_CATEGORY_NULL, PRODUCT_CATEGORY_SCHEMA } from './config/schema';
import { IProductCategoryAddOrUpdateProps } from './config/types';

const AddOrUpdate: React.FC<IProductCategoryAddOrUpdateProps> = ({
	url,
	open,
	setOpen,
	updatedData,
	setUpdatedData,
	postData,
	updateData,
}) => {
	const isUpdate = !!updatedData;

	const { user } = useAuth();
	const { invalidateQuery: invalidateDesignations } = useLibProductsCategory();
	const { data } = useLibProductCategoryByUUID<IProductCategoryTableData>(updatedData?.uuid as string);
	const { invalidateQuery: invalidateUserQuery } = useOtherDepartment();

	const form = useRHF(PRODUCT_CATEGORY_SCHEMA, PRODUCT_CATEGORY_NULL);

	const onClose = () => {
		setUpdatedData?.(null);
		form.reset(PRODUCT_CATEGORY_NULL);
		invalidateDesignations();
		invalidateUserQuery();
		setOpen((prev) => !prev);
	};

	// Reset form values when data is updated
	useEffect(() => {
		if (data && isUpdate) {
			form.reset(data);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isUpdate]);

	// Submit handler
	async function onSubmit(values: IProductCategory) {
		if (isUpdate) {
			// UPDATE ITEM
			updateData.mutateAsync({
				url: `${url}/${updatedData?.uuid}`,
				updatedData: {
					...values,
					updated_at: getDateTime(),
				},
				onClose,
			});
			return;
		}

		postData.mutateAsync({
			url,
			newData: {
				...values,
				created_at: getDateTime(),
				created_by: user?.uuid,
				uuid: nanoid(),
			},
			onClose,
		});
	}

	return (
		<AddModal
			open={open}
			setOpen={onClose}
			title={isUpdate ? 'Update Product Category' : 'Add Product Category'}
			form={form}
			onSubmit={onSubmit}
		>
			<FormField control={form.control} name='name' render={(props) => <CoreForm.Input {...props} />} />
			<FormField control={form.control} name='short_name' render={(props) => <CoreForm.Input {...props} />} />
			<FormField control={form.control} name='remarks' render={(props) => <CoreForm.Textarea {...props} />} />
		</AddModal>
	);
};

export default AddOrUpdate;
