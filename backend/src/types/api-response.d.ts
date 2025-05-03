export type ApiResponse<T> = { data: T; message?: never } | { message: string; data?: never };

