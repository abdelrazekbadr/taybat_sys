export type ErrorCode =
  | 'NETWORK'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_USED'
  | 'EMAIL_CONFIRMATION_REQUIRED'
  | 'SESSION_EXPIRED'
  | 'NOT_FOUND'
  | 'PERMISSION'
  | 'SERVER'
  | 'OAUTH_CANCELED'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(cause?: unknown) {
    super('NETWORK', 'تحقق من اتصالك بالإنترنت', cause);
    this.name = 'NetworkError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('INVALID_CREDENTIALS', 'البريد أو كلمة المرور غير صحيحة');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyUsedError extends AppError {
  constructor() {
    super('EMAIL_ALREADY_USED', 'هذا البريد الإلكتروني مستخدم بالفعل');
    this.name = 'EmailAlreadyUsedError';
  }
}

export class EmailConfirmationRequiredError extends AppError {
  constructor() {
    super('EMAIL_CONFIRMATION_REQUIRED', 'تم إرسال رابط التحقق إلى بريدك الإلكتروني');
    this.name = 'EmailConfirmationRequiredError';
  }
}

export class SessionExpiredError extends AppError {
  constructor() {
    super('SESSION_EXPIRED', 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً');
    this.name = 'SessionExpiredError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource?: string) {
    super('NOT_FOUND', resource ? `${resource} غير موجود` : 'غير موجود');
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(cause?: unknown) {
    super('SERVER', 'حدث خطأ في الخادم. حاول مرة أخرى', cause);
    this.name = 'ServerError';
  }
}

/**
 * Extracts a user-facing Arabic message from any thrown value.
 * Use this in store catch blocks before setting errorMessage.
 */
export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return 'حدث خطأ ما. حاول مرة أخرى';
}
