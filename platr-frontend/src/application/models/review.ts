import * as yup from 'yup';
import type { components } from '../../types/api';

export type ReviewRequest = components['schemas']['ReviewRequest'];

export const RECOMMEND_OPTIONS = ['yes', 'no'] as const;
export type RecommendOption = (typeof RECOMMEND_OPTIONS)[number];

export interface ReviewFormValues {
    recipeId: string;
    rating: number;
    recommend: RecommendOption;
    hasTried: boolean;
    text: string;
}

export const REVIEW_RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export const reviewFormSchema: yup.ObjectSchema<ReviewFormValues> = yup.object({
    recipeId: yup.string().trim().required('Select a recipe'),
    rating: yup
        .number()
        .transform((_, originalValue) => (originalValue === '' || originalValue == null ? Number.NaN : Number(originalValue)))
        .typeError('Rating is required')
        .required('Rating is required')
        .integer('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot be more than 5'),
    recommend: yup
        .string<RecommendOption>()
        .oneOf([...RECOMMEND_OPTIONS], 'Please select an option')
        .required('Please indicate whether you would recommend this recipe'),
    hasTried: yup.boolean().required().default(false),
    text: yup.string().trim().required('Review text is required').max(1000, 'Max 1000 characters'),
});

export function createReviewFormValues(recipeId?: string | null): ReviewFormValues {
    return {
        recipeId: recipeId?.trim() ?? '',
        rating: 5,
        recommend: 'yes',
        hasTried: false,
        text: '',
    };
}

export function toReviewRequest(values: ReviewFormValues): ReviewRequest {
    return {
        rating: values.rating,
        text: values.text.trim(),
    };
}