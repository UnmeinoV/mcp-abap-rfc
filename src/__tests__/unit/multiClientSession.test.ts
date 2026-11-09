const mockCreated: Array<Record<string, unknown>> = [];
jest.mock('../../lib/connectionFactory', () => ({
  createAbapConnection: jest.fn((params: Record<string, unknown>) => {
    mockCreated.push(params);
    throw new Error('stop after capturing params');
  }),
}));

import { handleDeletePackage } from '../../handlers/package/low/handleDeletePackage';
import { handleGetSession } from '../../handlers/system/readonly/handleGetSession';
import {
  loadSapClientConfig,
  markClientConnected,
  resetSapClientConfig,
} from '../../lib/sapClients';

afterEach(() => {
  resetSapClientConfig();
  mockCreated.length = 0;
});

describe('GetSession', () => {
  it('reports configured and connected clients', async () => {
    loadSapClientConfig({ env: { SAP_CLIENTS: '100,800', SAP_CLIENT: '100' } });
    markClientConnected('100');
    const r = await handleGetSession({ connection: {} as never }, {});
    const body = JSON.parse(r.content[0].text as string);
    expect(body.sap_clients).toMatchObject({
      default: '100',
      configured: ['100', '800'],
      connected: ['100'],
    });
  });

  it('says nothing about clients when multi-client is off', async () => {
    const r = await handleGetSession({ connection: {} as never }, {});
    expect(JSON.parse(r.content[0].text as string)).not.toHaveProperty(
      'sap_clients',
    );
  });
});

describe('DeletePackageLow force_new_connection', () => {
  it('copies the client from the injected connection, so it follows sap_client', async () => {
    const connection = {
      getConfig: () => ({
        url: 'http://sap.example:8000',
        authType: 'basic',
        username: 'U',
        password: 'P',
        client: '800',
      }),
    };
    await handleDeletePackage({ connection: connection as never }, {
      package_name: 'ZMCP_X',
      force_new_connection: true,
    } as never).catch(() => undefined);
    expect(mockCreated[0]).toMatchObject({ client: '800' });
  });
});
