import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class ProductionExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProductionExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (code: number) => { send: (body: unknown) => void } }>();
    const isProd = process.env.NODE_ENV === "production";

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : isProd
          ? { statusCode: status, message: "Internal server error" }
          : {
              statusCode: status,
              message: exception instanceof Error ? exception.message : "Internal server error",
            };

    response.status(status).send(body);
  }
}
