import { createFormHook } from "@tanstack/react-form";
import { lazy } from "react";
import { fieldContext, formContext } from "./form-context";

const TextField = lazy(() => import("@/components/form/text-field"));
const SubscribeButton = lazy(
	() => import("@/components/form/subscribe-button"),
);

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldComponents: {
		TextField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
