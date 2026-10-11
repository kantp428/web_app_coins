import { Controller, Get, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
@Injectable()
export class CategoriesService implements OnModuleDestroy {
  private readonly db: PrismaClient;
  constructor(config: ConfigService) {
    this.db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: config.get<string>('DATABASE_URL'),
      }),
    });
  }
  async list() {
    return (
      await this.db.categories.findMany({ orderBy: { name: 'asc' } })
    ).map((category) => ({
      id: category.category_id.toString(),
      name: category.name,
      slug: category.slug,
    }));
  }
  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Get()
  list() {
    return this.categories.list();
  }
}
