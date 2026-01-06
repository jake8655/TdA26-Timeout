import { createFormHook } from "@tanstack/react-form";
import { lazy } from "react";
import { fieldContext, formContext } from "./form-context";

const TextField = lazy(() => import("@/components/form/text-field"));
const TextareaField = lazy(() => import("@/components/form/textarea-field"));
const FileUploadField = lazy(
	() => import("@/components/form/file-upload-field"),
);
const SubscribeButton = lazy(
	() => import("@/components/form/subscribe-button"),
);

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldComponents: {
		TextField,
		TextareaField,
		FileUploadField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
