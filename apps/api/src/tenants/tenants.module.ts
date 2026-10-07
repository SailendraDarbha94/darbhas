import { Module } from "@nestjs/common";
import { TenantsController } from "./tenants.controller";
import { TenantsService } from "./tenants.service";
import { InvitesModule } from "../invites/invites.module";

@Module({
  imports: [InvitesModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
