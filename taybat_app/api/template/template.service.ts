export interface TemplateHealth {
  title: string;
  status: 'ready';
}

class TemplateService {
  async getHealth(): Promise<TemplateHealth> {
    return {
      title: 'Template service ready',
      status: 'ready',
    };
  }
}

export const templateService = new TemplateService();
