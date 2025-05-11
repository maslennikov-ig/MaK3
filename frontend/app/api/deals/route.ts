import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json(
        { message: 'Не авторизован' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    
    // Получаем параметры запроса
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const stageId = searchParams.get('stageId');
    const contactId = searchParams.get('contactId');
    const assignedToId = searchParams.get('assignedToId');
    const partnerId = searchParams.get('partnerId');
    const pipelineId = searchParams.get('pipelineId');

    // Формируем параметры запроса к бэкенду
    let queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    if (stageId) queryParams.append('stageId', stageId);
    if (contactId) queryParams.append('contactId', contactId);
    if (assignedToId) queryParams.append('assignedToId', assignedToId);
    if (partnerId) queryParams.append('partnerId', partnerId);
    
    // Если указан pipelineId, нужно получить все этапы этой воронки и запросить сделки по ним
    if (pipelineId) {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const pipelineResponse = await fetch(`${backendUrl}/pipelines/${pipelineId}`, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!pipelineResponse.ok) {
        const errorData = await pipelineResponse.json();
        return NextResponse.json(
          { message: errorData.message || 'Ошибка при получении воронки продаж' },
          { status: pipelineResponse.status }
        );
      }

      const pipelineData = await pipelineResponse.json();
      
      // Если у воронки есть этапы, запрашиваем сделки по всем этапам
      if (pipelineData.stages && pipelineData.stages.length > 0) {
        const stageIds = pipelineData.stages.map((stage: any) => stage.id);
        
        // Запрашиваем сделки для каждого этапа
        const dealsPromises = stageIds.map((stageId: string) => {
          const stageQueryParams = new URLSearchParams(queryParams.toString());
          stageQueryParams.append('stageId', stageId);
          
          return fetch(`${backendUrl}/deals?${stageQueryParams.toString()}`, {
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
              'Content-Type': 'application/json',
            },
          }).then(res => res.json());
        });
        
        const dealsResults = await Promise.all(dealsPromises);
        
        // Объединяем результаты
        const allDeals = dealsResults.flatMap(result => result.deals || []);
        const totalDeals = dealsResults.reduce((sum, result) => sum + (result.total || 0), 0);
        
        return NextResponse.json({
          deals: allDeals,
          total: totalDeals,
        });
      }
    }

    // Если не указан pipelineId или у воронки нет этапов, делаем обычный запрос
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/deals?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Ошибка при получении сделок' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка при получении сделок:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json(
        { message: 'Не авторизован' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/deals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || 'Ошибка при создании сделки' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка при создании сделки:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
