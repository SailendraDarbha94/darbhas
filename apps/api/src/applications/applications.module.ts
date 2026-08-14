import { Module } from "@nestjs/common";
import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";
import { InviteService } from "./invite.service";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
  imports: [TenantsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, InviteService],
})
export class ApplicationsModule {}
