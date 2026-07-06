import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createPrismaClient, PrismaClient } from "@darbha/db";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client: PrismaClient = createPrismaClient();

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
