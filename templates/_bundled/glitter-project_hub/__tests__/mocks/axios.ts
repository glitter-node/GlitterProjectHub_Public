function createClient() {
  const client: any = async (config?: any) => ({
    data: undefined,
    status: 200,
    statusText: 'OK',
    config: config ?? {},
    headers: {},
  });

  client.interceptors = {
    request: { use: () => 0 },
    response: { use: () => 0 },
  };

  client.get = async (_url: string, config?: any) => client(config);
  client.post = async (_url: string, _data?: any, config?: any) => client(config);
  client.put = async (_url: string, _data?: any, config?: any) => client(config);
  client.patch = async (_url: string, _data?: any, config?: any) => client(config);
  client.delete = async (_url: string, config?: any) => client(config);

  return client;
}

const axios = {
  create: createClient,
  isAxiosError: () => false,
};

export default axios;
