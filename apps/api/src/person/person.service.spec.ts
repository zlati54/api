import client from '@sendgrid/client'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { MockPrismaService, prismaMock } from '../prisma/prisma-client.mock'
import { PersonService } from './person.service'

const mockPerson = {
  firstName: 'test',
  lastName: 'test',
  email: 'test',
  newsletter: true,
}
const url = '/test/url'
const requestMock = jest.spyOn(client, 'request').mockImplementation()
const setApiKeyMock = jest.spyOn(client, 'setApiKey')

describe('PersonService with enable client list ', () => {
  let personService: PersonService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonService, MockPrismaService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          return key === 'sendgrid.apiKey' ? 'SG.test' : url
        }),
      })
      .compile()

    personService = module.get<PersonService>(PersonService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(personService).toBeDefined()
    expect(setApiKeyMock).toHaveBeenCalled()
  })

  it('should create person and add it to contact list', async () => {
    await personService.create(mockPerson)

    expect(prismaMock.person.create).toHaveBeenCalledWith({ data: mockPerson })
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        body: {
          contacts: [
            {
              email: mockPerson.email,
              first_name: mockPerson.firstName,
              last_name: mockPerson.lastName,
            },
          ],
        },
      }),
    )
  })

  it('should create person without adding it to contact list', async () => {
    await personService.create({ ...mockPerson, ...{ newsletter: false } })

    expect(prismaMock.person.create).toHaveBeenCalledWith({
      data: { ...mockPerson, ...{ newsletter: false } },
    })
    expect(requestMock).not.toHaveBeenCalled()
  })
})

describe('PersonService with disable client list ', () => {
  let personService: PersonService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonService, MockPrismaService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn(),
      })
      .compile()

    personService = module.get<PersonService>(PersonService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(personService).toBeDefined()
    expect(setApiKeyMock).not.toHaveBeenCalled()
  })

  it('should create person without adding it to contact list', async () => {
    await personService.create(mockPerson)

    expect(prismaMock.person.create).toHaveBeenCalledWith({
      data: mockPerson,
    })
    expect(requestMock).not.toHaveBeenCalled()
  })
})
