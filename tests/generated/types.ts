export type { components, operations, paths } from "./openapi-schema";

import type { components } from "./openapi-schema";

export type OrganizationResponse =
	components["schemas"]["OrganizationResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type CourseSummary = components["schemas"]["CourseSummary"];
export type CourseCreateRequest = components["schemas"]["CourseCreateRequest"];
export type CourseUpdateRequest = components["schemas"]["CourseUpdateRequest"];
export type CourseDetail = components["schemas"]["CourseDetail"];
export type Material = components["schemas"]["Material"];
export type FileMaterial = components["schemas"]["FileMaterial"];
export type UrlMaterial = components["schemas"]["UrlMaterial"];
export type FileMaterialCreateRequest =
	components["schemas"]["FileMaterialCreateRequest"];
export type UrlMaterialCreateRequest =
	components["schemas"]["UrlMaterialCreateRequest"];
export type FileMaterialUpdateRequest =
	components["schemas"]["FileMaterialUpdateRequest"];
export type UrlMaterialUpdateRequest =
	components["schemas"]["UrlMaterialUpdateRequest"];

export type Question = Omit<
	components["schemas"]["SingleChoiceQuestion"],
	"type"
> & { type: "singleChoice" | "multipleChoice" };
export type SingleChoiceQuestion = Omit<
	components["schemas"]["SingleChoiceQuestion"],
	"type"
> & { type: "singleChoice" };
export type MultipleChoiceQuestion = Omit<
	components["schemas"]["MultipleChoiceQuestion"],
	"type"
> & { type: "multipleChoice" };

export type Quiz = {
	uuid?: string;
	title: string;
	attemptsCount?: number;
	questions: Question[];
};

export type QuizSubmitRequest = components["schemas"]["QuizSubmitRequest"];
export type QuizAnswer = components["schemas"]["QuizAnswer"];
export type QuizSubmitResponse = components["schemas"]["QuizSubmitResponse"];
export type FeedItem = components["schemas"]["FeedItem"];
export type FeedCreateRequest = components["schemas"]["FeedCreateRequest"];
export type FeedUpdateRequest = components["schemas"]["FeedUpdateRequest"];

// Use CourseDetail for most test operations since tests access detail properties
export type Course = CourseDetail;
