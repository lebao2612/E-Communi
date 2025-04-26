import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsController } from './products/products.controller';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'baodao123',
      database: 'projectself',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // tự tạo bảng (DEV thôi, PROD thì false)
    }),
    UsersModule,
    MessagesModule,
    PostsModule
  ],
  controllers: [AppController, ProductsController],
  providers: [AppService],
})
export class AppModule {}
