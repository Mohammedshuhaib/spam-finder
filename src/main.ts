import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { DEFAULT_VERSION, extract_api_version } from './common/utils/extract_api_version';
import { HttpExceptionFilter } from './common/core/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.CUSTOM,
    extractor: extract_api_version,
    defaultVersion: DEFAULT_VERSION,
  });

  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('Api Documentation')
    .setDescription('Api documentation for spam finder')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
  Logger.log(`Application Listening on port - ${port}`);
}
bootstrap();
