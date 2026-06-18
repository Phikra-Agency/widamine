import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.normalizeException(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(
        `${request.method} ${request.url} → ${status}: ${JSON.stringify(body)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...body,
    });
  }

  private normalizeException(exception: unknown): {
    status: number;
    body: Record<string, unknown>;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        return { status, body: { message: res } };
      }

      if (typeof res === "object" && res !== null) {
        const record = res as Record<string, unknown>;
        const body: Record<string, unknown> = {};

        const { message, error, statusCode: _statusCode, ...rest } = record;

        if (
          typeof message === "object" &&
          message !== null &&
          !Array.isArray(message)
        ) {
          Object.assign(body, message as Record<string, unknown>);
        } else if (message !== undefined) {
          body.message = message;
        }

        if (error !== undefined) body.error = error;
        Object.assign(body, rest);

        return { status, body };
      }

      return { status, body: { message: exception.message } };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: { message: "Invalid database query", code: "prisma_validation" },
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        body: {
          message: "Internal server error",
          code: "internal_error",
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        message: "Internal server error",
        code: "internal_error",
      },
    };
  }

  private mapPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): { status: number; body: Record<string, unknown> } {
    switch (exception.code) {
      case "P2002":
        return {
          status: HttpStatus.CONFLICT,
          body: {
            message: "Record already exists",
            code: "unique_constraint",
            fields: exception.meta?.target,
          },
        };
      case "P2025":
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            message: "Record not found",
            code: "not_found",
          },
        };
      case "P2003":
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            message: "Related record missing or constraint failed",
            code: "foreign_key",
          },
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            message: "Database error",
            code: exception.code,
          },
        };
    }
  }
}
