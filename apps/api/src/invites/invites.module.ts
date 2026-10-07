import { Module } from "@nestjs/common";
import { InviteService } from "./invite.service";

/** Writer login invites, shared by application approval and the Sites page. */
@Module({
  providers: [InviteService],
  exports: [InviteService],
})
export class InvitesModule {}
