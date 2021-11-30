import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { UserEntity } from '@/user/user.entity';

import { ApproveState, RegistrationEntity } from './ragistration.entity';
import { RegistrationOrganizationEntity } from './registration-organization.entity';

import { RegistrationMetaDto } from './dto';

export enum RegistrationType {
  New = 'new',
  Modify = 'modify',
  NothingHappened = 'nothingHappened',
}

@Injectable()
export class RegistrationService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectRepository(RegistrationOrganizationEntity)
    private readonly registrationOrganizationRepository: Repository<RegistrationOrganizationEntity>,
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
  ) {}

  async findRegistrationByUser(user: UserEntity): Promise<RegistrationEntity> {
    return await this.registrationRepository.findOne({
      where: {
        userId: user.id,
      },
      relations: ['user', 'organization'],
    });
  }

  async findRegistrationById(id: number): Promise<RegistrationEntity> {
    return await this.registrationRepository.findOne({
      where: {
        registrationId: id,
      },
      relations: ['user', 'organization'],
    });
  }

  async findOrganizationById(
    id: number,
  ): Promise<RegistrationOrganizationEntity> {
    return await this.registrationOrganizationRepository.findOne({
      id,
    });
  }

  async registration(
    user: UserEntity,
    organization: RegistrationOrganizationEntity,
    name: string,
    id: string,
  ): Promise<RegistrationType> {
    let registrationType = RegistrationType.NothingHappened;
    let registration = await this.findRegistrationByUser(user);

    if (!registration) {
      registration = new RegistrationEntity();
      registration.userId = user.id;
      registrationType = RegistrationType.New;
    }

    if (
      organization.id !== registration.organizationId ||
      name !== registration.name ||
      id !== registration.id
    ) {
      if (registrationType !== RegistrationType.New) {
        registrationType = RegistrationType.Modify;
      }
    }

    registration.organizationId = organization.id;
    registration.name = name;
    registration.id = id;

    if (registrationType !== RegistrationType.NothingHappened) {
      registration.approveState = ApproveState.PENDING;
    }

    await this.registrationRepository.save(registration);

    return registrationType;
  }

  async getRegistrationList(
    approveState?: ApproveState,
  ): Promise<RegistrationMetaDto[]> {
    const RegistrationEntityList = await this.registrationRepository.find({
      relations: ['user', 'organization'],
      where:
        approveState != null
          ? {
              approveState,
            }
          : {},
    });

    return await Promise.all(
      RegistrationEntityList.map(async (registration) => {
        return <RegistrationMetaDto>{
          email: (await registration.user).email,
          name: registration.name,
          registrationId: registration.registrationId,
          id: registration.id,
          organizationId: registration.organizationId,
          organizationName: (await registration.organization).organizationName,
          approveState: registration.approveState,
        };
      }),
    );
  }

  async approve(
    registration: RegistrationEntity,
    approveState: ApproveState,
  ): Promise<void> {
    registration.approveState = approveState;
    await this.registrationRepository.save(registration);
  }

  async addOrganization(organizationName: string): Promise<void> {
    const organization = new RegistrationOrganizationEntity();
    organization.organizationName = organizationName;
    await this.registrationOrganizationRepository.save(organization);
  }

  async getOrganizationList(): Promise<RegistrationOrganizationEntity[]> {
    return await this.registrationOrganizationRepository.find();
  }
}
