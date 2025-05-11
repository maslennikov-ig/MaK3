import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { User, ContactSource, ClientStatus } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto';

// Мок для PrismaService
const mockPrismaService = {
  contact: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('ContactsService', () => {
  let service: ContactsService;
  let prismaService: PrismaService;

  // Тестовые данные
  const mockAdminUser: User = {
    id: 'admin-id',
    email: 'admin@example.com',
    password: 'hashed-password',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'ADMIN',
    refreshToken: null,
  } as User;

  const mockManagerUser: User = {
    ...mockAdminUser,
    id: 'manager-id',
    email: 'manager@example.com',
    role: 'MANAGER',
  } as User;

  const mockPartnerUser: User = {
    ...mockAdminUser,
    id: 'partner-id',
    email: 'partner@example.com',
    role: 'PARTNER',
  } as User;

  const mockContact = {
    id: 'contact-id',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+79991234567',
    email: 'john@example.com',
    source: ContactSource.OWN_LEAD_GEN,
    statusClient: ClientStatus.NEW_NO_PROCESSING,
    isLead: true,
    assignedToId: 'manager-id',
    partnerId: 'partner-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createContactDto: CreateContactDto = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+79991234567',
      email: 'john@example.com',
      source: ContactSource.OWN_LEAD_GEN,
      statusClient: ClientStatus.NEW_NO_PROCESSING,
    };

    it('should create a contact when user is admin', async () => {
      mockPrismaService.contact.create.mockResolvedValue(mockContact);

      const result = await service.create(createContactDto, mockAdminUser);

      expect(mockPrismaService.contact.create).toHaveBeenCalledWith({
        data: {
          ...createContactDto,
          assignedToId: mockAdminUser.id,
        },
      });
      expect(result).toEqual(mockContact);
    });

    it('should create a contact when user is manager', async () => {
      mockPrismaService.contact.create.mockResolvedValue(mockContact);

      const result = await service.create(createContactDto, mockManagerUser);

      expect(mockPrismaService.contact.create).toHaveBeenCalledWith({
        data: {
          ...createContactDto,
          assignedToId: mockManagerUser.id,
        },
      });
      expect(result).toEqual(mockContact);
    });

    it('should set partnerId when user is partner', async () => {
      mockPrismaService.contact.create.mockResolvedValue({
        ...mockContact,
        partnerId: mockPartnerUser.id,
      });

      const result = await service.create(createContactDto, mockPartnerUser);

      expect(mockPrismaService.contact.create).toHaveBeenCalledWith({
        data: {
          ...createContactDto,
          assignedToId: mockPartnerUser.id,
          partnerId: mockPartnerUser.id,
        },
      });
      expect(result.partnerId).toEqual(mockPartnerUser.id);
    });

    it('should throw ForbiddenException when non-admin tries to create contact for another partner', async () => {
      const dtoWithPartnerId = {
        ...createContactDto,
        partnerId: 'other-partner-id',
      };

      await expect(service.create(dtoWithPartnerId, mockManagerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all contacts for admin', async () => {
      mockPrismaService.contact.findMany.mockResolvedValue([mockContact]);
      mockPrismaService.contact.count.mockResolvedValue(1);

      const result = await service.findAll(mockAdminUser);

      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
      expect(result).toEqual({ contacts: [mockContact], total: 1 });
    });

    it('should filter contacts for manager', async () => {
      mockPrismaService.contact.findMany.mockResolvedValue([mockContact]);
      mockPrismaService.contact.count.mockResolvedValue(1);

      const result = await service.findAll(mockManagerUser);

      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assignedToId: mockManagerUser.id },
        }),
      );
      expect(result).toEqual({ contacts: [mockContact], total: 1 });
    });

    it('should filter contacts for partner', async () => {
      mockPrismaService.contact.findMany.mockResolvedValue([mockContact]);
      mockPrismaService.contact.count.mockResolvedValue(1);

      const result = await service.findAll(mockPartnerUser);

      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { partnerId: mockPartnerUser.id },
        }),
      );
      expect(result).toEqual({ contacts: [mockContact], total: 1 });
    });

    it('should apply search filter', async () => {
      mockPrismaService.contact.findMany.mockResolvedValue([mockContact]);
      mockPrismaService.contact.count.mockResolvedValue(1);

      const result = await service.findAll(mockAdminUser, { search: 'John' });

      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { firstName: { contains: 'John', mode: 'insensitive' } },
              { lastName: { contains: 'John', mode: 'insensitive' } },
              { phone: { contains: 'John' } },
              { email: { contains: 'John', mode: 'insensitive' } },
            ],
          },
        }),
      );
      expect(result).toEqual({ contacts: [mockContact], total: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a contact by id for admin', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);

      const result = await service.findOne('contact-id', mockAdminUser);

      expect(mockPrismaService.contact.findUnique).toHaveBeenCalledWith({
        where: { id: 'contact-id' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockContact);
    });

    it('should throw NotFoundException when contact not found', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id', mockAdminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when manager tries to access contact not assigned to them', async () => {
      const contactNotAssignedToManager = {
        ...mockContact,
        assignedToId: 'other-manager-id',
      };
      mockPrismaService.contact.findUnique.mockResolvedValue(contactNotAssignedToManager);

      await expect(service.findOne('contact-id', mockManagerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when partner tries to access contact not belonging to them', async () => {
      const contactNotBelongingToPartner = {
        ...mockContact,
        partnerId: 'other-partner-id',
      };
      mockPrismaService.contact.findUnique.mockResolvedValue(contactNotBelongingToPartner);

      await expect(service.findOne('contact-id', mockPartnerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a contact when user is admin', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);
      mockPrismaService.contact.update.mockResolvedValue({
        ...mockContact,
        firstName: 'Updated',
      });

      const result = await service.update(
        'contact-id',
        { firstName: 'Updated' },
        mockAdminUser,
      );

      expect(mockPrismaService.contact.update).toHaveBeenCalledWith({
        where: { id: 'contact-id' },
        data: { firstName: 'Updated' },
      });
      expect(result.firstName).toEqual('Updated');
    });

    it('should throw ForbiddenException when non-admin tries to change partnerId', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);

      await expect(
        service.update(
          'contact-id',
          { partnerId: 'new-partner-id' },
          mockManagerUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a contact when user is admin', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);
      mockPrismaService.contact.delete.mockResolvedValue(mockContact);

      const result = await service.remove('contact-id', mockAdminUser);

      expect(mockPrismaService.contact.delete).toHaveBeenCalledWith({
        where: { id: 'contact-id' },
      });
      expect(result).toEqual(mockContact);
    });

    it('should throw ForbiddenException when non-admin tries to delete a contact', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);

      await expect(service.remove('contact-id', mockManagerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getSources and getStatuses', () => {
    it('should return all contact sources', async () => {
      const sources = await service.getSources();
      expect(sources.length).toEqual(Object.values(ContactSource).length);
      expect(sources[0]).toHaveProperty('value');
      expect(sources[0]).toHaveProperty('label');
    });

    it('should return all client statuses', async () => {
      const statuses = await service.getStatuses();
      expect(statuses.length).toEqual(Object.values(ClientStatus).length);
      expect(statuses[0]).toHaveProperty('value');
      expect(statuses[0]).toHaveProperty('label');
    });
  });
});
