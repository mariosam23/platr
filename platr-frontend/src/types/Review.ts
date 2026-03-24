export interface ReviewResponse {
    reviewId: string;
    rating: number;
    text: string;
    ownerId: string;
    ownerUsername: string;
    createdAt: string;
}

export interface ReviewRequest {
    rating: number;
    text: string;
}