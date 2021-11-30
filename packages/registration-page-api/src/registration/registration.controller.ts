import { CurrentUser } from '@/common/user.decorator';
import { UserEntity } from '@/user/user.entity';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RegistrationService, RegistrationType } from './registration.service';

import { MailService, MailTemplate } from '@/mail/mail.service';
import { AuditService } from '@/audit/audit.service';
import {
  EventReportService,
  EventReportType,
} from '@/event-report/event-report.service';

import {
  AddOrganizationRequestDto,
  AddOrganizationResponseDto,
  AddOrganizationResponseError,
  ApproveRequestDto,
  ApproveResponseDto,
  ApproveResponseError,
  GetOrganizationListResponseDto,
  GetRegistrationListRequestDto,
  GetRegistrationListResponseDto,
  GetRegistrationListResponseError,
  GetRegistrationResponseDto,
  GetRegistrationResponseError,
  RegistrationRequestDto,
  RegistrationResponseDto,
  RegistrationResponseError,
} from './dto';
import { Locale } from '@/common/locale.type';

@ApiTags('Registration')
@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    private readonly eventReportService: EventReportService,
  ) {}

  @ApiBearerAuth()
  @Post('getRegistration')
  @ApiOperation({
    summary: 'get registration.',
  })
  @HttpCode(200)
  async getRegistration(
    @CurrentUser() currentUser: UserEntity,
  ): Promise<GetRegistrationResponseDto> {
    if (!currentUser || currentUser.isAdmin) {
      return {
        error: GetRegistrationResponseError.PERMISSION_DENIED,
      };
    }

    const registration = await this.registrationService.findRegistrationByUser(
      currentUser,
    );

    if (!registration) {
      return {
        error: GetRegistrationResponseError.NO_SUCH_REGISTRATION,
      };
    }

    return {
      registrationMeta: {
        email: currentUser.email,
        name: registration.name,
        id: registration.id,
        organizationId: registration.organizationId,
        organizationName: (await registration.organization).organizationName,
        approveState: registration.approveState,
      },
    };
  }

  @ApiBearerAuth()
  @Post('registration')
  @ApiOperation({
    summary: 'registration.',
  })
  async registration(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: RegistrationRequestDto,
  ): Promise<RegistrationResponseDto> {
    if (!currentUser || currentUser.isAdmin) {
      return {
        error: RegistrationResponseError.PERMISSION_DENIED,
      };
    }

    const organization = await this.registrationService.findOrganizationById(
      request.organizationId,
    );
    if (!organization) {
      return {
        error: RegistrationResponseError.NO_SUCH_ORGANIZATION,
      };
    }

    const registrationType = await this.registrationService.registration(
      currentUser,
      organization,
      request.name,
      request.id,
    );

    if (registrationType !== RegistrationType.NothingHappened) {
      const action = `registration.${registrationType}`;
      const details = {
        name: request.name,
        id: request.id,
        organizationId: organization.id,
        organizationName: organization.organizationName,
      };

      await this.auditService.log(currentUser.id, action, details);

      const message = `user: ${currentUser.email}, ${action}, ${JSON.stringify(
        details,
      )}`;

      this.eventReportService.report({
        type: EventReportType.Info,
        message,
      });
    }

    return {};
  }

  @ApiBearerAuth()
  @Post('getRegistrationList')
  @ApiOperation({
    summary: 'List All Registrations.',
  })
  @HttpCode(200)
  async getRegistrationList(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: GetRegistrationListRequestDto,
  ): Promise<GetRegistrationListResponseDto> {
    if (!currentUser || !currentUser.isAdmin) {
      return {
        error: GetRegistrationListResponseError.PERMISSION_DENIED,
      };
    }

    return {
      registrationMetaList: await this.registrationService.getRegistrationList(
        request.approveState,
      ),
    };
  }

  @ApiBearerAuth()
  @Post('approve')
  @ApiOperation({
    summary: 'Approve a registraion.',
  })
  async approve(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: ApproveRequestDto,
  ): Promise<ApproveResponseDto> {
    if (!currentUser || !currentUser.isAdmin) {
      return {
        error: ApproveResponseError.PERMISSION_DENIED,
      };
    }

    const registration = await this.registrationService.findRegistrationById(
      request.registrationId,
    );

    if (!registration) {
      return {
        error: ApproveResponseError.NO_SUCH_REGISTRATION_ID,
      };
    }

    if (registration.approveState === request.approveState) {
      return {
        error: ApproveResponseError.STATE_UNCHANGED,
      };
    }

    await this.registrationService.approve(registration, request.approveState);

    await this.mailService.sendMail(
      MailTemplate.Approve,
      Locale.en_US,
      {
        approveState: request.approveState,
        email: (await registration.user).email,
        name: registration.name,
        stuID: registration.id,
        school: (await registration.organization).organizationName,
        msg: request.msg,
      },
      (
        await registration.user
      ).email,
    );

    return {};
  }

  @ApiBearerAuth()
  @Post('addOrganization')
  @ApiOperation({
    summary: 'add a organization',
  })
  async addOrganization(
    @CurrentUser() currentUser: UserEntity,
    @Body() request: AddOrganizationRequestDto,
  ): Promise<AddOrganizationResponseDto> {
    if (!currentUser || !currentUser.isAdmin) {
      return {
        error: AddOrganizationResponseError.PERMISSION_DENIED,
      };
    }

    await this.registrationService.addOrganization(request.organizationName);

    return {};
  }

  @Post('getOrganizationList')
  @ApiOperation({
    summary: 'get organization list',
  })
  async getOrganizationList(): Promise<GetOrganizationListResponseDto> {
    return {
      registrationMetaList:
        await this.registrationService.getOrganizationList(),
    };
  }
}
