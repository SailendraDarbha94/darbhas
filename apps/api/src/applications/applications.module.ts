import { Module } from "@nestjs/common";
import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";
import { InvitesModule } from "../invites/invites.module";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
  imports: [TenantsModule, InvitesModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
